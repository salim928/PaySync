"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEmployee, useAccrual, useEmployerTransactions } from "@/lib/hooks";

export default function EmployeeDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const { data: employee, isLoading: empLoading } = useEmployee(id);
  const { data: accrual, isLoading: accrualLoading } = useAccrual(id);
  const { data: txnData } = useEmployerTransactions({ employee_id: id, limit: 10 });

  const transactions = txnData?.transactions ?? [];

  if (empLoading) {
    return (
      <div className="max-w-225">
        <Link href="/dashboard/employees" className="text-[13px] font-medium mb-3 inline-block" style={{ color: "var(--green)" }}>← Back to employees</Link>
        <div className="h-8 w-48 rounded mb-4 animate-pulse" style={{ background: "var(--bg3)" }} />
        <div className="h-4 w-72 rounded mb-8 animate-pulse" style={{ background: "var(--bg2)" }} />
        <div className="rounded-(--r-xl) h-40 animate-pulse" style={{ background: "var(--bg3)" }} />
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="max-w-225">
        <Link href="/dashboard/employees" className="text-[13px] font-medium mb-3 inline-block" style={{ color: "var(--green)" }}>← Back to employees</Link>
        <div className="py-16 text-center">
          <div className="text-[40px] mb-4">🔍</div>
          <h2 className="font-(family-name:--font-fraunces) text-[22px] font-light mb-2" style={{ color: "var(--ink)" }}>Employee not found</h2>
          <p className="text-[13px]" style={{ color: "var(--ink3)" }}>This employee may have been removed or you don&apos;t have access.</p>
        </div>
      </div>
    );
  }

  const initials = employee.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2);
  const pctElapsed = accrual ? Math.round(((accrual.days_worked + 1) / accrual.days_in_month) * 100) : 0;

  return (
    <div className="max-w-225">
      <Link href="/dashboard/employees" className="text-[13px] font-medium mb-3 inline-block" style={{ color: "var(--green)" }}>← Back to employees</Link>

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-xl flex items-center justify-center text-[18px] font-bold" style={{ background: "var(--bg2)", color: "var(--ink3)" }}>{initials}</div>
        <div>
          <h1 className="font-(family-name:--font-fraunces) text-[28px] font-light tracking-[-0.03em]" style={{ color: "var(--ink)" }}>{employee.full_name}</h1>
          <p className="text-[13px]" style={{ color: "var(--ink3)" }}>
            {employee.department || "No department"} · {employee.momo_provider.toUpperCase()} MoMo · EWA limit {parseFloat(employee.ewa_limit_pct)}%
          </p>
        </div>
        <span className="ml-auto inline-flex text-[11px] font-semibold px-3 py-1 rounded-full"
          style={{ background: employee.is_active ? "var(--green-bg)" : "var(--bg3)", color: employee.is_active ? "var(--green)" : "var(--ink4)" }}>
          {employee.is_active ? "Active" : "Inactive"}
        </span>
      </div>

      {/* Accrual card */}
      {accrual && (
        <div className={`rounded-(--r-xl) p-6 mb-6 ${accrualLoading ? "animate-pulse" : ""}`} style={{ background: "var(--ink)" }}>
          <div className="text-[10px] font-semibold tracking-[0.08em] uppercase mb-4" style={{ color: "rgba(255,255,255,0.3)" }}>
            Current accrual · {accrual.pay_period}
          </div>
          <div className="grid grid-cols-4 gap-6">
            {[
              { label: "Gross accrued", val: `GHS ${parseFloat(accrual.gross_accrued).toLocaleString("en-GH", { minimumFractionDigits: 2 })}` },
              { label: `EWA ceiling (${parseFloat(employee.ewa_limit_pct)}%)`, val: `GHS ${parseFloat(accrual.ewa_ceiling).toLocaleString("en-GH", { minimumFractionDigits: 2 })}` },
              { label: "Already withdrawn", val: `GHS ${parseFloat(accrual.period_withdrawals).toLocaleString("en-GH", { minimumFractionDigits: 2 })}` },
              { label: "Available now", val: `GHS ${parseFloat(accrual.available).toLocaleString("en-GH", { minimumFractionDigits: 2 })}`, green: true },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-[10px] font-medium tracking-[0.04em] uppercase mb-1" style={{ color: "rgba(255,255,255,0.35)" }}>{s.label}</div>
                <div className="font-(family-name:--font-fraunces) text-[22px] font-light tracking-[-0.04em] leading-none"
                  style={{ color: s.green ? "var(--green3)" : "#fff" }}>{s.val}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
            <div className="h-full rounded-full" style={{ width: `${pctElapsed}%`, background: "var(--green3)" }} />
          </div>
          <div className="flex justify-between mt-2 text-[10px] font-(family-name:--font-dm-mono)" style={{ color: "rgba(255,255,255,0.25)" }}>
            <span>Day {accrual.days_worked + 1} of {accrual.days_in_month}</span>
            <span>{pctElapsed}% of month elapsed</span>
          </div>
        </div>
      )}

      {/* Details */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="rounded-(--r-lg) p-5" style={{ background: "var(--white)", border: "1px solid var(--border)" }}>
          <h3 className="text-[11px] font-bold tracking-[0.06em] uppercase mb-4" style={{ color: "var(--ink4)" }}>Employee details</h3>
          {[
            { l: "Phone", v: employee.phone },
            { l: "Monthly salary", v: `GHS ${parseFloat(employee.monthly_salary).toLocaleString("en-GH", { minimumFractionDigits: 2 })}` },
            { l: "MoMo provider", v: employee.momo_provider.toUpperCase() },
            { l: "Start date", v: new Date(employee.start_date).toLocaleDateString("en-GH", { year: "numeric", month: "short", day: "numeric" }) },
          ].map((r) => (
            <div key={r.l} className="flex justify-between py-2 text-[13px]" style={{ borderBottom: "1px solid var(--border)" }}>
              <span style={{ color: "var(--ink3)" }}>{r.l}</span>
              <span className="font-medium" style={{ color: "var(--ink)" }}>{r.v}</span>
            </div>
          ))}
        </div>
        <div className="rounded-(--r-lg) p-5" style={{ background: "var(--white)", border: "1px solid var(--border)" }}>
          <h3 className="text-[11px] font-bold tracking-[0.06em] uppercase mb-4" style={{ color: "var(--ink4)" }}>Summary this period</h3>
          {[
            { l: "Total withdrawn", v: accrual ? `GHS ${parseFloat(accrual.period_withdrawals).toLocaleString("en-GH", { minimumFractionDigits: 2 })}` : "—" },
            { l: "Fees paid", v: `GHS ${(transactions.filter(t => t.status === "completed").length * 3).toFixed(2)}` },
            { l: "Transactions", v: String(transactions.length) },
          ].map((r) => (
            <div key={r.l} className="flex justify-between py-2 text-[13px]" style={{ borderBottom: "1px solid var(--border)" }}>
              <span style={{ color: "var(--ink3)" }}>{r.l}</span>
              <span className="font-medium font-(family-name:--font-dm-mono)" style={{ color: "var(--ink)" }}>{r.v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Transaction history */}
      <div className="rounded-(--r-lg)" style={{ background: "var(--white)", border: "1px solid var(--border)" }}>
        <div className="px-6 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
          <h3 className="font-(family-name:--font-fraunces) text-[18px] font-normal tracking-[-0.02em]" style={{ color: "var(--ink)" }}>Withdrawal history</h3>
        </div>
        {transactions.length === 0 ? (
          <div className="p-8 text-center text-[13px]" style={{ color: "var(--ink4)" }}>No withdrawals yet for this employee.</div>
        ) : (
          <>
            <div className="grid px-6 py-2 text-[10px] font-bold tracking-[0.06em] uppercase" style={{ gridTemplateColumns: "1fr 100px 80px 100px 120px", color: "var(--ink4)", borderBottom: "1px solid var(--border)" }}>
              <span>Date</span><span>Amount</span><span>Fee</span><span>Status</span><span>Reference</span>
            </div>
            {transactions.map((t) => (
              <div key={t.id} className="grid px-6 py-3 text-[13px]" style={{ gridTemplateColumns: "1fr 100px 80px 100px 120px", borderBottom: "1px solid var(--border)" }}>
                <span style={{ color: "var(--ink)" }}>{new Date(t.created_at).toLocaleDateString("en-GH", { year: "numeric", month: "short", day: "numeric" })}</span>
                <span className="font-medium font-(family-name:--font-dm-mono)" style={{ color: "var(--ink)" }}>GHS {parseFloat(t.amount_requested).toFixed(2)}</span>
                <span className="font-(family-name:--font-dm-mono) text-[12px]" style={{ color: "var(--ink4)" }}>GHS {parseFloat(t.fee).toFixed(2)}</span>
                <span className="inline-flex text-[10px] font-semibold px-2 py-0.75 rounded-full w-fit"
                  style={{
                    background: t.status === "completed" ? "var(--green-bg)" : t.status === "failed" ? "#fef2f2" : "var(--bg3)",
                    color: t.status === "completed" ? "var(--green)" : t.status === "failed" ? "#b83232" : "var(--ink3)",
                  }}>
                  {t.status === "completed" ? "Sent" : t.status === "failed" ? "Failed" : "Processing"}
                </span>
                <span className="font-(family-name:--font-dm-mono) text-[11px]" style={{ color: "var(--ink4)" }}>{t.momo_reference || "—"}</span>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
