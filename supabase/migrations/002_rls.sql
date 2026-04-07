-- ═══════════════════════════════════════════════════════════════════
-- WageNow Ghana — Migration 002: Row Level Security
-- Tenant isolation via app.current_employer_id session variable
-- Set by FastAPI middleware: SET LOCAL app.current_employer_id = :id
-- Phase 1: EWA tables only. Spend tables enabled in Phase 2.
-- ═══════════════════════════════════════════════════════════════════

-- Phase 1 — EWA tables
ALTER TABLE employees         ENABLE ROW LEVEL SECURITY;
ALTER TABLE ewa_transactions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_uploads   ENABLE ROW LEVEL SECURITY;
ALTER TABLE employer_users    ENABLE ROW LEVEL SECURITY;

CREATE POLICY employer_isolation_employees ON employees
    USING (employer_id = current_setting('app.current_employer_id')::uuid);

CREATE POLICY employer_isolation_ewa ON ewa_transactions
    USING (employer_id = current_setting('app.current_employer_id')::uuid);

CREATE POLICY employer_isolation_payroll ON payroll_uploads
    USING (employer_id = current_setting('app.current_employer_id')::uuid);

CREATE POLICY employer_isolation_users ON employer_users
    USING (employer_id = current_setting('app.current_employer_id')::uuid);

-- Phase 2 — Spend tables (uncomment when ClearSpend launches)
-- ALTER TABLE spend_wallets     ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE spend_transactions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE spend_policies    ENABLE ROW LEVEL SECURITY;
--
-- CREATE POLICY employer_isolation_wallets ON spend_wallets
--     USING (employer_id = current_setting('app.current_employer_id')::uuid);
--
-- CREATE POLICY employer_isolation_spend_txn ON spend_transactions
--     USING (employer_id = current_setting('app.current_employer_id')::uuid);
--
-- CREATE POLICY employer_isolation_spend_pol ON spend_policies
--     USING (employer_id = current_setting('app.current_employer_id')::uuid);
