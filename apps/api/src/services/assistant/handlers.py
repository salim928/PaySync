"""Tool handler implementations.

Each handler is `async def handler(db, employer_id, **kwargs) -> dict`.
The dict is JSON-serialized and returned to Claude as a tool_result.

Handlers MUST scope every query by employer_id. RLS is also active at the
DB layer, but explicit scoping is defense-in-depth.

LIVE handlers run real queries.
STUB handlers return {"not_implemented": True, "reason": "..."} so Claude
can explain the gap to the user.
"""

from __future__ import annotations

from datetime import date, datetime, timedelta, timezone
from decimal import Decimal
from typing import Any
from uuid import UUID

from sqlalchemy import desc, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from src.models import EWATransaction, Employee, EmployerPolicy, PayrollUpload


# ─── helpers ───

def _current_period() -> str:
    today = datetime.now(timezone.utc).date()
    return f"{today.year}-{today.month:02d}"


def _to_jsonable(value: Any) -> Any:
    """Convert SQLAlchemy result types into JSON-safe primitives."""
    if isinstance(value, Decimal):
        return float(value)
    if isinstance(value, (datetime, date)):
        return value.isoformat()
    if isinstance(value, UUID):
        return str(value)
    return value


# ─── LIVE handlers ───

async def list_employees(
    db: AsyncSession,
    employer_id: UUID,
    *,
    department: str | None = None,
    active_only: bool = True,
    name_search: str | None = None,
    limit: int = 25,
) -> dict[str, Any]:
    limit = max(1, min(int(limit), 100))
    stmt = select(Employee).where(Employee.employer_id == employer_id)
    if active_only:
        stmt = stmt.where(Employee.is_active.is_(True))
    if department:
        stmt = stmt.where(func.lower(Employee.department) == department.lower())
    if name_search:
        stmt = stmt.where(Employee.full_name.ilike(f"%{name_search}%"))
    stmt = stmt.order_by(Employee.full_name).limit(limit)

    rows = (await db.execute(stmt)).scalars().all()
    return {
        "count": len(rows),
        "employees": [
            {
                "id": str(e.id),
                "full_name": e.full_name,
                "department": e.department,
                "monthly_salary_ghs": float(e.monthly_salary),
                "ewa_limit_pct": float(e.ewa_limit_pct),
                "start_date": e.start_date.isoformat(),
                "is_active": e.is_active,
            }
            for e in rows
        ],
    }


async def get_employee(
    db: AsyncSession,
    employer_id: UUID,
    *,
    employee_id: str,
) -> dict[str, Any]:
    try:
        emp_uuid = UUID(employee_id)
    except ValueError:
        return {"error": f"invalid employee_id format: {employee_id!r}"}

    emp = (
        await db.execute(
            select(Employee).where(
                Employee.id == emp_uuid,
                Employee.employer_id == employer_id,
            )
        )
    ).scalar_one_or_none()
    if emp is None:
        return {"error": "employee not found"}

    recent = (
        await db.execute(
            select(EWATransaction)
            .where(EWATransaction.employee_id == emp_uuid)
            .order_by(desc(EWATransaction.created_at))
            .limit(5)
        )
    ).scalars().all()

    return {
        "id": str(emp.id),
        "full_name": emp.full_name,
        "department": emp.department,
        "monthly_salary_ghs": float(emp.monthly_salary),
        "ewa_limit_pct": float(emp.ewa_limit_pct),
        "start_date": emp.start_date.isoformat(),
        "is_active": emp.is_active,
        "recent_advances": [
            {
                "amount_ghs": float(t.amount_disbursed),
                "fee_ghs": float(t.fee),
                "status": t.status,
                "pay_period": t.pay_period,
                "created_at": t.created_at.isoformat(),
                "deducted": t.deducted_at is not None,
            }
            for t in recent
        ],
    }


async def get_dashboard_metrics(
    db: AsyncSession,
    employer_id: UUID,
    *,
    pay_period: str | None = None,
) -> dict[str, Any]:
    period = pay_period or _current_period()
    today = datetime.now(timezone.utc).date()

    active_count = (
        await db.execute(
            select(func.count()).where(
                Employee.employer_id == employer_id,
                Employee.is_active.is_(True),
            )
        )
    ).scalar() or 0

    today_row = (
        await db.execute(
            select(
                func.count(EWATransaction.id),
                func.coalesce(func.sum(EWATransaction.amount_disbursed), 0),
            ).where(
                EWATransaction.employer_id == employer_id,
                EWATransaction.status == "completed",
                func.date(EWATransaction.created_at) == today,
            )
        )
    ).one()

    period_row = (
        await db.execute(
            select(
                func.count(EWATransaction.id),
                func.coalesce(func.sum(EWATransaction.amount_requested), 0),
                func.coalesce(func.sum(EWATransaction.fee), 0),
            ).where(
                EWATransaction.employer_id == employer_id,
                EWATransaction.pay_period == period,
                EWATransaction.status == "completed",
            )
        )
    ).one()

    deducted_count = (
        await db.execute(
            select(func.count()).where(
                EWATransaction.employer_id == employer_id,
                EWATransaction.pay_period == period,
                EWATransaction.status == "completed",
                EWATransaction.deducted_at.isnot(None),
            )
        )
    ).scalar() or 0

    total_completed = period_row[0] or 0
    recovery_rate = (deducted_count / total_completed) if total_completed else None

    return {
        "pay_period": period,
        "active_employees": active_count,
        "withdrawals_today_count": today_row[0],
        "withdrawals_today_amount_ghs": float(today_row[1]),
        "period_advance_count": total_completed,
        "period_advance_amount_ghs": float(period_row[1]),
        "period_fees_collected_ghs": float(period_row[2]),
        "period_recovery_rate": recovery_rate,
    }


