# WageNow Ghana — Architecture Document

## System Overview (Phase 1)

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENTS                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │ Employer Web │  │ Employee PWA │  │ Hubtel MoMo Webhook  │   │
│  │  (Next.js)   │  │  (Next.js)   │  │  (inbound callback)  │   │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────┘   │
└─────────┼─────────────────┼─────────────────────┼───────────────┘
          │                 │                     │
          ▼                 ▼                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                     FASTAPI (Python 3.12)                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐    │
│  │  Auth    │  │   EWA    │  │ Webhooks │  │   Health     │    │
│  │  Router  │  │  Router  │  │  Router  │  │   Check      │    │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └──────────────┘    │
│       │              │             │                             │
│  ┌────▼──────────────▼─────────────▼────────────────────────┐   │
│  │                  SERVICE LAYER                            │   │
│  │  ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐  │   │
│  │  │   Accrual   │  │  Withdrawal  │  │   Deduction     │  │   │
│  │  │   Engine    │  │   Service    │  │    Engine        │  │   │
│  │  └─────────────┘  └──────────────┘  └─────────────────┘  │   │
│  │  ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐  │   │
│  │  │  Hubtel     │  │  Twilio SMS  │  │  CSV Parser     │  │   │
│  │  │  MoMo Client│  │   Service    │  │                 │  │   │
│  │  └─────────────┘  └──────────────┘  └─────────────────┘  │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────┬───────────────────┬───────────────────┬───────────────┘
          │                   │                   │
          ▼                   ▼                   ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐
│ PostgreSQL   │  │    Redis     │  │     Celery Worker        │
│  (Supabase)  │  │   (Cache,    │  │  (MoMo disbursement,     │
│  + RLS       │  │   OTP, Rate  │  │   SMS notifications)     │
│              │  │   Limiting)  │  │                          │
└──────────────┘  └──────────────┘  └──────────────────────────┘
```

## Withdrawal Flow (Critical Path)

```
Employee App                FastAPI                    Celery Worker
     │                         │                           │
     │  POST /ewa/withdraw     │                           │
     │  {amount: 400.00}       │                           │
     ├────────────────────────►│                           │
     │                         │                           │
     │                    ┌────┴────┐                      │
     │                    │ Rate    │ Redis sliding window  │
     │                    │ Limit   │ 3 req / 10 min       │
     │                    │ Check   │                      │
     │                    └────┬────┘                      │
     │                    ┌────┴────┐                      │
     │                    │Cooldown │ Redis: 48h key       │
     │                    │ Check   │                      │
     │                    └────┬────┘                      │
     │                    ┌────┴────┐                      │
     │                    │Accrual  │ Decimal math          │
     │                    │Engine   │ Redis cached 5min     │
     │                    └────┬────┘                      │
     │                    ┌────┴────┐                      │
     │                    │Advisory │ pg_advisory_xact_lock │
     │                    │ Lock    │ prevents double-spend │
     │                    └────┬────┘                      │
     │                    ┌────┴────┐                      │
     │                    │INSERT   │ status=pending        │
     │                    │txn row  │ fee=3.00 always       │
     │                    └────┬────┘                      │
     │                    ┌────┴────┐                      │
     │                    │COMMIT   │                      │
     │                    └────┬────┘                      │
     │  202 Accepted           │                           │
     │◄────────────────────────┤                           │
     │                         │  disburse_momo.delay()    │
     │                         ├──────────────────────────►│
     │                         │                           │
     │                         │                      ┌────┴────┐
     │                         │                      │ Hubtel  │
     │                         │                      │ MoMo    │
     │                         │                      │ API     │
     │                         │                      └────┬────┘
     │                         │                           │
     │                    Webhook callback                  │
     │                    ┌────┴────┐                      │
     │                    │UPDATE   │ status=completed      │
     │                    │txn row  │ momo_reference=...    │
     │                    └────┬────┘                      │
     │                         │  send_notification.delay() │
     │                         ├──────────────────────────►│
     │                         │                      SMS sent
```

## Accrual Calculation

```
days_worked    = max(ref_date.day - 1, 0)        # Today is incomplete
gross_accrued  = (salary / days_in_month) * days_worked
ewa_ceiling    = gross_accrued * (limit_pct / 100)
available      = max(ewa_ceiling - withdrawals, 0)   # NEVER negative
```

## Data Security

| Layer | Mechanism |
|-------|-----------|
| Transport | TLS 1.3 (enforced by Railway/Vercel) |
| Auth (Employer) | Email/password (bcrypt 12 rounds) + TOTP 2FA |
| Auth (Employee) | Phone OTP (6-digit, 10min, Twilio SMS) |
| Sessions | JWT (15min access, 7day refresh httpOnly) |
| PII at Rest | Fernet AES-256-CBC + HMAC-SHA256 |
| Tenant Isolation | PostgreSQL RLS via session variable |
| Financial Integrity | DB triggers block mutation of immutable fields |
| Webhooks | HMAC-SHA256 with constant-time comparison |
| Rate Limiting | Redis sliding window per endpoint |

## Phase 1 vs Phase 2 Boundary

Phase 1 builds and ships EWA. Phase 2 tables exist (empty), routes return 501,
service classes raise NotImplementedError. Zero Phase 1 code is modified for Phase 2.
