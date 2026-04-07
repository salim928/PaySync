-- ═══════════════════════════════════════════════════════════════════
-- WageNow Ghana — Migration 001: Core Schema
-- Phase 1: EWA tables (active) + Phase 2: Spend tables (defined, empty)
-- All monetary columns: NUMERIC(12,2). All IDs: UUID. All timestamps: TIMESTAMPTZ.
-- ═══════════════════════════════════════════════════════════════════

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─────────────────────────────────────────
-- EMPLOYERS
-- ─────────────────────────────────────────
CREATE TABLE employers (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name    TEXT NOT NULL,
    ghana_tin       TEXT UNIQUE NOT NULL,
    email           TEXT UNIQUE NOT NULL,
    password_hash   TEXT NOT NULL,
    totp_secret     TEXT,                           -- AES-256 encrypted; NULL until 2FA setup
    totp_verified   BOOLEAN NOT NULL DEFAULT false,
    momo_account    TEXT,                            -- AES-256 encrypted
    payroll_cycle   TEXT NOT NULL DEFAULT 'monthly'
                      CHECK (payroll_cycle IN ('monthly','bi-weekly','weekly')),
    payday          SMALLINT NOT NULL CHECK (payday BETWEEN 1 AND 31),
    ewa_enabled     BOOLEAN NOT NULL DEFAULT false,
    spend_enabled   BOOLEAN NOT NULL DEFAULT false,  -- Phase 2
    plan            TEXT NOT NULL DEFAULT 'starter'
                      CHECK (plan IN ('starter','growth','enterprise')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────
-- EMPLOYER TEAM MEMBERS (managers)
-- ─────────────────────────────────────────
CREATE TABLE employer_users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employer_id     UUID NOT NULL REFERENCES employers(id) ON DELETE CASCADE,
    email           TEXT NOT NULL,
    password_hash   TEXT NOT NULL,
    full_name       TEXT NOT NULL,
    role            TEXT NOT NULL DEFAULT 'manager'
                      CHECK (role IN ('employer_admin','manager')),
    totp_secret     TEXT,
    totp_verified   BOOLEAN NOT NULL DEFAULT false,
    is_active       BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(employer_id, email)
);

-- ─────────────────────────────────────────
-- EMPLOYEES
-- ─────────────────────────────────────────
CREATE TABLE employees (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employer_id     UUID NOT NULL REFERENCES employers(id) ON DELETE CASCADE,
    full_name       TEXT NOT NULL,
    phone           TEXT UNIQUE NOT NULL,
    momo_number     TEXT NOT NULL,                   -- AES-256 encrypted
    momo_provider   TEXT NOT NULL CHECK (momo_provider IN ('mtn','vodafone','airteltigo')),
    monthly_salary  NUMERIC(12,2) NOT NULL CHECK (monthly_salary > 0),
    ewa_limit_pct   NUMERIC(5,2) NOT NULL DEFAULT 50.00
                      CHECK (ewa_limit_pct BETWEEN 1 AND 80),
    department      TEXT,
    start_date      DATE NOT NULL,
    is_active       BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────
-- PAYROLL UPLOADS
-- ─────────────────────────────────────────
CREATE TABLE payroll_uploads (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employer_id     UUID NOT NULL REFERENCES employers(id) ON DELETE CASCADE,
    uploaded_by     UUID NOT NULL,
    filename        TEXT NOT NULL,
    pay_period      TEXT NOT NULL,                   -- format: YYYY-MM
    row_count       INTEGER NOT NULL DEFAULT 0,
    total_deductions NUMERIC(12,2) NOT NULL DEFAULT 0,
    status          TEXT NOT NULL DEFAULT 'pending'
                      CHECK (status IN ('pending','applied','cancelled')),
    applied_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────
-- EWA TRANSACTIONS (append-only for financial fields)
-- ─────────────────────────────────────────
CREATE TABLE ewa_transactions (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id         UUID NOT NULL REFERENCES employees(id),
    employer_id         UUID NOT NULL REFERENCES employers(id),
    amount_requested    NUMERIC(12,2) NOT NULL CHECK (amount_requested >= 50),
    amount_disbursed    NUMERIC(12,2) NOT NULL CHECK (amount_disbursed > 0),
    fee                 NUMERIC(12,2) NOT NULL DEFAULT 3.00,
    status              TEXT NOT NULL DEFAULT 'pending'
                          CHECK (status IN ('pending','processing','completed','failed')),
    momo_reference      TEXT,
    idempotency_key     TEXT UNIQUE NOT NULL,
    accrual_snapshot    NUMERIC(12,2) NOT NULL,
    pay_period          TEXT NOT NULL,               -- format: YYYY-MM
    deducted_at         TIMESTAMPTZ,
    payroll_upload_id   UUID REFERENCES payroll_uploads(id),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Prevent updates to immutable financial fields
CREATE OR REPLACE FUNCTION enforce_ewa_immutability()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.amount_requested != NEW.amount_requested OR
       OLD.amount_disbursed != NEW.amount_disbursed OR
       OLD.fee != NEW.fee OR
       OLD.employee_id != NEW.employee_id OR
       OLD.employer_id != NEW.employer_id THEN
        RAISE EXCEPTION 'ewa_transactions: immutable fields cannot be changed';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ewa_immutability
    BEFORE UPDATE ON ewa_transactions
    FOR EACH ROW EXECUTE FUNCTION enforce_ewa_immutability();

-- ─────────────────────────────────────────
-- AUDIT LOG (append-only enforced by trigger)
-- ─────────────────────────────────────────
CREATE TABLE audit_logs (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id    UUID,
    action      TEXT NOT NULL,
    entity_type TEXT,
    entity_id   UUID,
    metadata    JSONB,
    ip_address  INET,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION prevent_audit_mutation()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'audit_logs is append-only';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_append_only
    BEFORE UPDATE OR DELETE ON audit_logs
    FOR EACH ROW EXECUTE FUNCTION prevent_audit_mutation();

-- ─────────────────────────────────────────
-- PHASE 2 TABLES (defined, empty in Phase 1)
-- ─────────────────────────────────────────
CREATE TABLE spend_wallets (
    id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employer_id              UUID NOT NULL REFERENCES employers(id),
    employee_id              UUID REFERENCES employees(id),
    name                     TEXT NOT NULL,
    wallet_type              TEXT NOT NULL CHECK (wallet_type IN ('personal','departmental')),
    balance                  NUMERIC(12,2) NOT NULL DEFAULT 0,
    weekly_limit             NUMERIC(12,2),
    monthly_limit            NUMERIC(12,2),
    requires_approval_above  NUMERIC(12,2),
    is_active                BOOLEAN NOT NULL DEFAULT true,
    created_at               TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE spend_transactions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id       UUID NOT NULL REFERENCES spend_wallets(id),
    employer_id     UUID NOT NULL REFERENCES employers(id),
    employee_id     UUID NOT NULL REFERENCES employees(id),
    amount          NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    merchant        TEXT,
    category        TEXT,
    receipt_url     TEXT,
    status          TEXT NOT NULL DEFAULT 'pending'
                      CHECK (status IN ('pending','approved','rejected','completed')),
    approved_by     UUID,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE spend_policies (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employer_id     UUID NOT NULL REFERENCES employers(id),
    name            TEXT NOT NULL,
    rules           JSONB NOT NULL DEFAULT '{}',
    is_active       BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────
-- AUTO-UPDATE updated_at
-- ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER employers_updated_at
    BEFORE UPDATE ON employers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
