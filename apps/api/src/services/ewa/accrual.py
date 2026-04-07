"""Accrual Engine — calculates how much of their earned salary an employee can withdraw.

This is the most critical business logic in WageNow. Every calculation uses Python
Decimal. Never float for money. The engine is designed to be purely functional at its
core (calculate_accrual is a pure function) with caching bolted on top.

Formula:
    days_worked = max(ref_date.day - 1, 0)       # conservative: today is incomplete
    gross_accrued = (monthly_salary / days_in_month * days_worked).quantize('0.01')
    ewa_ceiling = gross_accrued * (ewa_limit_pct / 100)
    available = max(ewa_ceiling - period_withdrawals, Decimal('0'))

Cache: Redis key 'accrual:{employee_id}:{date}', TTL 5 minutes.
Invalidation: on any completed withdrawal for that employee.
"""

import calendar
import json
from datetime import date, datetime, timezone
from decimal import ROUND_HALF_UP, Decimal
from uuid import UUID

from redis.asyncio import Redis
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from src.models import EWATransaction, Employee

CACHE_TTL_SECONDS = 300  # 5 minutes


class AccrualError(Exception):
    """Raised when accrual calculation encounters an invalid state."""


class AccrualResult:
    """Immutable result of an accrual calculation."""

    __slots__ = (
        "employee_id",
        "monthly_salary",
        "days_worked",
        "days_in_month",
        "gross_accrued",
        "ewa_ceiling",
        "period_withdrawals",
        "available",
        "pay_period",
        "calculated_at",
    )

    def __init__(
        self,
        *,
        employee_id: UUID,
        monthly_salary: Decimal,
        days_worked: int,
        days_in_month: int,
        gross_accrued: Decimal,
        ewa_ceiling: Decimal,
        period_withdrawals: Decimal,
        available: Decimal,
        pay_period: str,
        calculated_at: datetime,
    ) -> None:
        self.employee_id = employee_id
        self.monthly_salary = monthly_salary
        self.days_worked = days_worked
        self.days_in_month = days_in_month
        self.gross_accrued = gross_accrued
        self.ewa_ceiling = ewa_ceiling
        self.period_withdrawals = period_withdrawals
        self.available = available
        self.pay_period = pay_period
        self.calculated_at = calculated_at

    def to_dict(self) -> dict:
        return {
            "employee_id": str(self.employee_id),
            "monthly_salary": str(self.monthly_salary),
            "days_worked": self.days_worked,
            "days_in_month": self.days_in_month,
            "gross_accrued": str(self.gross_accrued),
            "ewa_ceiling": str(self.ewa_ceiling),
            "period_withdrawals": str(self.period_withdrawals),
            "available": str(self.available),
            "pay_period": self.pay_period,
            "calculated_at": self.calculated_at.isoformat(),
        }


def calculate_accrual(
    *,
    monthly_salary: Decimal,
    ewa_limit_pct: Decimal,
    ref_date: date,
    period_withdrawals: Decimal,
    employee_id: UUID,
) -> AccrualResult:
    """Pure function: calculate accrual for an employee on a given date.

    This function has ZERO side effects. No DB, no Redis, no I/O.
    All inputs are explicit. All outputs are deterministic.

    Args:
        monthly_salary: Employee's monthly salary (Decimal, > 0).
        ewa_limit_pct: Max % of accrued salary available for EWA (1-80).
        ref_date: The reference date for the calculation.
        period_withdrawals: Sum of completed withdrawals this pay period.
        employee_id: The employee's UUID (for result metadata only).

    Returns:
        AccrualResult with all intermediate and final values.
    """
    if monthly_salary <= Decimal("0"):
        raise AccrualError("monthly_salary must be positive")
    if not (Decimal("1") <= ewa_limit_pct <= Decimal("80")):
        raise AccrualError("ewa_limit_pct must be between 1 and 80")

    days_in_month = calendar.monthrange(ref_date.year, ref_date.month)[1]

    # Conservative: today is incomplete, so days_worked = day - 1
    days_worked = max(ref_date.day - 1, 0)

    # Daily rate × days worked
    daily_rate = monthly_salary / Decimal(str(days_in_month))
    gross_accrued = (daily_rate * Decimal(str(days_worked))).quantize(
        Decimal("0.01"), rounding=ROUND_HALF_UP
    )

    # EWA ceiling: percentage of gross accrued
    ewa_ceiling = (gross_accrued * ewa_limit_pct / Decimal("100")).quantize(
        Decimal("0.01"), rounding=ROUND_HALF_UP
    )

    # Available: ceiling minus what's already been withdrawn. NEVER negative.
    available = max(ewa_ceiling - period_withdrawals, Decimal("0"))

    pay_period = f"{ref_date.year}-{ref_date.month:02d}"

    return AccrualResult(
        employee_id=employee_id,
        monthly_salary=monthly_salary,
        days_worked=days_worked,
        days_in_month=days_in_month,
        gross_accrued=gross_accrued,
        ewa_ceiling=ewa_ceiling,
        period_withdrawals=period_withdrawals,
        available=available,
        pay_period=pay_period,
        calculated_at=datetime.now(timezone.utc),
    )


