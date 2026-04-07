"use client";

import Link from "next/link";
import { useDeductionReport, usePayrollUploads } from "@/lib/hooks";

export default function PayrollPage() {
  const { data: uploads, isLoading } = usePayrollUploads();

  // Current pay period
  const now = new Date();
  const currentPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const { data: currentReport } = useDeductionReport(currentPeriod);

  const today = now.getDate();

  return (
    <div className="max-w-250">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-(family-name:--font-fraunces) text-[28px] font-light tracking-[-0.03em]" style={{ color: "var(--ink)" }}>Payroll & Deductions</h1>
          <p className="text-[14px] mt-1" style={{ color: "var(--ink3)" }}>Process EWA deductions at payday</p>
        </div>
        <Link href="/dashboard/payroll/upload"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-(--r) text-[13px] font-medium font-(family-name:--font-dm-sans)"
          style={{ background: "var(--ink)", color: "#fff" }}>
          + Process deductions
        </Link>
      </div>

      {/* Current period card */}
      <div className="rounded-(--r-xl) p-6 mb-6" style={{ background: "var(--green-bg)", border: "1px solid rgba(10,92,52,0.15)" }}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold tracking-[0.06em] uppercase mb-2" style={{ color: "var(--green)" }}>
              Current period: {currentPeriod}
            </div>
            <div className="font-(family-name:--font-fraunces) text-[32px] font-light tracking-[-0.04em] leading-none mb-2" style={{ color: "var(--green)" }}>
              {currentReport ? `GHS ${parseFloat(currentReport.grand_total).toLocaleString("en-GH", { minimumFractionDigits: 2 })}` : "GHS 0.00"}
            </div>
            <p className="text-[13px]" style={{ color: "var(--green)" }}>
              {currentReport ? `${currentReport.transaction_count} completed transactions · ${currentReport.items.length} employees` : "No transactions yet"}
            </p>
          </div>
        </div>
      </div>

      {/* Uploads table */}
      <div className="rounded-(--r-lg)" style={{ background: "var(--white)", border: "1px solid var(--border)" }}>
        <div className="px-6 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
          <h2 className="font-(family-name:--font-fraunces) text-[18px] font-normal tracking-[-0.02em]" style={{ color: "var(--ink)" }}>Deduction history</h2>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-[13px]" style={{ color: "var(--ink4)" }}>Loading history...</div>
        ) : !uploads || uploads.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-[32px] mb-3">📋</div>
            <p className="text-[14px] font-medium mb-1" style={{ color: "var(--ink)" }}>No deductions processed yet</p>
            <p className="text-[13px] mb-4" style={{ color: "var(--ink3)" }}>Process your first payroll deduction when payday arrives</p>
            <Link href="/dashboard/payroll/upload" className="text-[13px] font-medium" style={{ color: "var(--green)" }}>Process deductions →</Link>
          </div>
        ) : (
          <>
            <div className="grid px-6 py-2 text-[10px] font-bold tracking-[0.06em] uppercase"
              style={{ gridTemplateColumns: "100px 1fr 80px 120px 80px 120px", color: "var(--ink4)", borderBottom: "1px solid var(--border)" }}>
              <span>Period</span><span>File</span><span>Rows</span><span>Total</span><span>Status</span><span>Applied</span>
            </div>
            {uploads.map((u) => (
              <Link key={u.id} href={`/dashboard/payroll/${u.id}`}
                className="grid px-6 py-3 items-center hover:bg-(--bg) transition-colors"
                style={{ gridTemplateColumns: "100px 1fr 80px 120px 80px 120px", borderBottom: "1px solid var(--border)" }}>
                <span className="text-[13px] font-medium font-(family-name:--font-dm-mono)" style={{ color: "var(--ink)" }}>{u.pay_period}</span>
                <span className="text-[12px]" style={{ color: "var(--ink3)" }}>{u.filename}</span>
                <span className="text-[12px] font-(family-name:--font-dm-mono)" style={{ color: "var(--ink3)" }}>{u.row_count}</span>
                <span className="text-[12px] font-medium font-(family-name:--font-dm-mono)" style={{ color: "var(--ink)" }}>
                  GHS {parseFloat(u.total_deductions).toLocaleString("en-GH", { minimumFractionDigits: 2 })}
                </span>
                <span className="inline-flex text-[10px] font-semibold px-2 py-0.75 rounded-full w-fit"
                  style={{
                    background: u.status === "applied" ? "var(--green-bg)" : "var(--bg3)",
                    color: u.status === "applied" ? "var(--green)" : "var(--ink3)",
                  }}>
                  {u.status === "applied" ? "Applied" : "Pending"}
                </span>
                <span className="text-[11px] font-(family-name:--font-dm-mono)" style={{ color: "var(--ink4)" }}>
                  {u.applied_at ? new Date(u.applied_at).toLocaleDateString("en-GH", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                </span>
              </Link>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
