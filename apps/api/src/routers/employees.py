"""Employees router — CRUD operations, CSV upload, employee detail.

All endpoints require employer authentication (employer_admin or manager role).
Tenant isolation enforced via RLS and JWT employer_id claim.
"""

from datetime import date
from uuid import UUID

import structlog
from fastapi import APIRouter, Depends, File, HTTPException, Request, UploadFile
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.database import get_db
from src.core.security import encrypt_pii
from src.models import Employee
from src.schemas import EmployeeCreate, EmployeeListResponse, EmployeeResponse
from src.services.ewa.payroll_parser import parse_employee_csv

logger = structlog.get_logger()
router = APIRouter(prefix="/api/v1/employees", tags=["employees"])


@router.get("/me", response_model=EmployeeResponse)
async def get_my_profile(
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> EmployeeResponse:
    """Get the authenticated employee's own profile."""
    sub = getattr(request.state, "sub", None)
    if sub is None:
        raise HTTPException(status_code=401, detail="Authentication required")

    result = await db.execute(
        select(Employee).where(Employee.id == UUID(sub))
    )
    employee = result.scalar_one_or_none()
    if employee is None:
        raise HTTPException(status_code=404, detail="Employee not found")

    return EmployeeResponse.model_validate(employee)


@router.get("", response_model=EmployeeListResponse)
async def list_employees(
    request: Request,
    department: str | None = None,
    is_active: bool = True,
    search: str | None = None,
    limit: int = 50,
    offset: int = 0,
    db: AsyncSession = Depends(get_db),
) -> EmployeeListResponse:
    """List employees for the authenticated employer."""
    employer_id = _get_employer_id(request)

    query = select(Employee).where(
        Employee.employer_id == employer_id,
        Employee.is_active == is_active,
    )

    if department:
        query = query.where(Employee.department == department)
    if search:
        query = query.where(Employee.full_name.ilike(f"%{search}%"))

    count_query = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_query)).scalar() or 0

    query = query.order_by(Employee.full_name).limit(limit).offset(offset)
    result = await db.execute(query)
    employees = result.scalars().all()

    return EmployeeListResponse(
        employees=[EmployeeResponse.model_validate(e) for e in employees],
        total=total,
    )


@router.post("", response_model=EmployeeResponse, status_code=201)
async def create_employee(
    body: EmployeeCreate,
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> EmployeeResponse:
    """Create a single employee."""
    employer_id = _get_employer_id(request)

    # Check phone uniqueness (globally — one phone = one employee)
    existing = await db.execute(
        select(Employee).where(Employee.phone == body.phone)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Phone number already registered")

    employee = Employee(
        employer_id=employer_id,
        full_name=body.full_name,
        phone=body.phone,
        momo_number=encrypt_pii(body.momo_number),
        momo_provider=body.momo_provider.value,
        monthly_salary=body.monthly_salary,
        ewa_limit_pct=body.ewa_limit_pct,
        department=body.department,
        start_date=body.start_date,
    )
    db.add(employee)
    await db.flush()

    logger.info(
        "employee_created",
        employee_id=str(employee.id),
        employer_id=str(employer_id),
    )

    return EmployeeResponse.model_validate(employee)


@router.get("/{employee_id}", response_model=EmployeeResponse)
async def get_employee(
    employee_id: UUID,
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> EmployeeResponse:
    """Get employee detail by ID."""
    employer_id = _get_employer_id(request)

    result = await db.execute(
        select(Employee).where(
            Employee.id == employee_id,
            Employee.employer_id == employer_id,
        )
    )
    employee = result.scalar_one_or_none()
    if employee is None:
        raise HTTPException(status_code=404, detail="Employee not found")

    return EmployeeResponse.model_validate(employee)


@router.patch("/{employee_id}", response_model=EmployeeResponse)
async def update_employee(
    employee_id: UUID,
    request: Request,
    department: str | None = None,
    ewa_limit_pct: float | None = None,
    is_active: bool | None = None,
    db: AsyncSession = Depends(get_db),
) -> EmployeeResponse:
    """Update employee fields (department, EWA limit, active status)."""
    employer_id = _get_employer_id(request)

    result = await db.execute(
        select(Employee).where(
            Employee.id == employee_id,
            Employee.employer_id == employer_id,
        )
    )
    employee = result.scalar_one_or_none()
    if employee is None:
        raise HTTPException(status_code=404, detail="Employee not found")

    if department is not None:
        employee.department = department
    if ewa_limit_pct is not None:
        if not (1 <= ewa_limit_pct <= 80):
            raise HTTPException(status_code=400, detail="EWA limit must be 1-80%")
        employee.ewa_limit_pct = ewa_limit_pct
    if is_active is not None:
        employee.is_active = is_active

    await db.flush()
    return EmployeeResponse.model_validate(employee)


@router.post("/upload/preview")
async def preview_csv_upload(
    file: UploadFile = File(...),
) -> dict:
    """Preview a CSV upload: parse, validate, return results without saving."""
    if not file.filename or not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="File must be a .csv")

    content = await file.read()
    if len(content) > 5 * 1024 * 1024:  # 5MB limit
        raise HTTPException(status_code=400, detail="File too large (max 5MB)")

    result = parse_employee_csv(content)

    return {
        "total_rows": result.total_rows,
        "valid_rows": result.valid_rows,
        "errors": [
            {"row": e.row, "column": e.column, "message": e.message}
            for e in result.errors
        ],
        "preview": [
            {
                "full_name": emp.full_name,
                "phone": emp.phone,
                "momo_provider": emp.momo_provider,
                "monthly_salary": str(emp.monthly_salary),
                "department": emp.department,
                "ewa_limit_pct": str(emp.ewa_limit_pct),
            }
            for emp in result.employees[:10]  # Preview first 10
        ],
        "is_valid": result.is_valid,
    }


@router.post("/upload/confirm", status_code=201)
async def confirm_csv_upload(
    file: UploadFile = File(...),
    request: Request = None,
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Upload and save employees from CSV. Returns created count and errors."""
    employer_id = _get_employer_id(request)

    content = await file.read()
    result = parse_employee_csv(content)

    if not result.is_valid:
        raise HTTPException(
            status_code=422,
            detail={
                "message": "CSV has validation errors",
                "errors": [
                    {"row": e.row, "column": e.column, "message": e.message}
                    for e in result.errors
                ],
            },
        )

    created = 0
    skipped = 0
    for emp in result.employees:
        # Check phone uniqueness
        existing = await db.execute(
            select(Employee).where(Employee.phone == emp.phone)
        )
        if existing.scalar_one_or_none():
            skipped += 1
            continue

        employee = Employee(
            employer_id=employer_id,
            full_name=emp.full_name,
            phone=emp.phone,
            momo_number=encrypt_pii(emp.momo_number),
            momo_provider=emp.momo_provider,
            monthly_salary=emp.monthly_salary,
            ewa_limit_pct=emp.ewa_limit_pct,
            department=emp.department,
            start_date=date.today(),
        )
        db.add(employee)
        created += 1

    await db.flush()

    logger.info(
        "csv_upload_completed",
        employer_id=str(employer_id),
        created=created,
        skipped=skipped,
    )

    return {"created": created, "skipped": skipped, "total": result.total_rows}


def _get_employer_id(request: Request) -> UUID:
    employer_id = getattr(request.state, "employer_id", None)
    if employer_id is None:
        raise HTTPException(status_code=401, detail="Authentication required")
    return UUID(employer_id) if isinstance(employer_id, str) else employer_id
