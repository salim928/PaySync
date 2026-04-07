"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogoMark } from "@/components/ui/logo";
import { useAuth } from "@/lib/auth";

export default function EmployerRegisterPage() {
  const router = useRouter();
  const { signUpEmployer, loginWithCustomJWT } = useAuth();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ company_name: "", ghana_tin: "", email: "", password: "", payday: 25 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const update = (key: string, val: string | number) => setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 2) { setStep(2); return; }
    setLoading(true);
    setError("");
    try {
      // 1. Create Supabase Auth user
      const supabaseUserId = await signUpEmployer(form.email, form.password, {
        company_name: form.company_name,
        role: "employer_admin",
      });

      // 2. Try to register in FastAPI backend (optional — backend may not be running)
      try {
        const res = await fetch("/api/v1/auth/employer/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (res.ok) {
          const data = await res.json();
          loginWithCustomJWT(data.access_token);
        }
      } catch {
        // FastAPI backend not available — proceed with Supabase-only auth
      }

      // 3. Redirect — Supabase session will be picked up by the auth provider
      router.push(supabaseUserId ? "/dashboard" : "/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--bg)" }}>
      <div className="w-full max-w-110">
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-2.5 font-semibold text-[18px] tracking-[-0.02em]" style={{ color: "var(--ink)" }}>
            <LogoMark size={36} />
            WageNow
          </Link>
        </div>

        <div className="rounded-(--r-xl) p-8" style={{ background: "var(--white)", border: "1px solid var(--border)" }}>
          <div className="flex items-center gap-3 mb-6">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold"
                  style={{ background: step >= s ? "var(--green)" : "var(--bg2)", color: step >= s ? "#fff" : "var(--ink4)" }}>{s}</div>
                {s < 2 && <div className="w-12 h-px" style={{ background: step > s ? "var(--green)" : "var(--border)" }} />}
              </div>
            ))}
            <span className="text-[12px] ml-2" style={{ color: "var(--ink4)" }}>{step === 1 ? "Company details" : "Account setup"}</span>
          </div>

          <h1 className="font-(family-name:--font-fraunces) text-[24px] font-light tracking-[-0.03em] mb-6" style={{ color: "var(--ink)" }}>
            {step === 1 ? "Tell us about your company" : "Create your account"}
          </h1>

          {error && <div className="mb-4 p-3 rounded-(--r) text-[13px] font-medium" style={{ background: "#fef2f2", color: "#b83232", border: "1px solid #fecaca" }}>{error}</div>}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {step === 1 ? (
              <>
                <div>
                  <label className="block text-[12px] font-semibold tracking-[0.06em] uppercase mb-2" style={{ color: "var(--ink4)" }}>Company name</label>
                  <input type="text" value={form.company_name} onChange={(e) => update("company_name", e.target.value)} required
                    className="w-full px-4 py-3 rounded-(--r) text-[14px] outline-none font-(family-name:--font-dm-sans)"
                    style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--ink)" }} placeholder="Acme Ghana Ltd" />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold tracking-[0.06em] uppercase mb-2" style={{ color: "var(--ink4)" }}>Ghana TIN</label>
                  <input type="text" value={form.ghana_tin} onChange={(e) => update("ghana_tin", e.target.value)} required
                    className="w-full px-4 py-3 rounded-(--r) text-[14px] outline-none font-(family-name:--font-dm-sans)"
                    style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--ink)" }} placeholder="C0012345678" />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold tracking-[0.06em] uppercase mb-2" style={{ color: "var(--ink4)" }}>Payday</label>
                  <select value={form.payday} onChange={(e) => update("payday", parseInt(e.target.value))}
                    className="w-full px-4 py-3 rounded-(--r) text-[14px] outline-none font-(family-name:--font-dm-sans)"
                    style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--ink)" }}>
                    {Array.from({ length: 31 }, (_, i) => <option key={i + 1} value={i + 1}>{i + 1}</option>)}
                  </select>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-[12px] font-semibold tracking-[0.06em] uppercase mb-2" style={{ color: "var(--ink4)" }}>Work email</label>
                  <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} required
                    className="w-full px-4 py-3 rounded-(--r) text-[14px] outline-none font-(family-name:--font-dm-sans)"
                    style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--ink)" }} placeholder="admin@acmeghana.com" />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold tracking-[0.06em] uppercase mb-2" style={{ color: "var(--ink4)" }}>Password</label>
                  <input type="password" value={form.password} onChange={(e) => update("password", e.target.value)} required minLength={8}
                    className="w-full px-4 py-3 rounded-(--r) text-[14px] outline-none font-(family-name:--font-dm-sans)"
                    style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--ink)" }} placeholder="Min 8 characters" />
                </div>
              </>
            )}
            <div className="flex gap-3 mt-2">
              {step > 1 && (
                <button type="button" onClick={() => setStep(1)}
                  className="flex-1 py-3 rounded-(--r) text-[14px] font-medium cursor-pointer font-(family-name:--font-dm-sans)"
                  style={{ background: "var(--bg2)", color: "var(--ink)", border: "1px solid var(--border)" }}>← Back</button>
              )}
              <button type="submit" disabled={loading}
                className="flex-1 py-3 rounded-(--r) text-[14px] font-semibold cursor-pointer transition-opacity hover:opacity-90 disabled:opacity-50 font-(family-name:--font-dm-sans)"
                style={{ background: "var(--ink)", color: "#fff", border: "none" }}>
                {loading ? "Creating..." : step === 1 ? "Continue →" : "Create account →"}
              </button>
            </div>
          </form>

          <p className="text-center text-[13px] mt-5" style={{ color: "var(--ink4)" }}>
            Already have an account?{" "}
            <Link href="/login" className="font-medium" style={{ color: "var(--green)" }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
