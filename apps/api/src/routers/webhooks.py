"""Webhook router: MoMo callbacks, WhatsApp (Phase 2 stub).

ALL webhooks verified via HMAC-SHA256 before any processing.
Return 401 before any DB operations if signature is invalid.
"""

import structlog
from fastapi import APIRouter, HTTPException, Request
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.database import get_session_factory
from src.services.payments.webhook_validator import verify_momo_webhook

logger = structlog.get_logger()
router = APIRouter(prefix="/webhooks", tags=["webhooks"])


@router.post("/momo/callback")
async def momo_callback(request: Request) -> dict:
    """Handle Hubtel MoMo payment callback.

    Verifies HMAC signature, then updates transaction status.
    ResponseCode "0000" = success. Anything else = failure.
    """
    # Read raw body for signature verification
    body = await request.body()
    signature = request.headers.get("X-Hubtel-Signature", "")

    if not verify_momo_webhook(body, signature):
        logger.warning(
            "momo_webhook_rejected",
            ip=request.client.host if request.client else "unknown",
            payload_prefix=body[:32].decode("utf-8", errors="replace"),
        )
        raise HTTPException(status_code=401, detail="Invalid webhook signature")

    import json
    try:
        data = json.loads(body)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON payload")

    response_code = data.get("ResponseCode", "")
    client_reference = data.get("ClientReference", "")
    transaction_id = data.get("TransactionId", "")
    status_str = data.get("Status", "")

    if not client_reference:
        logger.error("momo_webhook_missing_reference", data=data)
        raise HTTPException(status_code=400, detail="Missing ClientReference")

    # Determine our status from Hubtel response
    new_status = "completed" if response_code == "0000" else "failed"

    # Update transaction in DB
    from src.models import EWATransaction
    from uuid import UUID

    async with get_session_factory()() as session:
        result = await session.execute(
            select(EWATransaction).where(
                EWATransaction.id == UUID(client_reference)
            )
        )
        txn = result.scalar_one_or_none()

        if txn is None:
            logger.error("momo_webhook_txn_not_found", reference=client_reference)
            raise HTTPException(status_code=404, detail="Transaction not found")

        if txn.status not in ("pending", "processing"):
            # Already finalized — idempotent response
            return {"status": "already_processed"}

        txn.status = new_status
        txn.momo_reference = transaction_id
        await session.commit()

    logger.info(
        "momo_webhook_processed",
        txn_id=client_reference,
        status=new_status,
        hubtel_code=response_code,
    )

    # Send notifications on success
    if new_status == "completed":
        from src.services.workers.tasks import send_withdrawal_notification, notify_employer_of_withdrawal

        try:
            # Notify employee via SMS
            send_withdrawal_notification.delay(
                employee_id=str(txn.employee_id),
                phone="",  # Fetched in task from employee record
                amount=str(txn.amount_disbursed),
                provider="",  # Fetched in task
                reference=transaction_id,
            )

            # Notify employer of pending deduction (spec Step 8)
            notify_employer_of_withdrawal.delay(
                employer_id=str(txn.employer_id),
                employee_name="",  # Fetched in task
                amount=str(txn.amount_requested),
                pay_period=txn.pay_period,
            )
        except Exception as e:
            logger.error("notification_dispatch_failed", error=str(e))

    return {"status": "ok"}


@router.post("/whatsapp")
async def whatsapp_webhook(request: Request) -> dict:
    """Phase 2 stub: WhatsApp receipt bot webhook."""
    raise HTTPException(status_code=501, detail="WhatsApp integration not yet available")
