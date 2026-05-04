"""Tool catalog — Anthropic tool definitions for the assistant.

The catalog is the contract between Claude and PaySync. Adding a tool here
without adding a handler in handlers.py will cause a runtime error when
Claude tries to call it. Keep the two files in sync.

Tools are grouped:
- LIVE: implemented against existing tables. Work today.
- STUB: defined but not yet wired up. Returns a structured "not implemented"
  response so Claude can explain the gap to the user without crashing.
  These activate when sprint 1-2 (payroll engine) lands.
"""

from typing import Any

# Tool definitions follow Anthropic Messages API tool schema.
# Names use snake_case verb_noun. Descriptions are written for Claude, not humans.

TOOL_DEFINITIONS: list[dict[str, Any]] = [
    # ─── LIVE TOOLS ───
    {
        "name": "list_employees",
        "description": (
            "List employees for the current employer. Filter by department, "
            "active status, or a name search. Use this when the user asks "
            "'show me employees in X' or 'who is in the engineering team.' "
            "Returns up to `limit` rows (default 25, max 100)."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "department": {
                    "type": "string",
                    "description": "Filter by department name (case-insensitive). Omit for all departments.",
                },
                "active_only": {
                    "type": "boolean",
                    "description": "If true (default), exclude employees with is_active=false.",
                },
                "name_search": {
                    "type": "string",
                    "description": "Substring match against full_name (case-insensitive).",
                },
                "limit": {
                    "type": "integer",
                    "description": "Max rows to return. Default 25, max 100.",
                },
            },
        },
    },
    {
        "name": "get_employee",
        "description": (
            "Get full profile for one employee, including monthly salary, EWA "
            "limit %, department, start date, and a summary of their last 5 "
            "EWA advances. Use when the user names a specific employee or "
            "asks for details on one person."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "employee_id": {
                    "type": "string",
                    "description": "UUID of the employee.",
                },
            },
            "required": ["employee_id"],
        },
    },
    {
        "name": "get_dashboard_metrics",
        "description": (
            "Get high-level employer metrics for a pay period: active employee "
            "count, withdrawals today, period totals (advance volume, fees), "
            "recovery rate (% of advances already deducted from payroll)."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "pay_period": {
                    "type": "string",
                    "description": "YYYY-MM, e.g. '2026-05'. Defaults to current month.",
                },
            },
        },
    },
    {
        "name": "compute_advance_eligibility",
        "description": (
            "List employees who currently qualify for an EWA advance, with the "
            "amount each is eligible for (based on accrued earned wages and the "
            "employer's current policy). Use when the user asks 'who can take "
            "an advance' or 'who qualifies right now.'"
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "min_eligible_amount": {
                    "type": "number",
                    "description": "Only return employees eligible for at least this GHS amount. Default 0.",
                },
                "limit": {
                    "type": "integer",
                    "description": "Max rows. Default 50.",
                },
            },
        },
    },
    {
        "name": "list_high_advance_employees",
        "description": (
            "List employees who have taken many or large EWA advances this period. "
            "Use when the user wants to spot heavy users or potential abuse. "
            "Returns each flagged employee with their advance count and total amount."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "pay_period": {
                    "type": "string",
                    "description": "YYYY-MM. Defaults to current month.",
                },
                "min_count": {
                    "type": "integer",
                    "description": "Minimum number of completed advances this period to flag. Default 3.",
                },
                "min_total_amount": {
                    "type": "number",
                    "description": "Minimum cumulative GHS this period to flag. Default 0.",
                },
            },
        },
    },
    {
        "name": "list_recent_withdrawals",
        "description": (
            "List recent EWA withdrawals across all employees, with status. "
            "Use to investigate failed withdrawals or see today's activity."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "status": {
                    "type": "string",
                    "enum": ["pending", "processing", "completed", "failed"],
                    "description": "Filter to one status. Omit for all statuses.",
                },
                "days": {
                    "type": "integer",
                    "description": "Look back N days. Default 7.",
                },
                "limit": {
                    "type": "integer",
                    "description": "Max rows. Default 25.",
                },
            },
        },
    },
    {
        "name": "get_employer_policy",
        "description": (
            "Get the current EWA policy for the employer: max access %, max "
            "withdrawal amount, request limits, approval flow, fee config. "
            "Use to explain why an employee was approved/rejected or what the "
            "current rules are."
        ),
        "input_schema": {"type": "object", "properties": {}},
    },
    {
        "name": "get_payroll_upload_status",
        "description": (
            "Show the status of payroll-deduction CSV uploads (pending, applied, "
            "or cancelled). Use when the user asks 'have we processed this "
            "month's deductions yet?'"
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "pay_period": {
                    "type": "string",
                    "description": "YYYY-MM. Defaults to current month.",
                },
            },
        },
    },
    # ─── STUB TOOLS — activate when payroll engine ships (sprints 1-2) ───
    {
        "name": "get_ssnit_summary",
        "description": (
            "Compute the SSNIT contribution summary for a pay period: per-employee "
            "Tier-1 employee 5.5% / employer 13% contributions, total payable to "
            "SSNIT. Use to prepare monthly SSNIT payment."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "pay_period": {
                    "type": "string",
                    "description": "YYYY-MM. Required.",
                },
            },
            "required": ["pay_period"],
        },
    },
    {
        "name": "explain_payroll_diff",
        "description": (
            "Compare two payroll runs and explain why total payroll cost changed: "
            "headcount delta, salary changes, new hires/leavers, allowance/overtime "
            "changes. Use when the user asks 'why did payroll go up this month?'"
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "from_period": {
                    "type": "string",
                    "description": "YYYY-MM of earlier period.",
                },
                "to_period": {
                    "type": "string",
                    "description": "YYYY-MM of later period.",
                },
            },
            "required": ["from_period", "to_period"],
        },
    },
]
