"""EWA router — accrual queries, withdrawal requests, transaction history.

Phase 1 ACTIVE. All endpoints require authentication.
Employee endpoints use employee JWT. Employer endpoints use employer JWT.
"""

from decimal import Decimal
from uuid import UUID

import structlog
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.database import get_db
from src.core.redis import get_redis
from src.models import EWATransaction, Employee
from src.schemas import (
    AccrualResponse,
    TransactionListResponse,
    TransactionResponse,
    WithdrawalRequest,
    WithdrawalResponse,
)
from src.services.ewa.accrual import AccrualEngine, AccrualError
from src.services.ewa.withdrawal import WithdrawalError, WithdrawalService

logger = structlog.get_logger()
router = APIRouter(prefix="/api/v1/ewa", tags=["ewa"])


@router.get("/accrual/{employee_id}", response_model=AccrualResponse)
async def get_accrual(
    employee_id: UUID,
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> AccrualResponse:
    """Get current accrual calculation for an employee.

    Returns: { accrued, available, withdrawn_this_period, next_payday }
    """
    redis = await get_redis()
    engine = AccrualEngine(db, redis)

    try:
        result = await engine.get_accrual(employee_id)
    except AccrualError as e:
        raise HTTPException(status_code=404, detail=str(e))

    # Compute next_payday from employer settings
    next_payday_str: str | None = None
    try:
        from src.models import Employee, Employer
        from sqlalchemy import select as sa_select
        emp_result = await db.execute(
            sa_select(Employer.payday).join(Employee, Employee.employer_id == Employer.id).where(
                Employee.id == employee_id
            )
        )
        payday = emp_result.scalar()
        if payday:
            from datetime import date, timedelta
            import calendar
            today = date.today()
            # If payday hasn't passed this month, it's this month; otherwise next month
            if today.day < payday:
                try:
                    next_pd = today.replace(day=payday)
                except ValueError:
                    # payday=31 in a 30-day month → last day of month
                    last_day = calendar.monthrange(today.year, today.month)[1]
                    next_pd = today.replace(day=min(payday, last_day))
            else:
                # Next month
                if today.month == 12:
                    next_month = today.replace(year=today.year + 1, month=1, day=1)
                else:
                    next_month = today.replace(month=today.month + 1, day=1)
                last_day = calendar.monthrange(next_month.year, next_month.month)[1]
                next_pd = next_month.replace(day=min(payday, last_day))
            next_payday_str = next_pd.isoformat()
    except Exception:
        pass  # Non-critical — return None if computation fails

    return AccrualResponse(
        employee_id=result.employee_id,
        monthly_salary=result.monthly_salary,
        days_worked=result.days_worked,
        days_in_month=result.days_in_month,
        gross_accrued=result.gross_accrued,
        ewa_ceiling=result.ewa_ceiling,
        period_withdrawals=result.period_withdrawals,
        available=result.available,
        pay_period=result.pay_period,
        next_payday=next_payday_str,
        calculated_at=result.calculated_at,
    )


@router.post("/withdraw", response_model=WithdrawalResponse, status_code=202)
async def request_withdrawal(
    body: WithdrawalRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> WithdrawalResponse:
    """Initiate EWA withdrawal.

    Body: { employee_id, amount, momo_number, momo_provider }
    Returns: { transaction_id, status: processing }
    """
    employer_id = _get_employer_id(request)

    redis = await get_redis()
    service = WithdrawalService(db, redis)

    try:
        txn = await service.request_withdrawal(
            employee_id=body.employee_id,
            employer_id=employer_id,
            amount=body.amount,
        )
    except WithdrawalError as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)

    # Dispatch Celery task AFTER transaction commit
    from src.services.workers.tasks import disburse_momo

    try:
        disburse_momo.delay(
            txn_id=str(txn.id),
            employee_id=str(body.employee_id),
            phone=body.momo_number,
            amount=str(txn.amount_disbursed),
            idempotency_key=txn.idempotency_key,
        )
    except Exception as e:
        logger.error("celery_dispatch_failed", txn_id=str(txn.id), error=str(e))
        txn.status = "failed"
        raise HTTPException(status_code=503, detail="Payment processing unavailable")

    return WithdrawalResponse(
        id=txn.id,
        amount_requested=Decimal(str(txn.amount_requested)),
        amount_disbursed=Decimal(str(txn.amount_disbursed)),
        fee=Decimal(str(txn.fee)),
        status=txn.status,
        accrual_snapshot=Decimal(str(txn.accrual_snapshot)),
        pay_period=txn.pay_period,
        created_at=txn.created_at,
    )


@router.get("/transactions", response_model=TransactionListResponse)
async def list_transactions(
    request: Request,
    pay_period: str | None = None,
    status: str | None = None,
    limit: int = 50,
    offset: int = 0,
    db: AsyncSession = Depends(get_db),
) -> TransactionListResponse:
    """List EWA transactions for the authenticated employee."""
    employee_id = _get_employee_id(request)

    query = select(EWATransaction).where(
        EWATransaction.employee_id == employee_id
    )

    if pay_period:
        query = query.where(EWATransaction.pay_period == pay_period)
    if status:
        query = query.where(EWATransaction.status == status)

    # Count total
    count_query = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_query)).scalar() or 0

    # Fetch page
    query = query.order_by(EWATransaction.created_at.desc()).limit(limit).offset(offset)
    result = await db.execute(query)
    transactions = result.scalars().all()

    return TransactionListResponse(
        transactions=[
            TransactionResponse.model_validate(t) for t in transactions
        ],
        total=total,
    )


@router.get("/employer/transactions", response_model=TransactionListResponse)
async def list_employer_transactions(
    request: Request,
    pay_period: str | None = None,
    employee_id: UUID | None = None,
    status: str | None = None,
    limit: int = 50,
    offset: int = 0,
    db: AsyncSession = Depends(get_db),
) -> TransactionListResponse:
    """List EWA transactions for an employer (all employees)."""
    emp_id = _get_employer_id(request)

    query = select(EWATransaction).where(
        EWATransaction.employer_id == emp_id
    )

    if pay_period:
        query = query.where(EWATransaction.pay_period == pay_period)
    if employee_id:
        query = query.where(EWATransaction.employee_id == employee_id)
    if status:
        query = query.where(EWATransaction.status == status)

    count_query = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_query)).scalar() or 0

    query = query.order_by(EWATransaction.created_at.desc()).limit(limit).offset(offset)
    result = await db.execute(query)
    transactions = result.scalars().all()

    return TransactionListResponse(
        transactions=[
            TransactionResponse.model_validate(t) for t in transactions
        ],
        total=total,
    )


def _get_employee_id(request: Request) -> UUID:
    """Extract employee_id from JWT claims in request state."""
    sub = getattr(request.state, "sub", None)
    role = getattr(request.state, "role", None)
    if sub is None or role != "employee":
        raise HTTPException(status_code=403, detail="Employee authentication required")
    return UUID(sub)


def _get_employer_id(request: Request) -> UUID:
    """Extract employer_id from JWT claims in request state."""
    employer_id = getattr(request.state, "employer_id", None)
    if employer_id is None:
        raise HTTPException(status_code=401, detail="Authentication required")
    return UUID(employer_id) if isinstance(employer_id, str) else employer_id
