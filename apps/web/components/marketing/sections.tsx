"use client";

import type { ReactNode } from "react";
import {
  Coins,
  Hourglass,
  RefreshCw,
  Building2,
  FileSpreadsheet,
  Zap,
  MessageCircle,
  ShieldCheck,
  BarChart3,
  Plug,
  Settings2,
  Lock,
  FileCheck2,
  Scale,
  Check,
  Sparkles,
  Calculator,
  CalendarCheck,
  Wallet,
} from "lucide-react";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

const ICON_STROKE = 1.5;

/* ═══════════════════════════════════════════════════════════
   TICKER MARQUEE
═══════════════════════════════════════════════════════════ */
const tickerItems = [
  { bold: "Payroll + HR + EWA", text: "in one place" },
  { bold: "AI assistant", text: "answers payroll & HR questions" },
  { bold: "SSNIT & PAYE", text: "computed automatically" },
  { bold: "~90 seconds", text: "EWA disbursement to MoMo" },
  { bold: "100%", text: "automatic payroll recovery" },
  { bold: "MTN · Vodafone · AirtelTigo", text: "all supported" },
  { bold: "Live in 5 days", text: "from CSV to first payroll run" },
  { bold: "Built in Ghana", text: "for African employers" },
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
   LOGOS / PARTNERS — wordmarks for Ghanaian payment rails & banks
═══════════════════════════════════════════════════════════ */
const partnerLogos: { name: string; sub?: string }[] = [
  { name: "MTN", sub: "MoMo" },
  { name: "Vodafone", sub: "Cash" },
  { name: "AirtelTigo", sub: "Money" },
  { name: "GCB", sub: "Bank" },
  { name: "Ecobank" },
  { name: "Stanbic" },
  { name: "ABSA" },
];

export function Logos() {
  return (
    <section
      className="px-13 py-14 max-[1080px]:px-8 max-[1080px]:py-12"
      style={{ borderBottom: "1px solid var(--border)" }}
    >
      <div className="max-w-(--max) mx-auto flex items-center gap-14 max-[1080px]:flex-col max-[1080px]:gap-6 max-[1080px]:items-start">
        <div
          className="text-[11px] font-semibold tracking-[0.1em] uppercase whitespace-nowrap shrink-0 pr-14 max-[1080px]:pr-0 max-[1080px]:pb-4 max-[1080px]:border-b max-[1080px]:border-r-0"
          style={{ color: "var(--ink5)", borderRight: "1px solid var(--border)" }}
        >
          Connects to
        </div>
        <div className="flex items-center gap-x-12 gap-y-6 flex-wrap">
          {partnerLogos.map((l) => (
            <div
              key={l.name}
              className="flex items-baseline gap-1.5 transition-opacity hover:opacity-100"
              style={{ opacity: 0.55 }}
            >
              <span
                className="font-(family-name:--font-fraunces) font-normal tracking-[-0.03em] text-[20px] leading-none"
                style={{ color: "var(--ink2)" }}
              >
                {l.name}
              </span>
              {l.sub && (
                <span
                  className="text-[11px] font-(family-name:--font-dm-mono) tracking-[0.02em]"
                  style={{ color: "var(--ink4)" }}
                >
                  {l.sub}
                </span>
              )}
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
const painCards: { icon: ReactNode; title: string; body: string }[] = [
  { icon: <FileSpreadsheet strokeWidth={ICON_STROKE} className="w-5 h-5" />, title: "Payroll runs on spreadsheets", body: "Most Ghanaian SMEs still calculate SSNIT, PAYE, and net pay by hand each month. One typo and the whole run is wrong." },
  { icon: <Hourglass strokeWidth={ICON_STROKE} className="w-5 h-5" />, title: "HR records are scattered", body: "Contracts in WhatsApp. Leave in a notebook. Salary changes in someone's email. Nothing connected, nothing auditable." },
  { icon: <Coins strokeWidth={ICON_STROKE} className="w-5 h-5" />, title: "Workers wait 30 days for their own pay", body: "Employees turn to loan apps charging 30–80% APR on money they've already earned. HR officers field a flood of advance requests." },
  { icon: <RefreshCw strokeWidth={ICON_STROKE} className="w-5 h-5" />, title: "Foreign HR tools don't fit", body: "Built for US W-2s and UK PAYE — not SSNIT, GRA bands, MoMo payouts, or the way Ghanaian businesses actually run." },
];

export function Problem() {
  return (
    <section className="section-padding py-30 max-[1080px]:py-20 grid gap-25 max-[1080px]:grid-cols-1 max-[1080px]:gap-14" style={{ gridTemplateColumns: "380px 1fr" }}>
      <ScrollReveal>
        <div className="eyebrow mb-6"><span className="inline-block w-6 h-px" style={{ background: "var(--ink4)" }} />The problem</div>
        <h2 className="font-(family-name:--font-fraunces) font-light tracking-[-0.04em] leading-[1.08] mb-5" style={{ fontSize: "clamp(34px, 3.5vw, 50px)", color: "var(--ink)" }}>
          Running payroll<br />in Ghana is <em className="italic" style={{ color: "var(--green2)" }}>chaos</em>
        </h2>
        <p className="text-[15px] leading-[1.75] mb-8" style={{ color: "var(--ink3)" }}>
          Spreadsheets, scattered records, manual SSNIT and PAYE math, and a constant queue of advance requests. Foreign HR tools don&apos;t understand Ghana. Local options are paper-based. Workers, HR, and finance all suffer.
        </p>
        <div className="rounded-r-(--r) p-5 px-6" style={{ borderLeft: "3px solid var(--green3)", background: "var(--green-bg)" }}>
          <p className="font-(family-name:--font-fraunces) text-[15px] font-light italic leading-[1.6] mb-2.5" style={{ color: "var(--ink2)" }}>
            &ldquo;Payroll used to take three days every month. With WageNow, I run it in a morning — and the AI assistant answers questions I would have called my accountant for.&rdquo;
          </p>
          <div className="text-[12px] font-medium" style={{ color: "var(--ink4)" }}>HR Manager — Private Hospital</div>
        </div>
      </ScrollReveal>

      <ScrollReveal>
        <div className="grid grid-cols-2 max-[640px]:grid-cols-1 gap-0.5 overflow-hidden" style={{ border: "1px solid var(--border)", borderRadius: "var(--r-xl)" }}>
          {painCards.map((c) => (
            <div key={c.title} className="p-8 px-7 transition-colors hover:bg-(--bg)" style={{ background: "var(--white)" }}>
              <div className="w-10 h-10 rounded-(--r) flex items-center justify-center mb-4" style={{ background: "var(--bg2)", color: "var(--ink2)" }}>{c.icon}</div>
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
const steps: { n: string; icon: ReactNode; title: string; body: string }[] = [
  { n: "01", icon: <Building2 strokeWidth={ICON_STROKE} className="w-[22px] h-[22px]" />, title: "Set up your company", body: "Add your company info, Ghana TIN, payroll cycle, and statutory settings (SSNIT, PAYE bands). Walk-through onboarding — under 20 minutes." },
  { n: "02", icon: <FileSpreadsheet strokeWidth={ICON_STROKE} className="w-[22px] h-[22px]" />, title: "Upload employees & salaries", body: "Drop a CSV of your team — names, salaries, departments, MoMo numbers. Payroll, HR records, and EWA accrual all populate at once." },
  { n: "03", icon: <Sparkles strokeWidth={ICON_STROKE} className="w-[22px] h-[22px]" />, title: "Ask the AI assistant", body: "“Who qualifies for an advance?” “Prepare the SSNIT summary.” “Why did payroll go up this month?” It answers from your real data — no spreadsheets." },
  { n: "04", icon: <Zap strokeWidth={ICON_STROKE} className="w-[22px] h-[22px]" />, title: "Run payroll. Pay everyone.", body: "Approve the run, and SSNIT, PAYE, and net pay are calculated. Salaries go out via MoMo or bank. Employees can pull earned wages early — auto-deducted at payday." },
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
            Upload a payroll CSV Monday. Run real payroll Friday. The AI assistant is live from day one.
          </p>
        </div>
        <div className="grid grid-cols-4 max-[1080px]:grid-cols-2 max-[640px]:grid-cols-1 gap-px overflow-hidden" style={{ background: "rgba(255,255,255,0.06)", borderRadius: "var(--r-xl)" }}>
          {steps.map((s, i) => (
            <div key={s.n} className="p-10 px-8 relative transition-colors" style={{ background: "rgba(255,255,255,0.03)" }}>
              <div className="flex items-center justify-between font-(family-name:--font-dm-mono) text-[11px] font-medium tracking-[0.06em] mb-10" style={{ color: "rgba(255,255,255,0.2)" }}>
                {s.n}
                {i < 3 && <span className="text-[14px]" style={{ color: "rgba(255,255,255,0.1)" }}>→</span>}
              </div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.85)" }}>{s.icon}</div>
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
const featureCards: { icon: ReactNode; title: string; body: string }[] = [
  { icon: <Calculator strokeWidth={ICON_STROKE} className="w-[18px] h-[18px]" />, title: "Payroll engine built for Ghana", body: "SSNIT (5.5% / 13%), PAYE bands, allowances, and net pay computed automatically. Generate payslips in one click. Bank or MoMo payout." },
  { icon: <CalendarCheck strokeWidth={ICON_STROKE} className="w-[18px] h-[18px]" />, title: "HR records that stay in sync", body: "Departments, contracts, leave, and salary changes in one place. Every change is audit-logged. No more contracts in WhatsApp." },
  { icon: <Wallet strokeWidth={ICON_STROKE} className="w-[18px] h-[18px]" />, title: "Earned wage access (EWA)", body: "Employees pull earned wages before payday — flat GHS 3 fee, ~90s to MoMo, auto-deducted from the next payroll run." },
  { icon: <ShieldCheck strokeWidth={ICON_STROKE} className="w-[18px] h-[18px]" />, title: "Compliance & reporting", body: "SSNIT and PAYE summaries ready for filing. Statutory leave tracked. Full audit trail for the GRA, your auditor, or the board." },
  { icon: <MessageCircle strokeWidth={ICON_STROKE} className="w-[18px] h-[18px]" />, title: "Employees on WhatsApp + PWA", body: "Workers check balances, request advances, and view payslips via WhatsApp or a lightweight web app. No install required." },
  { icon: <Plug strokeWidth={ICON_STROKE} className="w-[18px] h-[18px]" />, title: "CSV or REST API integration", body: "Start with a CSV upload. Plug into your existing HRIS or accounting via REST API when you're ready. No vendor lock-in." },
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
            <div className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[10px] font-semibold tracking-[0.05em] uppercase mb-5" style={{ background: "var(--green-bg)", border: "1px solid rgba(10,92,52,0.15)", color: "var(--green)" }}>✦ AI assistant</div>
            <h3 className="font-(family-name:--font-fraunces) text-[30px] font-light tracking-[-0.04em] leading-[1.1] mb-3.5" style={{ color: "var(--ink)" }}>Ask anything about your workforce</h3>
            <p className="text-[14px] leading-[1.7] mb-7" style={{ color: "var(--ink3)" }}>“Generate this month&apos;s payslips.” “Who qualifies for an advance?” “Prepare the SSNIT summary.” “Why did payroll go up?” The assistant answers from your real data — no spreadsheets, no exports.</p>
            <div className="flex gap-7 pt-5 flex-wrap" style={{ borderTop: "1px solid var(--border)" }}>
              {[{ val: "Payroll", unit: "", label: "Run, preview, explain" }, { val: "HR", unit: "", label: "Records, leave, contracts" }, { val: "Compliance", unit: "", label: "SSNIT · PAYE · GRA" }].map((m) => (
                <div key={m.label}>
                  <div className="font-(family-name:--font-fraunces) text-[22px] font-light tracking-[-0.04em] leading-none" style={{ color: "var(--ink)" }}>
                    <em style={{ color: "var(--green2)", fontStyle: "normal" }}>{m.val}</em>{m.unit}
                  </div>
                  <div className="text-[11px] font-medium mt-1" style={{ color: "var(--ink4)" }}>{m.label}</div>
                </div>
              ))}
            </div>
          </div>
          {/* AI assistant chat mockup */}
          <div className="flex justify-center max-[1080px]:hidden">
            <div className="w-72 rounded-[var(--r-xl)] overflow-hidden" style={{ background: "var(--white)", border: "1px solid var(--border)", boxShadow: "0 4px 24px rgba(0,0,0,0.06), 0 16px 48px rgba(0,0,0,0.08)" }}>
              <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: "1px solid var(--border)", background: "var(--bg)" }}>
                <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: "var(--green-bg)", color: "var(--green2)" }}>
                  <Sparkles strokeWidth={1.7} className="w-[14px] h-[14px]" />
                </div>
                <div className="text-[12px] font-semibold" style={{ color: "var(--ink)" }}>WageNow Assistant</div>
                <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: "var(--green2)" }} />
              </div>
              <div className="p-4 space-y-3 min-h-72">
                <div className="rounded-lg px-3 py-2 text-[12px] leading-[1.5] ml-auto max-w-[85%]" style={{ background: "var(--ink)", color: "rgba(255,255,255,0.92)" }}>
                  Who qualifies for an advance right now?
                </div>
                <div className="rounded-lg px-3 py-2 text-[12px] leading-[1.55] max-w-[92%]" style={{ background: "var(--bg2)", color: "var(--ink2)" }}>
                  <div className="font-medium mb-1" style={{ color: "var(--ink)" }}>12 employees qualify today.</div>
                  Top eligible:
                  <div className="mt-1.5 space-y-1 font-(family-name:--font-dm-mono) text-[11px]" style={{ color: "var(--ink3)" }}>
                    <div className="flex justify-between"><span>Kwame Asante</span><span>GHS 620</span></div>
                    <div className="flex justify-between"><span>Abena Boateng</span><span>GHS 540</span></div>
                    <div className="flex justify-between"><span>Yaw Owusu</span><span>GHS 480</span></div>
                  </div>
                </div>
                <div className="rounded-lg px-3 py-2 text-[12px] leading-[1.5] ml-auto max-w-[85%]" style={{ background: "var(--ink)", color: "rgba(255,255,255,0.92)" }}>
                  Prepare May SSNIT summary.
                </div>
                <div className="flex items-center gap-2 text-[11px] font-(family-name:--font-dm-mono)" style={{ color: "var(--ink4)" }}>
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--ink4)", animation: "floatY 1.4s ease-in-out infinite" }} />
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--ink4)", animation: "floatY 1.4s ease-in-out infinite -0.4s" }} />
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--ink4)", animation: "floatY 1.4s ease-in-out infinite -0.8s" }} />
                  </div>
                  thinking
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
              <div className="w-10 h-10 rounded-[9px] flex items-center justify-center mb-4" style={{ background: "var(--bg2)", color: "var(--ink2)" }}>{f.icon}</div>
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
const trustItems: { icon: ReactNode; title: string; body: string }[] = [
  { icon: <Lock strokeWidth={ICON_STROKE} className="w-[19px] h-[19px]" />, title: "Bank-grade data security", body: "All payroll data is encrypted at rest and in transit using AES-256 and TLS 1.3. We never store raw mobile wallet credentials." },
  { icon: <FileCheck2 strokeWidth={ICON_STROKE} className="w-[19px] h-[19px]" />, title: "Full audit trail", body: "Every withdrawal request, disbursement, and deduction is time-stamped and logged immutably. Auditor-ready records." },
  { icon: <Scale strokeWidth={ICON_STROKE} className="w-[19px] h-[19px]" />, title: "Regulatory-compliant infrastructure", body: "Built to comply with local payment systems guidelines and data protection requirements in every market we serve." },
];

const complianceBadges = ["AES-256", "TLS 1.3", "SOC 2 aligned", "GDPR-ready", "BoG guidelines"];

export function Trust() {
  return (
    <section className="section-padding pb-30 max-[1080px]:pb-20">
      <ScrollReveal>
        <div
          className="p-14 px-16 max-[1080px]:p-10"
          style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "var(--r-2xl)" }}
        >
          <div className="flex items-center justify-between gap-6 mb-9 max-[1080px]:flex-col max-[1080px]:items-start max-[1080px]:gap-4">
            <div className="eyebrow">
              <span className="inline-block w-6 h-px" style={{ background: "var(--ink4)" }} />
              Security &amp; compliance
            </div>
            <div className="flex flex-wrap gap-2 max-[1080px]:justify-start">
              {complianceBadges.map((b) => (
                <span
                  key={b}
                  className="inline-flex items-center text-[11px] font-medium tracking-[0.02em] px-2.5 py-1 rounded-full font-(family-name:--font-dm-mono)"
                  style={{ background: "var(--white)", border: "1px solid var(--border)", color: "var(--ink3)" }}
                >
                  {b}
                </span>
              ))}
            </div>
          </div>

          <div
            className="grid grid-cols-3 max-[1080px]:grid-cols-1 gap-px overflow-hidden"
            style={{ background: "var(--border)", borderRadius: "var(--r-xl)" }}
          >
            {trustItems.map((t) => (
              <div key={t.title} className="p-7 px-7" style={{ background: "var(--white)" }}>
                <div
                  className="w-11 h-11 rounded-[11px] flex items-center justify-center mb-4"
                  style={{ background: "var(--bg2)", color: "var(--ink2)", border: "1px solid var(--border)" }}
                >
                  {t.icon}
                </div>
                <h3
                  className="font-(family-name:--font-fraunces) text-[17px] font-normal tracking-[-0.02em] mb-2"
                  style={{ color: "var(--ink)" }}
                >
                  {t.title}
                </h3>
                <p className="text-[13px] leading-[1.65]" style={{ color: "var(--ink3)" }}>
                  {t.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   NUMBERS / STATS (dark section)
═══════════════════════════════════════════════════════════ */
const stats = [
  { num: "3", suffix: " days", label: "Average payroll cycle today", note: "WageNow runs it in a morning" },
  { num: "10", suffix: "+", label: "AI assistant capabilities", note: "Payroll, HR, EWA, compliance" },
  { num: "~90", suffix: "s", label: "EWA disbursement to MoMo", note: "vs 14-day manual advance" },
  { num: "100", suffix: "%", label: "Payroll deduction recovery", note: "Zero credit risk — earned wages" },
];

export function Numbers() {
  return (
    <section className="py-24 max-[1080px]:py-20 px-13 max-[1080px]:px-8 relative overflow-hidden" style={{ background: "var(--ink)" }}>
      <div className="max-w-(--max) mx-auto relative z-1">
        <div className="flex justify-between items-end mb-16 max-[640px]:flex-col max-[640px]:gap-4 max-[640px]:items-start">
          <h2 className="font-(family-name:--font-fraunces) font-light tracking-[-0.04em] leading-[1.08] text-white" style={{ fontSize: "clamp(32px, 3.5vw, 48px)" }}>
            What you get,<br /><em className="italic" style={{ color: "var(--green3)" }}>in numbers.</em>
          </h2>
          <p className="max-w-65 text-[13px] text-right max-[640px]:text-left leading-[1.6]" style={{ color: "rgba(255,255,255,0.3)" }}>
            From customer interviews and our pilot deployments across Ghanaian SMEs.
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
          <div className="eyebrow mb-5"><span className="inline-block w-6 h-px" style={{ background: "var(--ink4)" }} />The EWA layer · vs alternatives</div>
          <h2 className="font-(family-name:--font-fraunces) font-light tracking-[-0.04em] leading-[1.06]" style={{ fontSize: "clamp(34px, 3.8vw, 52px)", color: "var(--ink)" }}>
            Earned wage access<br /><em className="italic" style={{ color: "var(--green2)" }}>without the loans</em>
          </h2>
        </div>
        <p className="text-[14px] leading-[1.7] text-right max-[1080px]:text-left" style={{ color: "var(--ink3)" }}>EWA is one of four layers — built into WageNow alongside payroll, HR, and the AI assistant. Your employees don&apos;t need debt. They need access to what they&apos;ve already earned.</p>
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
  { tier: "Starter", tierCls: "t-starter", name: "Starter", price: "500", cadence: "per month · up to 50 employees", features: ["Payroll engine — SSNIT, PAYE, payslips", "HR records — employees, departments, leave", "EWA for all employees", "AI assistant — read-only + drafts", "Employer dashboard + audit trail", "Email & chat support"], btnCls: "pb-default", featured: false },
  { tier: "Most popular", tierCls: "t-growth", name: "Growth", price: "2,000", cadence: "per month · up to 250 employees", features: ["Everything in Starter", "Bank + MoMo payroll payouts", "Compliance reports — SSNIT, GRA filings", "AI assistant — write actions (with approval)", "REST API + HRIS integration", "Dedicated onboarding support"], btnCls: "pb-featured", featured: true },
  { tier: "Enterprise", tierCls: "t-ent", name: "Enterprise", price: "Custom", cadence: "250+ employees · custom contract", features: ["Everything in Growth", "Dedicated account manager", "Custom SLA + 24/7 phone support", "Custom payroll rules per role & grade", "SSO + custom integrations", "Quarterly business reviews"], btnCls: "pb-ent", featured: false },
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
          One subscription covers payroll, HR, EWA, and the AI assistant. No setup fees, no percentage cuts, no per-payslip charges. Employees pay a flat GHS 3 per EWA withdrawal — the lowest financial access cost available.
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
                    <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: p.featured ? "rgba(255,255,255,0.12)" : "var(--green-bg)", color: p.featured ? "rgba(255,255,255,0.85)" : "var(--green)" }}>
                      <Check strokeWidth={2.5} className="w-2.5 h-2.5" />
                    </div>
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
              Stop running payroll<br />on <em className="italic" style={{ color: "var(--green3)" }}>spreadsheets.</em>
            </h2>
            <p className="text-[15px] leading-[1.7] max-w-120" style={{ color: "rgba(255,255,255,0.4)" }}>
              WageNow runs payroll, HR, and earned-wage access — with an AI assistant that understands your workforce. Live in 5 days. Starts at GHS 500/month. Built in Ghana, for Ghanaian employers.
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
