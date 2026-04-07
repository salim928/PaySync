"use client";

import { useAnalytics } from "@/lib/hooks";

export default function AnalyticsPage() {
  const { data, isLoading } = useAnalytics(6);

  const trend = data?.monthly_trend ?? [];
  const departments = data?.departments ?? [];
  const summary = data?.summary;
  const maxAmount = Math.max(...trend.map((m) => m.amount), 1);

  if (isLoading) {
    return (
      <div className="max-w-275">
        <div className="h-8 w-32 rounded mb-8 animate-pulse" style={{ background: "var(--bg3)" }} />
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[...Array(3)].map((_, i) => <div key={i} className="h-25 rounded-(--r-lg) animate-pulse" style={{ background: "var(--bg2)" }} />)}
        </div>
        <div className="h-75 rounded-(--r-lg) animate-pulse" style={{ background: "var(--bg2)" }} />
      </div>
    );
  }

  return (
    <div className="max-w-275">
      <h1 className="font-(family-name:--font-fraunces) text-[28px] font-light tracking-[-0.03em] mb-1" style={{ color: "var(--ink)" }}>Analytics</h1>
      <p className="text-[14px] mb-8" style={{ color: "var(--ink3)" }}>Withdrawal trends and workforce insights</p>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total disbursed (6mo)", val: summary ? `GHS ${summary.total_disbursed.toLocaleString("en-GH", { minimumFractionDigits: 2 })}` : "—", delta: `${summary?.total_transactions ?? 0} transactions` },
          { label: "Avg. withdrawal", val: summary ? `GHS ${summary.avg_withdrawal.toLocaleString("en-GH", { minimumFractionDigits: 2 })}` : "—", delta: "per transaction" },
          { label: "Est. employee savings vs loans", val: summary ? `GHS ${summary.estimated_savings.toLocaleString("en-GH", { minimumFractionDigits: 2 })}` : "—", delta: "vs payday loan fees" },
        ].map((s) => (
          <div key={s.label} className="rounded-(--r-lg) p-5" style={{ background: "var(--white)", border: "1px solid var(--border)" }}>
            <div className="text-[11px] font-semibold tracking-[0.05em] uppercase mb-2" style={{ color: "var(--ink4)" }}>{s.label}</div>
            <div className="font-(family-name:--font-fraunces) text-[24px] font-light tracking-[-0.04em] leading-none mb-1" style={{ color: "var(--ink)" }}>{s.val}</div>
            <div className="text-[11px] font-(family-name:--font-dm-mono)" style={{ color: "var(--green2)" }}>{s.delta}</div>
          </div>
        ))}
      </div>

      {/* Trend chart */}
      <div className="rounded-(--r-lg) p-6 mb-8" style={{ background: "var(--white)", border: "1px solid var(--border)" }}>
        <h2 className="font-(family-name:--font-fraunces) text-[18px] font-normal tracking-[-0.02em] mb-6" style={{ color: "var(--ink)" }}>Monthly withdrawal volume</h2>
        {trend.length === 0 ? (
          <p className="text-[13px] py-8 text-center" style={{ color: "var(--ink4)" }}>No data yet. Analytics will populate as employees make withdrawals.</p>
        ) : (
          <>
            <div className="flex items-end gap-4 h-50 mb-4">
              {trend.map((m, i) => (
                <div key={m.period} className="flex-1 flex flex-col items-center gap-2">
                  <div className="text-[11px] font-medium font-(family-name:--font-dm-mono)" style={{ color: "var(--ink3)" }}>
                    {m.amount > 0 ? `${Math.round(m.amount).toLocaleString()}` : ""}
                  </div>
                  <div
                    className="w-full rounded-t-md transition-colors hover:opacity-80"
                    style={{
                      height: `${Math.max((m.amount / maxAmount) * 100, 2)}%`,
                      background: i === trend.length - 1 ? "var(--green3)" : "var(--bg3)",
                    }}
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-4">
              {trend.map((m) => (
                <div key={m.period} className="flex-1 text-center text-[12px] font-medium" style={{ color: "var(--ink4)" }}>{m.month}</div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Department breakdown */}
      <div className="rounded-(--r-lg) p-6" style={{ background: "var(--white)", border: "1px solid var(--border)" }}>
        <h2 className="font-(family-name:--font-fraunces) text-[18px] font-normal tracking-[-0.02em] mb-6" style={{ color: "var(--ink)" }}>By department</h2>
        {departments.length === 0 ? (
          <p className="text-[13px] py-4 text-center" style={{ color: "var(--ink4)" }}>No department data yet.</p>
        ) : (
          departments.map((d) => (
            <div key={d.department} className="flex items-center gap-4 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
              <div className="w-35 text-[13px] font-medium" style={{ color: "var(--ink)" }}>{d.department}</div>
              <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "var(--bg2)" }}>
                <div className="h-full rounded-full" style={{ width: `${d.percentage}%`, background: "var(--green3)" }} />
              </div>
              <div className="w-15 text-[12px] font-medium font-(family-name:--font-dm-mono) text-right" style={{ color: "var(--ink)" }}>{d.percentage}%</div>
              <div className="w-30 text-[12px] font-(family-name:--font-dm-mono) text-right" style={{ color: "var(--ink3)" }}>
                GHS {d.amount.toLocaleString("en-GH", { minimumFractionDigits: 2 })}
              </div>
              <div className="w-20 text-[11px] text-right" style={{ color: "var(--ink4)" }}>{d.employees} staff</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
