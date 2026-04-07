"""Unit tests for Pydantic v2 request/response schemas."""

from decimal import Decimal

import pytest
from pydantic import ValidationError

from src.schemas import (
    EmployeeCreate,
    EmployeeOTPRequest,
    EmployerRegisterRequest,
    WithdrawalRequest,
)


class TestEmployerRegister:
    def test_valid(self) -> None:
        req = EmployerRegisterRequest(
            company_name="Acme Ltd",
            ghana_tin="C0012345678",
            email="admin@acme.com",
            password="securepass123",
            payday=25,
        )
        assert req.company_name == "Acme Ltd"

    def test_short_company_name(self) -> None:
        with pytest.raises(ValidationError):
            EmployerRegisterRequest(
                company_name="A",
                ghana_tin="C001",
                email="a@b.com",
                password="12345678",
                payday=25,
            )

    def test_invalid_email(self) -> None:
        with pytest.raises(ValidationError):
            EmployerRegisterRequest(
                company_name="Acme",
                ghana_tin="C001234",
                email="not-an-email",
                password="12345678",
                payday=25,
            )

    def test_payday_out_of_range(self) -> None:
        with pytest.raises(ValidationError):
            EmployerRegisterRequest(
                company_name="Acme",
                ghana_tin="C001234",
                email="a@b.com",
                password="12345678",
                payday=32,
            )

    def test_short_password(self) -> None:
        with pytest.raises(ValidationError):
            EmployerRegisterRequest(
                company_name="Acme",
                ghana_tin="C001234",
                email="a@b.com",
                password="short",
                payday=25,
            )


class TestEmployeeOTP:
    def test_valid_phone(self) -> None:
        req = EmployeeOTPRequest(phone="+233241234567")
        assert req.phone == "+233241234567"

    def test_invalid_phone(self) -> None:
        with pytest.raises(ValidationError, match="Ghana prefix"):
            EmployeeOTPRequest(phone="+44123456789")

    def test_short_phone(self) -> None:
        with pytest.raises(ValidationError):
            EmployeeOTPRequest(phone="+23324")


class TestWithdrawalRequest:
    def _make(self, **overrides):
        """Helper to create a valid WithdrawalRequest with defaults."""
        from uuid import uuid4
        defaults = {
            "employee_id": str(uuid4()),
            "amount": Decimal("400.00"),
            "momo_number": "0241234567",
            "momo_provider": "mtn",
        }
        defaults.update(overrides)
        return WithdrawalRequest(**defaults)

    def test_valid_amount(self) -> None:
        req = self._make(amount=Decimal("400.00"))
        assert req.amount == Decimal("400.00")

    def test_min_amount(self) -> None:
        req = self._make(amount=Decimal("50.00"))
        assert req.amount == Decimal("50.00")

    def test_max_amount(self) -> None:
        req = self._make(amount=Decimal("2000.00"))
        assert req.amount == Decimal("2000.00")

    def test_below_min(self) -> None:
        with pytest.raises(ValidationError):
            self._make(amount=Decimal("49.99"))

    def test_above_max(self) -> None:
        with pytest.raises(ValidationError):
            self._make(amount=Decimal("2000.01"))

    def test_too_many_decimal_places(self) -> None:
        with pytest.raises(ValidationError, match="2 decimal"):
            self._make(amount=Decimal("100.123"))

    def test_exact_two_decimals(self) -> None:
        req = self._make(amount=Decimal("99.99"))
        assert req.amount == Decimal("99.99")

    def test_invalid_momo_number(self) -> None:
        with pytest.raises(ValidationError, match="10 digits"):
            self._make(momo_number="12345")

    def test_valid_momo_provider(self) -> None:
        req = self._make(momo_provider="vodafone")
        assert req.momo_provider == "vodafone"


class TestEmployeeCreate:
    def test_valid(self) -> None:
        emp = EmployeeCreate(
            full_name="Kwame Asante",
            phone="+233241234567",
            momo_number="0241234567",
            momo_provider="mtn",
            monthly_salary=Decimal("3200.00"),
            start_date="2025-01-15",
        )
        assert emp.full_name == "Kwame Asante"
        assert emp.ewa_limit_pct == Decimal("50.00")

    def test_invalid_momo_number(self) -> None:
        with pytest.raises(ValidationError, match="10 digits"):
            EmployeeCreate(
                full_name="Test",
                phone="+233241234567",
                momo_number="12345",
                momo_provider="mtn",
                monthly_salary=Decimal("3200.00"),
                start_date="2025-01-15",
            )

    def test_ewa_limit_bounds(self) -> None:
        with pytest.raises(ValidationError):
            EmployeeCreate(
                full_name="Test",
                phone="+233241234567",
                momo_number="0241234567",
                momo_provider="mtn",
                monthly_salary=Decimal("3200.00"),
                ewa_limit_pct=Decimal("81"),
                start_date="2025-01-15",
            )

    def test_zero_salary(self) -> None:
        with pytest.raises(ValidationError):
            EmployeeCreate(
                full_name="Test",
                phone="+233241234567",
                momo_number="0241234567",
                momo_provider="mtn",
                monthly_salary=Decimal("0"),
                start_date="2025-01-15",
            )
