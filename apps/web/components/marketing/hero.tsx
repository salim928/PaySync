"use client";

import { PlayCircle, Zap, Wallet } from "lucide-react";

export function Hero() {
  const chartHeights = [35,42,28,55,48,62,40,70,58,66,52,78,61,85,74,32,44,38,57,65];
  const chartLabels = ["1","3","5","7","9","11","13","15","17","19","21","23","25","27","Today","—","—","—","—","—"];

  return (
    <section
      className="min-h-screen flex flex-col justify-end relative section-padding"
      style={{ paddingTop: "calc(var(--nav-h) + 80px)", paddingBottom: 0 }}
    >
      {/* Background numeral */}
      <div
        className="absolute right-[-20px] top-1/2 -translate-y-[55%] font-[family-name:var(--font-fraunces)] font-extralight leading-none select-none pointer-events-none z-0 tracking-[-0.05em] max-[1080px]:hidden"
        style={{
          fontSize: "clamp(280px, 28vw, 460px)",
          color: "transparent",
          WebkitTextStroke: "1px var(--border2)",
        }}
      >
        GHS
      </div>

      <div className="relative z-[1] grid grid-cols-[1fr_520px] gap-16 items-end max-[1080px]:grid-cols-1">
        {/* Left */}
        <div>
          {/* Headline */}
          <h1
            className="hero-stagger-2 font-[family-name:var(--font-fraunces)] font-light tracking-[-0.04em] leading-[1.01] mb-7"
            style={{ fontSize: "clamp(52px, 6vw, 84px)", color: "var(--ink)" }}
          >
            Your workforce<br />
            has <em className="italic" style={{ color: "var(--green2)" }}>already<br />earned</em> this.
          </h1>

          {/* Sub */}
          <p
            className="hero-stagger-3 text-[17px] leading-[1.75] max-w-[500px] mb-11"
            style={{ color: "var(--ink3)" }}
          >
            <strong className="font-medium" style={{ color: "var(--ink2)" }}>WageNow</strong> gives
            employees real-time access to wages they&apos;ve already accrued — before
            payday. No loans. No interest. No credit risk. Just their own money, when they need it.
          </p>

          {/* CTAs */}
          <div className="hero-stagger-4 flex items-center gap-[14px] mb-14">
            <a
              href="#contact"
              className="inline-flex items-center gap-[9px] text-[15px] font-medium px-7 py-[14px] rounded-[10px] border-none cursor-pointer transition-opacity duration-150 hover:opacity-[0.82] active:scale-[0.98] font-[family-name:var(--font-dm-sans)]"
              style={{ background: "var(--ink)", color: "#fff", letterSpacing: "-0.01em" }}
            >
              Request early access →
            </a>
            <a
              href="/demo"
              className="inline-flex items-center gap-[9px] text-[15px] font-normal px-7 py-[14px] rounded-[10px] cursor-pointer transition-colors duration-150 font-[family-name:var(--font-dm-sans)]"
              style={{
                background: "transparent",
                color: "var(--ink2)",
                border: "1.5px solid var(--border2)",
                letterSpacing: "-0.01em",
              }}
            >
              <PlayCircle strokeWidth={1.4} className="w-4 h-4" />
              Watch demo
            </a>
          </div>

          {/* Proof */}
          <div
            className="hero-stagger-5 flex items-center gap-5 pt-5"
            style={{ borderTop: "1px solid var(--border)" }}
          >
            <div className="flex">
              {["EA", "AG", "KO", "AB", "SF"].map((initials, i) => (
                <div
                  key={initials}
                  className="w-[30px] h-[30px] rounded-full flex items-center justify-center text-[10px] font-semibold"
                  style={{
                    background: "var(--bg3)",
                    border: "2px solid var(--bg)",
                    marginLeft: i > 0 ? -10 : 0,
                    color: "var(--ink2)",
                  }}
                >
                  {initials}
                </div>
              ))}
            </div>
            <p className="text-[13px] leading-[1.45]" style={{ color: "var(--ink4)" }}>
              <strong className="font-medium" style={{ color: "var(--ink3)" }}>Early access open</strong>
              <br />
              Trusted by HR &amp; Finance leads across multiple industries
            </p>
          </div>
        </div>

        {/* Right — Dashboard visual */}
        <div className="hero-stagger-6 self-end relative max-[1080px]:hidden">
          {/* Floating cards */}
          <div
            className="absolute left-[-88px] top-[100px] z-10 rounded-[var(--r-lg)] p-3 px-4 flex items-center gap-3"
            style={{
              background: "var(--white)",
              border: "1px solid var(--border)",
              boxShadow: "0 4px 24px rgba(0,0,0,0.09), 0 1px 4px rgba(0,0,0,0.04)",
              animation: "floatY 5s ease-in-out infinite -1.5s",
            }}
          >
            <div
              className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0"
              style={{ background: "var(--green-bg)", color: "var(--green2)" }}
            >
              <Zap strokeWidth={1.7} className="w-[18px] h-[18px]" />
            </div>
            <div>
              <div className="text-[10px] font-medium mb-[3px]" style={{ color: "var(--ink4)" }}>
                Avg. disbursement
              </div>
              <div
                className="font-[family-name:var(--font-fraunces)] text-[20px] font-light tracking-[-0.04em] leading-none"
                style={{ color: "var(--green2)" }}
              >
                ~90s
              </div>
              <div className="text-[9px] mt-[3px] font-[family-name:var(--font-dm-mono)]" style={{ color: "var(--ink5)" }}>
                via MoMo rails
              </div>
            </div>
          </div>

          <div
            className="absolute right-[-72px] top-[200px] z-10 rounded-[var(--r-lg)] p-3 px-4 flex items-center gap-3"
            style={{
              background: "var(--white)",
              border: "1px solid var(--border)",
              boxShadow: "0 4px 24px rgba(0,0,0,0.09), 0 1px 4px rgba(0,0,0,0.04)",
              animation: "floatY 5s ease-in-out infinite -3s",
            }}
          >
            <div
              className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0"
              style={{ background: "var(--bg2)", color: "var(--ink2)" }}
            >
              <Wallet strokeWidth={1.6} className="w-[18px] h-[18px]" />
            </div>
            <div>
              <div className="text-[10px] font-medium mb-[3px]" style={{ color: "var(--ink4)" }}>
                Employee fee
              </div>
              <div className="font-[family-name:var(--font-fraunces)] text-[20px] font-light tracking-[-0.04em] leading-none" style={{ color: "var(--ink)" }}>
                GHS 3
              </div>
              <div className="text-[9px] mt-[3px] font-[family-name:var(--font-dm-mono)]" style={{ color: "var(--ink5)" }}>
                flat · no interest
              </div>
            </div>
          </div>

          {/* Dashboard mockup */}
          <div
            className="overflow-hidden"
            style={{
              background: "var(--white)",
              border: "1px solid var(--border)",
              borderBottom: "none",
              borderRadius: "var(--r-xl) var(--r-xl) 0 0",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06), 0 32px 80px rgba(0,0,0,0.07)",
            }}
          >
            {/* Titlebar */}
            <div
              className="flex items-center px-[18px] py-[14px] gap-[7px]"
              style={{ borderBottom: "1px solid var(--border)", background: "var(--bg)" }}
            >
              <div className="w-[11px] h-[11px] rounded-full" style={{ background: "#ff5f57" }} />
              <div className="w-[11px] h-[11px] rounded-full" style={{ background: "#febc2e" }} />
              <div className="w-[11px] h-[11px] rounded-full" style={{ background: "#28c840" }} />
              <div
                className="mx-auto -translate-x-[18px] font-[family-name:var(--font-dm-mono)] text-[11px]"
                style={{ color: "var(--ink5)" }}
              >
                WageNow — Employer Dashboard
              </div>
            </div>

            <div className="p-[22px] pb-0">
              {/* Stats row */}
              <div className="grid grid-cols-3 gap-[10px] mb-[18px]">
                {[
                  { label: "Total accrued", val: "GHS 284K", delta: "↑ +12.4% MoM", green: false },
                  { label: "Withdrawn today", val: "GHS 14.2K", delta: "↑ 47 transactions", green: true },
                  { label: "Recovery rate", val: "100%", delta: "Auto deducted", green: false },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="rounded-[var(--r)] p-[14px] px-4"
                    style={{ background: "var(--bg)", border: "1px solid var(--border)" }}
                  >
                    <div className="text-[10px] font-medium tracking-[0.04em] uppercase mb-[5px]" style={{ color: "var(--ink4)" }}>
                      {s.label}
                    </div>
                    <div
                      className="font-[family-name:var(--font-fraunces)] text-[22px] font-light tracking-[-0.04em] leading-none"
                      style={{ color: s.green ? "var(--green2)" : "var(--ink)" }}
                    >
                      {s.val}
                    </div>
                    <div className="text-[10px] font-medium mt-1 font-[family-name:var(--font-dm-mono)]" style={{ color: "var(--green2)" }}>
                      {s.delta}
                    </div>
                  </div>
                ))}
              </div>

              {/* Chart */}
              <div
                className="rounded-[var(--r)] p-4 mb-[14px]"
                style={{ background: "var(--bg)", border: "1px solid var(--border)" }}
              >
                <div className="flex justify-between items-center mb-[14px]">
                  <span className="text-[12px] font-semibold" style={{ color: "var(--ink2)" }}>
                    Daily withdrawals — March 2026
                  </span>
                  <span
                    className="font-[family-name:var(--font-dm-mono)] text-[10px] rounded px-2 py-[2px]"
                    style={{ color: "var(--ink4)", background: "var(--bg2)" }}
                  >
                    MTD
                  </span>
                </div>
                <div className="flex items-end gap-[6px] h-16">
                  {chartHeights.map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-t-[3px] transition-colors duration-200"
                      style={{
                        height: `${h}%`,
                        background: i === 14 ? "var(--green3)" : "var(--bg3)",
                      }}
                    />
                  ))}
                </div>
                <div className="flex gap-[6px] mt-[6px]">
                  {chartLabels.map((l, i) => (
                    <div
                      key={i}
                      className="flex-1 text-center text-[8px] font-[family-name:var(--font-dm-mono)]"
                      style={{ color: "var(--ink5)" }}
                    >
                      {l}
                    </div>
                  ))}
                </div>
              </div>

              {/* Employee list */}
              <div>
                <div
                  className="grid gap-3 px-1 pb-2 text-[10px] font-semibold tracking-[0.04em] uppercase"
                  style={{ gridTemplateColumns: "1fr auto auto", color: "var(--ink4)", borderBottom: "1px solid var(--border)" }}
                >
                  <span>Employee</span>
                  <span>Amount</span>
                  <span>Status</span>
                </div>
                {[
                  { initials: "KA", name: "Kwame Asante", amount: "GHS 450", status: "Sent", sent: true },
                  { initials: "AB", name: "Abena Boateng", amount: "GHS 300", status: "Sent", sent: true },
                  { initials: "YO", name: "Yaw Owusu", amount: "GHS 600", status: "Processing", sent: false },
                ].map((emp) => (
                  <div
                    key={emp.name}
                    className="grid gap-3 items-center px-1 py-[10px]"
                    style={{ gridTemplateColumns: "1fr auto auto", borderBottom: "1px solid var(--border)" }}
                  >
                    <div className="flex items-center gap-[9px] text-[12px] font-medium" style={{ color: "var(--ink)" }}>
                      <div
                        className="w-6 h-6 rounded-[6px] flex items-center justify-center text-[9px] font-bold shrink-0"
                        style={{ background: "var(--bg2)", color: "var(--ink3)" }}
                      >
                        {emp.initials}
                      </div>
                      {emp.name}
                    </div>
                    <div className="font-[family-name:var(--font-dm-mono)] text-[11px] font-medium text-right" style={{ color: "var(--ink2)" }}>
                      {emp.amount}
                    </div>
                    <div
                      className="inline-flex items-center text-[10px] font-semibold px-2 py-[3px] rounded-full"
                      style={{
                        background: emp.sent ? "var(--green-bg)" : "var(--bg3)",
                        color: emp.sent ? "var(--green)" : "var(--ink3)",
                      }}
                    >
                      {emp.status}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
