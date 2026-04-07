"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth";

export default function TeamPage() {
  const { user } = useAuth();

  return (
    <div className="max-w-200">
      <Link href="/dashboard/settings" className="text-[13px] font-medium mb-3 inline-block" style={{ color: "var(--green)" }}>← Back to settings</Link>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-(family-name:--font-fraunces) text-[28px] font-light tracking-[-0.03em]" style={{ color: "var(--ink)" }}>Team</h1>
          <p className="text-[14px] mt-1" style={{ color: "var(--ink3)" }}>Manage dashboard access</p>
        </div>
        <button className="px-5 py-2.5 rounded-(--r) text-[13px] font-medium font-(family-name:--font-dm-sans)" style={{ background: "var(--ink)", color: "#fff" }}>
          + Invite member
        </button>
      </div>

      <div className="rounded-(--r-lg)" style={{ background: "var(--white)", border: "1px solid var(--border)" }}>
        <div className="grid px-6 py-2 text-[10px] font-bold tracking-[0.06em] uppercase" style={{ gridTemplateColumns: "1fr 100px 80px 80px", color: "var(--ink4)", borderBottom: "1px solid var(--border)" }}>
          <span>Member</span><span>Role</span><span>2FA</span><span>Status</span>
        </div>
        {user && (
          <div className="grid px-6 py-3 items-center" style={{ gridTemplateColumns: "1fr 100px 80px 80px", borderBottom: "1px solid var(--border)" }}>
            <div>
              <div className="text-[13px] font-medium" style={{ color: "var(--ink)" }}>You</div>
              <div className="text-[11px]" style={{ color: "var(--ink4)" }}>{user.sub.slice(0, 8)}...</div>
            </div>
            <span className="text-[12px]" style={{ color: "var(--ink3)" }}>{user.role === "employer_admin" ? "Admin" : "Manager"}</span>
            <span className="text-[11px] font-semibold px-2 py-0.75 rounded-full inline-flex w-fit"
              style={{ background: "var(--bg3)", color: "var(--ink4)" }}>—</span>
            <span className="text-[11px] font-semibold px-2 py-0.75 rounded-full inline-flex w-fit"
              style={{ background: "var(--green-bg)", color: "var(--green)" }}>Active</span>
          </div>
        )}
      </div>
    </div>
  );
}
