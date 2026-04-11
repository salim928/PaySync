"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

/* ── Employee simulation steps ── */
const employeeSteps = [
  {
    title: "Open WageNow",
    description: "Ama opens the WageNow app on her phone after receiving her access link from HR.",
    screen: "home",
  },
  {
    title: "View earned wages",
    description: "She can see exactly how much she's earned so far this pay cycle — updated in real time.",
    screen: "balance",
  },
  {
    title: "Request withdrawal",
    description: "Ama needs 200 for an emergency. She enters the amount and confirms.",
    screen: "withdraw",
  },
  {
    title: "Confirm via mobile wallet",
    description: "The request is processed instantly. Funds are sent to her mobile money wallet.",
    screen: "processing",
  },
  {
    title: "Money received",
    description: "Within ~90 seconds, 200 lands in her mobile wallet. Flat fee only. No interest.",
    screen: "success",
  },
];

/* ── Employer simulation steps ── */
const employerSteps = [
  {
    title: "Upload payroll",
    description: "HR uploads the monthly payroll CSV — or connects via API. WageNow maps employee data automatically.",
    screen: "upload",
  },
  {
    title: "Set access limits",
    description: "Configure how much of earned wages employees can access — typically 50%. Set per department or company-wide.",
    screen: "limits",
  },
  {
    title: "Employees start withdrawing",
    description: "Employees access their earned wages through the app. Every transaction is logged in real time.",
    screen: "activity",
  },
  {
    title: "Monitor dashboard",
    description: "Track withdrawal patterns, department usage, and total disbursements from the employer dashboard.",
    screen: "dashboard",
  },
  {
    title: "Automatic payroll deduction",
    description: "At month end, WageNow provides a deduction report. Withdrawn amounts are auto-deducted from payroll. 100% recovery.",
    screen: "deduction",
  },
];

/* ── Phone frame component ── */
function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative mx-auto" style={{ width: 280, height: 560 }}>
      <div
        className="absolute inset-0 rounded-[36px]"
        style={{
          background: "var(--ink)",
          boxShadow: "0 8px 40px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.08)",
        }}
      />
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[120px] h-[28px] rounded-b-[14px] z-10"
        style={{ background: "var(--ink)" }}
      />
      <div
        className="absolute top-[8px] left-[8px] right-[8px] bottom-[8px] rounded-[28px] overflow-hidden"
        style={{ background: "#fff" }}
      >
        {children}
      </div>
    </div>
  );
}

/* ── Desktop frame component ── */
function DesktopFrame({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-(--r-xl) overflow-hidden mx-auto w-full"
      style={{
        background: "var(--white)",
        border: "1px solid var(--border)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.03)",
      }}
    >
      <div
        className="flex items-center px-4 py-3 gap-[7px]"
        style={{ borderBottom: "1px solid var(--border)", background: "var(--bg)" }}
      >
        <div className="w-[10px] h-[10px] rounded-full" style={{ background: "#ff5f57" }} />
        <div className="w-[10px] h-[10px] rounded-full" style={{ background: "#febc2e" }} />
        <div className="w-[10px] h-[10px] rounded-full" style={{ background: "#28c840" }} />
        <div
          className="mx-auto -translate-x-4 font-(family-name:--font-dm-mono) text-[11px] hidden sm:block"
          style={{ color: "var(--ink5)" }}
        >
          WageNow — Employer Dashboard
        </div>
      </div>
      <div>{children}</div>
    </div>
  );
}