async def compute_advance_eligibility(
    db: AsyncSession,
    employer_id: UUID,
    *,
    min_eligible_amount: float = 0.0,
    limit: int = 50,
) -> dict[str, Any]:
    """Approximate eligibility using accrual = salary/days_in_month * days_worked,
    capped at policy.max_access_pct. Mirrors the logic in services/ewa/accrual.py
    so the assistant gives the same answer the withdrawal endpoint would.
    """
    limit = max(1, min(int(limit), 200))
    today = datetime.now(timezone.utc).date()

    # Days-worked pro-rata for current month.
    if today.month == 12:
        next_month = date(today.year + 1, 1, 1)
    else:
        next_month = date(today.year, today.month + 1, 1)
    first_day = date(today.year, today.month, 1)
    days_in_month = (next_month - first_day).days
    days_worked = today.day

    policy = (
        await db.execute(
            select(EmployerPolicy).where(EmployerPolicy.employer_id == employer_id)
        )
    ).scalar_one_or_none()
    max_pct = float(policy.max_access_pct) if policy else 50.0
    max_amount = float(policy.max_withdrawal_amount) if policy and policy.max_withdrawal_amount else None

    employees = (
        await db.execute(
            select(Employee).where(
                Employee.employer_id == employer_id,
                Employee.is_active.is_(True),
            )
        )
    ).scalars().all()

    eligible: list[dict[str, Any]] = []
    for emp in employees:
        salary = float(emp.monthly_salary)
        accrued = salary * (days_worked / days_in_month)
        cap_pct = min(float(emp.ewa_limit_pct), max_pct)
        eligible_amount = accrued * (cap_pct / 100.0)
        if max_amount is not None:
            eligible_amount = min(eligible_amount, max_amount)
        eligible_amount = round(eligible_amount, 2)

        if eligible_amount >= min_eligible_amount:
            eligible.append({
                "id": str(emp.id),
                "full_name": emp.full_name,
                "department": emp.department,
                "monthly_salary_ghs": salary,
                "eligible_amount_ghs": eligible_amount,
                "limit_pct": cap_pct,
            })

    eligible.sort(key=lambda r: r["eligible_amount_ghs"], reverse=True)
    return {
        "as_of": today.isoformat(),
        "policy": {
            "max_access_pct": max_pct,
            "max_withdrawal_amount_ghs": max_amount,
        },
        "count": len(eligible[:limit]),
        "employees": eligible[:limit],
    }


async def list_high_advance_employees(
    db: AsyncSession,
    employer_id: UUID,
    *,
    pay_period: str | None = None,
    min_count: int = 3,
    min_total_amount: float = 0.0,
) -> dict[str, Any]:
    period = pay_period or _current_period()

    rows = (
        await db.execute(
            select(
                Employee.id,
                Employee.full_name,
                Employee.department,
                func.count(EWATransaction.id).label("advance_count"),
                func.coalesce(func.sum(EWATransaction.amount_disbursed), 0).label("total_amount"),
            )
            .join(EWATransaction, EWATransaction.employee_id == Employee.id)
            .where(
                Employee.employer_id == employer_id,
                EWATransaction.pay_period == period,
                EWATransaction.status == "completed",
            )
            .group_by(Employee.id, Employee.full_name, Employee.department)
            .having(func.count(EWATransaction.id) >= min_count)
            .order_by(desc("advance_count"))
        )
    ).all()

    flagged = [
        {
            "id": str(r.id),
            "full_name": r.full_name,
            "department": r.department,
            "advance_count": r.advance_count,
            "total_amount_ghs": float(r.total_amount),
        }
        for r in rows
        if float(r.total_amount) >= min_total_amount
    ]
    return {
        "pay_period": period,
        "criteria": {"min_count": min_count, "min_total_amount_ghs": min_total_amount},
        "count": len(flagged),
        "employees": flagged,
    }


