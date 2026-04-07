"use client";

import { useTransactions } from "@/lib/hooks";

const statusStyles: Record<string, { bg: string; color: string; label: string }> = {
  completed: { bg: "var(--green-bg)", color: "var(--green)", label: "Sent" },
  processing: { bg: "var(--gold-bg)", color: "var(--gold)", label: "Processing" },
  pending: { bg: "var(--bg3)", color: "var(--ink3)", label: "Pending" },
  failed: { bg: "#fef2f2", color: "#b83232", label: "Failed" },
};

export default function HistoryPage() {
  const { data, isLoading } = useTransactions({ limit: 50 });
  const transactions = data?.transactions ?? [];
  const totalReceived = transactions
    .filter((t) => t.status === "completed")
    .reduce((s, t) => s + parseFloat(t.amount_disbursed), 0);
  const totalFees = transactions
    .filter((t) => t.status === "completed")
    .reduce((s, t) => s + parseFloat(t.fee), 0);

  return (
    <div>
      <h1 className="font-(family-name:--font-fraunces) text-[24px] font-light tracking-[-0.03em] mb-1" style={{ color: "var(--ink)" }}>
        Transaction history
      </h1>
      <p className="text-[13px] mb-6" style={{ color: "var(--ink3)" }}>
        {transactions.length} withdrawals · GHS {totalReceived.toFixed(2)} total received
      </p>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Total received", val: `GHS ${totalReceived.toFixed(2)}` },
          { label: "Total fees", val: `GHS ${totalFees.toFixed(2)}` },
          { label: "Transactions", val: String(transactions.length) },
        ].map((s) => (
          <div key={s.label} className="rounded-(--r) p-3 text-center" style={{ background: "var(--white)", border: "1px solid var(--border)" }}>
            <div className="text-[9px] font-semibold tracking-[0.06em] uppercase mb-1" style={{ color: "var(--ink4)" }}>{s.label}</div>
            <div className="font-(family-name:--font-fraunces) text-[18px] font-light tracking-[-0.04em]" style={{ color: "var(--ink)" }}>{s.val}</div>
          </div>
        ))}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="py-12 text-center text-[13px]" style={{ color: "var(--ink4)" }}>Loading transactions...</div>
      ) : transactions.length === 0 ? (
        <div className="py-12 text-center">
          <div className="text-[40px] mb-3">📋</div>
          <p className="text-[14px] font-medium mb-1" style={{ color: "var(--ink)" }}>No transactions yet</p>
          <p className="text-[13px]" style={{ color: "var(--ink3)" }}>Your withdrawal history will appear here</p>
        </div>
      ) : (
        <div className="flex flex-col gap-0.5">
          {transactions.map((t) => {
            const st = statusStyles[t.status] || statusStyles.pending;
            return (
              <div key={t.id} className="rounded-(--r-lg) p-4 transition-colors hover:bg-(--bg)"
                style={{ background: "var(--white)", border: "1px solid var(--border)" }}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[14px] shrink-0"
                      style={{ background: t.status === "completed" ? "var(--green-bg)" : "var(--bg3)" }}>
                      {t.status === "completed" ? "📲" : t.status === "failed" ? "❌" : "⏳"}
                    </div>
                    <div>
                      <div className="text-[13px] font-medium" style={{ color: "var(--ink)" }}>
                        {t.status === "completed" ? "MoMo withdrawal" : t.status === "failed" ? "Withdrawal failed" : "Processing"}
                      </div>
                      <div className="text-[10px] font-(family-name:--font-dm-mono)" style={{ color: "var(--ink4)" }}>
                        {new Date(t.created_at).toLocaleDateString("en-GH", { month: "short", day: "numeric", year: "numeric" })} · {new Date(t.created_at).toLocaleTimeString("en-GH", { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[14px] font-semibold font-(family-name:--font-dm-mono)" style={{ color: "var(--ink)" }}>
                      −GHS {parseFloat(t.amount_requested).toFixed(2)}
                    </div>
                    <div className="text-[10px] font-(family-name:--font-dm-mono)" style={{ color: "var(--ink4)" }}>
                      received: {parseFloat(t.amount_disbursed).toFixed(2)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: st.bg, color: st.color }}>{st.label}</span>
                  <span className="text-[10px] font-(family-name:--font-dm-mono)" style={{ color: "var(--ink5)" }}>
                    {t.momo_reference ? `Ref: ${t.momo_reference}` : ""}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
