"use client";

import { useState } from "react";
import Link from "next/link";
import { useDeductionReport } from "@/lib/hooks";
import { apiFetch } from "@/lib/utils";

export default function PayrollUploadPage() {
  const [period, setPeriod] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [step, setStep] = useState<"select" | "preview" | "done">("select");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState({ rows: 0, total: "0" });

  // Fetch real deduction report when in preview mode
  const { data: report, isLoading: reportLoading } = useDeductionReport(
    step === "preview" || step === "done" ? period : null
  );

  const handleDownloadExcel = () => {
    const token = localStorage.getItem("wagenow_token") || "";
    const url = `/api/v1/employers/deductions/export?pay_period=${period}`;
    // Open in new tab — browser handles the download
    const a = document.createElement("a");
    a.href = url;
    a.setAttribute("download", `wagenow_deductions_${period}.xlsx`);
    // For auth, we need to fetch with token and create blob
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.blob())
      .then((blob) => {
        const blobUrl = URL.createObjectURL(blob);
        a.href = blobUrl;
        a.click();
        URL.revokeObjectURL(blobUrl);
      });
  };

  const handleApply = async () => {
    setLoading(true);
    try {
      const data = await apiFetch<{ rows_deducted: number; pay_period: string }>(
        `/api/v1/employers/deductions/apply?pay_period=${period}`,
        { method: "POST" }
      );
      setResult({ rows: data.rows_deducted, total: report?.grand_total || "0" });
      setStep("done");
    } catch {
      // Error handled
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-225">
      <Link href="/dashboard/payroll" className="text-[13px] font-medium mb-3 inline-block" style={{ color: "var(--green)" }}>← Back to payroll</Link>
      <h1 className="font-(family-name:--font-fraunces) text-[28px] font-light tracking-[-0.03em] mb-1" style={{ color: "var(--ink)" }}>Process deductions</h1>
      <p className="text-[14px] mb-8" style={{ color: "var(--ink3)" }}>Generate and apply payroll deduction report</p>

      {step === "select" && (
        <div className="rounded-(--r-xl) p-8" style={{ background: "var(--white)", border: "1px solid var(--border)" }}>
          <h2 className="font-(family-name:--font-fraunces) text-[20px] font-light tracking-[-0.02em] mb-4" style={{ color: "var(--ink)" }}>Select pay period</h2>
          <div className="flex items-end gap-4">
            <div className="flex-1 max-w-50">
              <label className="block text-[12px] font-semibold tracking-[0.06em] uppercase mb-2" style={{ color: "var(--ink4)" }}>Period</label>
              <input type="month" value={period} onChange={(e) => setPeriod(e.target.value)}
                className="w-full px-4 py-3 rounded-(--r) text-[14px] outline-none font-(family-name:--font-dm-sans)"
                style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--ink)" }} />
            </div>
            <button onClick={() => setStep("preview")}
              className="px-6 py-3 rounded-(--r) text-[14px] font-semibold font-(family-name:--font-dm-sans)"
              style={{ background: "var(--ink)", color: "#fff" }}>
              Generate report →
            </button>
          </div>
        </div>
      )}

      {step === "preview" && (
        <div className="rounded-(--r-xl)" style={{ background: "var(--white)", border: "1px solid var(--border)" }}>
          <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border)" }}>
            <div>
              <h2 className="text-[16px] font-semibold" style={{ color: "var(--ink)" }}>Deduction report — {period}</h2>
              <p className="text-[12px] mt-1" style={{ color: "var(--ink3)" }}>
                {reportLoading ? "Loading..." : `${report?.items?.length || 0} employees · ${report?.transaction_count || 0} transactions`}
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep("select")}
                className="px-4 py-2 rounded-(--r) text-[13px] font-medium font-(family-name:--font-dm-sans)"
                style={{ background: "var(--bg2)", border: "1px solid var(--border)", color: "var(--ink)" }}>Cancel</button>
              <button onClick={handleDownloadExcel}
                className="px-4 py-2 rounded-(--r) text-[13px] font-medium font-(family-name:--font-dm-sans)"
                style={{ background: "var(--bg2)", border: "1px solid var(--border)", color: "var(--ink)" }}>
                📥 Download Excel
              </button>
              <button onClick={handleApply} disabled={loading || reportLoading || !report?.items?.length}
                className="px-5 py-2 rounded-(--r) text-[13px] font-semibold font-(family-name:--font-dm-sans) disabled:opacity-50"
                style={{ background: "var(--green)", color: "#fff" }}>
                {loading ? "Applying..." : "Apply deductions →"}
              </button>
            </div>
          </div>

          {reportLoading ? (
            <div className="p-8 text-center text-[13px]" style={{ color: "var(--ink4)" }}>Generating report...</div>
          ) : !report || report.items.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-[32px] mb-3">📋</div>
              <p className="text-[14px] font-medium mb-1" style={{ color: "var(--ink)" }}>No undeducted transactions</p>
              <p className="text-[13px]" style={{ color: "var(--ink3)" }}>All completed withdrawals for {period} have already been deducted, or there are no completed withdrawals.</p>
            </div>
          ) : (
            <>
              <div className="grid px-6 py-2 text-[10px] font-bold tracking-[0.06em] uppercase"
                style={{ gridTemplateColumns: "1fr 100px 80px 100px 60px", color: "var(--ink4)", borderBottom: "1px solid var(--border)" }}>
                <span>Employee</span><span>Withdrawn</span><span>Fees</span><span>Deduction</span><span>Txns</span>
              </div>
              {report.items.map((d) => (
                <div key={d.employee_id} className="grid px-6 py-3 text-[13px]"
                  style={{ gridTemplateColumns: "1fr 100px 80px 100px 60px", borderBottom: "1px solid var(--border)" }}>
                  <span className="font-medium" style={{ color: "var(--ink)" }}>{d.employee_name}</span>
                  <span className="font-(family-name:--font-dm-mono) text-[12px]" style={{ color: "var(--ink2)" }}>GHS {parseFloat(d.total_withdrawn).toFixed(2)}</span>
                  <span className="font-(family-name:--font-dm-mono) text-[12px]" style={{ color: "var(--ink4)" }}>GHS {parseFloat(d.total_fees).toFixed(2)}</span>
                  <span className="font-(family-name:--font-dm-mono) text-[12px] font-semibold" style={{ color: "var(--ink)" }}>GHS {parseFloat(d.net_deduction).toFixed(2)}</span>
                  <span className="font-(family-name:--font-dm-mono) text-[12px]" style={{ color: "var(--ink3)" }}>{d.transaction_count}</span>
                </div>
              ))}
              <div className="grid px-6 py-3 text-[13px] font-semibold"
                style={{ gridTemplateColumns: "1fr 100px 80px 100px 60px", background: "var(--bg)" }}>
                <span style={{ color: "var(--ink)" }}>Grand total</span>
                <span /><span />
                <span className="font-(family-name:--font-dm-mono)" style={{ color: "var(--green)" }}>GHS {parseFloat(report.grand_total).toFixed(2)}</span>
                <span className="font-(family-name:--font-dm-mono)" style={{ color: "var(--ink3)" }}>{report.transaction_count}</span>
              </div>
            </>
          )}
        </div>
      )}

      {step === "done" && (
        <div className="rounded-(--r-xl) p-12 text-center" style={{ background: "var(--white)", border: "1px solid var(--border)" }}>
          <div className="text-[48px] mb-4">✅</div>
          <h2 className="font-(family-name:--font-fraunces) text-[24px] font-light tracking-[-0.03em] mb-3" style={{ color: "var(--ink)" }}>Deductions applied</h2>
          <p className="text-[14px] mb-4" style={{ color: "var(--ink3)" }}>
            {result.rows} transactions deducted · GHS {parseFloat(result.total).toFixed(2)} total for {period}
          </p>
          <div className="flex gap-3 justify-center">
            <button onClick={handleDownloadExcel}
              className="px-5 py-3 rounded-(--r) text-[14px] font-medium font-(family-name:--font-dm-sans)"
              style={{ background: "var(--bg2)", color: "var(--ink)", border: "1px solid var(--border)" }}>
              📥 Download Excel report
            </button>
            <Link href="/dashboard/payroll"
              className="inline-flex items-center px-6 py-3 rounded-(--r) text-[14px] font-medium font-(family-name:--font-dm-sans)"
              style={{ background: "var(--ink)", color: "#fff" }}>
              View payroll history →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