class AccrualEngine:
    """Service layer: fetches employee data, calls calculate_accrual, caches result."""

    def __init__(self, db: AsyncSession, redis: Redis) -> None:
        self._db = db
        self._redis = redis

    async def get_accrual(
        self,
        employee_id: UUID,
        ref_date: date | None = None,
    ) -> AccrualResult:
        """Calculate (or return cached) accrual for an employee.

        Args:
            employee_id: The employee to calculate for.
            ref_date: Override date (defaults to today UTC).

        Returns:
            AccrualResult with available balance and all intermediate values.
        """
        if ref_date is None:
            ref_date = datetime.now(timezone.utc).date()

        # Check cache first
        cache_key = f"accrual:{employee_id}:{ref_date.isoformat()}"
        cached = await self._redis.get(cache_key)
        if cached:
            data = json.loads(cached)
            return AccrualResult(
                employee_id=UUID(data["employee_id"]),
                monthly_salary=Decimal(data["monthly_salary"]),
                days_worked=data["days_worked"],
                days_in_month=data["days_in_month"],
                gross_accrued=Decimal(data["gross_accrued"]),
                ewa_ceiling=Decimal(data["ewa_ceiling"]),
                period_withdrawals=Decimal(data["period_withdrawals"]),
                available=Decimal(data["available"]),
                pay_period=data["pay_period"],
                calculated_at=datetime.fromisoformat(data["calculated_at"]),
            )

        # Fetch employee
        result = await self._db.execute(
            select(Employee).where(
                Employee.id == employee_id,
                Employee.is_active.is_(True),
            )
        )
        employee = result.scalar_one_or_none()
        if employee is None:
            raise AccrualError(f"Employee {employee_id} not found or inactive")

        # Sum completed withdrawals for this pay period
        pay_period = f"{ref_date.year}-{ref_date.month:02d}"
        withdrawal_result = await self._db.execute(
            select(func.coalesce(func.sum(EWATransaction.amount_requested), 0)).where(
                EWATransaction.employee_id == employee_id,
                EWATransaction.pay_period == pay_period,
                EWATransaction.status == "completed",
            )
        )
        period_withdrawals = Decimal(str(withdrawal_result.scalar()))

        # Calculate
        accrual = calculate_accrual(
            monthly_salary=Decimal(str(employee.monthly_salary)),
            ewa_limit_pct=Decimal(str(employee.ewa_limit_pct)),
            ref_date=ref_date,
            period_withdrawals=period_withdrawals,
            employee_id=employee_id,
        )

        # Cache result
        await self._redis.setex(
            cache_key,
            CACHE_TTL_SECONDS,
            json.dumps(accrual.to_dict()),
        )

        return accrual

    async def invalidate_cache(self, employee_id: UUID) -> None:
        """Invalidate all cached accruals for an employee.

        Called after any completed withdrawal to ensure fresh calculations.
        """
        today = datetime.now(timezone.utc).date()
        cache_key = f"accrual:{employee_id}:{today.isoformat()}"
        await self._redis.delete(cache_key)
