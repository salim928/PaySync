"use client";

import Link from "next/link";
import { useDashboard, useEmployerTransactions } from "@/lib/hooks";

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading, error: statsError } = useDashboard();
  const { data: txnData, isLoading: txnLoading, error: txnError } = useEmployerTransactions({ limit: 5 });

  const backendDown = statsError || txnError;

  const statCards = [
    {
      label: "Active employees",
      value: stats ? String(stats.active_employees) : "—",
      delta: stats ? `${stats.period.pay_period}` : "",
      icon: "👥",
    },
    {
      label: "Withdrawals today",
      value: stats ? `GHS ${stats.amount_today.toLocaleString("en-GH", { minimumFractionDigits: 2 })}` : "—",
      delta: stats ? `${stats.withdrawals_today} transactions` : "",
      icon: "💸",
      green: true,
    },
    {
      label: "Period total",
      value: stats ? `GHS ${stats.period.total_amount.toLocaleString("en-GH", { minimumFractionDigits: 2 })}` : "—",
      delta: stats ? `${stats.period.total_transactions} transactions` : "",
      icon: "📊",
    },
    {
      label: "Recovery rate",
      value: stats ? `${stats.recovery_rate}%` : "—",
      delta: "Auto deducted",
      icon: "✅",
    },
  ];

  const transactions = txnData?.transactions ?? [];

  return (
    <div className="max-w-275">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-(family-name:--font-fraunces) text-[28px] font-light tracking-[-0.03em]" style={{ color: "var(--ink)" }}>
            Dashboard
          </h1>
          <p className="text-[14px] mt-1" style={{ color: "var(--ink3)" }}>Overview of your WageNow activity</p>
        </div>
        <Link href="/dashboard/employees/upload"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-(--r) text-[13px] font-medium transition-opacity hover:opacity-90 font-(family-name:--font-dm-sans)"
          style={{ background: "var(--ink)", color: "#fff" }}>
          + Upload employees
        </Link>
      </div>

      {backendDown && (
        <div className="mb-6 p-4 rounded-(--r-lg) text-[13px]" style={{ background: "#fffbeb", border: "1px solid #fde68a", color: "#92400e" }}>
          <strong>API backend not reachable.</strong> Dashboard data will appear once the FastAPI server is running on port 8000.
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-4 max-[1080px]:grid-cols-2 gap-4 mb-8">
        {statCards.map((s) => (
          <div key={s.label} className={`rounded-(--r-lg) p-5 ${statsLoading ? "animate-pulse" : ""}`} style={{ background: "var(--white)", border: "1px solid var(--border)" }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-semibold tracking-[0.05em] uppercase" style={{ color: "var(--ink4)" }}>{s.label}</span>
              <span className="text-[18px]">{s.icon}</span>
            </div>
            <div className="font-(family-name:--font-fraunces) text-[26px] font-light tracking-[-0.04em] leading-none mb-1"
              style={{ color: s.green ? "var(--green2)" : "var(--ink)" }}>
              {s.value}
            </div>
            <div className="text-[11px] font-medium font-(family-name:--font-dm-mono)" style={{ color: "var(--green2)" }}>{s.delta}</div>
          </div>
        ))}
      </div>

      {/* Recent transactions */}
      <div className="rounded-(--r-lg)" style={{ background: "var(--white)", border: "1px solid var(--border)" }}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
          <h2 className="font-(family-name:--font-fraunces) text-[18px] font-normal tracking-[-0.02em]" style={{ color: "var(--ink)" }}>
            Recent withdrawals
          </h2>
          <Link href="/dashboard/payroll" className="text-[13px] font-medium" style={{ color: "var(--green)" }}>
            View all →
          </Link>
        </div>

        <div className="grid px-6 py-3 text-[10px] font-bold tracking-[0.06em] uppercase" style={{ gridTemplateColumns: "1fr 100px 100px 100px", color: "var(--ink4)", borderBottom: "1px solid var(--border)" }}>
          <span>Employee</span><span>Amount</span><span>Status</span><span>Date</span>
        </div>

        {txnLoading ? (
          <div className="p-8 text-center text-[13px]" style={{ color: "var(--ink4)" }}>Loading transactions...</div>
        ) : transactions.length === 0 ? (
          <div className="p-8 text-center text-[13px]" style={{ color: "var(--ink4)" }}>No withdrawals yet. Employees will appear here once they start using WageNow.</div>
        ) : (
          transactions.map((t) => (
            <div key={t.id} className="grid px-6 py-3 items-center hover:bg-(--bg) transition-colors" style={{ gridTemplateColumns: "1fr 100px 100px 100px", borderBottom: "1px solid var(--border)" }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold" style={{ background: "var(--bg2)", color: "var(--ink3)" }}>
                  {t.employee_id.slice(0, 2).toUpperCase()}
                </div>
                <span className="text-[13px] font-medium" style={{ color: "var(--ink)" }}>{t.employee_id.slice(0, 8)}...</span>
              </div>
              <span className="text-[12px] font-medium font-(family-name:--font-dm-mono)" style={{ color: "var(--ink)" }}>
                GHS {parseFloat(t.amount_requested).toFixed(2)}
              </span>
              <span className="inline-flex items-center text-[10px] font-semibold px-2 py-0.75 rounded-full w-fit"
                style={{
                  background: t.status === "completed" ? "var(--green-bg)" : t.status === "failed" ? "#fef2f2" : "var(--bg3)",
                  color: t.status === "completed" ? "var(--green)" : t.status === "failed" ? "#b83232" : "var(--ink3)",
                }}>
                {t.status === "completed" ? "Sent" : t.status === "failed" ? "Failed" : "Processing"}
              </span>
              <span className="text-[11px] font-(family-name:--font-dm-mono)" style={{ color: "var(--ink4)" }}>
                {new Date(t.created_at).toLocaleDateString("en-GH", { month: "short", day: "numeric" })}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
