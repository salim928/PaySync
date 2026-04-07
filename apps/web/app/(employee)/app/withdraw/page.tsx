"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { useAccrual, useEmployeeProfile, submitWithdrawal } from "@/lib/hooks";

export default function WithdrawPage() {
  const { user } = useAuth();
  const employeeId = user?.sub ?? null;
  const { data: accrual } = useAccrual(employeeId);
  const { data: employee } = useEmployeeProfile();

  const available = accrual ? parseFloat(accrual.available) : 0;
  const fee = 3.0;
  const [amount, setAmount] = useState("");
  const [step, setStep] = useState<"input" | "confirm" | "processing" | "done">("input");
  const [error, setError] = useState("");

  const numAmount = parseFloat(amount) || 0;
  const disbursed = numAmount - fee;
  const isValid = numAmount >= 50 && numAmount <= 2000 && numAmount <= available && disbursed > 0;
  const quickAmounts = [100, 200, 300, 400].filter((q) => q <= available);

  const momoDisplay = employee
    ? `${employee.momo_provider.toUpperCase()} MoMo · ${employee.phone.slice(0, 7)}****${employee.phone.slice(-2)}`
    : "MoMo";

  const handleSubmit = async () => {
    if (!employeeId || !employee) return;
    setStep("processing");
    try {
      await submitWithdrawal({
        employee_id: employeeId,
        amount: numAmount.toFixed(2),
        momo_number: employee.phone.startsWith("+233")
          ? `0${employee.phone.slice(4)}`
          : employee.phone,
        momo_provider: employee.momo_provider,
      });
      setTimeout(() => setStep("done"), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Withdrawal failed");
      setStep("input");
    }
  };

  if (step === "processing") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6" style={{ background: "var(--green-bg)" }}>
          <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "var(--green3)", borderTopColor: "transparent" }} />
        </div>
        <h2 className="font-(family-name:--font-fraunces) text-[22px] font-light tracking-[-0.03em] mb-2" style={{ color: "var(--ink)" }}>
          Processing withdrawal
        </h2>
        <p className="text-[14px]" style={{ color: "var(--ink3)" }}>Sending GHS {disbursed.toFixed(2)} to your {momoDisplay}...</p>
      </div>
    );
  }

  if (step === "done") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="text-[56px] mb-4">✅</div>
        <h2 className="font-(family-name:--font-fraunces) text-[24px] font-light tracking-[-0.03em] mb-2" style={{ color: "var(--ink)" }}>
          Withdrawal sent!
        </h2>
        <p className="text-[14px] mb-2" style={{ color: "var(--ink3)" }}>GHS {disbursed.toFixed(2)} is on its way to your MoMo</p>
        <p className="text-[12px] font-(family-name:--font-dm-mono) mb-8" style={{ color: "var(--ink4)" }}>Expect it within ~90 seconds</p>
        <Link href="/app" className="px-6 py-3 rounded-(--r) text-[14px] font-medium font-(family-name:--font-dm-sans)" style={{ background: "var(--ink)", color: "#fff" }}>
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-(family-name:--font-fraunces) text-[24px] font-light tracking-[-0.03em] mb-1" style={{ color: "var(--ink)" }}>
        Withdraw funds
      </h1>
      <p className="text-[13px] mb-6" style={{ color: "var(--ink3)" }}>
        Available: <strong className="font-medium" style={{ color: "var(--green)" }}>GHS {available.toFixed(2)}</strong>
      </p>

      {error && (
        <div className="mb-4 p-3 rounded-(--r) text-[13px]" style={{ background: "#fef2f2", color: "#b83232", border: "1px solid #fecaca" }}>{error}</div>
      )}

      {step === "input" && (
        <>
          <div className="rounded-(--r-xl) p-6 mb-5" style={{ background: "var(--white)", border: "1px solid var(--border)" }}>
            <label className="block text-[11px] font-bold tracking-[0.06em] uppercase mb-3" style={{ color: "var(--ink4)" }}>Enter amount (GHS)</label>
            <div className="flex items-center gap-1 mb-4">
              <span className="text-[28px] font-light font-(family-name:--font-fraunces)" style={{ color: "var(--ink4)" }}>GHS</span>
              <input type="text" inputMode="decimal" value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
                className="flex-1 text-[40px] font-light font-(family-name:--font-fraunces) tracking-[-0.04em] outline-none bg-transparent"
                style={{ color: "var(--ink)" }} placeholder="0.00" autoFocus />
            </div>
            {quickAmounts.length > 0 && (
              <div className="flex gap-2">
                {quickAmounts.map((q) => (
                  <button key={q} onClick={() => setAmount(String(q))}
                    className="flex-1 py-2 rounded-lg text-[12px] font-medium transition-colors font-(family-name:--font-dm-sans)"
                    style={{
                      background: numAmount === q ? "var(--green-bg)" : "var(--bg)",
                      color: numAmount === q ? "var(--green)" : "var(--ink3)",
                      border: `1px solid ${numAmount === q ? "rgba(10,92,52,0.2)" : "var(--border)"}`,
                    }}>
                    GHS {q}
                  </button>
                ))}
              </div>
            )}
            {numAmount > 0 && numAmount < 50 && <p className="text-[12px] mt-3" style={{ color: "#b83232" }}>Minimum withdrawal is GHS 50</p>}
            {numAmount > available && <p className="text-[12px] mt-3" style={{ color: "#b83232" }}>Exceeds available balance</p>}
          </div>

          {numAmount >= 50 && numAmount <= available && (
            <div className="rounded-(--r-lg) p-5 mb-5" style={{ background: "var(--white)", border: "1px solid var(--border)" }}>
              {[
                { label: "Withdrawal amount", val: `GHS ${numAmount.toFixed(2)}` },
                { label: "Platform fee", val: `−GHS ${fee.toFixed(2)}` },
                { label: "You receive", val: `GHS ${disbursed.toFixed(2)}`, bold: true, green: true },
              ].map((r) => (
                <div key={r.label} className="flex justify-between py-2.5 text-[13px]" style={{ borderBottom: "1px solid var(--border)" }}>
                  <span style={{ color: "var(--ink3)" }}>{r.label}</span>
                  <span className={`font-(family-name:--font-dm-mono) ${r.bold ? "font-semibold" : "font-medium"}`}
                    style={{ color: r.green ? "var(--green)" : "var(--ink)" }}>{r.val}</span>
                </div>
              ))}
              <div className="flex items-center gap-2 mt-3">
                <span className="text-[11px]" style={{ color: "var(--ink4)" }}>Sent to:</span>
                <span className="text-[12px] font-medium font-(family-name:--font-dm-mono)" style={{ color: "var(--ink)" }}>{momoDisplay}</span>
              </div>
            </div>
          )}

          <button onClick={() => setStep("confirm")} disabled={!isValid}
            className="w-full py-4 rounded-(--r-lg) text-[15px] font-semibold transition-opacity hover:opacity-90 disabled:opacity-40 font-(family-name:--font-dm-sans)"
            style={{ background: "var(--green3)", color: "#fff" }}>
            Continue →
          </button>
        </>
      )}

      {step === "confirm" && (
        <div className="rounded-(--r-xl) p-6" style={{ background: "var(--white)", border: "1px solid var(--border)" }}>
          <h2 className="font-(family-name:--font-fraunces) text-[20px] font-light tracking-[-0.02em] mb-4" style={{ color: "var(--ink)" }}>Confirm withdrawal</h2>
          <div className="rounded-(--r-lg) p-5 mb-6" style={{ background: "var(--bg)" }}>
            <div className="text-center mb-4">
              <div className="text-[11px] font-semibold tracking-[0.06em] uppercase mb-2" style={{ color: "var(--ink4)" }}>You will receive</div>
              <div className="font-(family-name:--font-fraunces) text-[36px] font-light tracking-[-0.04em]" style={{ color: "var(--green)" }}>
                GHS {disbursed.toFixed(2)}
              </div>
              <div className="text-[12px] font-(family-name:--font-dm-mono) mt-1" style={{ color: "var(--ink4)" }}>to {momoDisplay}</div>
            </div>
            <div className="text-[11px] text-center" style={{ color: "var(--ink4)" }}>Fee: GHS {fee.toFixed(2)} · Arrives in ~90 seconds</div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep("input")}
              className="flex-1 py-3 rounded-(--r) text-[14px] font-medium font-(family-name:--font-dm-sans)"
              style={{ background: "var(--bg2)", color: "var(--ink)", border: "1px solid var(--border)" }}>← Back</button>
            <button onClick={handleSubmit}
              className="flex-1 py-3 rounded-(--r) text-[14px] font-semibold font-(family-name:--font-dm-sans)"
              style={{ background: "var(--green3)", color: "#fff" }}>Confirm withdrawal →</button>
          </div>
        </div>
      )}
    </div>
  );
}
