"""SQLAlchemy 2.x ORM models for all WageNow tables.

All monetary columns use Numeric(12, 2). All IDs are UUIDs.
All timestamps are timezone-aware (TIMESTAMPTZ).
PII fields (momo_number, momo_account) are encrypted at the application layer.
"""

import uuid
from datetime import date, datetime

from sqlalchemy import (
    Boolean,
    Date,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    Numeric,
    String,
    Text,
    text,
)
from sqlalchemy.dialects.postgresql import INET, JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.core.database import Base


class Employer(Base):
    __tablename__ = "employers"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()")
    )
    company_name: Mapped[str] = mapped_column(Text, nullable=False)
    ghana_tin: Mapped[str] = mapped_column(Text, unique=True, nullable=False)
    email: Mapped[str] = mapped_column(Text, unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(Text, nullable=False)
    totp_secret: Mapped[str | None] = mapped_column(Text, nullable=True)
    totp_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    momo_account: Mapped[str | None] = mapped_column(Text, nullable=True)  # encrypted
    payroll_cycle: Mapped[str] = mapped_column(Text, default="monthly", nullable=False)
    payday: Mapped[int] = mapped_column(Integer, nullable=False)
    ewa_enabled: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    spend_enabled: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    plan: Mapped[str] = mapped_column(Text, default="starter", nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=text("now()"), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=text("now()"), nullable=False
    )

    # Relationships
    employees: Mapped[list["Employee"]] = relationship(back_populates="employer")
    ewa_transactions: Mapped[list["EWATransaction"]] = relationship(
        back_populates="employer"
    )


class Employee(Base):
    __tablename__ = "employees"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()")
    )
    employer_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("employers.id", ondelete="CASCADE"), nullable=False
    )
    full_name: Mapped[str] = mapped_column(Text, nullable=False)
    phone: Mapped[str] = mapped_column(Text, unique=True, nullable=False)
    momo_number: Mapped[str] = mapped_column(Text, nullable=False)  # encrypted
    momo_provider: Mapped[str] = mapped_column(Text, nullable=False)
    monthly_salary: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    ewa_limit_pct: Mapped[float] = mapped_column(
        Numeric(5, 2), default=50.00, nullable=False
    )
    department: Mapped[str | None] = mapped_column(Text, nullable=True)
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=text("now()"), nullable=False
    )

    # Relationships
    employer: Mapped["Employer"] = relationship(back_populates="employees")
    ewa_transactions: Mapped[list["EWATransaction"]] = relationship(
        back_populates="employee"
    )


class PayrollUpload(Base):
    __tablename__ = "payroll_uploads"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()")
    )
    employer_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("employers.id", ondelete="CASCADE"), nullable=False
    )
    uploaded_by: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    filename: Mapped[str] = mapped_column(Text, nullable=False)
    pay_period: Mapped[str] = mapped_column(Text, nullable=False)
    row_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    total_deductions: Mapped[float] = mapped_column(
        Numeric(12, 2), default=0, nullable=False
    )
    status: Mapped[str] = mapped_column(Text, default="pending", nullable=False)
    applied_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=text("now()"), nullable=False
    )


class EWATransaction(Base):
    __tablename__ = "ewa_transactions"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()")
    )
    employee_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("employees.id"), nullable=False
    )
    employer_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("employers.id"), nullable=False
    )
    amount_requested: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    amount_disbursed: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    fee: Mapped[float] = mapped_column(Numeric(12, 2), default=3.00, nullable=False)
    status: Mapped[str] = mapped_column(Text, default="pending", nullable=False)
    momo_reference: Mapped[str | None] = mapped_column(Text, nullable=True)
    idempotency_key: Mapped[str] = mapped_column(Text, unique=True, nullable=False)
    accrual_snapshot: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    pay_period: Mapped[str] = mapped_column(Text, nullable=False)
    deducted_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    payroll_upload_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("payroll_uploads.id"), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=text("now()"), nullable=False
    )

    # Relationships
    employee: Mapped["Employee"] = relationship(back_populates="ewa_transactions")
    employer: Mapped["Employer"] = relationship(back_populates="ewa_transactions")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()")
    )
    actor_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), nullable=True)
    action: Mapped[str] = mapped_column(Text, nullable=False)
    entity_type: Mapped[str | None] = mapped_column(Text, nullable=True)
    entity_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), nullable=True)
    event_metadata: Mapped[dict | None] = mapped_column(
        "metadata", JSONB, nullable=True
    )
    ip_address: Mapped[str | None] = mapped_column(INET, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=text("now()"), nullable=False
    )


# ── Phase 2 stubs (tables exist, models defined, not used in Phase 1) ──

class SpendWallet(Base):
    __tablename__ = "spend_wallets"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()")
    )
    employer_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("employers.id"), nullable=False
    )
    employee_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("employees.id"), nullable=True
    )
    name: Mapped[str] = mapped_column(Text, nullable=False)
    wallet_type: Mapped[str] = mapped_column(Text, nullable=False)
    balance: Mapped[float] = mapped_column(Numeric(12, 2), default=0, nullable=False)
    weekly_limit: Mapped[float | None] = mapped_column(Numeric(12, 2), nullable=True)
    monthly_limit: Mapped[float | None] = mapped_column(Numeric(12, 2), nullable=True)
    requires_approval_above: Mapped[float | None] = mapped_column(
        Numeric(12, 2), nullable=True
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=text("now()"), nullable=False
    )
