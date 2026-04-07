"use client";

import Link from "next/link";
import { useEmployerSettings } from "@/lib/hooks";

export default function BillingPage() {
  const { data: settings } = useEmployerSettings();
  const plan = settings?.plan || "starter";

  return (
    <div className="max-w-175">
      <Link href="/dashboard/settings" className="text-[13px] font-medium mb-3 inline-block" style={{ color: "var(--green)" }}>← Back to settings</Link>
      <h1 className="font-(family-name:--font-fraunces) text-[28px] font-light tracking-[-0.03em] mb-1" style={{ color: "var(--ink)" }}>Billing</h1>
      <p className="text-[14px] mb-8" style={{ color: "var(--ink3)" }}>Your plan and payment history</p>

      {/* Current plan */}
      <div className="rounded-(--r-xl) p-6 mb-6" style={{ background: "var(--ink)" }}>
        <div className="text-[10px] font-bold tracking-widest uppercase px-2.5 py-0.75 rounded-full inline-block mb-4" style={{ background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.55)" }}>Current plan</div>
        <div className="font-(family-name:--font-fraunces) text-[32px] font-light tracking-[-0.04em] text-white leading-none mb-2 capitalize">{plan}</div>
        <div className="text-[14px] mb-4" style={{ color: "rgba(255,255,255,0.4)" }}>
          {plan === "starter" ? "Up to 50 employees" : plan === "growth" ? "Up to 500 employees" : "Unlimited employees"}
        </div>
        <div className="flex gap-3">
          {plan === "starter" && (
            <button className="px-5 py-2.5 rounded-(--r) text-[13px] font-semibold font-(family-name:--font-dm-sans)" style={{ background: "#fff", color: "var(--ink)" }}>Upgrade to Growth →</button>
          )}
          <button className="px-5 py-2.5 rounded-(--r) text-[13px] font-medium font-(family-name:--font-dm-sans)" style={{ background: "transparent", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.15)" }}>Contact sales</button>
        </div>
      </div>

      {/* Invoices */}
      <div className="rounded-(--r-lg)" style={{ background: "var(--white)", border: "1px solid var(--border)" }}>
        <div className="px-6 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
          <h2 className="font-(family-name:--font-fraunces) text-[18px] font-normal tracking-[-0.02em]" style={{ color: "var(--ink)" }}>Invoices</h2>
        </div>
        <div className="p-8 text-center text-[13px]" style={{ color: "var(--ink4)" }}>
          No invoices yet. Billing will appear here when your subscription is active.
        </div>
      </div>
    </div>
  );
}
