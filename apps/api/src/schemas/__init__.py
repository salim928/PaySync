"""Pydantic v2 request/response schemas.

All monetary fields use Decimal. All responses use RFC 7807 Problem Details for errors.
Phone numbers enforce Ghana E.164 format. Pay periods enforce YYYY-MM regex.
"""

import re
from datetime import date, datetime
from decimal import Decimal
from enum import StrEnum
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator


# ── Validators ──

PHONE_REGEX = re.compile(r"^\+233\d{9}$")
PAY_PERIOD_REGEX = re.compile(r"^\d{4}-(0[1-9]|1[0-2])$")
MOMO_REGEX = re.compile(r"^0\d{9}$")


def validate_ghana_phone(v: str) -> str:
    if not PHONE_REGEX.match(v):
        msg = "Phone must be in E.164 format with Ghana prefix (+233XXXXXXXXX)"
        raise ValueError(msg)
    return v


def validate_pay_period(v: str) -> str:
    if not PAY_PERIOD_REGEX.match(v):
        msg = "Pay period must be in YYYY-MM format"
        raise ValueError(msg)
    return v


def validate_momo_number(v: str) -> str:
    if not MOMO_REGEX.match(v):
        msg = "MoMo number must be 10 digits starting with 0"
        raise ValueError(msg)
    return v


# ── Enums ──

class MoMoProvider(StrEnum):
    MTN = "mtn"
    VODAFONE = "vodafone"
    AIRTELTIGO = "airteltigo"


class TransactionStatus(StrEnum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class Plan(StrEnum):
    STARTER = "starter"
    GROWTH = "growth"
    ENTERPRISE = "enterprise"


# ── Error response (RFC 7807) ──

class ProblemDetail(BaseModel):
    type: str = "about:blank"
    title: str
    status: int
    detail: str


# ── Auth schemas ──

class EmployerRegisterRequest(BaseModel):
    company_name: str = Field(..., min_length=2, max_length=200)
    ghana_tin: str = Field(..., min_length=5, max_length=20)
    email: str = Field(..., pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
    password: str = Field(..., min_length=8, max_length=128)
    payday: int = Field(..., ge=1, le=31)

    model_config = ConfigDict(str_strip_whitespace=True)


class EmployerLoginRequest(BaseModel):
    email: str
    password: str


class TOTPSetupResponse(BaseModel):
    totp_uri: str
    secret: str  # Only shown once during setup


class TOTPVerifyRequest(BaseModel):
    code: str = Field(..., min_length=6, max_length=6, pattern=r"^\d{6}$")


class EmployeeOTPRequest(BaseModel):
    phone: str

    @field_validator("phone")
    @classmethod
    def check_phone(cls, v: str) -> str:
        return validate_ghana_phone(v)


class EmployeeOTPVerifyRequest(BaseModel):
    phone: str
    code: str = Field(..., min_length=6, max_length=6, pattern=r"^\d{6}$")

    @field_validator("phone")
    @classmethod
    def check_phone(cls, v: str) -> str:
        return validate_ghana_phone(v)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    role: str


# ── Employee schemas ──

class EmployeeCreate(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=200)
    phone: str
    momo_number: str
    momo_provider: MoMoProvider
    monthly_salary: Decimal = Field(..., gt=0, decimal_places=2)
    ewa_limit_pct: Decimal = Field(default=Decimal("50.00"), ge=1, le=80)
    department: str | None = None
    start_date: date

    @field_validator("phone")
    @classmethod
    def check_phone(cls, v: str) -> str:
        return validate_ghana_phone(v)

    @field_validator("momo_number")
    @classmethod
    def check_momo(cls, v: str) -> str:
        return validate_momo_number(v)


class EmployeeResponse(BaseModel):
    id: UUID
    employer_id: UUID
    full_name: str
    phone: str
    momo_provider: str
    monthly_salary: Decimal
    ewa_limit_pct: Decimal
    department: str | None
    start_date: date
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class EmployeeListResponse(BaseModel):
    employees: list[EmployeeResponse]
    total: int


# ── EWA schemas ──

class AccrualResponse(BaseModel):
    employee_id: UUID
    monthly_salary: Decimal
    days_worked: int
    days_in_month: int
    gross_accrued: Decimal
    ewa_ceiling: Decimal
    period_withdrawals: Decimal
    available: Decimal
    pay_period: str
    next_payday: str | None = None
    calculated_at: datetime


class WithdrawalRequest(BaseModel):
    employee_id: UUID
    amount: Decimal = Field(..., ge=Decimal("50.00"), le=Decimal("2000.00"))
    momo_number: str
    momo_provider: MoMoProvider

    @field_validator("amount")
    @classmethod
    def validate_precision(cls, v: Decimal) -> Decimal:
        if v != v.quantize(Decimal("0.01")):
            msg = "Amount must have at most 2 decimal places"
            raise ValueError(msg)
        return v

    @field_validator("momo_number")
    @classmethod
    def check_momo(cls, v: str) -> str:
        return validate_momo_number(v)


class WithdrawalResponse(BaseModel):
    id: UUID
    amount_requested: Decimal
    amount_disbursed: Decimal
    fee: Decimal
    status: str
    accrual_snapshot: Decimal
    pay_period: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TransactionResponse(BaseModel):
    id: UUID
    employee_id: UUID
    employer_id: UUID
    amount_requested: Decimal
    amount_disbursed: Decimal
    fee: Decimal
    status: str
    momo_reference: str | None
    accrual_snapshot: Decimal
    pay_period: str
    deducted_at: datetime | None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TransactionListResponse(BaseModel):
    transactions: list[TransactionResponse]
    total: int


# ── Payroll / Deduction schemas ──

class PayrollUploadResponse(BaseModel):
    id: UUID
    employer_id: UUID
    filename: str
    pay_period: str
    row_count: int
    total_deductions: Decimal
    status: str
    applied_at: datetime | None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class DeductionReportItem(BaseModel):
    employee_id: UUID
    employee_name: str
    total_withdrawn: Decimal
    total_fees: Decimal
    net_deduction: Decimal
    transaction_count: int


class DeductionReport(BaseModel):
    pay_period: str
    employer_id: UUID
    items: list[DeductionReportItem]
    grand_total: Decimal
    total_fees: Decimal
    transaction_count: int


# ── Health check ──

class HealthResponse(BaseModel):
    status: str
    db: str
    redis: str
    celery: str
