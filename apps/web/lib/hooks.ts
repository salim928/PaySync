"use client";

import useSWR from "swr";
import { apiFetch } from "@/lib/utils";

// ── SWR config: don't retry when backend is down ──
const swrOptions = {
  shouldRetryOnError: false,
  revalidateOnFocus: false,
  onErrorRetry: (error: Error, _key: string, _config: unknown, revalidate: (opts?: { retryCount: number }) => void, { retryCount }: { retryCount: number }) => {
    // Don't retry on network errors or 401s
    if (error.message.includes("fetch") || error.message.includes("401")) return;
    if (retryCount >= 2) return;
    setTimeout(() => revalidate({ retryCount }), 5000);
  },
};

// ── Generic fetcher ──

function fetcher<T>(path: string): Promise<T> {
  return apiFetch<T>(path);
}

// ── EWA Hooks (Employee) ──

export interface Accrual {
  employee_id: string;
  monthly_salary: string;
  days_worked: number;
  days_in_month: number;
  gross_accrued: string;
  ewa_ceiling: string;
  period_withdrawals: string;
  available: string;
  pay_period: string;
  next_payday: string | null;
  calculated_at: string;
}

export function useAccrual(employeeId: string | null) {
  return useSWR<Accrual>(
    employeeId ? `/api/v1/ewa/accrual/${employeeId}` : null,
    fetcher,
    { refreshInterval: 30_000, ...swrOptions }
  );
}

export interface Transaction {
  id: string;
  employee_id: string;
  employer_id: string;
  amount_requested: string;
  amount_disbursed: string;
  fee: string;
  status: string;
  momo_reference: string | null;
  accrual_snapshot: string;
  pay_period: string;
  deducted_at: string | null;
  created_at: string;
}

export interface TransactionList {
  transactions: Transaction[];
  total: number;
}

export function useTransactions(params?: { pay_period?: string; status?: string; limit?: number }) {
  const query = new URLSearchParams();
  if (params?.pay_period) query.set("pay_period", params.pay_period);
  if (params?.status) query.set("status", params.status);
  if (params?.limit) query.set("limit", String(params.limit));
  const qs = query.toString();
  return useSWR<TransactionList>(
    `/api/v1/ewa/transactions${qs ? `?${qs}` : ""}`,
    fetcher,
    swrOptions
  );
}

// ── Employer Hooks ──

export interface DashboardStats {
  active_employees: number;
  withdrawals_today: number;
  amount_today: number;
  period: {
    pay_period: string;
    total_transactions: number;
    total_amount: number;
    total_fees: number;
  };
  recovery_rate: number;
}

export function useDashboard() {
  return useSWR<DashboardStats>("/api/v1/employers/dashboard", fetcher, {
    refreshInterval: 60_000,
    ...swrOptions,
  });
}

export interface Employee {
  id: string;
  employer_id: string;
  full_name: string;
  phone: string;
  momo_provider: string;
  monthly_salary: string;
  ewa_limit_pct: string;
  department: string | null;
  start_date: string;
  is_active: boolean;
  created_at: string;
}

export interface EmployeeList {
  employees: Employee[];
  total: number;
}

export function useEmployees(params?: { department?: string; search?: string; is_active?: boolean }) {
  const query = new URLSearchParams();
  if (params?.department) query.set("department", params.department);
  if (params?.search) query.set("search", params.search);
  if (params?.is_active !== undefined) query.set("is_active", String(params.is_active));
  const qs = query.toString();
  return useSWR<EmployeeList>(
    `/api/v1/employees${qs ? `?${qs}` : ""}`,
    fetcher,
    swrOptions
  );
}

export function useEmployee(id: string | null) {
  return useSWR<Employee>(
    id ? `/api/v1/employees/${id}` : null,
    fetcher,
    swrOptions
  );
}

export interface EmployerTransactionList {
  transactions: Transaction[];
  total: number;
}

export function useEmployerTransactions(params?: {
  pay_period?: string;
  employee_id?: string;
  limit?: number;
}) {
  const query = new URLSearchParams();
  if (params?.pay_period) query.set("pay_period", params.pay_period);
  if (params?.employee_id) query.set("employee_id", params.employee_id);
  if (params?.limit) query.set("limit", String(params.limit));
  const qs = query.toString();
  return useSWR<EmployerTransactionList>(
    `/api/v1/ewa/employer/transactions${qs ? `?${qs}` : ""}`,
    fetcher,
    swrOptions
  );
}

export interface DeductionReport {
  pay_period: string;
  employer_id: string;
  items: Array<{
    employee_id: string;
    employee_name: string;
    total_withdrawn: string;
    total_fees: string;
    net_deduction: string;
    transaction_count: number;
  }>;
  grand_total: string;
  total_fees: string;
  transaction_count: number;
}

export function useDeductionReport(payPeriod: string | null) {
  return useSWR<DeductionReport>(
    payPeriod ? `/api/v1/employers/deductions/report?pay_period=${payPeriod}` : null,
    fetcher,
    swrOptions
  );
}

export interface EmployerSettings {
  company_name: string;
  ghana_tin: string;
  payroll_cycle: string;
  payday: number;
  ewa_enabled: boolean;
  plan: string;
  totp_verified: boolean;
}

export function useEmployerSettings() {
  return useSWR<EmployerSettings>("/api/v1/employers/settings", fetcher, swrOptions);
}

// ── Payroll Hooks ──

export interface PayrollUpload {
  id: string;
  employer_id: string;
  filename: string;
  pay_period: string;
  row_count: number;
  total_deductions: string;
  status: string;
  applied_at: string | null;
  created_at: string;
}

export function usePayrollUploads(limit = 20) {
  return useSWR<PayrollUpload[]>(
    `/api/v1/employers/payroll-uploads?limit=${limit}`,
    fetcher,
    swrOptions
  );
}

// ── Analytics Hooks ──

export interface AnalyticsData {
  monthly_trend: Array<{
    period: string;
    month: string;
    transactions: number;
    amount: number;
    fees: number;
  }>;
  departments: Array<{
    department: string;
    employees: number;
    amount: number;
    percentage: number;
  }>;
  summary: {
    total_disbursed: number;
    total_transactions: number;
    avg_withdrawal: number;
    estimated_savings: number;
  };
}

export function useAnalytics(months = 6) {
  return useSWR<AnalyticsData>(
    `/api/v1/employers/analytics?months=${months}`,
    fetcher,
    swrOptions
  );
}

// ── Employee Self-Profile Hook ──

export function useEmployeeProfile() {
  return useSWR<Employee>(
    "/api/v1/employees/me",
    fetcher,
    swrOptions
  );
}

// ── Withdrawal action (not a hook — imperative) ──

export async function submitWithdrawal(body: {
  employee_id: string;
  amount: string;
  momo_number: string;
  momo_provider: string;
}): Promise<{ id: string; status: string }> {
  return apiFetch("/api/v1/ewa/withdraw", {
    method: "POST",
    body: JSON.stringify(body),
  });
}
