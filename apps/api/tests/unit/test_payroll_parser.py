"""Unit tests for the payroll CSV parser."""

from decimal import Decimal

import pytest

from src.services.ewa.payroll_parser import (
    ParseResult,
    _infer_provider,
    _normalize_phone,
    parse_employee_csv,
)


class TestPhoneNormalization:
    def test_local_format(self) -> None:
        assert _normalize_phone("0241234567") == "+233241234567"

    def test_international_no_plus(self) -> None:
        assert _normalize_phone("233241234567") == "+233241234567"

    def test_e164_format(self) -> None:
        assert _normalize_phone("+233241234567") == "+233241234567"

    def test_with_spaces(self) -> None:
        assert _normalize_phone("024 123 4567") == "+233241234567"

    def test_with_dashes(self) -> None:
        assert _normalize_phone("024-123-4567") == "+233241234567"


class TestProviderInference:
    def test_mtn_024(self) -> None:
        assert _infer_provider("0241234567") == "mtn"

    def test_mtn_054(self) -> None:
        assert _infer_provider("0541234567") == "mtn"

    def test_vodafone_020(self) -> None:
        assert _infer_provider("0201234567") == "vodafone"

    def test_airteltigo_027(self) -> None:
        assert _infer_provider("0271234567") == "airteltigo"

    def test_e164_input(self) -> None:
        assert _infer_provider("+233241234567") == "mtn"

    def test_unknown_prefix(self) -> None:
        assert _infer_provider("0991234567") is None


class TestCSVParser:
    def test_valid_csv(self) -> None:
        csv = """full_name,phone,monthly_salary,department
Kwame Asante,0241234567,3200.00,Engineering
Ama Mensah,0201234567,2800.50,Finance"""

        result = parse_employee_csv(csv)
        assert result.is_valid
        assert result.valid_rows == 2
        assert result.total_rows == 2
        assert len(result.errors) == 0

        assert result.employees[0].full_name == "Kwame Asante"
        assert result.employees[0].phone == "+233241234567"
        assert result.employees[0].momo_provider == "mtn"
        assert result.employees[0].monthly_salary == Decimal("3200.00")

    def test_custom_column_map(self) -> None:
        csv = """Employee,Contact,Pay
Kwame,0241234567,3200"""

        result = parse_employee_csv(csv, custom_column_map={
            "full_name": "Employee",
            "phone": "Contact",
            "monthly_salary": "Pay",
        })
        assert result.is_valid
        assert result.employees[0].full_name == "Kwame"

    def test_missing_required_columns(self) -> None:
        csv = """department,email
Engineering,kwame@test.com"""

        result = parse_employee_csv(csv)
        assert not result.is_valid
        assert len(result.errors) > 0

    def test_invalid_phone(self) -> None:
        csv = """full_name,phone,monthly_salary
Kwame,12345,3200"""

        result = parse_employee_csv(csv)
        assert not result.is_valid

    def test_negative_salary(self) -> None:
        csv = """full_name,phone,monthly_salary
Kwame,0241234567,-500"""

        result = parse_employee_csv(csv)
        assert not result.is_valid

    def test_salary_with_currency_symbol(self) -> None:
        csv = """full_name,phone,monthly_salary
Kwame,0241234567,GHS 3200.00"""

        result = parse_employee_csv(csv)
        assert result.is_valid
        assert result.employees[0].monthly_salary == Decimal("3200.00")

    def test_salary_with_commas(self) -> None:
        csv = """full_name,phone,monthly_salary
Kwame,0241234567,"3,200.00" """

        result = parse_employee_csv(csv)
        assert result.is_valid

    def test_blank_rows_skipped(self) -> None:
        csv = """full_name,phone,monthly_salary
Kwame,0241234567,3200

Ama,0201234567,2800"""

        result = parse_employee_csv(csv)
        assert result.valid_rows == 2

    def test_ewa_limit_override(self) -> None:
        csv = """full_name,phone,monthly_salary,ewa_limit_pct
Kwame,0241234567,3200,70"""

        result = parse_employee_csv(csv)
        assert result.is_valid
        assert result.employees[0].ewa_limit_pct == Decimal("70")

    def test_ewa_limit_out_of_range(self) -> None:
        csv = """full_name,phone,monthly_salary,ewa_limit_pct
Kwame,0241234567,3200,95"""

        result = parse_employee_csv(csv)
        assert not result.is_valid

    def test_empty_csv(self) -> None:
        result = parse_employee_csv("just_a_header\n")
        assert not result.is_valid

    def test_bytes_input_with_bom(self) -> None:
        csv = b"\xef\xbb\xbffull_name,phone,monthly_salary\nKwame,0241234567,3200"
        result = parse_employee_csv(csv)
        assert result.is_valid

    def test_momo_defaults_to_phone(self) -> None:
        csv = """full_name,phone,monthly_salary
Kwame,0241234567,3200"""

        result = parse_employee_csv(csv)
        assert result.employees[0].momo_number == "0241234567"
