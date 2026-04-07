"""Payroll CSV parser with column mapping, validation, and preview.

Handles employer-uploaded CSV files for:
1. Employee roster imports (bulk onboarding)
2. Payroll data uploads (for deduction processing)

Validates all rows before accepting. Returns structured errors per row.
"""

import csv
import io
import re
from dataclasses import dataclass, field
from decimal import Decimal, InvalidOperation

import structlog

logger = structlog.get_logger()

PHONE_REGEX = re.compile(r"^\+?233\d{9}$|^0\d{9}$")
PROVIDER_MAP = {
    "024": "mtn", "054": "mtn", "055": "mtn", "059": "mtn",
    "020": "vodafone", "050": "vodafone",
    "027": "airteltigo", "057": "airteltigo", "026": "airteltigo", "056": "airteltigo",
}


@dataclass
class ParseError:
    row: int
    column: str
    message: str


@dataclass
class ParsedEmployee:
    full_name: str
    phone: str
    momo_number: str
    momo_provider: str
    monthly_salary: Decimal
    department: str | None = None
    ewa_limit_pct: Decimal = field(default_factory=lambda: Decimal("50.00"))


@dataclass
class ParseResult:
    employees: list[ParsedEmployee]
    errors: list[ParseError]
    total_rows: int
    valid_rows: int

    @property
    def is_valid(self) -> bool:
        return len(self.errors) == 0 and self.valid_rows > 0


# Default column mapping (case-insensitive, stripped)
DEFAULT_COLUMN_MAP = {
    "full_name": ["full_name", "name", "employee_name", "full name", "employee"],
    "phone": ["phone", "phone_number", "mobile", "contact", "phone number"],
    "momo_number": ["momo_number", "momo", "mobile_money", "momo number", "wallet"],
    "monthly_salary": ["monthly_salary", "salary", "gross_salary", "monthly salary", "pay"],
    "department": ["department", "dept", "division", "unit"],
    "ewa_limit_pct": ["ewa_limit_pct", "ewa_limit", "ewa_pct", "ewa limit", "limit_pct"],
}


def _normalize_phone(raw: str) -> str:
    """Normalize a Ghana phone number to E.164 format (+233XXXXXXXXX)."""
    cleaned = raw.strip().replace(" ", "").replace("-", "")
    if cleaned.startswith("0") and len(cleaned) == 10:
        return f"+233{cleaned[1:]}"
    if cleaned.startswith("233") and len(cleaned) == 12:
        return f"+{cleaned}"
    if cleaned.startswith("+233") and len(cleaned) == 13:
        return cleaned
    return cleaned  # Return as-is; validation will catch it


def _infer_provider(momo_number: str) -> str | None:
    """Infer MoMo provider from the first 3 digits of a local number."""
    # Normalize to local format for prefix matching
    local = momo_number
    if local.startswith("+233"):
        local = "0" + local[4:]
    elif local.startswith("233"):
        local = "0" + local[3:]

    prefix = local[:3]
    return PROVIDER_MAP.get(prefix)


def _resolve_columns(
    headers: list[str],
    custom_map: dict[str, str] | None = None,
) -> dict[str, int]:
    """Map logical field names to CSV column indexes."""
    normalized = [h.strip().lower().replace(" ", "_") for h in headers]
    resolved: dict[str, int] = {}

    if custom_map:
        for field_name, csv_col in custom_map.items():
            col_norm = csv_col.strip().lower().replace(" ", "_")
            if col_norm in normalized:
                resolved[field_name] = normalized.index(col_norm)
        return resolved

    for field_name, aliases in DEFAULT_COLUMN_MAP.items():
        for alias in aliases:
            alias_norm = alias.strip().lower().replace(" ", "_")
            if alias_norm in normalized:
                resolved[field_name] = normalized.index(alias_norm)
                break

    return resolved


