"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useEmployeeProfile } from "@/lib/hooks";

export default function ProfilePage() {
  const { logout } = useAuth();
  const { data: employee, isLoading } = useEmployeeProfile();
  const [smsNotify, setSmsNotify] = useState(true);

  if (isLoading) {
    return (
      <div>
        <h1 className="font-(family-name:--font-fraunces) text-[24px] font-light tracking-[-0.03em] mb-6" style={{ color: "var(--ink)" }}>Profile</h1>
        <div className="h-20 rounded-xl animate-pulse mb-6" style={{ background: "var(--bg3)" }} />
        <div className="h-75 rounded-(--r-lg) animate-pulse" style={{ background: "var(--bg2)" }} />
      </div>
    );
  }

  const initials = employee?.full_name?.split(" ").map((n) => n[0]).join("").slice(0, 2) || "??";
  const maskedMomo = employee?.phone ? `${employee.phone.slice(0, 7)}****${employee.phone.slice(-2)}` : "—";

  return (
    <div>
      <h1 className="font-(family-name:--font-fraunces) text-[24px] font-light tracking-[-0.03em] mb-6" style={{ color: "var(--ink)" }}>Profile</h1>

      {/* Avatar + name */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-[22px] font-bold" style={{ background: "var(--bg2)", color: "var(--ink3)" }}>{initials}</div>
        <div>
          <div className="text-[18px] font-medium" style={{ color: "var(--ink)" }}>{employee?.full_name || "—"}</div>
          <div className="text-[13px]" style={{ color: "var(--ink3)" }}>{employee?.department || "No department"}</div>
        </div>
      </div>

      {/* Account info */}
      <div className="rounded-(--r-lg) p-5 mb-5" style={{ background: "var(--white)", border: "1px solid var(--border)" }}>
        <h2 className="text-[11px] font-bold tracking-[0.06em] uppercase mb-4" style={{ color: "var(--ink4)" }}>Account</h2>
        {[
          { label: "Phone number", val: employee?.phone || "—" },
          { label: "MoMo provider", val: employee?.momo_provider ? `${employee.momo_provider.toUpperCase()} Mobile Money` : "—" },
          { label: "MoMo number", val: maskedMomo },
          { label: "Start date", val: employee?.start_date ? new Date(employee.start_date).toLocaleDateString("en-GH", { year: "numeric", month: "long", day: "numeric" }) : "—" },
        ].map((r) => (
          <div key={r.label} className="flex justify-between py-2.5 text-[13px]" style={{ borderBottom: "1px solid var(--border)" }}>
            <span style={{ color: "var(--ink3)" }}>{r.label}</span>
            <span className="font-medium" style={{ color: "var(--ink)" }}>{r.val}</span>
          </div>
        ))}
      </div>

      {/* EWA info */}
      <div className="rounded-(--r-lg) p-5 mb-5" style={{ background: "var(--white)", border: "1px solid var(--border)" }}>
        <h2 className="text-[11px] font-bold tracking-[0.06em] uppercase mb-4" style={{ color: "var(--ink4)" }}>EWA settings</h2>
        {[
          { label: "Monthly salary", val: employee?.monthly_salary ? `GHS ${parseFloat(employee.monthly_salary).toLocaleString("en-GH", { minimumFractionDigits: 2 })}` : "—" },
          { label: "EWA limit", val: employee?.ewa_limit_pct ? `${parseFloat(employee.ewa_limit_pct)}% of accrued` : "—" },
          { label: "Withdrawal fee", val: "GHS 3.00 flat" },
          { label: "Min withdrawal", val: "GHS 50.00" },
          { label: "Max withdrawal", val: "GHS 2,000.00" },
          { label: "Cooldown period", val: "48 hours" },
        ].map((r) => (
          <div key={r.label} className="flex justify-between py-2.5 text-[13px]" style={{ borderBottom: "1px solid var(--border)" }}>
            <span style={{ color: "var(--ink3)" }}>{r.label}</span>
            <span className="font-medium font-(family-name:--font-dm-mono)" style={{ color: "var(--ink)" }}>{r.val}</span>
          </div>
        ))}
      </div>

      {/* Notifications */}
      <div className="rounded-(--r-lg) p-5 mb-5" style={{ background: "var(--white)", border: "1px solid var(--border)" }}>
        <h2 className="text-[11px] font-bold tracking-[0.06em] uppercase mb-4" style={{ color: "var(--ink4)" }}>Notifications</h2>
        <div className="flex items-center justify-between py-2.5" style={{ borderBottom: "1px solid var(--border)" }}>
          <div>
            <div className="text-[13px] font-medium" style={{ color: "var(--ink)" }}>SMS confirmations</div>
            <div className="text-[11px]" style={{ color: "var(--ink4)" }}>Receive SMS when withdrawal is sent</div>
          </div>
          <button onClick={() => setSmsNotify(!smsNotify)}
            className="w-11 h-6 rounded-full transition-colors relative cursor-pointer"
            style={{ background: smsNotify ? "var(--green3)" : "var(--bg3)" }}>
            <div className="w-4.5 h-4.5 rounded-full bg-white absolute top-0.75 transition-all shadow-sm"
              style={{ left: smsNotify ? 22 : 3 }} />
          </button>
        </div>
      </div>

      <button onClick={logout}
        className="w-full py-3 rounded-(--r) text-[14px] font-medium font-(family-name:--font-dm-sans)"
        style={{ background: "var(--bg2)", color: "var(--ink3)", border: "1px solid var(--border)" }}>
        Sign out
      </button>
    </div>
  );
}
