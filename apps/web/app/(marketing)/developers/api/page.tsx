import type { Metadata } from "next";
import { PageHeader } from "@/components/marketing/page-header";

export const metadata: Metadata = {
  title: "API Documentation",
  description: "Complete REST API reference for WageNow — authentication, employee management, EWA transactions, and webhooks.",
};

const endpoints = [
  {
    method: "POST",
    path: "/api/v1/auth/token/exchange",
    description: "Exchange a Supabase access token for a WageNow API JWT with employer context.",
  },
  {
    method: "GET",
    path: "/api/v1/employees",
    description: "List all employees for the authenticated employer. Supports filtering by department, search query, and active status.",
  },
  {
    method: "POST",
    path: "/api/v1/employees",
    description: "Create a new employee record. Requires name, phone number, gross salary, and department.",
  },
  {
    method: "GET",
    path: "/api/v1/employees/:id",
    description: "Get a single employee by ID, including their current accrual balance and transaction history.",
  },
  {
    method: "POST",
    path: "/api/v1/employees/upload/preview",
    description: "Upload a payroll CSV for validation. Returns a preview of rows to import with any validation errors.",
  },
  {
    method: "POST",
    path: "/api/v1/employees/upload/confirm",
    description: "Confirm a previously previewed CSV upload. Creates or updates employee records in bulk.",
  },
  {
    method: "GET",
    path: "/api/v1/ewa/accrual/:employeeId",
    description: "Get the current earned wage accrual for an employee — how much they can withdraw right now.",
  },
  {
    method: "POST",
    path: "/api/v1/ewa/withdraw",
    description: "Submit a withdrawal request. Disburses to the employee's mobile wallet. Returns transaction ID and status.",
  },
  {
    method: "GET",
    path: "/api/v1/ewa/transactions",
    description: "List EWA transactions. Supports filtering by pay period, status, and pagination.",
  },
  {
    method: "GET",
    path: "/api/v1/employers/dashboard",
    description: "Get employer dashboard summary — total employees, total disbursed, active withdrawals, and trends.",
  },
  {
    method: "GET",
    path: "/api/v1/employers/deductions/report",
    description: "Generate the payroll deduction report for a given pay period. Returns totals per employee.",
  },
  {
    method: "GET",
    path: "/api/v1/employers/deductions/export",
    description: "Export the deduction report as a CSV file for payroll system import.",
  },
];

const methodColors: Record<string, { bg: string; color: string }> = {
  GET: { bg: "var(--green-bg)", color: "var(--green)" },
  POST: { bg: "#e8eaff", color: "#4a4ade" },
  PATCH: { bg: "var(--gold-bg)", color: "var(--gold)" },
  DELETE: { bg: "#fef2f2", color: "#b83232" },
};

export default function APIDocsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Developers"
        title={<>API <em className="italic" style={{ color: "var(--green2)" }}>reference</em></>}
        subtitle="The WageNow REST API gives you programmatic access to employee management, EWA transactions, payroll deductions, and more. All endpoints require authentication via Bearer token."
      />

      <section className="section-padding pb-10">
        <div
          className="rounded-(--r-xl) p-8 mb-10"
          style={{ background: "var(--ink)", color: "#fff" }}
        >
          <h3 className="text-[14px] font-semibold mb-3" style={{ color: "rgba(255,255,255,0.5)" }}>
            Base URL
          </h3>
          <code className="text-[15px] font-(family-name:--font-dm-mono)" style={{ color: "var(--green3)" }}>
            https://api.wagenow.com.gh/api/v1
          </code>
          <div className="mt-6 pt-6" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
            <h3 className="text-[14px] font-semibold mb-3" style={{ color: "rgba(255,255,255,0.5)" }}>
              Authentication
            </h3>
            <p className="text-[14px] leading-[1.7]" style={{ color: "rgba(255,255,255,0.45)" }}>
              Include your API token in the <code className="font-(family-name:--font-dm-mono) text-[13px]" style={{ color: "rgba(255,255,255,0.65)" }}>Authorization</code> header:{" "}
              <code className="font-(family-name:--font-dm-mono) text-[13px]" style={{ color: "var(--green3)" }}>Bearer {"<your-token>"}</code>
            </p>
          </div>
        </div>
      </section>

      <section className="section-padding pb-[120px] max-[1080px]:pb-20">
        <h2
          className="font-(family-name:--font-fraunces) font-light tracking-[-0.03em] text-[28px] mb-8"
          style={{ color: "var(--ink)" }}
        >
          Endpoints
        </h2>
        <div className="rounded-(--r-xl) overflow-hidden" style={{ border: "1px solid var(--border)" }}>
          {endpoints.map((ep, i) => {
            const mc = methodColors[ep.method];
            return (
              <div
                key={`${ep.method}-${ep.path}`}
                className="flex items-start gap-4 px-6 py-5 max-[1080px]:flex-col max-[1080px]:gap-2"
                style={{
                  background: "var(--white)",
                  borderBottom: i < endpoints.length - 1 ? "1px solid var(--border)" : "none",
                }}
              >
                <div className="flex items-center gap-3 shrink-0 min-w-[340px] max-[1080px]:min-w-0">
                  <span
                    className="text-[11px] font-bold tracking-[0.04em] px-2 py-0.5 rounded font-(family-name:--font-dm-mono)"
                    style={{ background: mc.bg, color: mc.color }}
                  >
                    {ep.method}
                  </span>
                  <code className="text-[13px] font-(family-name:--font-dm-mono)" style={{ color: "var(--ink2)" }}>
                    {ep.path}
                  </code>
                </div>
                <p className="text-[13px] leading-[1.6]" style={{ color: "var(--ink3)" }}>
                  {ep.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
