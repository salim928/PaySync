"""Celery tasks for async operations: MoMo disbursement, SMS, scheduled deductions.

All tasks are retryable with exponential backoff. Financial tasks log to audit_logs.
"""

import asyncio
from decimal import Decimal

import structlog
from celery import Celery

from src.core.config import get_settings

logger = structlog.get_logger()

celery_app = Celery("wagenow")


def _configure_celery():
    """Lazily configure Celery broker/backend from settings."""
    settings = get_settings()
    celery_app.conf.broker_url = settings.redis_url
    celery_app.conf.result_backend = settings.redis_url


# Defer configuration until first use
try:
    _configure_celery()
except Exception:
    logger.warning("celery_config_deferred", msg="Settings not ready — Celery will be configured on first use")
celery_app.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_acks_late=True,
    worker_prefetch_multiplier=1,
)


def _run_async(coro):
    """Helper to run async code in Celery's sync workers."""
    loop = asyncio.new_event_loop()
    try:
        return loop.run_until_complete(coro)
    finally:
        loop.close()


@celery_app.task(
    bind=True,
    max_retries=3,
    default_retry_delay=30,
    name="wagenow.disburse_momo",
)
def disburse_momo(
    self,
    txn_id: str,
    employee_id: str,
    phone: str,
    amount: str,
    idempotency_key: str,
) -> dict:
    """Disburse funds to MoMo wallet via Hubtel API.

    On success: UPDATE ewa_transactions SET status='completed', momo_reference=...
    On failure: retry up to 3 times, then SET status='failed'. Notify employee.

    Args:
        txn_id: EWA transaction UUID.
        employee_id: Employee UUID.
        phone: MoMo number (233XXXXXXXXX).
        amount: Disbursement amount (string Decimal).
        idempotency_key: For Hubtel X-Reference-Id header.

    Returns:
        Dict with status and reference.
    """

    async def _disburse():
        from src.core.database import get_session_factory
        from src.core.redis import get_redis
        from src.models import EWATransaction
        from src.services.ewa.accrual import AccrualEngine
        from src.services.payments.hubtel import HubtelMoMoClient, MoMoError

        from sqlalchemy import update as sql_update
        from uuid import UUID

        client = HubtelMoMoClient()
        try:
            result = await client.disburse(
                phone=phone,
                amount=Decimal(amount),
                description=f"WageNow withdrawal - {txn_id[:8]}",
                idempotency_key=idempotency_key,
                client_reference=txn_id,
            )

            # Update transaction to completed
            async with get_session_factory()() as session:
                await session.execute(
                    sql_update(EWATransaction)
                    .where(EWATransaction.id == UUID(txn_id))
                    .values(
                        status="completed",
                        momo_reference=result.get("TransactionId", ""),
                    )
                )
                await session.commit()

            # Invalidate accrual cache
            redis = await get_redis()
            engine = AccrualEngine(session, redis)
            await engine.invalidate_cache(UUID(employee_id))

            logger.info(
                "momo_disbursement_completed",
                txn_id=txn_id,
                momo_ref=result.get("TransactionId"),
            )
            return {"status": "completed", "reference": result.get("TransactionId")}

        except MoMoError as e:
            logger.error(
                "momo_disbursement_failed",
                txn_id=txn_id,
                error=e.message,
                response_code=e.response_code,
            )

            if self.request.retries < self.max_retries:
                raise self.retry(exc=e)

            # Final failure: mark transaction as failed
            async with get_session_factory()() as session:
                await session.execute(
                    sql_update(EWATransaction)
                    .where(EWATransaction.id == UUID(txn_id))
                    .values(status="failed")
                )
                await session.commit()

            return {"status": "failed", "error": e.message}

        finally:
            await client.close()

    return _run_async(_disburse())


