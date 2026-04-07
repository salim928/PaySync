"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogoMark } from "@/components/ui/logo";
import { useAuth } from "@/lib/auth";

export default function EmployeeLoginPage() {
  const router = useRouter();
  const { loginWithCustomJWT, loginWithSupabase } = useAuth();
  const [mode, setMode] = useState<"phone" | "email">("phone");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const formatPhone = (raw: string) => {
    const cleaned = raw.replace(/\s|-/g, "");
    if (cleaned.startsWith("0") && cleaned.length === 10) return `+233${cleaned.slice(1)}`;
    if (cleaned.startsWith("+")) return cleaned;
    return `+233${cleaned}`;
  };

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/v1/auth/employee/otp/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: formatPhone(phone) }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || "Failed to send OTP");
      }
      setStep("otp");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Cannot reach the server. Try email login instead.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/v1/auth/employee/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: formatPhone(phone), code: otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Invalid OTP");
      loginWithCustomJWT(data.access_token);
      router.push("/app");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await loginWithSupabase(email, password);
      router.push("/app");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const maskedPhone = phone.length >= 4
    ? `+233${phone.replace(/^0/, "").slice(0, 2)}****${phone.slice(-2)}`
    : "";

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--bg)" }}>
      <div className="w-full max-w-95">
        <div className="flex flex-col items-center mb-8">
          <LogoMark size={44} />
          <span className="font-semibold text-[18px] tracking-[-0.02em] mt-3" style={{ color: "var(--ink)" }}>WageNow</span>
          <span className="text-[13px] mt-1" style={{ color: "var(--ink3)" }}>Access your earned wages</span>
        </div>

        {/* Mode toggle */}
        <div className="flex mb-4 rounded-(--r) overflow-hidden" style={{ border: "1px solid var(--border)" }}>
          <button
            onClick={() => { setMode("phone"); setError(""); }}
            className="flex-1 py-2.5 text-[13px] font-medium text-center cursor-pointer transition-colors font-(family-name:--font-dm-sans)"
            style={{ background: mode === "phone" ? "var(--ink)" : "var(--white)", color: mode === "phone" ? "#fff" : "var(--ink3)", border: "none" }}
          >
            Phone OTP
          </button>
          <button
            onClick={() => { setMode("email"); setError(""); }}
            className="flex-1 py-2.5 text-[13px] font-medium text-center cursor-pointer transition-colors font-(family-name:--font-dm-sans)"
            style={{ background: mode === "email" ? "var(--ink)" : "var(--white)", color: mode === "email" ? "#fff" : "var(--ink3)", border: "none" }}
          >
            Email login
          </button>
        </div>

        <div className="rounded-(--r-xl) p-7" style={{ background: "var(--white)", border: "1px solid var(--border)" }}>
          {mode === "email" ? (
            <>
              <h1 className="font-(family-name:--font-fraunces) text-[22px] font-light tracking-[-0.03em] mb-2" style={{ color: "var(--ink)" }}>
                Sign in with email
              </h1>
              <p className="text-[13px] mb-6" style={{ color: "var(--ink3)" }}>Use your WageNow account credentials</p>
              {error && <div className="mb-4 p-3 rounded-(--r) text-[13px]" style={{ background: "#fef2f2", color: "#b83232" }}>{error}</div>}
              <form onSubmit={handleEmailLogin} className="flex flex-col gap-4">
                <div>
                  <label className="block text-[12px] font-semibold tracking-[0.06em] uppercase mb-2" style={{ color: "var(--ink4)" }}>Email</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                    className="w-full px-4 py-3 rounded-(--r) text-[14px] outline-none font-(family-name:--font-dm-sans)"
                    style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--ink)" }}
                    placeholder="you@company.com" />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold tracking-[0.06em] uppercase mb-2" style={{ color: "var(--ink4)" }}>Password</label>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                    className="w-full px-4 py-3 rounded-(--r) text-[14px] outline-none font-(family-name:--font-dm-sans)"
                    style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--ink)" }}
                    placeholder="••••••••" />
                </div>
                <button type="submit" disabled={loading}
                  className="w-full py-3 rounded-(--r) text-[14px] font-semibold cursor-pointer transition-opacity hover:opacity-90 disabled:opacity-50 font-(family-name:--font-dm-sans)"
                  style={{ background: "var(--ink)", color: "#fff" }}>
                  {loading ? "Signing in..." : "Sign in →"}
                </button>
              </form>
            </>
          ) : step === "phone" ? (
            <>
              <h1 className="font-(family-name:--font-fraunces) text-[22px] font-light tracking-[-0.03em] mb-2" style={{ color: "var(--ink)" }}>
                Enter your phone number
              </h1>
              <p className="text-[13px] mb-6" style={{ color: "var(--ink3)" }}>We&apos;ll send a 6-digit OTP to verify your identity</p>
              {error && <div className="mb-4 p-3 rounded-(--r) text-[13px]" style={{ background: "#fef2f2", color: "#b83232" }}>{error}</div>}
              <form onSubmit={handleRequestOTP} className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-3 rounded-(--r) text-[14px] font-medium font-(family-name:--font-dm-mono) shrink-0"
                    style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--ink3)" }}>+233</span>
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required
                    className="flex-1 px-4 py-3 rounded-(--r) text-[16px] outline-none font-(family-name:--font-dm-sans)"
                    style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--ink)" }}
                    placeholder="24 123 4567" maxLength={10} inputMode="tel" />
                </div>
                <button type="submit" disabled={loading}
                  className="w-full py-3 rounded-(--r) text-[14px] font-semibold cursor-pointer transition-opacity hover:opacity-90 disabled:opacity-50 font-(family-name:--font-dm-sans)"
                  style={{ background: "var(--ink)", color: "#fff" }}>
                  {loading ? "Sending..." : "Send OTP →"}
                </button>
              </form>
            </>
          ) : (
            <>
              <h1 className="font-(family-name:--font-fraunces) text-[22px] font-light tracking-[-0.03em] mb-2" style={{ color: "var(--ink)" }}>
                Enter verification code
              </h1>
              <p className="text-[13px] mb-6" style={{ color: "var(--ink3)" }}>Sent to {maskedPhone}</p>
              {error && <div className="mb-4 p-3 rounded-(--r) text-[13px]" style={{ background: "#fef2f2", color: "#b83232" }}>{error}</div>}
              <form onSubmit={handleVerifyOTP} className="flex flex-col gap-4">
                <input type="text" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  required maxLength={6} inputMode="numeric" autoComplete="one-time-code"
                  className="w-full px-4 py-4 rounded-(--r) text-[24px] text-center tracking-[0.3em] outline-none font-(family-name:--font-dm-mono)"
                  style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--ink)" }}
                  placeholder="000000" />
                <button type="submit" disabled={loading || otp.length < 6}
                  className="w-full py-3 rounded-(--r) text-[14px] font-semibold cursor-pointer transition-opacity hover:opacity-90 disabled:opacity-50 font-(family-name:--font-dm-sans)"
                  style={{ background: "var(--ink)", color: "#fff" }}>
                  {loading ? "Verifying..." : "Verify →"}
                </button>
                <button type="button" onClick={() => { setStep("phone"); setOtp(""); setError(""); }}
                  className="text-[13px] font-medium text-center font-(family-name:--font-dm-sans)" style={{ color: "var(--green)" }}>
                  ← Change number
                </button>
              </form>
            </>
          )}
        </div>

        <div className="text-center mt-4">
          <p className="text-[12px]" style={{ color: "var(--ink4)" }}>
            Are you an employer?{" "}
            <a href="/login" className="font-medium" style={{ color: "var(--green)" }}>Employer sign in →</a>
          </p>
        </div>
      </div>
    </div>
  );
}