async def list_recent_withdrawals(
    db: AsyncSession,
    employer_id: UUID,
    *,
    status: str | None = None,
    days: int = 7,
    limit: int = 25,
) -> dict[str, Any]:
    days = max(1, min(int(days), 90))
    limit = max(1, min(int(limit), 100))
    since = datetime.now(timezone.utc) - timedelta(days=days)

    stmt = (
        select(
            EWATransaction.id,
            EWATransaction.amount_requested,
            EWATransaction.amount_disbursed,
            EWATransaction.status,
            EWATransaction.created_at,
            EWATransaction.pay_period,
            Employee.full_name,
        )
        .join(Employee, Employee.id == EWATransaction.employee_id)
        .where(
            EWATransaction.employer_id == employer_id,
            EWATransaction.created_at >= since,
        )
        .order_by(desc(EWATransaction.created_at))
        .limit(limit)
    )
    if status:
        stmt = stmt.where(EWATransaction.status == status)

    rows = (await db.execute(stmt)).all()
    return {
        "since": since.isoformat(),
        "count": len(rows),
        "withdrawals": [
            {
                "id": str(r.id),
                "employee": r.full_name,
                "amount_requested_ghs": float(r.amount_requested),
                "amount_disbursed_ghs": float(r.amount_disbursed),
                "status": r.status,
                "pay_period": r.pay_period,
                "created_at": r.created_at.isoformat(),
            }
            for r in rows
        ],
    }


async def get_employer_policy(
    db: AsyncSession,
    employer_id: UUID,
) -> dict[str, Any]:
    policy = (
        await db.execute(
            select(EmployerPolicy).where(EmployerPolicy.employer_id == employer_id)
        )
    ).scalar_one_or_none()
    if policy is None:
        return {"exists": False, "note": "No policy configured — defaults apply (50% access, no caps)."}
    return {
        "exists": True,
        "max_access_pct": float(policy.max_access_pct),
        "max_withdrawal_amount_ghs": _to_jsonable(policy.max_withdrawal_amount),
        "max_requests_per_period": policy.max_requests_per_period,
        "min_employment_days": policy.min_employment_days,
        "min_monthly_salary_ghs": float(policy.min_monthly_salary),
        "cutoff_day_of_month": policy.cutoff_day_of_month,
        "approval_threshold_ghs": _to_jsonable(policy.approval_threshold),
        "approval_flow": policy.approval_flow,
        "fee_mode": policy.fee_mode,
        "fee_value": float(policy.fee_value),
        "department_rules": policy.department_rules,
    }


async def get_payroll_upload_status(
    db: AsyncSession,
    employer_id: UUID,
    *,
    pay_period: str | None = None,
) -> dict[str, Any]:
    period = pay_period or _current_period()
    rows = (
        await db.execute(
            select(PayrollUpload)
            .where(
                PayrollUpload.employer_id == employer_id,
                PayrollUpload.pay_period == period,
            )
            .order_by(desc(PayrollUpload.created_at))
        )
    ).scalars().all()
    return {
        "pay_period": period,
        "count": len(rows),
        "uploads": [
            {
                "id": str(u.id),
                "filename": u.filename,
                "row_count": u.row_count,
                "total_deductions_ghs": float(u.total_deductions),
                "status": u.status,
                "applied_at": u.applied_at.isoformat() if u.applied_at else None,
                "created_at": u.created_at.isoformat(),
            }
            for u in rows
        ],
    }


# ─── STUB handlers — activate when payroll engine ships ───

_NOT_IMPLEMENTED_PAYROLL = {
    "not_implemented": True,
    "reason": (
        "The payroll engine is on the v1 roadmap (sprints 1-2) but not yet built. "
        "When the payroll_run, payslip, and statutory_deduction tables ship, this "
        "tool will return real data. Until then, payroll figures must come from "
        "the spreadsheet the customer is using outside PaySync."
    ),
}


async def get_ssnit_summary(
    db: AsyncSession,
    employer_id: UUID,
    *,
    pay_period: str,
) -> dict[str, Any]:
    return _NOT_IMPLEMENTED_PAYROLL


async def explain_payroll_diff(
    db: AsyncSession,
    employer_id: UUID,
    *,
    from_period: str,
    to_period: str,
) -> dict[str, Any]:
    return _NOT_IMPLEMENTED_PAYROLL


# ─── Registry ───

HANDLERS = {
    "list_employees": list_employees,
    "get_employee": get_employee,
    "get_dashboard_metrics": get_dashboard_metrics,
    "compute_advance_eligibility": compute_advance_eligibility,
    "list_high_advance_employees": list_high_advance_employees,
    "list_recent_withdrawals": list_recent_withdrawals,
    "get_employer_policy": get_employer_policy,
    "get_payroll_upload_status": get_payroll_upload_status,
    "get_ssnit_summary": get_ssnit_summary,
    "explain_payroll_diff": explain_payroll_diff,
}