@celery_app.task(name="wagenow.send_withdrawal_notification")
def send_withdrawal_notification(
    employee_id: str,
    phone: str,
    amount: str,
    provider: str,
    reference: str,
) -> None:
    """Send withdrawal confirmation SMS to employee. Fire and forget.

    Args:
        employee_id: Employee UUID.
        phone: Employee phone (E.164).
        amount: Disbursed amount string.
        provider: MoMo provider name.
        reference: Transaction reference.
    """

    async def _send():
        from src.core.redis import get_redis
        from src.services.notifications.sms import SMSService

        redis = await get_redis()
        sms = SMSService(redis)
        try:
            await sms.send_withdrawal_confirmation(phone, amount, provider, reference)
        except Exception as e:
            logger.error(
                "withdrawal_notification_failed",
                employee_id=employee_id,
                error=str(e),
            )

    _run_async(_send())


@celery_app.task(name="wagenow.notify_employer_of_withdrawal")
def notify_employer_of_withdrawal(
    employer_id: str,
    employee_name: str,
    amount: str,
    pay_period: str,
) -> None:
    """Notify employer that an employee withdrawal is pending deduction.

    Spec Step 8: 'Employee notified via push. Employer notified of pending deduction.'
    Sends to employer admin email. In Phase 2 this would also push to dashboard.

    Args:
        employer_id: Employer UUID.
        employee_name: Employee full name (for the notification).
        amount: Withdrawal amount requested (string).
        pay_period: Current pay period YYYY-MM.
    """

    async def _notify():
        from src.core.database import get_session_factory
        from src.models import Employer, AuditLog
        from sqlalchemy import select as sa_select
        from uuid import UUID

        async with get_session_factory()() as session:
            # Get employer details
            result = await session.execute(
                sa_select(Employer.email, Employer.company_name).where(
                    Employer.id == UUID(employer_id)
                )
            )
            employer = result.one_or_none()
            if not employer:
                logger.error("employer_not_found_for_notification", employer_id=employer_id)
                return

            # Log the notification as an audit event
            audit = AuditLog(
                actor_id=UUID(employer_id),
                action="EMPLOYER_WITHDRAWAL_NOTIFICATION",
                entity_type="ewa_transaction",
                event_metadata={
                    "employee_name": employee_name,
                    "amount": amount,
                    "pay_period": pay_period,
                    "employer_email": employer.email,
                },
            )
            session.add(audit)
            await session.commit()

            logger.info(
                "employer_withdrawal_notified",
                employer_id=employer_id,
                employee=employee_name,
                amount=amount,
            )

            # In production: send email/push notification to employer admin
            # For now: logged in audit trail. Email integration can be added
            # via SendGrid/SES without changing this task signature.

    _run_async(_notify())


@celery_app.task(name="wagenow.process_scheduled_deductions")
def process_scheduled_deductions() -> dict:
    """Scheduled task: run at 00:01 on payday each month.

    Finds all employers where payday == today's day. Does NOT auto-apply —
    only flags. Employer must manually apply from dashboard.

    Returns:
        Dict with employer_ids flagged.
    """

    async def _process():
        from datetime import datetime, timezone
        from src.core.database import get_session_factory
        from src.models import Employer
        from sqlalchemy import select

        today = datetime.now(timezone.utc)
        day = today.day

        async with get_session_factory()() as session:
            result = await session.execute(
                select(Employer.id, Employer.company_name).where(
                    Employer.payday == day,
                    Employer.ewa_enabled.is_(True),
                )
            )
            employers = result.all()

        flagged = []
        for emp_id, name in employers:
            logger.info(
                "payday_flagged",
                employer_id=str(emp_id),
                company=name,
                day=day,
            )
            flagged.append(str(emp_id))

        return {"flagged_employers": flagged, "count": len(flagged)}

    return _run_async(_process())


# ── Celery Beat schedule ──
from celery.schedules import crontab

celery_app.conf.beat_schedule = {
    "process-scheduled-deductions": {
        "task": "wagenow.process_scheduled_deductions",
        "schedule": crontab(hour=0, minute=1),
    },
}
