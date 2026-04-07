-- ═══════════════════════════════════════════════════════════════
-- WageNow Ghana — Seed Data (local development only)
-- Run: psql -d wagenow -f supabase/seed/001_dev_data.sql
-- ═══════════════════════════════════════════════════════════════

-- Set RLS context for inserts
SET LOCAL app.current_employer_id = '00000000-0000-0000-0000-000000000001';

-- Demo employer (password: "wagenow123" bcrypt hash)
INSERT INTO employers (id, company_name, ghana_tin, email, password_hash, payday, ewa_enabled, plan)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Acme Ghana Ltd',
    'C0012345678',
    'admin@acmeghana.com',
    '$2b$12$LJ3/XQxVZ5X3YPJ5xYGV8u0V4B6.G7J1cL5R0E9yP2V8jQ3R.mK2m',
    25,
    true,
    'starter'
);

-- Demo employees (momo_number would be encrypted in production)
INSERT INTO employees (id, employer_id, full_name, phone, momo_number, momo_provider, monthly_salary, department, start_date)
VALUES
    ('00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000001',
     'Kwame Asante', '+233241234567', '0241234567', 'mtn', 3200.00, 'Engineering', '2024-01-15'),
    ('00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000001',
     'Ama Mensah', '+233201234567', '0201234567', 'vodafone', 2800.00, 'Finance', '2024-03-01'),
    ('00000000-0000-0000-0000-000000000103', '00000000-0000-0000-0000-000000000001',
     'Kofi Boateng', '+233271234567', '0271234567', 'airteltigo', 4500.00, 'Operations', '2023-09-01'),
    ('00000000-0000-0000-0000-000000000104', '00000000-0000-0000-0000-000000000001',
     'Abena Osei', '+233541234567', '0541234567', 'mtn', 3800.00, 'Engineering', '2024-06-15'),
    ('00000000-0000-0000-0000-000000000105', '00000000-0000-0000-0000-000000000001',
     'Yaw Adjei', '+233501234567', '0501234567', 'vodafone', 2500.00, 'HR', '2024-02-01');

-- Demo completed transactions (for deduction testing)
INSERT INTO ewa_transactions (employee_id, employer_id, amount_requested, amount_disbursed, fee, status, idempotency_key, accrual_snapshot, pay_period, momo_reference)
VALUES
    ('00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000001',
     400.00, 397.00, 3.00, 'completed', 'seed-key-001', 877.42, '2026-03', 'MOMO-REF-001'),
    ('00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000001',
     200.00, 197.00, 3.00, 'completed', 'seed-key-002', 600.00, '2026-03', 'MOMO-REF-002'),
    ('00000000-0000-0000-0000-000000000103', '00000000-0000-0000-0000-000000000001',
     1000.00, 997.00, 3.00, 'completed', 'seed-key-003', 1500.00, '2026-03', 'MOMO-REF-003');
