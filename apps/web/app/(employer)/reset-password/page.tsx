"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogoMark } from "@/components/ui/logo";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [hasSession, setHasSession] = useState<boolean | null>(null);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getSession().then(({ data: { session } }: { data: { session: unknown } }) => {
      setHasSession(!!session);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const supabase = createSupabaseBrowserClient();
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw new Error(updateError.message);
      setSuccess(true);
      setTimeout(() => router.push("/login"), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update password");
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
            Set new password
          </h1>
          <p className="text-[14px] mb-6" style={{ color: "var(--ink3)" }}>
            Choose a strong password for your account
          </p>

          {error && (
            <div className="mb-4 p-3 rounded-(--r) text-[13px] font-medium" style={{ background: "#fef2f2", color: "#b83232", border: "1px solid #fecaca" }}>{error}</div>
          )}

          {success ? (
            <div className="p-4 rounded-(--r) text-[14px]" style={{ background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0" }}>
              <p className="font-semibold mb-1">Password updated</p>
              <p className="text-[13px]">Redirecting to sign in...</p>
            </div>
          ) : hasSession === false ? (
            <div className="p-4 rounded-(--r) text-[14px]" style={{ background: "#fef2f2", color: "#b83232", border: "1px solid #fecaca" }}>
              <p className="font-semibold mb-1">Invalid or expired link</p>
              <p className="text-[13px]">
                Please request a new reset link from the{" "}
                <Link href="/forgot-password" className="underline font-medium">forgot password</Link> page.
              </p>
            </div>
          ) : hasSession === null ? (
            <p className="text-[14px]" style={{ color: "var(--ink3)" }}>Loading...</p>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-[12px] font-semibold tracking-[0.06em] uppercase mb-2" style={{ color: "var(--ink4)" }}>New password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8}
                  className="w-full px-4 py-3 rounded-(--r) text-[14px] outline-none transition-colors focus:border-(--green3) font-(family-name:--font-dm-sans)"
                  style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--ink)" }}
                  placeholder="Min 8 characters" />
              </div>
              <div>
                <label className="block text-[12px] font-semibold tracking-[0.06em] uppercase mb-2" style={{ color: "var(--ink4)" }}>Confirm password</label>
                <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required minLength={8}
                  className="w-full px-4 py-3 rounded-(--r) text-[14px] outline-none transition-colors focus:border-(--green3) font-(family-name:--font-dm-sans)"
                  style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--ink)" }}
                  placeholder="Re-enter password" />
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-3 rounded-(--r) text-[14px] font-semibold cursor-pointer transition-opacity hover:opacity-90 disabled:opacity-50 font-(family-name:--font-dm-sans)"
                style={{ background: "var(--ink)", color: "#fff", border: "none" }}>
                {loading ? "Updating..." : "Update password"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
