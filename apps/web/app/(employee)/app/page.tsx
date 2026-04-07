"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { useAccrual, useTransactions } from "@/lib/hooks";

export default function EmployeeHomePage() {
  const { user } = useAuth();
  const employeeId = user?.sub ?? null;

  const { data: accrual, isLoading: accrualLoading } = useAccrual(employeeId);
  const { data: txnData } = useTransactions({ limit: 3 });

  const today = new Date();
  const dayLabel = today.toLocaleDateString("en-GH", { weekday: "long", month: "long", day: "numeric" }).toUpperCase();

  // Derived values
  const available = accrual ? parseFloat(accrual.available) : 0;
  const day = accrual?.days_worked ? accrual.days_worked + 1 : today.getDate();
  const total = accrual?.days_in_month ?? new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const pctElapsed = Math.round((day / total) * 100);
  const recentTxns = txnData?.transactions?.slice(0, 3) ?? [];

  return (
    <div>
      {/* Greeting */}
      <div className="mb-6">
        <div className="text-[11px] font-(family-name:--font-dm-mono) mb-1" style={{ color: "var(--ink4)" }}>
          {dayLabel}
        </div>
        <h1 className="font-(family-name:--font-fraunces) text-[24px] font-light tracking-[-0.03em]" style={{ color: "var(--ink)" }}>
          Hello 👋
        </h1>
      </div>

      {/* Main accrual card */}
      <div className={`rounded-(--r-xl) p-6 mb-5 ${accrualLoading ? "animate-pulse" : ""}`} style={{ background: "var(--ink)" }}>
        <div className="text-[9px] font-semibold tracking-[0.08em] uppercase mb-1" style={{ color: "rgba(255,255,255,0.35)" }}>
          Available to withdraw
        </div>
        <div className="font-(family-name:--font-fraunces) text-[40px] font-light tracking-[-0.04em] leading-none text-white mb-4">
          {accrual ? `GHS ${parseFloat(accrual.available).toLocaleString("en-GH", { minimumFractionDigits: 2 })}` : "GHS —"}
        </div>
        <div className="h-1.5 rounded-full overflow-hidden mb-2" style={{ background: "rgba(255,255,255,0.08)" }}>
          <div className="h-full rounded-full transition-all" style={{ width: `${pctElapsed}%`, background: "var(--green3)" }} />
        </div>
        <div className="flex justify-between text-[10px] font-(family-name:--font-dm-mono)" style={{ color: "rgba(255,255,255,0.25)" }}>
          <span>Day {day} of {total}</span>
          <span>{pctElapsed}% accrued</span>
        </div>
        {accrual?.next_payday && (
          <div className="mt-3 text-[10px] font-(family-name:--font-dm-mono)" style={{ color: "rgba(255,255,255,0.2)" }}>
            Next payday: {new Date(accrual.next_payday).toLocaleDateString("en-GH", { month: "short", day: "numeric" })}
          </div>
        )}
      </div>

      {/* Withdraw button */}
      <Link href="/app/withdraw"
        className={`flex items-center justify-center gap-2 w-full py-4 rounded-(--r-lg) text-[15px] font-semibold transition-opacity font-(family-name:--font-dm-sans) mb-6 ${available <= 0 ? "opacity-40 pointer-events-none" : "hover:opacity-90"}`}
        style={{ background: "var(--green3)", color: "#fff" }}>
        {available > 0 ? "Withdraw to MoMo →" : "No balance available yet"}
      </Link>

      {/* Breakdown */}
      {accrual && (
        <div className="rounded-(--r-lg) p-5 mb-5" style={{ background: "var(--white)", border: "1px solid var(--border)" }}>
          <h2 className="text-[11px] font-bold tracking-[0.06em] uppercase mb-4" style={{ color: "var(--ink4)" }}>
            {accrual.pay_period} breakdown
          </h2>
          {[
            { label: "Monthly salary", val: `GHS ${parseFloat(accrual.monthly_salary).toLocaleString("en-GH", { minimumFractionDigits: 2 })}` },
            { label: "Gross accrued", val: `GHS ${parseFloat(accrual.gross_accrued).toLocaleString("en-GH", { minimumFractionDigits: 2 })}` },
            { label: `EWA ceiling`, val: `GHS ${parseFloat(accrual.ewa_ceiling).toLocaleString("en-GH", { minimumFractionDigits: 2 })}` },
            { label: "Already withdrawn", val: `GHS ${parseFloat(accrual.period_withdrawals).toLocaleString("en-GH", { minimumFractionDigits: 2 })}`, color: "var(--ink4)" },
            { label: "Available now", val: `GHS ${parseFloat(accrual.available).toLocaleString("en-GH", { minimumFractionDigits: 2 })}`, color: "var(--green)", bold: true },
          ].map((r) => (
            <div key={r.label} className="flex justify-between py-2.5 text-[13px]" style={{ borderBottom: "1px solid var(--border)" }}>
              <span style={{ color: "var(--ink3)" }}>{r.label}</span>
              <span className={`font-(family-name:--font-dm-mono) ${r.bold ? "font-semibold" : "font-medium"}`}
                style={{ color: r.color || "var(--ink)" }}>{r.val}</span>
            </div>
          ))}
        </div>
      )}

      {/* Recent activity */}
      <div className="rounded-(--r-lg) p-5" style={{ background: "var(--white)", border: "1px solid var(--border)" }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[11px] font-bold tracking-[0.06em] uppercase" style={{ color: "var(--ink4)" }}>Recent</h2>
          <Link href="/app/history" className="text-[12px] font-medium" style={{ color: "var(--green)" }}>See all</Link>
        </div>
        {recentTxns.length === 0 ? (
          <p className="text-[13px] py-4 text-center" style={{ color: "var(--ink4)" }}>No withdrawals yet</p>
        ) : (
          recentTxns.map((t, i) => (
            <div key={t.id} className="flex items-center gap-3 py-3" style={{ borderBottom: i < recentTxns.length - 1 ? "1px solid var(--border)" : "none" }}>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[12px] shrink-0" style={{ background: t.status === "completed" ? "var(--green-bg)" : "var(--bg3)" }}>
                {t.status === "completed" ? "📲" : "⏳"}
              </div>
              <div className="flex-1">
                <div className="text-[12px] font-medium" style={{ color: "var(--ink)" }}>
                  {t.status === "completed" ? "MoMo transfer sent" : "Processing"}
                </div>
                <div className="text-[10px] font-(family-name:--font-dm-mono)" style={{ color: "var(--ink4)" }}>
                  {new Date(t.created_at).toLocaleDateString("en-GH", { month: "short", day: "numeric" })} · {new Date(t.created_at).toLocaleTimeString("en-GH", { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
              <div className="text-[12px] font-semibold font-(family-name:--font-dm-mono)" style={{ color: "var(--ink)" }}>
                −GHS {parseFloat(t.amount_requested).toFixed(2)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
