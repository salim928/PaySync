-- ═══════════════════════════════════════════════════════════════════
-- WageNow Ghana — Migration 003: Indexes
-- Targeted partial indexes for hot query paths
-- ═══════════════════════════════════════════════════════════════════

-- EWA: accrual calculation — sum completed withdrawals per employee per period
CREATE INDEX idx_ewa_employee_period ON ewa_transactions(employee_id, pay_period)
    WHERE status = 'completed';

-- EWA: deduction engine — find undeducted transactions per employer per period
CREATE INDEX idx_ewa_employer_period ON ewa_transactions(employer_id, pay_period)
    WHERE deducted_at IS NULL;

-- EWA: idempotency key lookup
CREATE INDEX idx_ewa_idempotency ON ewa_transactions(idempotency_key);

-- Employees: employer dashboard employee list
CREATE INDEX idx_employees_employer ON employees(employer_id) WHERE is_active = true;

-- Employees: phone lookup for OTP auth
CREATE INDEX idx_employees_phone ON employees(phone);

-- Payroll uploads: employer + period lookup
CREATE INDEX idx_payroll_employer_period ON payroll_uploads(employer_id, pay_period);

-- Audit logs: entity lookup for history
CREATE INDEX idx_audit_entity ON audit_logs(entity_id, created_at DESC);

-- Audit logs: actor lookup
CREATE INDEX idx_audit_actor ON audit_logs(actor_id, created_at DESC);