/* ── Employee screens ── */
function EmployeeScreen({ screen }: { screen: string }) {
  return (
    <div className="h-full flex flex-col" style={{ background: "#fafaf7" }}>
      {/* Status bar */}
      <div className="flex items-center justify-between px-5 pt-10 pb-2">
        <span className="text-[10px] font-medium" style={{ color: "#999" }}>9:41</span>
        <div className="flex gap-1">
          <svg width="14" height="10" viewBox="0 0 14 10"><rect x="0" y="4" width="3" height="6" rx="0.5" fill="#333"/><rect x="4" y="2" width="3" height="8" rx="0.5" fill="#333"/><rect x="8" y="0" width="3" height="10" rx="0.5" fill="#333"/></svg>
        </div>
      </div>

      {/* App header */}
      <div className="px-5 pt-2 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "#18160f" }}>
            <svg viewBox="0 0 20 20" width="14" height="14" fill="none">
              <rect x="2" y="2" width="7" height="7" rx="2" fill="white" opacity="0.95"/>
              <rect x="11" y="2" width="7" height="7" rx="2" fill="white" opacity="0.4"/>
              <rect x="2" y="11" width="7" height="7" rx="2" fill="white" opacity="0.4"/>
              <rect x="11" y="11" width="7" height="7" rx="2" fill="#28c840"/>
            </svg>
          </div>
          <span className="text-[13px] font-semibold" style={{ color: "#18160f" }}>WageNow</span>
        </div>
        <p className="text-[11px]" style={{ color: "#999" }}>Good morning, Ama</p>
      </div>

      {screen === "home" && (
        <div className="flex-1 px-5 animate-[fadeUp_0.4s_ease_both]">
          <div className="rounded-xl p-5 mb-3" style={{ background: "#18160f" }}>
            <p className="text-[10px] font-medium mb-1" style={{ color: "rgba(255,255,255,0.5)" }}>Available to withdraw</p>
            <p className="text-[28px] font-light tracking-tight text-white font-(family-name:--font-fraunces)">$847.50</p>
            <p className="text-[10px] mt-1" style={{ color: "rgba(255,255,255,0.35)" }}>of $1,695.00 earned this cycle</p>
          </div>
          <div className="rounded-xl p-4" style={{ background: "#fff", border: "1px solid #eee" }}>
            <p className="text-[10px] font-semibold tracking-wide uppercase mb-2" style={{ color: "#999" }}>Quick actions</p>
            <div className="flex gap-2">
              <div className="flex-1 rounded-lg p-3 text-center" style={{ background: "#f5f2eb" }}>
                <p className="text-[11px] font-medium" style={{ color: "#18160f" }}>Withdraw</p>
              </div>
              <div className="flex-1 rounded-lg p-3 text-center" style={{ background: "#f5f2eb" }}>
                <p className="text-[11px] font-medium" style={{ color: "#18160f" }}>History</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {screen === "balance" && (
        <div className="flex-1 px-5 animate-[fadeUp_0.4s_ease_both]">
          <div className="rounded-xl p-5 mb-3" style={{ background: "#18160f" }}>
            <p className="text-[10px] font-medium mb-1" style={{ color: "rgba(255,255,255,0.5)" }}>Earned this cycle</p>
            <p className="text-[28px] font-light tracking-tight text-white font-(family-name:--font-fraunces)">$1,695.00</p>
            <div className="mt-3 h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.1)" }}>
              <div className="h-full rounded-full" style={{ width: "50%", background: "#28c840" }} />
            </div>
            <div className="flex justify-between mt-1.5">
              <span className="text-[9px]" style={{ color: "rgba(255,255,255,0.4)" }}>50% accessible</span>
              <span className="text-[9px]" style={{ color: "#28c840" }}>$847.50</span>
            </div>
          </div>
          <div className="rounded-xl p-4" style={{ background: "#fff", border: "1px solid #eee" }}>
            <p className="text-[10px] font-semibold tracking-wide uppercase mb-3" style={{ color: "#999" }}>Earning breakdown</p>
            {[
              { label: "Days worked", value: "18 of 22" },
              { label: "Daily rate", value: "$94.17" },
              { label: "Already withdrawn", value: "$0.00" },
              { label: "Available now", value: "$847.50" },
            ].map((r) => (
              <div key={r.label} className="flex justify-between py-1.5" style={{ borderBottom: "1px solid #f5f3ee" }}>
                <span className="text-[11px]" style={{ color: "#999" }}>{r.label}</span>
                <span className="text-[11px] font-medium" style={{ color: "#18160f" }}>{r.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {screen === "withdraw" && (
        <div className="flex-1 px-5 animate-[fadeUp_0.4s_ease_both]">
          <p className="text-[13px] font-medium mb-4" style={{ color: "#18160f" }}>Withdraw to mobile wallet</p>
          <div className="rounded-xl p-5 text-center mb-4" style={{ background: "#fff", border: "1px solid #eee" }}>
            <p className="text-[10px] mb-2" style={{ color: "#999" }}>Amount</p>
            <p className="text-[36px] font-light tracking-tight font-(family-name:--font-fraunces)" style={{ color: "#18160f" }}>
              $200
            </p>
            <p className="text-[10px] mt-1" style={{ color: "#999" }}>Fee: $1.50 flat</p>
          </div>
          <div className="rounded-xl p-4 mb-4" style={{ background: "#fff", border: "1px solid #eee" }}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#e4f2ea" }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <rect width="14" height="14" rx="3" fill="#0a5c34"/>
                  <path d="M4 7h6M7 4v6" stroke="#fff" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
              </div>
              <div>
                <p className="text-[11px] font-medium" style={{ color: "#18160f" }}>Mobile Wallet</p>
                <p className="text-[10px]" style={{ color: "#999" }}>•••• 5678</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl p-3.5 text-center" style={{ background: "#18160f" }}>
            <span className="text-[13px] font-medium text-white">Confirm withdrawal</span>
          </div>
        </div>
      )}

      {screen === "processing" && (
        <div className="flex-1 px-5 flex flex-col items-center justify-center animate-[fadeUp_0.4s_ease_both]">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: "#f0fdf4" }}>
            <div
              className="w-8 h-8 rounded-full border-2 border-t-transparent"
              style={{ borderColor: "#28c840", borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }}
            />
          </div>
          <p className="text-[15px] font-medium mb-1" style={{ color: "#18160f" }}>Processing</p>
          <p className="text-[12px] text-center" style={{ color: "#999" }}>Sending $200 to your<br />mobile wallet...</p>
          <div className="mt-6 w-full max-w-[200px]">
            {["Validating balance", "Initiating transfer", "Waiting for confirmation"].map((s, i) => (
              <div key={s} className="flex items-center gap-2 py-1.5">
                <div
                  className="w-3.5 h-3.5 rounded-full flex items-center justify-center"
                  style={{ background: i < 2 ? "#e4f2ea" : "#f5f2eb" }}
                >
                  {i < 2 ? (
                    <svg width="8" height="8" viewBox="0 0 8 8"><path d="M1.5 4L3 5.5L6.5 2" stroke="#0a5c34" strokeWidth="1.2" fill="none"/></svg>
                  ) : (
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#c4bfb0" }} />
                  )}
                </div>
                <span className="text-[10px]" style={{ color: i < 2 ? "#0a5c34" : "#999" }}>{s}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {screen === "success" && (
        <div className="flex-1 px-5 flex flex-col items-center justify-center animate-[fadeUp_0.4s_ease_both]">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: "#e4f2ea" }}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <path d="M7 14L12 19L21 9" stroke="#0a5c34" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <p className="text-[17px] font-medium mb-1" style={{ color: "#18160f" }}>Money sent!</p>
          <p className="text-[24px] font-light tracking-tight font-(family-name:--font-fraunces) mb-1" style={{ color: "#0f7a45" }}>
            $200.00
          </p>
          <p className="text-[11px] mb-6" style={{ color: "#999" }}>Received in mobile wallet • •••• 5678</p>
          <div className="w-full rounded-xl p-4" style={{ background: "#fff", border: "1px solid #eee" }}>
            {[
              { label: "Transaction ID", value: "WN-2026-04821" },
              { label: "Fee charged", value: "$1.50" },
              { label: "Time to receive", value: "~87 seconds" },
              { label: "Remaining balance", value: "$647.50" },
            ].map((r) => (
              <div key={r.label} className="flex justify-between py-1.5" style={{ borderBottom: "1px solid #f5f3ee" }}>
                <span className="text-[10px]" style={{ color: "#999" }}>{r.label}</span>
                <span className="text-[10px] font-medium" style={{ color: "#18160f" }}>{r.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Employer screens ── */
function EmployerScreen({ screen }: { screen: string }) {
  return (
    <div className="p-4 sm:p-5" style={{ minHeight: 340 }}>
      {screen === "upload" && (
        <div className="animate-[fadeUp_0.4s_ease_both]">
          <h3 className="text-[14px] font-medium mb-4" style={{ color: "var(--ink)" }}>Upload payroll data</h3>
          <div
            className="rounded-xl p-6 sm:p-8 text-center mb-4"
            style={{ border: "2px dashed var(--border2)", background: "var(--bg)" }}
          >
            <svg className="mx-auto mb-3" width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="var(--bg2)"/>
              <path d="M16 10V22M10 16H22" stroke="var(--ink4)" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <p className="text-[12px] font-medium mb-1" style={{ color: "var(--ink2)" }}>
              Drop your payroll CSV here
            </p>
            <p className="text-[10px]" style={{ color: "var(--ink4)" }}>
              or click to browse — .csv, .xlsx supported
            </p>
          </div>
          <div className="rounded-xl p-4" style={{ background: "var(--bg)", border: "1px solid var(--border)" }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "var(--green-bg)" }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M3 7L6 10L11 4" stroke="var(--green)" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-medium truncate" style={{ color: "var(--ink)" }}>payroll_march_2026.csv</p>
                <p className="text-[10px]" style={{ color: "var(--ink4)" }}>247 employees mapped successfully</p>
              </div>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--bg2)" }}>
              <div className="h-full rounded-full" style={{ width: "100%", background: "var(--green3)" }} />
            </div>
          </div>
        </div>
      )}

      {screen === "limits" && (
        <div className="animate-[fadeUp_0.4s_ease_both]">
          <h3 className="text-[14px] font-medium mb-4" style={{ color: "var(--ink)" }}>Configure access limits</h3>
          <div className="rounded-xl p-5 mb-4" style={{ background: "var(--bg)", border: "1px solid var(--border)" }}>
            <div className="flex justify-between items-center mb-3">
              <span className="text-[12px] font-medium" style={{ color: "var(--ink2)" }}>Company-wide limit</span>
              <span className="text-[14px] font-semibold font-(family-name:--font-fraunces)" style={{ color: "var(--green2)" }}>50%</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden mb-2" style={{ background: "var(--bg3)" }}>
              <div className="h-full rounded-full" style={{ width: "50%", background: "var(--green3)" }} />
            </div>
            <p className="text-[10px]" style={{ color: "var(--ink4)" }}>Employees can access up to 50% of earned wages</p>
          </div>
          <div className="flex flex-col gap-2">
            {[
              { dept: "Operations", limit: "50%", employees: 142 },
              { dept: "Sales", limit: "50%", employees: 65 },
              { dept: "Logistics", limit: "40%", employees: 40 },
            ].map((d) => (
              <div key={d.dept} className="rounded-lg p-3 flex items-center justify-between" style={{ background: "var(--white)", border: "1px solid var(--border)" }}>
                <div>
                  <p className="text-[11px] font-medium" style={{ color: "var(--ink)" }}>{d.dept}</p>
                  <p className="text-[10px]" style={{ color: "var(--ink4)" }}>{d.employees} employees</p>
                </div>
                <span className="text-[12px] font-semibold font-(family-name:--font-dm-mono)" style={{ color: "var(--ink2)" }}>{d.limit}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {screen === "activity" && (
        <div className="animate-[fadeUp_0.4s_ease_both]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-[14px] font-medium" style={{ color: "var(--ink)" }}>Live activity</h3>
            <span className="flex items-center gap-1.5 text-[10px] font-medium" style={{ color: "var(--green)" }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--green3)", animation: "pls 2.4s ease-in-out infinite" }} />
              Real-time
            </span>
          </div>
          {[
            { name: "Ama Mensah", amount: "$200", time: "2 min ago", status: "Sent" },
            { name: "James Carter", amount: "$450", time: "8 min ago", status: "Sent" },
            { name: "Lisa Park", amount: "$300", time: "14 min ago", status: "Sent" },
            { name: "David Osei", amount: "$150", time: "22 min ago", status: "Sent" },
            { name: "Sarah Chen", amount: "$500", time: "31 min ago", status: "Sent" },
          ].map((tx, i) => (
            <div
              key={tx.name}
              className="flex items-center gap-3 py-3"
              style={{ borderBottom: i < 4 ? "1px solid var(--border)" : "none" }}
            >
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[9px] font-bold shrink-0" style={{ background: "var(--bg2)", color: "var(--ink3)" }}>
                {tx.name.split(" ").map(n => n[0]).join("")}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-medium truncate" style={{ color: "var(--ink)" }}>{tx.name}</p>
                <p className="text-[10px]" style={{ color: "var(--ink4)" }}>{tx.time}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[11px] font-medium font-(family-name:--font-dm-mono)" style={{ color: "var(--ink)" }}>{tx.amount}</p>
                <p className="text-[9px] font-semibold" style={{ color: "var(--green)" }}>{tx.status}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {screen === "dashboard" && (
        <div className="animate-[fadeUp_0.4s_ease_both]">
          <h3 className="text-[14px] font-medium mb-4" style={{ color: "var(--ink)" }}>Dashboard overview</h3>
          <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4">
            {[
              { label: "Total disbursed", value: "$84.2K", sub: "This month" },
              { label: "Active users", value: "189", sub: "of 247 enrolled" },
              { label: "Avg. withdrawal", value: "$312", sub: "Per transaction" },
              { label: "Recovery rate", value: "100%", sub: "Auto deducted" },
            ].map((s) => (
              <div key={s.label} className="rounded-lg p-3 sm:p-3.5" style={{ background: "var(--bg)", border: "1px solid var(--border)" }}>
                <p className="text-[9px] font-semibold tracking-wide uppercase mb-1" style={{ color: "var(--ink4)" }}>{s.label}</p>
                <p className="text-[16px] sm:text-[18px] font-light tracking-tight font-(family-name:--font-fraunces)" style={{ color: "var(--ink)" }}>{s.value}</p>
                <p className="text-[9px] mt-0.5 font-(family-name:--font-dm-mono)" style={{ color: "var(--green2)" }}>{s.sub}</p>
              </div>
            ))}
          </div>
          <div className="rounded-lg p-4" style={{ background: "var(--bg)", border: "1px solid var(--border)" }}>
            <p className="text-[11px] font-semibold mb-3" style={{ color: "var(--ink2)" }}>Daily withdrawals — April 2026</p>
            <div className="flex items-end gap-[4px] h-12">
              {[30,45,38,55,42,68,52,72,60,48].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t"
                  style={{
                    height: `${h}%`,
                    background: i === 9 ? "var(--green3)" : "var(--bg3)",
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {screen === "deduction" && (
        <div className="animate-[fadeUp_0.4s_ease_both]">
          <h3 className="text-[14px] font-medium mb-4" style={{ color: "var(--ink)" }}>Payroll deduction report</h3>
          <div className="rounded-xl p-4 sm:p-5 mb-4" style={{ background: "var(--green-bg)", border: "1px solid rgba(10,92,52,0.15)" }}>
            <div className="flex items-center gap-2 mb-2">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M4 8L7 11L12 5" stroke="var(--green)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-[12px] font-semibold" style={{ color: "var(--green)" }}>Report ready</span>
            </div>
            <p className="text-[11px] leading-relaxed" style={{ color: "var(--green)" }}>
              March 2026 deduction report generated. Total to deduct: $84,200 across 189 employees.
            </p>
          </div>
          <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
            <div className="grid gap-3 px-4 py-2.5 text-[9px] font-semibold tracking-wide uppercase" style={{ background: "var(--bg)", color: "var(--ink4)", gridTemplateColumns: "1fr auto auto" }}>
              <span>Employee</span>
              <span>Withdrawn</span>
              <span>Deduct</span>
            </div>
            {[
              { name: "Ama Mensah", withdrawn: "$650", deduct: "$651.50" },
              { name: "James Carter", withdrawn: "$900", deduct: "$903" },
              { name: "Lisa Park", withdrawn: "$300", deduct: "$301.50" },
              { name: "David Osei", withdrawn: "$450", deduct: "$451.50" },
            ].map((r) => (
              <div
                key={r.name}
                className="grid gap-3 px-4 py-2.5 items-center"
                style={{ gridTemplateColumns: "1fr auto auto", background: "var(--white)", borderTop: "1px solid var(--border)" }}
              >
                <span className="text-[11px] font-medium truncate" style={{ color: "var(--ink)" }}>{r.name}</span>
                <span className="text-[10px] font-(family-name:--font-dm-mono)" style={{ color: "var(--ink3)" }}>{r.withdrawn}</span>
                <span className="text-[10px] font-semibold font-(family-name:--font-dm-mono)" style={{ color: "var(--ink)" }}>{r.deduct}</span>
              </div>
            ))}
          </div>
          <p className="text-[10px] mt-3 text-center" style={{ color: "var(--ink4)" }}>
            Fees included in deduction amounts. Download full CSV report for payroll integration.
          </p>
        </div>
      )}
    </div>
  );
}

/* ── Step controls (shared) ── */
function StepControls({
  steps,
  currentStep,
  setCurrentStep,
  isPlaying,
  setIsPlaying,
  activeTab,
}: {
  steps: typeof employeeSteps;
  currentStep: number;
  setCurrentStep: (n: number | ((s: number) => number)) => void;
  isPlaying: boolean;
  setIsPlaying: (b: boolean) => void;
  activeTab: string;
}) {
  const step = steps[currentStep];

  const prevStep = () => setCurrentStep((s: number) => (s > 0 ? s - 1 : s));
  const nextStep = () => setCurrentStep((s: number) => (s < steps.length - 1 ? s + 1 : s));

  return (
    <div>
      {/* Step indicators */}
      <div className="flex items-center gap-4 mb-6 sm:mb-8">
        <div className="flex gap-1.5">
          {steps.map((_, i) => (
            <button
              key={i}
              onClick={() => { setCurrentStep(i); setIsPlaying(false); }}
              className="h-1.5 rounded-full transition-all duration-300 cursor-pointer"
              style={{
                width: i === currentStep ? 32 : 12,
                background: i === currentStep ? "var(--green3)" : i < currentStep ? "var(--green-bg)" : "var(--bg3)",
              }}
            />
          ))}
        </div>
        <span className="text-[12px] font-(family-name:--font-dm-mono)" style={{ color: "var(--ink4)" }}>
          {currentStep + 1} / {steps.length}
        </span>
      </div>

      {/* Step content */}
      <div key={`${activeTab}-${currentStep}`} className="animate-[fadeUp_0.35s_ease_both]">
        <p className="text-[11px] font-semibold tracking-[0.08em] uppercase mb-2" style={{ color: "var(--green)" }}>
          Step {currentStep + 1}
        </p>
        <h2 className="text-[22px] sm:text-[28px] font-(family-name:--font-fraunces) font-light tracking-[-0.03em] mb-3" style={{ color: "var(--ink)" }}>
          {step.title}
        </h2>
        <p className="text-[14px] sm:text-[15px] leading-[1.75] max-w-[480px] mb-6 sm:mb-8" style={{ color: "var(--ink3)" }}>
          {step.description}
        </p>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
        <button
          onClick={prevStep}
          disabled={currentStep === 0}
          className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-[13px] font-medium transition-opacity cursor-pointer disabled:opacity-30 disabled:cursor-default"
          style={{ border: "1.5px solid var(--border2)", color: "var(--ink2)" }}
        >
          ← Back
        </button>
        <button
          onClick={() => {
            if (currentStep >= steps.length - 1) {
              setCurrentStep(0);
              setIsPlaying(true);
            } else if (isPlaying) {
              setIsPlaying(false);
            } else {
              setIsPlaying(true);
            }
          }}
          className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg text-[13px] font-medium transition-opacity hover:opacity-90 cursor-pointer"
          style={{ background: "var(--ink)", color: "#fff" }}
        >
          {isPlaying ? "Pause" : currentStep >= steps.length - 1 ? "Replay" : "Auto-play"}
        </button>
        <button
          onClick={nextStep}
          disabled={currentStep >= steps.length - 1}
          className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-[13px] font-medium transition-opacity cursor-pointer disabled:opacity-30 disabled:cursor-default"
          style={{ border: "1.5px solid var(--border2)", color: "var(--ink2)" }}
        >
          Next →
        </button>
      </div>
    </div>
  );
}

/* ── Main demo page ── */
export default function DemoPage() {
  const [activeTab, setActiveTab] = useState<"employee" | "employer">("employee");
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const steps = activeTab === "employee" ? employeeSteps : employerSteps;

  const nextStep = useCallback(() => {
    setCurrentStep((s) => (s < steps.length - 1 ? s + 1 : s));
  }, [steps.length]);

  // Auto-play
  useEffect(() => {
    if (!isPlaying) return;
    if (currentStep >= steps.length - 1) {
      setIsPlaying(false);
      return;
    }
    const timer = setTimeout(nextStep, 3000);
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, steps.length, nextStep]);

  // Reset step when switching tabs
  useEffect(() => {
    setCurrentStep(0);
    setIsPlaying(false);
  }, [activeTab]);

  const step = steps[currentStep];

  return (
    <>
      {/* Header */}
      <div className="section-padding pt-[140px] pb-10 sm:pb-14 max-[1080px]:pt-[120px]">
        <div className="eyebrow mb-5">
          <span className="inline-block w-6 h-px" style={{ background: "var(--ink4)" }} />
          Demo
        </div>
        <h1
          className="font-(family-name:--font-fraunces) font-light tracking-[-0.04em] leading-[1.06] mb-5"
          style={{ fontSize: "clamp(32px, 4.5vw, 60px)", color: "var(--ink)" }}
        >
          See WageNow in <em className="italic" style={{ color: "var(--green2)" }}>action</em>
        </h1>
        <p className="text-[15px] sm:text-[17px] leading-[1.75] max-w-[640px]" style={{ color: "var(--ink3)" }}>
          Walk through the experience from both sides — how an employee withdraws earned wages,
          and how an employer manages it all.
        </p>
      </div>

      {/* Tab switcher */}
      <div className="section-padding mb-8 sm:mb-10">
        <div className="inline-flex rounded-xl p-1 w-full sm:w-auto" style={{ background: "var(--bg2)", border: "1px solid var(--border)" }}>
          {(["employee", "employer"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex-1 sm:flex-none px-4 sm:px-6 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-200 cursor-pointer"
              style={{
                background: activeTab === tab ? "var(--white)" : "transparent",
                color: activeTab === tab ? "var(--ink)" : "var(--ink4)",
                boxShadow: activeTab === tab ? "0 1px 3px rgba(0,0,0,0.06)" : "none",
              }}
            >
              {tab === "employee" ? "Employee" : "Employer"}
            </button>
          ))}
        </div>
      </div>

      {/* Simulation area */}
      <section className="section-padding pb-20 sm:pb-[120px]">

        {/* Employee view */}
        {activeTab === "employee" && (
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-center lg:items-start">
            {/* Phone — visible on all sizes, centered on mobile */}
            <div className="shrink-0">
              <PhoneFrame>
                <EmployeeScreen screen={step.screen} />
              </PhoneFrame>
            </div>

            {/* Step info */}
            <div className="w-full">
              <StepControls
                steps={steps}
                currentStep={currentStep}
                setCurrentStep={setCurrentStep}
                isPlaying={isPlaying}
                setIsPlaying={setIsPlaying}
                activeTab={activeTab}
              />
            </div>
          </div>
        )}

        {/* Employer view */}
        {activeTab === "employer" && (
          <div className="flex flex-col-reverse lg:flex-row gap-8 lg:gap-12 items-start">
            {/* Desktop frame */}
            <div className="w-full lg:flex-1">
              <DesktopFrame>
                <EmployerScreen screen={step.screen} />
              </DesktopFrame>
            </div>

            {/* Step info */}
            <div className="w-full lg:w-[340px] shrink-0">
              <StepControls
                steps={steps}
                currentStep={currentStep}
                setCurrentStep={setCurrentStep}
                isPlaying={isPlaying}
                setIsPlaying={setIsPlaying}
                activeTab={activeTab}
              />
            </div>
          </div>
        )}

        {/* CTA */}
        <div
          className="mt-16 sm:mt-20 rounded-(--r-xl) p-8 sm:p-10 text-center"
          style={{ background: "var(--ink)" }}
        >
          <h3 className="text-[20px] sm:text-[24px] font-(family-name:--font-fraunces) font-light tracking-[-0.03em] text-white mb-3">
            Ready to get started?
          </h3>
          <p className="text-[13px] sm:text-[14px] leading-[1.7] mb-6" style={{ color: "rgba(255,255,255,0.5)" }}>
            Deploy WageNow for your workforce in as little as 5 days.
          </p>
          <a
            href="#contact"
            className="inline-flex items-center gap-2 text-[14px] font-medium px-6 py-3 rounded-lg transition-opacity hover:opacity-90"
            style={{ background: "var(--green3)", color: "#fff" }}
          >
            Schedule a demo →
          </a>
        </div>
      </section>
    </>
  );
}
