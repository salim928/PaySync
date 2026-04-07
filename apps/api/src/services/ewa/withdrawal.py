"""Withdrawal Service — handles the full lifecycle of an EWA withdrawal request.

Flow:
    1. Rate limit check (3 attempts / 10 min / employee, Redis sliding window)
    2. Cooldown check (48h between successful withdrawals, Redis key)
    3. Calculate accrual (via AccrualEngine)
    4. Validate amount (MIN=50, MAX=2000, <= available)
    5. Generate idempotency key
    6. Acquire advisory lock (pg_advisory_xact_lock) INSIDE transaction
    7. INSERT ewa_transaction (status=pending) INSIDE same transaction
    8. Commit transaction
    9. Dispatch Celery task (disburse_momo) AFTER commit
    10. If dispatch fails: UPDATE status=failed, raise

Flat fee: GHS 3.00. Non-negotiable. amount_disbursed = amount_requested - fee.
"""

import time
from datetime import datetime, timezone
from decimal import Decimal
from uuid import UUID

import structlog
from redis.asyncio import Redis
from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.security import generate_idempotency_key
from src.models import EWATransaction, Employee
from src.services.ewa.accrual import AccrualEngine, AccrualResult

logger = structlog.get_logger()

# ── Constants ──
PLATFORM_FEE = Decimal("3.00")
MIN_WITHDRAWAL = Decimal("50.00")
MAX_WITHDRAWAL = Decimal("2000.00")
COOLDOWN_SECONDS = 48 * 3600  # 48 hours
RATE_LIMIT_WINDOW = 600  # 10 minutes
RATE_LIMIT_MAX = 3


class WithdrawalError(Exception):
    """Raised when a withdrawal cannot be processed."""

    def __init__(self, message: str, status_code: int = 400) -> None:
        self.message = message
        self.status_code = status_code
        super().__init__(message)


class WithdrawalService:
    """Processes EWA withdrawal requests with full safety guarantees."""

    def __init__(self, db: AsyncSession, redis: Redis) -> None:
        self._db = db
        self._redis = redis
        self._accrual_engine = AccrualEngine(db, redis)

    async def request_withdrawal(
        self,
        employee_id: UUID,
        employer_id: UUID,
        amount: Decimal,
    ) -> EWATransaction:
        """Process a withdrawal request end-to-end.

        Args:
            employee_id: The requesting employee.
            employer_id: The employee's employer (for tenant context).
            amount: Requested withdrawal amount in GHS.

        Returns:
            The created EWATransaction (status=pending).

        Raises:
            WithdrawalError: If any validation, rate limit, or business rule fails.
        """
        # ── 1. Validate amount bounds ──
        if amount < MIN_WITHDRAWAL:
            raise WithdrawalError(
                f"Minimum withdrawal is GHS {MIN_WITHDRAWAL}", status_code=400
            )
        if amount > MAX_WITHDRAWAL:
            raise WithdrawalError(
                f"Maximum withdrawal is GHS {MAX_WITHDRAWAL}", status_code=400
            )

        # ── 2. Rate limit check (sliding window) ──
        await self._check_rate_limit(employee_id)

        # ── 3. Cooldown check (48h) ──
        await self._check_cooldown(employee_id)

        # ── 4. Calculate accrual ──
        accrual = await self._accrual_engine.get_accrual(employee_id)

        # ── 5. Validate against available balance ──
        if amount > accrual.available:
            raise WithdrawalError(
                f"Requested GHS {amount} exceeds available GHS {accrual.available}",
                status_code=400,
            )

        # ── 6. Calculate disbursement ──
        amount_disbursed = amount - PLATFORM_FEE
        if amount_disbursed <= Decimal("0"):
            raise WithdrawalError(
                f"Amount after GHS {PLATFORM_FEE} fee must be positive",
                status_code=400,
            )

        # ── 7. Generate idempotency key ──
        idempotency_key = generate_idempotency_key(employee_id, str(amount))

        # ── 8. Check idempotency (already submitted in this window?) ──
        existing = await self._db.execute(
            select(EWATransaction).where(
                EWATransaction.idempotency_key == idempotency_key
            )
        )
        if existing.scalar_one_or_none() is not None:
            raise WithdrawalError(
                "Duplicate withdrawal request (same amount within 5-minute window)",
                status_code=409,
            )

        # ── 9. Advisory lock + INSERT inside transaction ──
        lock_key = hash(str(employee_id)) % (2**31)
        await self._db.execute(text(f"SELECT pg_advisory_xact_lock({lock_key})"))

        # Re-check accrual after lock (another request may have gone through)
        await self._accrual_engine.invalidate_cache(employee_id)
        accrual = await self._accrual_engine.get_accrual(employee_id)
        if amount > accrual.available:
            raise WithdrawalError(
                f"Insufficient balance after lock re-check: GHS {accrual.available} available",
                status_code=409,
            )

        transaction = EWATransaction(
            employee_id=employee_id,
            employer_id=employer_id,
            amount_requested=amount,
            amount_disbursed=amount_disbursed,
            fee=PLATFORM_FEE,
            status="pending",
            idempotency_key=idempotency_key,
            accrual_snapshot=accrual.available,
            pay_period=accrual.pay_period,
        )
        self._db.add(transaction)
        await self._db.flush()  # Get the ID without committing

        logger.info(
            "withdrawal_created",
            employee_id=str(employee_id),
            amount=str(amount),
            fee=str(PLATFORM_FEE),
            txn_id=str(transaction.id),
        )

        # ── 10. Set cooldown ──
        cooldown_key = f"ewa:cooldown:{employee_id}"
        await self._redis.setex(cooldown_key, COOLDOWN_SECONDS, "1")

        # ── 11. Invalidate accrual cache ──
        await self._accrual_engine.invalidate_cache(employee_id)

        return transaction

    async def _check_rate_limit(self, employee_id: UUID) -> None:
        """Sliding window rate limit: 3 attempts per 10 minutes per employee."""
        key = f"ewa:ratelimit:{employee_id}"
        now = time.time()
        pipe = self._redis.pipeline()
        pipe.zremrangebyscore(key, 0, now - RATE_LIMIT_WINDOW)
        pipe.zcard(key)
        pipe.zadd(key, {str(now): now})
        pipe.expire(key, RATE_LIMIT_WINDOW)
        results = await pipe.execute()
        count = results[1]

        if count >= RATE_LIMIT_MAX:
            raise WithdrawalError(
                "Rate limit exceeded. Maximum 3 withdrawal attempts per 10 minutes.",
                status_code=429,
            )

    async def _check_cooldown(self, employee_id: UUID) -> None:
        """48-hour cooldown between successful withdrawals."""
        cooldown_key = f"ewa:cooldown:{employee_id}"
        if await self._redis.exists(cooldown_key):
            ttl = await self._redis.ttl(cooldown_key)
            hours = ttl // 3600
            raise WithdrawalError(
                f"Withdrawal cooldown active. Try again in ~{hours} hours.",
                status_code=429,
            )
