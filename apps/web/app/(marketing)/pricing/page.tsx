import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/marketing/page-header";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Simple, honest pricing. No setup fees, no percentage cuts. Employees pay a flat fee per withdrawal.",
};

const plans = [
  {
    tier: "Starter",
    price: "500",
    cadence: "per month · up to 50 employees",
    features: [
      "WageNow EWA for all employees",
      "WhatsApp + PWA employee access",
      "Payroll CSV upload",
      "Employer analytics dashboard",
      "Monthly deduction report export",
      "Email & chat support",
    ],
    cta: "Start free trial →",
    featured: false,
  },
  {
    tier: "Growth",
    price: "2,000",
    cadence: "per month · up to 250 employees",
    features: [
      "Everything in Starter",
      "REST API payroll integration",
      "Priority disbursement queue",
      "Configurable accrual rules per dept",
      "Advanced workforce analytics",
      "Dedicated onboarding support",
    ],
    cta: "Start free trial →",
    featured: true,
  },
  {
    tier: "Enterprise",
    price: "Custom",
    cadence: "250+ employees · custom contract",
    features: [
      "Everything in Growth",
      "Dedicated account manager",
      "Custom SLA + 24/7 phone support",
      "Custom accrual config per role & grade",
      "SSO & HRIS integration",
      "Quarterly business reviews",
    ],
    cta: "Talk to sales →",
    featured: false,
  },
];

const faqs = [
  {
    q: "What does the employee pay?",
    a: "A flat fee per withdrawal. No interest, no percentage of salary, no hidden charges. This is deducted from the withdrawal amount, not from the employer.",
  },
  {
    q: "Is there a setup fee?",
    a: "No. Zero setup fees, zero integration fees. You pay the monthly platform fee and your employees pay a flat fee per withdrawal. That's it.",
  },
  {
    q: "What if we have more than 250 employees?",
    a: "Contact our sales team for Enterprise pricing. We offer volume discounts and custom contracts for larger organisations.",
  },
  {
    q: "Can we try before committing?",
    a: "Yes. All plans come with a 30-day free trial. No credit card required to start. Cancel anytime during the trial period.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept bank transfer, mobile money, and card payments. Enterprise clients can arrange invoicing on NET 30 terms.",
  },
];

export default function PricingPage() {
  return (
    <>
      <PageHeader
        eyebrow="Pricing"
        title={<>Simple, <em className="italic" style={{ color: "var(--green2)" }}>honest</em> pricing</>}
        subtitle="No setup fees. No percentage cuts. Employees pay a flat fee per withdrawal — the lowest cost financial access available."
      />

      <section className="section-padding pb-20">
        <div className="grid grid-cols-3 max-[1080px]:grid-cols-1 gap-5">
          {plans.map((p) => (
            <div
              key={p.tier}
              className="flex flex-col rounded-(--r-xl) p-9 transition-shadow hover:shadow-lg"
              style={{
                background: p.featured ? "var(--ink)" : "var(--white)",
                border: p.featured ? "1.5px solid var(--ink)" : "1.5px solid var(--border)",
                boxShadow: p.featured ? "0 20px 64px rgba(24,22,15,0.18)" : undefined,
              }}
            >
              <div
                className="text-[10px] font-bold tracking-[0.1em] uppercase px-2.5 py-[3px] rounded-full w-fit mb-6"
                style={{
                  background: p.featured ? "rgba(255,255,255,0.1)" : "var(--bg2)",
                  color: p.featured ? "rgba(255,255,255,0.55)" : "var(--ink4)",
                }}
              >
                {p.tier === "Growth" ? "Most popular" : p.tier}
              </div>
              <div
                className="font-(family-name:--font-fraunces) text-[24px] font-light tracking-[-0.04em] mb-1.5"
                style={{ color: p.featured ? "#fff" : "var(--ink)" }}
              >
                {p.tier}
              </div>
              <div
                className="font-(family-name:--font-fraunces) font-extralight tracking-[-0.05em] leading-none mb-1"
                style={{ fontSize: p.price === "Custom" ? 38 : 52, color: p.featured ? "#fff" : "var(--ink)" }}
              >
                {p.price !== "Custom" && <sup className="text-[16px] align-super tracking-normal mr-1">GHS</sup>}
                {p.price}
              </div>
              <div
                className="text-[12px] font-(family-name:--font-dm-mono) mb-7"
                style={{ color: p.featured ? "rgba(255,255,255,0.35)" : "var(--ink4)" }}
              >
                {p.cadence}
              </div>
              <div className="h-px mb-6" style={{ background: p.featured ? "rgba(255,255,255,0.08)" : "var(--border)" }} />
              <div className="flex-1 flex flex-col gap-[11px] mb-8">
                {p.features.map((f) => (
                  <div
                    key={f}
                    className="flex items-start gap-2.5 text-[13px] leading-[1.4]"
                    style={{ color: p.featured ? "rgba(255,255,255,0.65)" : "var(--ink2)" }}
                  >
                    <div
                      className="w-4 h-4 rounded flex items-center justify-center text-[9px] shrink-0 mt-px"
                      style={{
                        background: p.featured ? "rgba(255,255,255,0.1)" : "var(--green-bg)",
                        color: p.featured ? "rgba(255,255,255,0.6)" : "var(--green)",
                      }}
                    >
                      ✓
                    </div>
                    {f}
                  </div>
                ))}
              </div>
              <Link
                href={p.price === "Custom" ? "#contact" : "/register"}
                className="w-full py-3 rounded-[9px] text-[14px] font-medium text-center font-(family-name:--font-dm-sans) transition-all block"
                style={{
                  background: p.featured ? "#fff" : "var(--bg2)",
                  color: "var(--ink)",
                  border: p.featured ? "none" : "1.5px solid var(--border)",
                }}
              >
                {p.cta}
              </Link>
            </div>
          ))}
        </div>
        <p className="text-center mt-8 text-[13px] leading-[1.6]" style={{ color: "var(--ink4)" }}>
          <strong className="font-medium" style={{ color: "var(--ink3)" }}>Employees pay a flat fee per withdrawal.</strong>{" "}
          No hidden fees. No interest. No percentage of salary. Ever.
        </p>
      </section>

      <section className="section-padding py-[100px] max-[1080px]:py-16" style={{ borderTop: "1px solid var(--border)" }}>
        <h2
          className="font-(family-name:--font-fraunces) font-light tracking-[-0.03em] text-[28px] mb-10"
          style={{ color: "var(--ink)" }}
        >
          Frequently asked questions
        </h2>
        <div className="flex flex-col gap-6 max-w-[680px]">
          {faqs.map((faq) => (
            <div key={faq.q} className="pb-6" style={{ borderBottom: "1px solid var(--border)" }}>
              <h3 className="text-[15px] font-medium mb-2" style={{ color: "var(--ink)" }}>{faq.q}</h3>
              <p className="text-[14px] leading-[1.7]" style={{ color: "var(--ink3)" }}>{faq.a}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
