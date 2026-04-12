"use client";

import { ScrollReveal } from "@/components/ui/scroll-reveal";

/* ═══════════════════════════════════════════════════════════
   TICKER MARQUEE
═══════════════════════════════════════════════════════════ */
const tickerItems = [
  { bold: "GHS 3", text: "flat fee per withdrawal" },
  { bold: "~90 seconds", text: "disbursement time" },
  { bold: "100%", text: "automatic payroll recovery" },
  { bold: "Zero", text: "credit risk for employers" },
  { bold: "1.5M+", text: "formal workers addressable" },
  { bold: "No app download", text: "required — WhatsApp access" },
  { bold: "Live in 5 days", text: "from CSV upload to first withdrawal" },
  { bold: "All networks", text: "supported" },
];

export function Ticker() {
  const items = [...tickerItems, ...tickerItems];
  return (
    <div className="overflow-hidden whitespace-nowrap relative py-3.5" style={{ background: "var(--ink)" }}>
      <div className="absolute top-0 bottom-0 left-0 w-20 z-2 pointer-events-none" style={{ background: "linear-gradient(90deg, var(--ink), transparent)" }} />
      <div className="absolute top-0 bottom-0 right-0 w-20 z-2 pointer-events-none" style={{ background: "linear-gradient(-90deg, var(--ink), transparent)" }} />
      <div className="inline-flex items-center" style={{ animation: "tick 28s linear infinite" }}>
        {items.map((item, i) => (
          <div key={i} className="inline-flex items-center gap-3.5 px-8 text-[12.5px] font-normal tracking-[0.01em]" style={{ color: "rgba(255,255,255,0.45)" }}>
            <strong className="font-medium" style={{ color: "rgba(255,255,255,0.85)" }}>{item.bold}</strong> {item.text}
            <div className="w-1 h-1 rounded-full shrink-0" style={{ background: "rgba(255,255,255,0.2)" }} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   LOGOS / PARTNERS
═══════════════════════════════════════════════════════════ */
const logos = [
  { icon: "📱", name: "Mobile Money" },
  { icon: "📱", name: "All Networks" },
  { icon: "🏦", name: "Bank Transfer" },
  { icon: "🏦", name: "Local Banks" },
  { icon: "💼", name: "CSV Import" },
  { icon: "💼", name: "Payroll Systems" },
];

export function Logos() {
  return (
    <section className="px-13 py-16 max-[1080px]:px-8 max-[1080px]:py-12" style={{ borderBottom: "1px solid var(--border)" }}>
      <div className="max-w-(--max) mx-auto flex items-center gap-16 max-[1080px]:flex-col max-[1080px]:gap-6 max-[1080px]:items-start">
        <div className="text-[11px] font-semibold tracking-[0.08em] uppercase whitespace-nowrap shrink-0 pr-16 max-[1080px]:pr-0 max-[1080px]:pb-4 max-[1080px]:border-b max-[1080px]:border-r-0" style={{ color: "var(--ink5)", borderRight: "1px solid var(--border)" }}>
          Integrated with
        </div>
        <div className="flex items-center gap-11 flex-wrap">
          {logos.map((l) => (
            <div key={l.name} className="flex items-center gap-2 text-[13px] font-medium opacity-65 hover:opacity-100 transition-opacity" style={{ color: "var(--ink4)" }}>
              <div className="w-7 h-7 rounded-[7px] flex items-center justify-center text-[13px]" style={{ background: "var(--bg3)" }}>{l.icon}</div>
              {l.name}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   PROBLEM SECTION
═══════════════════════════════════════════════════════════ */
const painCards = [
  { icon: "💸", title: "Predatory lending fills the gap", body: "Loan apps charge 10–40x what WageNow costs. Employees pay interest on money they've already earned." },
  { icon: "⏳", title: "HR is buried in advance requests", body: "Manual salary advance processing consumes 4–8 hours of payroll officer time per month. High error rate. No audit trail." },
  { icon: "📉", title: "Financial stress kills productivity", body: "Workers distracted by financial emergencies underperform. Studies link financial stress to 20%+ productivity loss." },
  { icon: "🔁", title: "Payroll cycle mismatch", body: "Monthly payroll was designed around bank constraints that no longer exist. Mobile money rails enable real-time settlement." },
];

export function Problem() {
  return (
    <section className="section-padding py-30 max-[1080px]:py-20 grid gap-25 max-[1080px]:grid-cols-1 max-[1080px]:gap-14" style={{ gridTemplateColumns: "380px 1fr" }}>
      <ScrollReveal>
        <div className="eyebrow mb-6"><span className="inline-block w-6 h-px" style={{ background: "var(--ink4)" }} />The problem</div>
        <h2 className="font-(family-name:--font-fraunces) font-light tracking-[-0.04em] leading-[1.08] mb-5" style={{ fontSize: "clamp(34px, 3.5vw, 50px)", color: "var(--ink)" }}>
          Workers are<br /><em className="italic" style={{ color: "var(--green2)" }}>financing</em> their<br />own salaries
        </h2>
        <p className="text-[15px] leading-[1.75] mb-8" style={{ color: "var(--ink3)" }}>
          The average formal worker waits 30 days to access income they earned on day one. In the gap, they turn to loan apps, loan sharks, or the HR manager — paying interest rates of 30–80% per annum on money that is already theirs.
        </p>
        <div className="rounded-r-(--r) p-5 px-6" style={{ borderLeft: "3px solid var(--green3)", background: "var(--green-bg)" }}>
          <p className="font-(family-name:--font-fraunces) text-[15px] font-light italic leading-[1.6] mb-2.5" style={{ color: "var(--ink2)" }}>
            &ldquo;Our nurses used to take payday loans every single month. Since WageNow, I haven&apos;t had one person come to me for a salary advance.&rdquo;
          </p>
          <div className="text-[12px] font-medium" style={{ color: "var(--ink4)" }}>HR Manager — Private Hospital</div>
        </div>
      </ScrollReveal>

      <ScrollReveal>
        <div className="grid grid-cols-2 max-[640px]:grid-cols-1 gap-0.5 overflow-hidden" style={{ border: "1px solid var(--border)", borderRadius: "var(--r-xl)" }}>
          {painCards.map((c) => (
            <div key={c.title} className="p-8 px-7 transition-colors hover:bg-(--bg)" style={{ background: "var(--white)" }}>
              <div className="w-10.5 h-10.5 rounded-(--r) flex items-center justify-center text-[18px] mb-4" style={{ background: "var(--bg2)" }}>{c.icon}</div>
              <h3 className="font-(family-name:--font-fraunces) text-[17px] font-normal tracking-[-0.02em] leading-[1.2] mb-2" style={{ color: "var(--ink)" }}>{c.title}</h3>
              <p className="text-[13px] leading-[1.65]" style={{ color: "var(--ink3)" }}>{c.body}</p>
            </div>
          ))}
        </div>
      </ScrollReveal>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   PRODUCT — HOW IT WORKS (dark section)
═══════════════════════════════════════════════════════════ */
const steps = [
  { n: "01", icon: "🏢", title: "Employer onboards", body: "Create your account, set your withdrawal cap — typically 50% of net salary — and configure payroll cycle dates. Takes under 20 minutes." },
  { n: "02", icon: "📋", title: "Payroll is connected", body: "Upload your CSV or connect via REST API. WageNow reads salary data and recalculates each employee's real-time earned balance every working day." },
  { n: "03", icon: "📲", title: "Employees activate", body: "Staff receive an SMS invite. They verify via phone OTP and see their live accrual balance in seconds — no app download, no bank account required." },
  { n: "04", icon: "⚡", title: "Withdraw. Repay. Repeat.", body: "Employee taps withdraw. Mobile wallet receives funds in ~90 seconds. On payday, deductions are automatic — zero admin, zero default risk, ever." },
];

export function Product() {
  return (
    <section id="product" className="py-30 max-[1080px]:py-20 px-13 max-[1080px]:px-8 relative overflow-hidden" style={{ background: "var(--ink)" }}>
      <div className="absolute -top-50 left-1/2 -translate-x-1/2 w-225 h-150 pointer-events-none" style={{ background: "radial-gradient(ellipse, rgba(26,148,89,0.1) 0%, transparent 70%)" }} />
      <div className="max-w-(--max) mx-auto relative z-1">
        <div className="flex justify-between items-end mb-18 max-[640px]:flex-col max-[640px]:gap-4 max-[640px]:items-start">
          <h2 className="font-(family-name:--font-fraunces) font-light tracking-[-0.04em] leading-[1.05] text-white" style={{ fontSize: "clamp(36px, 4vw, 58px)" }}>
            Live in <em className="italic" style={{ color: "var(--green3)" }}>5 days.</em><br />No IT project.
          </h2>
          <p className="max-w-75 text-[14px] leading-[1.7] text-right max-[640px]:text-left max-[640px]:max-w-full" style={{ color: "rgba(255,255,255,0.38)" }}>
            Upload a payroll CSV Monday. Employees are withdrawing by Friday. No API required to start.
          </p>
        </div>
        <div className="grid grid-cols-4 max-[1080px]:grid-cols-2 max-[640px]:grid-cols-1 gap-px overflow-hidden" style={{ background: "rgba(255,255,255,0.06)", borderRadius: "var(--r-xl)" }}>
          {steps.map((s, i) => (
            <div key={s.n} className="p-10 px-8 relative transition-colors" style={{ background: "rgba(255,255,255,0.03)" }}>
              <div className="flex items-center justify-between font-(family-name:--font-dm-mono) text-[11px] font-medium tracking-[0.06em] mb-10" style={{ color: "rgba(255,255,255,0.2)" }}>
                {s.n}
                {i < 3 && <span className="text-[14px]" style={{ color: "rgba(255,255,255,0.1)" }}>→</span>}
              </div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-[22px] mb-5" style={{ background: "rgba(255,255,255,0.06)" }}>{s.icon}</div>
              <h3 className="font-(family-name:--font-fraunces) text-[20px] font-light tracking-[-0.03em] text-white leading-[1.2] mb-2.5">{s.title}</h3>
              <p className="text-[13px] leading-[1.65]" style={{ color: "rgba(255,255,255,0.38)" }}>{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   FEATURES
═══════════════════════════════════════════════════════════ */
const featureCards = [
  { icon: "📱", title: "WhatsApp + PWA access", body: "Employees check balances and request withdrawals directly via WhatsApp or a lightweight web app. No install required." },
  { icon: "🔒", title: "Zero employer credit risk", body: "Employees can only access wages they have already accrued. Repayment is deducted automatically at payroll." },
  { icon: "📊", title: "Employer analytics dashboard", body: "Real-time view of all withdrawals, outstanding accruals, and per-employee activity. One-click deduction reports." },
  { icon: "🔗", title: "Payroll CSV or REST API", body: "Start with a monthly CSV upload — zero dev work. When ready, connect via REST API for live sync." },
  { icon: "🛡️", title: "OTP-secured verification", body: "Every employee activation and withdrawal is secured via SMS OTP. No passwords to forget. No email to verify." },
  { icon: "⚙️", title: "Configurable accrual rules", body: "Set withdrawal caps by department, seniority, or employment type. Handle probation and part-time out of the box." },
];

export function Features() {
  return (
    <section id="features" className="section-padding py-30 max-[1080px]:py-20">
      <div className="grid grid-cols-2 max-[1080px]:grid-cols-1 gap-20 max-[1080px]:gap-6 items-end mb-18">
        <div>
          <div className="eyebrow mb-5"><span className="inline-block w-6 h-px" style={{ background: "var(--ink4)" }} />Platform capabilities</div>
          <h2 className="font-(family-name:--font-fraunces) font-light tracking-[-0.04em] leading-[1.06]" style={{ fontSize: "clamp(34px, 3.8vw, 54px)", color: "var(--ink)" }}>
            Built for the<br /><em className="italic" style={{ color: "var(--green2)" }}>real</em> workforce
          </h2>
        </div>
        <p className="text-[15px] leading-[1.75] max-w-105" style={{ color: "var(--ink3)" }}>
          Designed around mobile money rails, low-bandwidth phones, WhatsApp, and the way payroll actually works — not Silicon Valley assumptions.
        </p>
      </div>

      {/* Hero feature card with phone mockup */}
      <ScrollReveal>
        <div className="grid grid-cols-2 max-[1080px]:grid-cols-1 gap-16 items-end overflow-hidden p-12 px-12 pb-0 max-[1080px]:p-9 max-[1080px]:pb-0 mb-0.5" style={{ background: "var(--white)", border: "1px solid var(--border)", borderRadius: "var(--r-xl) var(--r-xl) 0 0" }}>
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[10px] font-semibold tracking-[0.05em] uppercase mb-5" style={{ background: "var(--green-bg)", border: "1px solid rgba(10,92,52,0.15)", color: "var(--green)" }}>✦ Core feature</div>
            <h3 className="font-(family-name:--font-fraunces) text-[30px] font-light tracking-[-0.04em] leading-[1.1] mb-3.5" style={{ color: "var(--ink)" }}>Real-time wage accrual engine</h3>
            <p className="text-[14px] leading-[1.7] mb-7" style={{ color: "var(--ink3)" }}>Every employee&apos;s available balance recalculates daily based on working days elapsed, configured salary, and any leave data. The balance is always accurate — not estimated.</p>
            <div className="flex gap-7 pt-5" style={{ borderTop: "1px solid var(--border)" }}>
              {[{ val: "~90", unit: "s", label: "Disbursement time" }, { val: "100", unit: "%", label: "Recovery rate" }, { val: "GHS 3", unit: "", label: "Per withdrawal" }].map((m) => (
                <div key={m.label}>
                  <div className="font-(family-name:--font-fraunces) text-[28px] font-light tracking-[-0.04em] leading-none" style={{ color: "var(--ink)" }}>
                    <em style={{ color: "var(--green2)", fontStyle: "normal" }}>{m.val}</em>{m.unit}
                  </div>
                  <div className="text-[11px] font-medium mt-1" style={{ color: "var(--ink4)" }}>{m.label}</div>
                </div>
              ))}
            </div>
          </div>
          {/* Phone mockup */}
          <div className="flex justify-center max-[1080px]:hidden">
            <div className="w-55 rounded-[30px_30px_0_0] p-2.5 pb-0" style={{ background: "var(--ink)", boxShadow: "0 -8px 40px rgba(0,0,0,0.12)" }}>
              <div className="rounded-[22px_22px_0_0] overflow-hidden min-h-85" style={{ background: "var(--bg)" }}>
                <div className="w-16 h-5.5 mx-auto rounded-b-xl" style={{ background: "var(--ink)" }} />
                <div className="p-3.5 pb-0">
                  <div className="text-[9px] font-(family-name:--font-dm-mono) mb-0.5" style={{ color: "var(--ink4)" }}>THURSDAY · MARCH 27</div>
                  <div className="font-(family-name:--font-fraunces) text-[16px] font-light tracking-[-0.04em] mb-3" style={{ color: "var(--ink)" }}>Hello, Kofi 👋</div>
                  <div className="rounded-xl p-3.5 mb-2.5" style={{ background: "var(--ink)" }}>
                    <div className="text-[8px] font-medium tracking-[0.05em] uppercase mb-0.75" style={{ color: "rgba(255,255,255,0.4)" }}>Available to withdraw</div>
                    <div className="font-(family-name:--font-fraunces) text-[26px] font-light tracking-[-0.04em] leading-none text-white mb-2">GHS 1,240</div>
                    <div className="h-0.75 rounded-sm overflow-hidden mb-1" style={{ background: "rgba(255,255,255,0.1)" }}>
                      <div className="w-[62%] h-full" style={{ background: "var(--green3)" }} />
                    </div>
                    <div className="flex justify-between text-[8px] font-(family-name:--font-dm-mono)" style={{ color: "rgba(255,255,255,0.25)" }}>
                      <span>Day 19 of 31</span><span>62% accrued</span>
                    </div>
                  </div>
                  <button className="w-full rounded-lg py-2.25 text-[11px] font-semibold text-white mb-2.5 font-(family-name:--font-dm-sans)" style={{ background: "var(--green3)" }}>
                    Withdraw now →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* Feature grid */}
      <div className="grid grid-cols-3 max-[1080px]:grid-cols-2 max-[640px]:grid-cols-1 gap-0.5">
        {featureCards.map((f, i) => (
          <ScrollReveal key={f.title}>
            <div className="p-8 px-7 transition-colors hover:bg-(--bg)" style={{ background: "var(--white)", border: "1px solid var(--border)", borderRadius: i === 0 ? "0 0 0 var(--r-xl)" : i === featureCards.length - 1 ? "0 0 var(--r-xl) 0" : undefined }}>
              <div className="w-10 h-10 rounded-[9px] flex items-center justify-center text-[17px] mb-4" style={{ background: "var(--bg2)" }}>{f.icon}</div>
              <h3 className="font-(family-name:--font-fraunces) text-[17px] font-normal tracking-[-0.02em] leading-[1.2] mb-2" style={{ color: "var(--ink)" }}>{f.title}</h3>
              <p className="text-[13px] leading-[1.65]" style={{ color: "var(--ink3)" }}>{f.body}</p>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   TRUST / SECURITY
═══════════════════════════════════════════════════════════ */
const trustItems = [
  { icon: "🏛️", title: "Bank-grade data security", body: "All payroll data is encrypted at rest and in transit using AES-256 and TLS 1.3. We never store raw mobile wallet credentials." },
  { icon: "📋", title: "Full audit trail", body: "Every withdrawal request, disbursement, and deduction is time-stamped and logged immutably. Auditor-ready records." },
  { icon: "🏛️", title: "Regulatory-compliant infrastructure", body: "Built to comply with local payment systems guidelines and data protection requirements in every market we serve." },
];

export function Trust() {
  return (
    <section className="section-padding pb-30 max-[1080px]:pb-20">
      <ScrollReveal>
        <div className="grid grid-cols-3 max-[1080px]:grid-cols-1 gap-12 p-14 px-16 max-[1080px]:p-10" style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "var(--r-2xl)" }}>
          {trustItems.map((t) => (
            <div key={t.title}>
              <div className="w-11 h-11 rounded-[11px] flex items-center justify-center text-[20px] mb-4" style={{ background: "var(--white)", border: "1px solid var(--border)" }}>{t.icon}</div>
              <h3 className="font-(family-name:--font-fraunces) text-[18px] font-normal tracking-[-0.02em] mb-2" style={{ color: "var(--ink)" }}>{t.title}</h3>
              <p className="text-[13px] leading-[1.65]" style={{ color: "var(--ink3)" }}>{t.body}</p>
            </div>
          ))}
        </div>
      </ScrollReveal>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   NUMBERS / STATS (dark section)
═══════════════════════════════════════════════════════════ */
const stats = [
  { num: "1.5", suffix: "M+", label: "Formal workers addressable", note: "Growing market · No EWA competitor" },
  { num: "GHS 3", suffix: "", label: "Flat fee per withdrawal", note: "vs GHS 60–200+ per payday loan" },
  { num: "~90", suffix: "s", label: "Median disbursement time", note: "vs 14-day manual advance cycle" },
  { num: "100", suffix: "%", label: "Payroll deduction recovery", note: "Zero credit risk — earned wages" },
];

export function Numbers() {
  return (
    <section className="py-24 max-[1080px]:py-20 px-13 max-[1080px]:px-8 relative overflow-hidden" style={{ background: "var(--ink)" }}>
      <div className="max-w-(--max) mx-auto relative z-1">
        <div className="flex justify-between items-end mb-16 max-[640px]:flex-col max-[640px]:gap-4 max-[640px]:items-start">
          <h2 className="font-(family-name:--font-fraunces) font-light tracking-[-0.04em] leading-[1.08] text-white" style={{ fontSize: "clamp(32px, 3.5vw, 48px)" }}>
            The numbers<br /><em className="italic" style={{ color: "var(--green3)" }}>speak plainly.</em>
          </h2>
          <p className="max-w-65 text-[13px] text-right max-[640px]:text-left leading-[1.6]" style={{ color: "rgba(255,255,255,0.3)" }}>
            Market data from public financial reports and industry research.
          </p>
        </div>
        <div className="grid grid-cols-4 max-[1080px]:grid-cols-2 overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.06)", borderRadius: "var(--r-xl)" }}>
          {stats.map((s, i) => (
            <div key={s.label} className="p-10 px-9 transition-colors hover:bg-[rgba(255,255,255,0.03)]" style={{ borderRight: i < 3 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
              <div className="font-(family-name:--font-fraunces) font-extralight tracking-[-0.05em] leading-none text-white mb-3" style={{ fontSize: "clamp(42px, 4.5vw, 64px)" }}>
                <em style={{ color: "var(--green3)", fontStyle: "normal" }}>{s.num}</em>{s.suffix}
              </div>
              <div className="text-[14px] font-medium mb-1.5" style={{ color: "rgba(255,255,255,0.5)" }}>{s.label}</div>
              <div className="text-[11px] leading-normal font-(family-name:--font-dm-mono)" style={{ color: "rgba(255,255,255,0.22)" }}>{s.note}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   COMPARISON TABLE
═══════════════════════════════════════════════════════════ */
const compareRows = [
  { label: "Cost to employee", wn: "GHS 3 flat", loan: { text: "GHS 60–200+ interest", cls: "bad" }, manual: { text: "Free", cls: "good" }, cc: { text: "30–40% APR", cls: "bad" } },
  { label: "Speed of access", wn: "~90 seconds", loan: { text: "Minutes–hours", cls: "mid" }, manual: { text: "Days–weeks", cls: "bad" }, cc: { text: "Instant (if approved)", cls: "mid" } },
  { label: "Credit check required", wn: "None", loan: { text: "Yes", cls: "bad" }, manual: { text: "None", cls: "good" }, cc: { text: "Yes", cls: "bad" } },
  { label: "Default risk to employer", wn: "Zero", loan: { text: "Zero", cls: "good" }, manual: { text: "High", cls: "bad" }, cc: { text: "Zero", cls: "good" } },
  { label: "HR admin burden", wn: "Fully automated", loan: { text: "None", cls: "good" }, manual: { text: "Very high", cls: "bad" }, cc: { text: "None", cls: "good" } },
  { label: "Works without bank account", wn: "Yes — mobile wallet", loan: { text: "Partial", cls: "mid" }, manual: { text: "No", cls: "bad" }, cc: { text: "No", cls: "bad" } },
];
const clsMap: Record<string, string> = { bad: "text-[#b83232]", mid: "text-[var(--gold)]", good: "text-[var(--green)]" };

export function Compare() {
  return (
    <section className="section-padding py-30 max-[1080px]:py-20">
      <div className="grid gap-20 max-[1080px]:grid-cols-1 max-[1080px]:gap-4 items-end mb-14" style={{ gridTemplateColumns: "1fr 360px" }}>
        <div>
          <div className="eyebrow mb-5"><span className="inline-block w-6 h-px" style={{ background: "var(--ink4)" }} />Competitive landscape</div>
          <h2 className="font-(family-name:--font-fraunces) font-light tracking-[-0.04em] leading-[1.06]" style={{ fontSize: "clamp(34px, 3.8vw, 52px)", color: "var(--ink)" }}>
            WageNow vs<br /><em className="italic" style={{ color: "var(--green2)" }}>the alternatives</em>
          </h2>
        </div>
        <p className="text-[14px] leading-[1.7] text-right max-[1080px]:text-left" style={{ color: "var(--ink3)" }}>Your employees don&apos;t need debt. They need access to what they&apos;ve already earned.</p>
      </div>
      <ScrollReveal>
        <div className="overflow-x-auto" style={{ border: "1px solid var(--border)", borderRadius: "var(--r-xl)" }}>
          <div className="grid min-w-175" style={{ gridTemplateColumns: "2fr 1.4fr 1fr 1fr 1fr", background: "var(--bg2)", borderBottom: "1px solid var(--border)" }}>
            {["Criteria", "WageNow (EWA)", "Loan Apps", "Manual Advance", "Credit Card"].map((h, i) => (
              <div key={h} className="p-3.5 px-5 text-[11px] font-bold tracking-[0.05em] uppercase" style={{ color: i === 1 ? "rgba(255,255,255,0.6)" : "var(--ink4)", background: i === 1 ? "var(--ink)" : undefined }}>{h}</div>
            ))}
          </div>
          {compareRows.map((r) => (
            <div key={r.label} className="grid min-w-175 hover:bg-(--bg)" style={{ gridTemplateColumns: "2fr 1.4fr 1fr 1fr 1fr", borderBottom: "1px solid var(--border)" }}>
              <div className="p-3.5 px-5 text-[13px] font-medium flex items-center" style={{ color: "var(--ink)" }}>{r.label}</div>
              <div className="p-3.5 px-5 text-[12px] font-semibold font-(family-name:--font-dm-mono) flex items-center" style={{ color: "var(--green)", background: "rgba(26,148,89,0.04)" }}>{r.wn}</div>
              <div className={`p-3.5 px-5 text-[12px] font-(family-name:--font-dm-mono) flex items-center ${clsMap[r.loan.cls]}`}>{r.loan.text}</div>
              <div className={`p-3.5 px-5 text-[12px] font-(family-name:--font-dm-mono) flex items-center ${clsMap[r.manual.cls]}`}>{r.manual.text}</div>
              <div className={`p-3.5 px-5 text-[12px] font-(family-name:--font-dm-mono) flex items-center ${clsMap[r.cc.cls]}`}>{r.cc.text}</div>
            </div>
          ))}
        </div>
      </ScrollReveal>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   TESTIMONIALS
═══════════════════════════════════════════════════════════ */
const testimonials = [
  { quote: "Our nurses used to take payday loans every single month. Since WageNow, I haven't had one person come to me for a salary advance.", name: "Emmanuel A.", role: "HR Manager, Private Hospital", initials: "EA" },
  { quote: "The deployment was shockingly fast. We uploaded our payroll CSV on Monday, and employees were making withdrawals by Friday. Absolutely zero IT involvement.", name: "Abena G.", role: "CFO, Distribution Company", initials: "AG" },
  { quote: "We were skeptical — anything near payroll feels risky. But the automatic deduction is bulletproof. Not once have we had a recovery issue.", name: "Kwame O.", role: "Finance Director, NGO", initials: "KO" },
];

export function Testimonials() {
  return (
    <section id="testi" className="pb-30 max-[1080px]:pb-20 px-13 max-[1080px]:px-8" style={{ background: "var(--bg2)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
      <div className="max-w-(--max) mx-auto pt-30 max-[1080px]:pt-20">
        <div className="grid grid-cols-2 max-[1080px]:grid-cols-1 gap-20 max-[1080px]:gap-4 items-end mb-16">
          <div>
            <div className="eyebrow mb-5"><span className="inline-block w-6 h-px" style={{ background: "var(--ink4)" }} />Customer stories</div>
            <h2 className="font-(family-name:--font-fraunces) font-light tracking-[-0.04em] leading-[1.06]" style={{ fontSize: "clamp(34px, 3.8vw, 52px)", color: "var(--ink)" }}>
              Heard from the<br /><em className="italic" style={{ color: "var(--green2)" }}>people using it</em>
            </h2>
          </div>
          <p className="text-[15px] leading-[1.7]" style={{ color: "var(--ink3)" }}>From private hospitals to logistics firms — the feedback is consistent: WageNow removes a problem that felt unsolvable.</p>
        </div>
        <div className="grid grid-cols-3 max-[1080px]:grid-cols-1 gap-5">
          {testimonials.map((t) => (
            <ScrollReveal key={t.name}>
              <div className="flex flex-col p-9 rounded-(--r-xl) transition-all hover:shadow-lg hover:-translate-y-0.5" style={{ background: "var(--white)", border: "1px solid var(--border)" }}>
                <div className="flex gap-0.75 mb-5">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-3.5 h-3.5" style={{ background: "var(--gold)", clipPath: "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)" }} />
                  ))}
                </div>
                <p className="font-(family-name:--font-fraunces) text-[15px] font-light italic leading-[1.7] flex-1 mb-6" style={{ color: "var(--ink2)" }}>&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-3 pt-5" style={{ borderTop: "1px solid var(--border)" }}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-[12px] font-bold shrink-0" style={{ background: "var(--bg2)", border: "1px solid var(--border)", color: "var(--ink2)" }}>{t.initials}</div>
                  <div>
                    <div className="text-[13px] font-semibold" style={{ color: "var(--ink)" }}>{t.name}</div>
                    <div className="text-[11px] mt-px" style={{ color: "var(--ink4)" }}>{t.role}</div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   PRICING
═══════════════════════════════════════════════════════════ */
const plans = [
  { tier: "Starter", tierCls: "t-starter", name: "Starter", price: "500", cadence: "per month · up to 50 employees", features: ["WageNow EWA for all employees", "WhatsApp + PWA employee access", "Payroll CSV upload", "Employer analytics dashboard", "Monthly deduction report export", "Email & chat support"], btnCls: "pb-default", featured: false },
  { tier: "Most popular", tierCls: "t-growth", name: "Growth", price: "2,000", cadence: "per month · up to 250 employees", features: ["Everything in Starter", "REST API payroll integration", "Priority disbursement queue", "Configurable accrual rules per dept", "Advanced workforce analytics", "Dedicated onboarding support"], btnCls: "pb-featured", featured: true },
  { tier: "Enterprise", tierCls: "t-ent", name: "Enterprise", price: "Custom", cadence: "250+ employees · custom contract", features: ["Everything in Growth", "Dedicated account manager", "Custom SLA + 24/7 phone support", "Custom accrual config per role & grade", "SSO & HRIS integration", "Quarterly business reviews"], btnCls: "pb-ent", featured: false },
];

export function Pricing() {
  return (
    <section id="pricing" className="section-padding py-30 max-[1080px]:py-20">
      <div className="text-center mb-16">
        <div className="eyebrow justify-center mb-4"><span className="inline-block w-6 h-px" style={{ background: "var(--ink4)" }} />Pricing<span className="inline-block w-6 h-px" style={{ background: "var(--ink4)" }} /></div>
        <h2 className="font-(family-name:--font-fraunces) font-light tracking-[-0.04em] leading-[1.05] mb-3.5" style={{ fontSize: "clamp(36px, 4vw, 56px)", color: "var(--ink)" }}>
          Simple, <em className="italic" style={{ color: "var(--green2)" }}>honest</em> pricing
        </h2>
        <p className="text-[16px] leading-[1.7] max-w-130 mx-auto" style={{ color: "var(--ink3)" }}>
          No setup fees. No percentage cuts. Employees pay a flat fee per withdrawal — the lowest cost financial access available.
        </p>
      </div>
      <div className="grid grid-cols-3 max-[1080px]:grid-cols-1 gap-5">
        {plans.map((p) => (
          <ScrollReveal key={p.name}>
            <div className="flex flex-col rounded-(--r-xl) p-9 relative transition-shadow hover:shadow-lg" style={{ background: p.featured ? "var(--ink)" : "var(--white)", border: p.featured ? "1.5px solid var(--ink)" : "1.5px solid var(--border)", boxShadow: p.featured ? "0 20px 64px rgba(24,22,15,0.18)" : undefined }}>
              <div className="text-[10px] font-bold tracking-widest uppercase px-2.5 py-0.75 rounded-full w-fit mb-6" style={{
                background: p.tierCls === "t-starter" ? "var(--bg2)" : p.tierCls === "t-growth" ? "rgba(255,255,255,0.1)" : "var(--gold-bg)",
                color: p.tierCls === "t-starter" ? "var(--ink4)" : p.tierCls === "t-growth" ? "rgba(255,255,255,0.55)" : "var(--gold)",
              }}>{p.tier}</div>
              <div className="font-(family-name:--font-fraunces) text-[24px] font-light tracking-[-0.04em] mb-1.5" style={{ color: p.featured ? "#fff" : "var(--ink)" }}>{p.name}</div>
              <div className="font-(family-name:--font-fraunces) font-extralight tracking-[-0.05em] leading-none mb-1" style={{ fontSize: p.price === "Custom" ? 38 : 52, color: p.featured ? "#fff" : "var(--ink)" }}>
                {p.price !== "Custom" && <sup className="text-[16px] align-super tracking-normal mr-1">GHS</sup>}{p.price}
              </div>
              <div className="text-[12px] font-(family-name:--font-dm-mono) mb-7" style={{ color: p.featured ? "rgba(255,255,255,0.35)" : "var(--ink4)" }}>{p.cadence}</div>
              <div className="h-px mb-6" style={{ background: p.featured ? "rgba(255,255,255,0.08)" : "var(--border)" }} />
              <div className="flex-1 flex flex-col gap-2.75 mb-8">
                {p.features.map((f) => (
                  <div key={f} className="flex items-start gap-2.5 text-[13px] leading-[1.4]" style={{ color: p.featured ? "rgba(255,255,255,0.65)" : "var(--ink2)" }}>
                    <div className="w-4 h-4 rounded flex items-center justify-center text-[9px] shrink-0 mt-px" style={{ background: p.featured ? "rgba(255,255,255,0.1)" : "var(--green-bg)", color: p.featured ? "rgba(255,255,255,0.6)" : "var(--green)" }}>✓</div>
                    {f}
                  </div>
                ))}
              </div>
              <button className="w-full py-3 rounded-[9px] text-[14px] font-medium cursor-pointer font-(family-name:--font-dm-sans) transition-all" style={{
                background: p.featured ? "#fff" : p.btnCls === "pb-ent" ? "transparent" : "var(--bg2)",
                color: "var(--ink)",
                border: p.featured ? "none" : p.btnCls === "pb-ent" ? "1.5px solid var(--border2)" : "1.5px solid var(--border)",
                letterSpacing: "-0.01em",
              }}>
                {p.price === "Custom" ? "Talk to sales →" : "Start free trial →"}
              </button>
            </div>
          </ScrollReveal>
        ))}
      </div>
      <p className="text-center mt-8 text-[13px] leading-[1.6]" style={{ color: "var(--ink4)" }}>
        <strong className="font-medium" style={{ color: "var(--ink3)" }}>Employees pay a flat fee per withdrawal.</strong> No hidden fees. No interest. No percentage of salary. Ever.
      </p>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   FINAL CTA
═══════════════════════════════════════════════════════════ */
export function CTA() {
  return (
    <section id="contact" className="px-13 max-[1080px]:px-8 pb-30 max-[1080px]:pb-20">
      <div className="max-w-(--max) mx-auto">
        <div className="grid grid-cols-[1fr_340px] max-[1080px]:grid-cols-1 gap-20 max-[1080px]:gap-10 items-center p-24 px-20 max-[1080px]:p-14 max-[1080px]:px-10 relative overflow-hidden" style={{ background: "var(--ink)", borderRadius: "var(--r-2xl)" }}>
          <div className="absolute top-[-150px] left-[-100px] w-[700px] h-150 pointer-events-none" style={{ background: "radial-gradient(ellipse, rgba(26,148,89,0.12) 0%, transparent 65%)" }} />
          <div className="absolute bottom-[-100px] right-[-80px] w-[500px] h-[400px] pointer-events-none" style={{ background: "radial-gradient(ellipse, rgba(26,148,89,0.06) 0%, transparent 65%)" }} />
          <div className="relative z-1">
            <div className="flex items-center gap-2.5 text-[11px] font-semibold tracking-widest uppercase mb-5" style={{ color: "rgba(255,255,255,0.3)" }}>
              <span className="inline-block w-5 h-px" style={{ background: "rgba(255,255,255,0.2)" }} />Get started today
            </div>
            <h2 className="font-(family-name:--font-fraunces) font-light tracking-[-0.04em] leading-[1.03] text-white mb-4.5" style={{ fontSize: "clamp(36px, 4.2vw, 60px)" }}>
              Your employees have<br /><em className="italic" style={{ color: "var(--green3)" }}>already earned</em><br />this money.
            </h2>
            <p className="text-[15px] leading-[1.7] max-w-120" style={{ color: "rgba(255,255,255,0.4)" }}>
              Give them access to it — without loans, interest, or any HR burden on your team. WageNow deploys in 5 days, costs GHS 500/month to start, and pays for itself the moment your first employee skips a loan app.
            </p>
          </div>
          <div className="relative z-1 rounded-(--r-xl) p-9" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="text-[12px] font-semibold tracking-[0.06em] uppercase mb-5" style={{ color: "rgba(255,255,255,0.3)" }}>Request early access</div>
            <div className="flex flex-col gap-3">
              {["Your name", "Company name", "Work email", "Number of employees"].map((ph) => (
                <input
                  key={ph}
                  type={ph === "Work email" ? "email" : "text"}
                  placeholder={ph}
                  className="w-full px-4 py-[11px] rounded-lg text-[14px] text-white outline-none transition-all focus:border-[rgba(26,148,89,0.5)] focus:bg-[rgba(255,255,255,0.09)] font-(family-name:--font-dm-sans)"
                  style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}
                />
              ))}
              <button className="w-full py-[13px] rounded-lg text-[14px] font-semibold cursor-pointer transition-opacity hover:opacity-90 font-(family-name:--font-dm-sans)" style={{ background: "#fff", color: "var(--ink)", border: "none", letterSpacing: "-0.01em" }}>
                Request access →
              </button>
              <p className="text-[11px] text-center leading-normal" style={{ color: "rgba(255,255,255,0.22)" }}>
                We&apos;ll reach out within one business day. No spam, ever.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
