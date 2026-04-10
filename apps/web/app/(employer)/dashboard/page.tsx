"use client";

import Link from "next/link";
import { useDashboard, useEmployerTransactions } from "@/lib/hooks";

/* ── Stat card icons ── */
const StatIcons = {
  employees: (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <circle cx="8" cy="7" r="3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M2.5 18c0-2.8 2.5-5 5.5-5s5.5 2.2 5.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="16" cy="8" r="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M17 14c1.5.5 3 2 3 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  money: (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <rect x="2" y="5" width="18" height="12" rx="3" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="11" cy="11" r="2.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5 8.5v0M17 13.5v0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  chart: (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <rect x="3" y="12" width="3.5" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="9.25" y="7" width="3.5" height="12" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="15.5" y="3" width="3.5" height="16" rx="1" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ),
  check: (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7.5 11l2.5 2.5L14.5 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading, error: statsError } = useDashboard();
  const { data: txnData, isLoading: txnLoading, error: txnError } = useEmployerTransactions({ limit: 5 });

  const backendDown = statsError || txnError;

  const statCards = [
    {
      label: "Active employees",
      value: stats ? String(stats.active_employees) : "—",
      delta: stats ? `${stats.period.pay_period}` : "",
      icon: StatIcons.employees,
      color: "var(--ink)",
    },
    {
      label: "Withdrawals today",
      value: stats ? `GHS ${stats.amount_today.toLocaleString("en-GH", { minimumFractionDigits: 2 })}` : "—",
      delta: stats ? `${stats.withdrawals_today} transactions` : "",
      icon: StatIcons.money,
      color: "var(--green2)",
    },
    {
      label: "Period total",
      value: stats ? `GHS ${stats.period.total_amount.toLocaleString("en-GH", { minimumFractionDigits: 2 })}` : "—",
      delta: stats ? `${stats.period.total_transactions} transactions` : "",
      icon: StatIcons.chart,
      color: "var(--ink)",
    },
    {
      label: "Recovery rate",
      value: stats ? `${stats.recovery_rate}%` : "—",
      delta: "Auto deducted",
      icon: StatIcons.check,
      color: "var(--green2)",
    },
  ];

  const transactions = txnData?.transactions ?? [];

  // Time-based greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="max-w-280">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-(family-name:--font-fraunces) text-[28px] font-light tracking-[-0.03em]" style={{ color: "var(--ink)" }}>
            {greeting}
          </h1>
          <p className="text-[14px] mt-1" style={{ color: "var(--ink3)" }}>Here&apos;s your WageNow activity overview</p>
        </div>
        <Link href="/dashboard/employees/upload"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold transition-all hover:shadow-md font-(family-name:--font-dm-sans)"
          style={{ background: "var(--green)", color: "#fff" }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 3v10M3 8h10" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" /></svg>
          Upload employees
        </Link>
      </div>

      {backendDown && (
        <div className="mb-6 p-4 rounded-xl flex items-start gap-3 text-[13px]" style={{ background: "var(--gold-bg)", border: "1px solid #f0dda0", color: "#92400e" }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="mt-0.5 shrink-0"><circle cx="9" cy="9" r="7" stroke="#92400e" strokeWidth="1.5" /><path d="M9 6v3.5M9 12v.5" stroke="#92400e" strokeWidth="1.5" strokeLinecap="round" /></svg>
          <div><strong>API backend not reachable.</strong> Dashboard data will appear once the FastAPI server is running on port 8000.</div>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-4 max-[1080px]:grid-cols-2 gap-5 mb-8">
        {statCards.map((s) => (
          <div key={s.label}
            className={`rounded-2xl p-5 transition-all hover:shadow-sm ${statsLoading ? "animate-pulse" : ""}`}
            style={{ background: "var(--white)", border: "1px solid var(--border)", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-semibold tracking-[0.05em] uppercase" style={{ color: "var(--ink4)" }}>{s.label}</span>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "var(--bg)", color: s.color }}>
                {s.icon}
              </div>
            </div>
            <div className="font-(family-name:--font-fraunces) text-[26px] font-light tracking-[-0.04em] leading-none mb-1.5"
              style={{ color: s.color }}>
              {s.value}
            </div>
            <div className="text-[11px] font-medium font-(family-name:--font-dm-mono)" style={{ color: "var(--green2)" }}>{s.delta}</div>
          </div>
        ))}
      </div>

      {/* Recent transactions */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "var(--white)", border: "1px solid var(--border)", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
        <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: "1px solid var(--border)" }}>
          <div>
            <h2 className="font-(family-name:--font-fraunces) text-[18px] font-normal tracking-[-0.02em]" style={{ color: "var(--ink)" }}>
              Recent withdrawals
            </h2>
            <p className="text-[12px] mt-0.5" style={{ color: "var(--ink4)" }}>Latest employee wage access activity</p>
          </div>
          <Link href="/dashboard/payroll" className="text-[13px] font-semibold px-4 py-2 rounded-lg transition-colors hover:bg-(--bg)"
            style={{ color: "var(--green)" }}>
            View all
          </Link>
        </div>

        {/* Table header */}
        <div className="grid px-6 py-3 text-[10px] font-bold tracking-[0.08em] uppercase"
          style={{ gridTemplateColumns: "1fr 120px 100px 100px", color: "var(--ink4)", background: "var(--bg)" }}>
          <span>Employee</span><span>Amount</span><span>Status</span><span>Date</span>
        </div>

        {txnLoading ? (
          <div className="p-10 text-center">
            <div className="flex justify-center gap-1.5 mb-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="w-2 h-2 rounded-full animate-pulse" style={{ background: "var(--bg3)", animationDelay: `${i * 150}ms` }} />
              ))}
            </div>
            <p className="text-[13px]" style={{ color: "var(--ink4)" }}>Loading transactions...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "var(--bg)" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="3" y="6" width="18" height="12" rx="3" stroke="var(--ink4)" strokeWidth="1.5" /><circle cx="12" cy="12" r="2.5" stroke="var(--ink4)" strokeWidth="1.5" /></svg>
            </div>
            <p className="text-[14px] font-medium mb-1" style={{ color: "var(--ink)" }}>No withdrawals yet</p>
            <p className="text-[13px]" style={{ color: "var(--ink3)" }}>Employees will appear here once they start using WageNow</p>
          </div>
        ) : (
          transactions.map((t, i) => (
            <div key={t.id} className="grid px-6 py-3.5 items-center hover:bg-(--bg) transition-colors"
              style={{
                gridTemplateColumns: "1fr 120px 100px 100px",
                borderBottom: i < transactions.length - 1 ? "1px solid var(--border)" : "none",
              }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center text-[10px] font-bold"
                  style={{ background: "var(--green-bg)", color: "var(--green)" }}>
                  {t.employee_id.slice(0, 2).toUpperCase()}
                </div>
                <span className="text-[13px] font-medium" style={{ color: "var(--ink)" }}>{t.employee_id.slice(0, 8)}...</span>
              </div>
              <span className="text-[13px] font-semibold font-(family-name:--font-dm-mono)" style={{ color: "var(--ink)" }}>
                GHS {parseFloat(t.amount_requested).toFixed(2)}
              </span>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-lg w-fit"
                style={{
                  background: t.status === "completed" ? "var(--green-bg)" : t.status === "failed" ? "#fef2f2" : "var(--bg2)",
                  color: t.status === "completed" ? "var(--green)" : t.status === "failed" ? "#b83232" : "var(--ink3)",
                }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{
                  background: t.status === "completed" ? "var(--green3)" : t.status === "failed" ? "#ef4444" : "var(--ink4)",
                }} />
                {t.status === "completed" ? "Sent" : t.status === "failed" ? "Failed" : "Processing"}
              </span>
              <span className="text-[12px] font-(family-name:--font-dm-mono)" style={{ color: "var(--ink4)" }}>
                {new Date(t.created_at).toLocaleDateString("en-GH", { month: "short", day: "numeric" })}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
