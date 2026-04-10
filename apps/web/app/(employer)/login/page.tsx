"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogoMark } from "@/components/ui/logo";
import { useAuth } from "@/lib/auth";

export default function EmployerLoginPage() {
  const router = useRouter();
  const { loginWithSupabase } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await loginWithSupabase(email, password);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
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
            Employer sign in
          </h1>
          <p className="text-[14px] mb-6" style={{ color: "var(--ink3)" }}>Access your WageNow dashboard</p>

          {error && (
            <div className="mb-4 p-3 rounded-(--r) text-[13px] font-medium" style={{ background: "#fef2f2", color: "#b83232", border: "1px solid #fecaca" }}>{error}</div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-[12px] font-semibold tracking-[0.06em] uppercase mb-2" style={{ color: "var(--ink4)" }}>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                className="w-full px-4 py-3 rounded-(--r) text-[14px] outline-none transition-colors focus:border-(--green3) font-(family-name:--font-dm-sans)"
                style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--ink)" }}
                placeholder="admin@company.com" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-[12px] font-semibold tracking-[0.06em] uppercase" style={{ color: "var(--ink4)" }}>Password</label>
                <Link href="/forgot-password" className="text-[12px] font-medium" style={{ color: "var(--green)" }}>Forgot password?</Link>
              </div>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                className="w-full px-4 py-3 rounded-(--r) text-[14px] outline-none transition-colors focus:border-(--green3) font-(family-name:--font-dm-sans)"
                style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--ink)" }}
                placeholder="••••••••" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-(--r) text-[14px] font-semibold cursor-pointer transition-opacity hover:opacity-90 disabled:opacity-50 font-(family-name:--font-dm-sans)"
              style={{ background: "var(--ink)", color: "#fff", border: "none" }}>
              {loading ? "Signing in..." : "Sign in →"}
            </button>
          </form>

          <p className="text-center text-[13px] mt-5" style={{ color: "var(--ink4)" }}>
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-medium" style={{ color: "var(--green)" }}>Register</Link>
          </p>

          <div className="text-center mt-4 pt-4" style={{ borderTop: "1px solid var(--border)" }}>
            <p className="text-[12px]" style={{ color: "var(--ink4)" }}>
              Are you an employee?{" "}
              <Link href="/employee-login" className="font-medium" style={{ color: "var(--green)" }}>Employee sign in →</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
