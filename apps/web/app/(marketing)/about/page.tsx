import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/marketing/page-header";

export const metadata: Metadata = {
  title: "About",
  description: "WageNow is building the financial infrastructure that gives the modern workforce real-time access to the wages they've already earned.",
};

const values = [
  {
    title: "Workers first",
    body: "Every product decision starts with a simple question: does this make the worker's life better? If it doesn't, we don't build it.",
  },
  {
    title: "Radical simplicity",
    body: "Financial products are overengineered and under-explained. We build things that work on the first try, for people who don't have time to read a manual.",
  },
  {
    title: "Zero exploitation",
    body: "No interest. No percentage of salary. No predatory fees. A flat fee per withdrawal. We make money by being useful, not by being extractive.",
  },
  {
    title: "Speed as a feature",
    body: "~90 second disbursement. 5-day employer onboarding. Instant accrual visibility. Speed isn't a nice-to-have — for someone who needs money today, it's everything.",
  },
];

const stats = [
  { value: "2026", label: "Founded" },
  { value: "Accra, Ghana", label: "Headquarters" },
  { value: "GHS 3", label: "Flat fee per withdrawal" },
  { value: "~90s", label: "Disbursement time" },
];

const team = [
  { name: "Leadership Team", role: "Building the future of earned wage access", count: "Growing" },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="Company"
        title={<>Money people have <em className="italic" style={{ color: "var(--green2)" }}>already earned</em> shouldn&apos;t be locked away</>}
        subtitle="WageNow exists because the 30-day pay cycle is an outdated relic of banking infrastructure constraints that no longer exist. Mobile Money rails make real-time wage access possible — we're making it real."
      />

      {/* Stats */}
      <section className="section-padding pb-16">
        <div className="grid grid-cols-4 max-[1080px]:grid-cols-2 gap-5">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-(--r-xl) p-7 text-center"
              style={{ background: "var(--white)", border: "1px solid var(--border)" }}
            >
              <div
                className="font-(family-name:--font-fraunces) font-light text-[32px] tracking-[-0.03em] mb-1"
                style={{ color: "var(--ink)" }}
              >
                {s.value}
              </div>
              <div className="text-[13px]" style={{ color: "var(--ink4)" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Mission */}
      <section className="section-padding py-20" style={{ borderTop: "1px solid var(--border)" }}>
        <div className="grid grid-cols-[1fr_1fr] max-[1080px]:grid-cols-1 gap-16">
          <div>
            <h2
              className="font-(family-name:--font-fraunces) font-light tracking-[-0.03em] text-[28px] leading-[1.15] mb-5"
              style={{ color: "var(--ink)" }}
            >
              Our mission
            </h2>
            <p className="text-[15px] leading-[1.8]" style={{ color: "var(--ink3)" }}>
              Millions of formal workers wait an average of 30 days to access income they earned on day one.
              In the gap, they turn to loan apps charging 30–80% APR on money that is already theirs.
            </p>
            <p className="text-[15px] leading-[1.8] mt-4" style={{ color: "var(--ink3)" }}>
              WageNow eliminates that gap. We give employees real-time visibility into what they&apos;ve earned and the ability
              to withdraw it instantly to their mobile wallet — for a flat fee. No loans. No interest. No credit checks.
            </p>
          </div>
          <div>
            <h2
              className="font-(family-name:--font-fraunces) font-light tracking-[-0.03em] text-[28px] leading-[1.15] mb-5"
              style={{ color: "var(--ink)" }}
            >
              Why now
            </h2>
            <p className="text-[15px] leading-[1.8]" style={{ color: "var(--ink3)" }}>
              Mobile money penetration is growing rapidly worldwide. Modern payment rails can settle transactions in under 90 seconds.
              The infrastructure that made the monthly pay cycle necessary no longer constrains us.
            </p>
            <p className="text-[15px] leading-[1.8] mt-4" style={{ color: "var(--ink3)" }}>
              At the same time, the predatory lending market is growing. Loan apps are filling a gap that
              shouldn&apos;t exist. WageNow replaces exploitation with infrastructure — giving workers what&apos;s already theirs.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section-padding py-20" style={{ borderTop: "1px solid var(--border)" }}>
        <h2
          className="font-(family-name:--font-fraunces) font-light tracking-[-0.03em] text-[28px] mb-10"
          style={{ color: "var(--ink)" }}
        >
          What we believe
        </h2>
        <div className="grid grid-cols-2 max-[1080px]:grid-cols-1 gap-5">
          {values.map((v) => (
            <div
              key={v.title}
              className="rounded-(--r-xl) p-8"
              style={{ background: "var(--white)", border: "1px solid var(--border)" }}
            >
              <h3 className="text-[17px] font-medium tracking-[-0.02em] mb-2" style={{ color: "var(--ink)" }}>
                {v.title}
              </h3>
              <p className="text-[14px] leading-[1.7]" style={{ color: "var(--ink3)" }}>{v.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Team CTA */}
      <section className="section-padding pb-[120px] max-[1080px]:pb-20 pt-10">
        <div
          className="rounded-(--r-xl) p-10 text-center"
          style={{ background: "var(--ink)", color: "#fff" }}
        >
          <h3
            className="font-(family-name:--font-fraunces) font-light text-[24px] tracking-[-0.02em] mb-3"
          >
            Join the team
          </h3>
          <p className="text-[15px] leading-[1.7] max-w-[480px] mx-auto mb-6" style={{ color: "rgba(255,255,255,0.45)" }}>
            We&apos;re building something that matters. If you want to work on financial infrastructure that directly
            improves the lives of workers everywhere, we&apos;d love to hear from you.
          </p>
          <Link
            href="/careers"
            className="inline-flex items-center gap-2 text-[14px] font-semibold px-8 py-3.5 rounded-lg transition-opacity hover:opacity-90"
            style={{ background: "#fff", color: "var(--ink)" }}
          >
            View open positions →
          </Link>
        </div>
      </section>
    </>
  );
}