def parse_employee_csv(
    csv_content: str | bytes,
    custom_column_map: dict[str, str] | None = None,
) -> ParseResult:
    """Parse a CSV file into validated employee records.

    Args:
        csv_content: Raw CSV content (string or bytes).
        custom_column_map: Optional mapping of {field_name: csv_column_header}.

    Returns:
        ParseResult with validated employees and per-row errors.
    """
    if isinstance(csv_content, bytes):
        csv_content = csv_content.decode("utf-8-sig")  # Handle BOM

    reader = csv.reader(io.StringIO(csv_content))
    rows = list(reader)

    if len(rows) < 2:
        return ParseResult(employees=[], errors=[
            ParseError(row=0, column="", message="CSV must have a header row and at least one data row")
        ], total_rows=0, valid_rows=0)

    headers = rows[0]
    col_map = _resolve_columns(headers, custom_column_map)

    # Check required columns
    required = ["full_name", "phone", "monthly_salary"]
    missing = [f for f in required if f not in col_map]
    if missing:
        return ParseResult(employees=[], errors=[
            ParseError(row=0, column=", ".join(missing),
                       message=f"Missing required columns: {', '.join(missing)}")
        ], total_rows=len(rows) - 1, valid_rows=0)

    employees: list[ParsedEmployee] = []
    errors: list[ParseError] = []

    for row_idx, row in enumerate(rows[1:], start=2):
        if not any(cell.strip() for cell in row):
            continue  # Skip blank rows

        row_errors: list[ParseError] = []

        # Full name
        name_idx = col_map.get("full_name")
        full_name = row[name_idx].strip() if name_idx is not None and name_idx < len(row) else ""
        if not full_name or len(full_name) < 2:
            row_errors.append(ParseError(row=row_idx, column="full_name", message="Name is required (min 2 chars)"))

        # Phone
        phone_idx = col_map.get("phone")
        raw_phone = row[phone_idx].strip() if phone_idx is not None and phone_idx < len(row) else ""
        phone = _normalize_phone(raw_phone)
        if not re.match(r"^\+233\d{9}$", phone):
            row_errors.append(ParseError(row=row_idx, column="phone", message=f"Invalid Ghana phone: {raw_phone}"))

        # MoMo number (defaults to phone if not provided)
        momo_idx = col_map.get("momo_number")
        if momo_idx is not None and momo_idx < len(row) and row[momo_idx].strip():
            momo_number = row[momo_idx].strip()
        else:
            # Use phone as momo number, convert to local format
            momo_number = "0" + phone[4:] if phone.startswith("+233") else raw_phone

        # Provider inference
        provider = _infer_provider(momo_number)
        if provider is None:
            row_errors.append(ParseError(row=row_idx, column="momo_number",
                                         message=f"Cannot infer MoMo provider from: {momo_number}"))
            provider = "mtn"  # Fallback for error reporting

        # Monthly salary
        salary_idx = col_map.get("monthly_salary")
        raw_salary = row[salary_idx].strip() if salary_idx is not None and salary_idx < len(row) else ""
        raw_salary = raw_salary.replace(",", "").replace("GHS", "").replace("₵", "").strip()
        try:
            salary = Decimal(raw_salary).quantize(Decimal("0.01"))
            if salary <= 0:
                row_errors.append(ParseError(row=row_idx, column="monthly_salary", message="Salary must be positive"))
        except (InvalidOperation, ValueError):
            row_errors.append(ParseError(row=row_idx, column="monthly_salary", message=f"Invalid salary: {raw_salary}"))
            salary = Decimal("0")

        # Department (optional)
        dept_idx = col_map.get("department")
        department = row[dept_idx].strip() if dept_idx is not None and dept_idx < len(row) else None
        if department == "":
            department = None

        # EWA limit (optional, defaults to 50%)
        ewa_idx = col_map.get("ewa_limit_pct")
        ewa_limit = Decimal("50.00")
        if ewa_idx is not None and ewa_idx < len(row) and row[ewa_idx].strip():
            try:
                ewa_limit = Decimal(row[ewa_idx].strip().replace("%", ""))
                if not (Decimal("1") <= ewa_limit <= Decimal("80")):
                    row_errors.append(ParseError(row=row_idx, column="ewa_limit_pct",
                                                 message="EWA limit must be 1-80%"))
                    ewa_limit = Decimal("50.00")
            except (InvalidOperation, ValueError):
                row_errors.append(ParseError(row=row_idx, column="ewa_limit_pct",
                                             message="Invalid EWA limit percentage"))

        if row_errors:
            errors.extend(row_errors)
        else:
            employees.append(ParsedEmployee(
                full_name=full_name,
                phone=phone,
                momo_number=momo_number,
                momo_provider=provider,
                monthly_salary=salary,
                department=department,
                ewa_limit_pct=ewa_limit,
            ))

    return ParseResult(
        employees=employees,
        errors=errors,
        total_rows=len(rows) - 1,
        valid_rows=len(employees),
    )
