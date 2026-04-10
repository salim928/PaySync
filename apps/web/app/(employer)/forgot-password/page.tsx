"use client";

import { useState } from "react";
import Link from "next/link";
import { LogoMark } from "@/components/ui/logo";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const supabase = createSupabaseBrowserClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/api/auth/callback?next=/reset-password`,
      });
      if (resetError) throw new Error(resetError.message);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--bg)" }}>
      <div className="w-full max-w-100">
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-2.5 font-semibold text-[18px] tracking-[-0.02em]" style={{ color: "var(--ink)" }}>
            <LogoMark size={36} />
            WageNow
          </Link>
        </div>

        <div className="rounded-(--r-xl) p-8" style={{ background: "var(--white)", border: "1px solid var(--border)" }}>
          <h1 className="font-(family-name:--font-fraunces) text-[24px] font-light tracking-[-0.03em] mb-2" style={{ color: "var(--ink)" }}>
            Reset your password
          </h1>
          <p className="text-[14px] mb-6" style={{ color: "var(--ink3)" }}>
            Enter your email and we&apos;ll send a reset link
          </p>

          {error && (
            <div className="mb-4 p-3 rounded-(--r) text-[13px] font-medium" style={{ background: "#fef2f2", color: "#b83232", border: "1px solid #fecaca" }}>{error}</div>
          )}

          {sent ? (
            <div className="p-4 rounded-(--r) text-[14px]" style={{ background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0" }}>
              <p className="font-semibold mb-1">Check your email</p>
              <p className="text-[13px]">We sent a password reset link to <strong>{email}</strong>. Click the link in the email to set a new password.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-[12px] font-semibold tracking-[0.06em] uppercase mb-2" style={{ color: "var(--ink4)" }}>Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                  className="w-full px-4 py-3 rounded-(--r) text-[14px] outline-none transition-colors focus:border-(--green3) font-(family-name:--font-dm-sans)"
                  style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--ink)" }}
                  placeholder="admin@company.com" />
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-3 rounded-(--r) text-[14px] font-semibold cursor-pointer transition-opacity hover:opacity-90 disabled:opacity-50 font-(family-name:--font-dm-sans)"
                style={{ background: "var(--ink)", color: "#fff", border: "none" }}>
                {loading ? "Sending..." : "Send reset link"}
              </button>
            </form>
          )}

          <p className="text-center text-[13px] mt-5" style={{ color: "var(--ink4)" }}>
            Remember your password?{" "}
            <Link href="/login" className="font-medium" style={{ color: "var(--green)" }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
