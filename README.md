# WageNow Ghana — Earned Wage Access Platform

**Phase 1**: Employees access accrued wages before payday, disbursed to MTN/Vodafone/AirtelTigo MoMo in <90 seconds.

## Local Setup (5 commands)

```bash
git clone https://github.com/pactium/wagenow.git && cd wagenow
docker compose up -d                          # PostgreSQL 15 + Redis 7
cd apps/api && pip install -e ".[dev]"        # Python dependencies
cp ../../.env.example .env                    # Fill in secrets
pytest tests/ -v                              # Run test suite
```

Start the API:
```bash
uvicorn src.main:app --reload --port 8000
```

## Architecture

```
wagenow/
├── apps/api/          FastAPI backend (Python 3.12)
│   ├── src/
│   │   ├── core/      Config, database, Redis, security
│   │   ├── models/    SQLAlchemy 2.x ORM models
│   │   ├── schemas/   Pydantic v2 request/response models
│   │   ├── routers/   API route handlers
│   │   └── services/  Business logic (accrual, withdrawal, deduction)
│   └── tests/         Unit + integration + load tests
├── supabase/          SQL migrations (001-003)
└── docker-compose.yml Local PostgreSQL + Redis
```

## Key Design Decisions

- **Decimal everywhere**: All monetary calculations use Python `Decimal`. Never float.
- **Append-only financials**: `ewa_transactions` immutable fields enforced by DB trigger.
- **Advisory locks**: Prevents double-spend via `pg_advisory_xact_lock` per employee.
- **Idempotency keys**: SHA256-based, 5-minute windows. Duplicate requests return 409.
- **48h cooldown**: One withdrawal per 48 hours per employee (Redis key).
- **Row Level Security**: Tenant isolation via PostgreSQL RLS policies.
- **AES-256 PII**: MoMo numbers encrypted at rest with Fernet.

## API Endpoints (Phase 1)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/auth/employer/register` | Register employer |
| POST | `/api/v1/auth/employer/login` | Employer login |
| POST | `/api/v1/auth/employer/totp/setup` | Setup 2FA |
| POST | `/api/v1/auth/employer/totp/verify` | Verify TOTP code |
| POST | `/api/v1/auth/employee/otp/request` | Send SMS OTP |
| POST | `/api/v1/auth/employee/otp/verify` | Verify OTP, get JWT |
| GET | `/api/v1/ewa/accrual/{id}` | Get accrual balance |
| POST | `/api/v1/ewa/withdraw` | Request withdrawal |
| GET | `/api/v1/ewa/transactions` | Employee tx history |
| GET | `/api/v1/ewa/employer/transactions` | Employer tx view |
| POST | `/webhooks/momo/callback` | Hubtel MoMo callback |
| GET | `/api/v1/health` | Health check |

## Test Suite

```bash
pytest tests/unit/ -v                    # Unit tests (accrual, parser, security)
pytest tests/unit/test_accrual.py -v     # Accrual engine only (100% coverage target)
pytest tests/ --cov=src --cov-report=html # Full coverage report
```
