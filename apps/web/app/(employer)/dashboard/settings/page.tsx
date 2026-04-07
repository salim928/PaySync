"use client";

import { useState } from "react";
import Link from "next/link";
import { useEmployerSettings } from "@/lib/hooks";
import { apiFetch } from "@/lib/utils";

export default function SettingsPage() {
  const { data: settings, isLoading, mutate } = useEmployerSettings();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showTotpSetup, setShowTotpSetup] = useState(false);
  const [totpUri, setTotpUri] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [totpError, setTotpError] = useState("");

  const handleToggleEwa = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      await apiFetch(`/api/v1/employers/settings?ewa_enabled=${!settings.ewa_enabled}`, { method: "PATCH" });
      mutate();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      // Error handled silently
    } finally {
      setSaving(false);
    }
  };

  const handlePaydayChange = async (newPayday: number) => {
    setSaving(true);
    try {
      await apiFetch(`/api/v1/employers/settings?payday=${newPayday}`, { method: "PATCH" });
      mutate();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      // Error handled silently
    } finally {
      setSaving(false);
    }
  };

  const handleTotpSetup = async () => {
    try {
      const data = await apiFetch<{ totp_uri: string; secret: string }>("/api/v1/auth/employer/totp/setup", { method: "POST" });
      setTotpUri(data.totp_uri);
      setShowTotpSetup(true);
    } catch {
      setTotpError("Failed to generate TOTP secret");
    }
  };

  const handleTotpVerify = async () => {
    try {
      await apiFetch("/api/v1/auth/employer/totp/verify", {
        method: "POST",
        body: JSON.stringify({ code: totpCode }),
      });
      setShowTotpSetup(false);
      setTotpCode("");
      mutate();
    } catch {
      setTotpError("Invalid code. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-175">
        <div className="h-8 w-32 rounded mb-8 animate-pulse" style={{ background: "var(--bg3)" }} />
        <div className="h-50 rounded-(--r-xl) animate-pulse mb-6" style={{ background: "var(--bg2)" }} />
        <div className="h-75 rounded-(--r-xl) animate-pulse" style={{ background: "var(--bg2)" }} />
      </div>
    );
  }

  return (
    <div className="max-w-175">
      <h1 className="font-(family-name:--font-fraunces) text-[28px] font-light tracking-[-0.03em] mb-1" style={{ color: "var(--ink)" }}>Settings</h1>
      <p className="text-[14px] mb-8" style={{ color: "var(--ink3)" }}>Company profile and EWA configuration</p>

      {saved && (
        <div className="mb-4 p-3 rounded-(--r) text-[13px] font-medium" style={{ background: "var(--green-bg)", color: "var(--green)" }}>
          ✓ Settings saved
        </div>
      )}

      {/* Quick links */}
      <div className="flex gap-3 mb-8">
        <Link href="/dashboard/settings/team" className="px-4 py-2 rounded-(--r) text-[13px] font-medium" style={{ background: "var(--bg2)", color: "var(--ink)", border: "1px solid var(--border)" }}>Team members</Link>
        <Link href="/dashboard/settings/billing" className="px-4 py-2 rounded-(--r) text-[13px] font-medium" style={{ background: "var(--bg2)", color: "var(--ink)", border: "1px solid var(--border)" }}>Billing</Link>
      </div>

      {/* Company profile */}
      <div className="rounded-(--r-xl) p-6 mb-6" style={{ background: "var(--white)", border: "1px solid var(--border)" }}>
        <h2 className="font-(family-name:--font-fraunces) text-[18px] font-normal tracking-[-0.02em] mb-4" style={{ color: "var(--ink)" }}>Company profile</h2>
        <div className="flex flex-col gap-4">
          {[
            { label: "Company name", value: settings?.company_name || "—" },
            { label: "Ghana TIN", value: settings?.ghana_tin || "—" },
            { label: "Payroll cycle", value: settings?.payroll_cycle || "monthly" },
            { label: "Plan", value: `${settings?.plan || "starter"} tier` },
          ].map((f) => (
            <div key={f.label}>
              <label className="block text-[12px] font-semibold tracking-[0.06em] uppercase mb-2" style={{ color: "var(--ink4)" }}>{f.label}</label>
              <input type="text" defaultValue={f.value} disabled
                className="w-full px-4 py-3 rounded-(--r) text-[14px] font-(family-name:--font-dm-sans) disabled:opacity-60"
                style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--ink)" }} />
            </div>
          ))}
        </div>
      </div>

      {/* EWA config */}
      <div className="rounded-(--r-xl) p-6 mb-6" style={{ background: "var(--white)", border: "1px solid var(--border)" }}>
        <h2 className="font-(family-name:--font-fraunces) text-[18px] font-normal tracking-[-0.02em] mb-4" style={{ color: "var(--ink)" }}>EWA configuration</h2>
        <div className="flex flex-col gap-5">
          <div className="flex items-center justify-between py-3" style={{ borderBottom: "1px solid var(--border)" }}>
            <div>
              <div className="text-[14px] font-medium" style={{ color: "var(--ink)" }}>Enable EWA</div>
              <div className="text-[12px]" style={{ color: "var(--ink3)" }}>Allow employees to make wage withdrawals</div>
            </div>
            <button onClick={handleToggleEwa} disabled={saving}
              className="w-12 h-7 rounded-full transition-colors relative cursor-pointer disabled:opacity-50"
              style={{ background: settings?.ewa_enabled ? "var(--green3)" : "var(--bg3)" }}>
              <div className="w-5 h-5 rounded-full bg-white absolute top-1 transition-all shadow-sm"
                style={{ left: settings?.ewa_enabled ? 24 : 4 }} />
            </button>
          </div>
          <div>
            <label className="block text-[12px] font-semibold tracking-[0.06em] uppercase mb-2" style={{ color: "var(--ink4)" }}>Payday (day of month)</label>
            <select
              value={settings?.payday || 25}
              onChange={(e) => handlePaydayChange(parseInt(e.target.value))}
              className="w-full max-w-50 px-4 py-3 rounded-(--r) text-[14px] outline-none font-(family-name:--font-dm-sans)"
              style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--ink)" }}>
              {Array.from({ length: 31 }, (_, i) => <option key={i + 1} value={i + 1}>{i + 1}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[12px] font-semibold tracking-[0.06em] uppercase mb-2" style={{ color: "var(--ink4)" }}>Default EWA limit</label>
            <div className="text-[14px]" style={{ color: "var(--ink)" }}>50% of accrued salary (configurable per employee)</div>
          </div>
          <div>
            <label className="block text-[12px] font-semibold tracking-[0.06em] uppercase mb-2" style={{ color: "var(--ink4)" }}>Platform fee</label>
            <div className="text-[14px] font-(family-name:--font-dm-mono)" style={{ color: "var(--ink)" }}>GHS 3.00 flat per withdrawal (non-configurable)</div>
          </div>
        </div>
      </div>

      {/* Security — TOTP 2FA */}
      <div className="rounded-(--r-xl) p-6 mb-6" style={{ background: "var(--white)", border: "1px solid var(--border)" }}>
        <h2 className="font-(family-name:--font-fraunces) text-[18px] font-normal tracking-[-0.02em] mb-4" style={{ color: "var(--ink)" }}>Security</h2>
        <div className="flex items-center justify-between py-3" style={{ borderBottom: "1px solid var(--border)" }}>
          <div>
            <div className="text-[14px] font-medium" style={{ color: "var(--ink)" }}>Two-factor authentication (TOTP)</div>
            <div className="text-[12px]" style={{ color: "var(--ink3)" }}>
              {settings?.totp_verified
                ? "TOTP 2FA is active. Required for all admin logins."
                : "Mandatory for employer admins. Set up now to secure your account."}
            </div>
          </div>
          {settings?.totp_verified ? (
            <span className="text-[11px] font-semibold px-3 py-1 rounded-full" style={{ background: "var(--green-bg)", color: "var(--green)" }}>Enabled</span>
          ) : (
            <button onClick={handleTotpSetup}
              className="px-4 py-2 rounded-(--r) text-[13px] font-semibold font-(family-name:--font-dm-sans)"
              style={{ background: "var(--green)", color: "#fff" }}>
              Set up 2FA →
            </button>
          )}
        </div>

        {showTotpSetup && (
          <div className="mt-4 p-4 rounded-(--r-lg)" style={{ background: "var(--bg)", border: "1px solid var(--border)" }}>
            <h3 className="text-[14px] font-medium mb-3" style={{ color: "var(--ink)" }}>Set up TOTP</h3>
            <p className="text-[13px] mb-3" style={{ color: "var(--ink3)" }}>
              Scan this URI in your authenticator app (Google Authenticator, Authy, etc.):
            </p>
            <div className="p-3 rounded-(--r) mb-4 break-all font-(family-name:--font-dm-mono) text-[11px]"
              style={{ background: "var(--white)", border: "1px solid var(--border)", color: "var(--ink3)" }}>
              {totpUri}
            </div>
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <label className="block text-[12px] font-semibold tracking-[0.06em] uppercase mb-2" style={{ color: "var(--ink4)" }}>Enter 6-digit code</label>
                <input type="text" value={totpCode} onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  maxLength={6} inputMode="numeric"
                  className="w-full px-4 py-3 rounded-(--r) text-[16px] text-center tracking-[0.2em] outline-none font-(family-name:--font-dm-mono)"
                  style={{ background: "var(--white)", border: "1px solid var(--border)", color: "var(--ink)" }}
                  placeholder="000000" />
              </div>
              <button onClick={handleTotpVerify} disabled={totpCode.length < 6}
                className="px-5 py-3 rounded-(--r) text-[13px] font-semibold font-(family-name:--font-dm-sans) disabled:opacity-50"
                style={{ background: "var(--green)", color: "#fff" }}>
                Verify
              </button>
            </div>
            {totpError && <p className="text-[12px] mt-2" style={{ color: "#b83232" }}>{totpError}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
