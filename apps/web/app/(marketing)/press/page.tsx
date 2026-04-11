import type { Metadata } from "next";
import { LogoMark } from "@/components/ui/logo";
import { PageHeader } from "@/components/marketing/page-header";

export const metadata: Metadata = {
  title: "Press",
  description: "WageNow press resources — company information, brand assets, and media contact.",

};

const coverage = [
  {
    date: "2026-04-01",
    outlet: "Business News Daily",
    title: "WageNow launches earned wage access platform targeting 1.5M formal workers",
    excerpt: "Fintech WageNow has launched a platform enabling employees to access earned wages before payday, disbursed via mobile wallets for a flat fee.",
  },
  {
    date: "2026-03-15",
    outlet: "TechCrunch",
    title: "The case for earned wage access in emerging markets",
    excerpt: "As predatory lending apps proliferate, a new wave of fintech startups is offering an alternative: letting workers access money they've already earned.",
  },
  {
    date: "2026-02-20",
    outlet: "Disrupt",
    title: "WageNow tackles payday loan dependency with EWA platform",
    excerpt: "WageNow is positioning earned wage access as an alternative to the growing payday loan market, offering instant mobile wallet disbursements at a flat fee.",
  },
];

const facts = [
  { label: "Founded", value: "2026" },
  { label: "Headquarters", value: "Global" },
  { label: "Product", value: "Earned Wage Access (EWA)" },
  { label: "Addressable market", value: "1.5M+ formal workers" },
  { label: "Disbursement speed", value: "~90 seconds to mobile wallet" },
  { label: "Employee cost", value: "Flat fee per withdrawal" },
  { label: "Supported channels", value: "Mobile money, bank transfer" },
  { label: "Employer onboarding", value: "~5 days from CSV upload to first withdrawal" },
];

export default function PressPage() {
  return (
    <>
      <PageHeader
        eyebrow="Press"
        title={<>Press & <em className="italic" style={{ color: "var(--green2)" }}>media</em></>}
        subtitle="For media enquiries, interviews, or press assets, contact press@wagenow.io. We typically respond within 24 hours."
      />

      {/* Brand assets */}
      <section className="section-padding pb-16">
        <h2
          className="font-(family-name:--font-fraunces) font-light tracking-[-0.03em] text-[28px] mb-8"
          style={{ color: "var(--ink)" }}
        >
          Brand assets
        </h2>
        <div className="grid grid-cols-2 max-[1080px]:grid-cols-1 gap-5">
          <div
            className="rounded-(--r-xl) p-10 flex items-center justify-center"
            style={{ background: "var(--white)", border: "1px solid var(--border)" }}
          >
            <div className="flex items-center gap-3">
              <LogoMark size={48} />
              <span className="text-[24px] font-semibold tracking-[-0.02em]" style={{ color: "var(--ink)" }}>
                WageNow
              </span>
            </div>
          </div>
          <div
            className="rounded-(--r-xl) p-10 flex items-center justify-center"
            style={{ background: "var(--ink)" }}
          >
            <div className="flex items-center gap-3">
              <LogoMark size={48} />
              <span className="text-[24px] font-semibold tracking-[-0.02em] text-white">
                WageNow
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Company facts */}
      <section className="section-padding py-16" style={{ borderTop: "1px solid var(--border)" }}>
        <h2
          className="font-(family-name:--font-fraunces) font-light tracking-[-0.03em] text-[28px] mb-8"
          style={{ color: "var(--ink)" }}
        >
          Company facts
        </h2>
        <div className="rounded-(--r-xl) overflow-hidden" style={{ border: "1px solid var(--border)" }}>
          {facts.map((f, i) => (
            <div
              key={f.label}
              className="flex items-center justify-between px-6 py-4"
              style={{
                background: "var(--white)",
                borderBottom: i < facts.length - 1 ? "1px solid var(--border)" : "none",
              }}
            >
              <span className="text-[13px] font-medium" style={{ color: "var(--ink4)" }}>{f.label}</span>
              <span className="text-[14px] font-medium text-right" style={{ color: "var(--ink)" }}>{f.value}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Press coverage */}
      <section className="section-padding pb-[120px] max-[1080px]:pb-20" style={{ borderTop: "1px solid var(--border)" }}>
        <h2
          className="font-(family-name:--font-fraunces) font-light tracking-[-0.03em] text-[28px] mb-8 pt-16"
          style={{ color: "var(--ink)" }}
        >
          Coverage
        </h2>
        <div className="flex flex-col gap-6 max-w-[720px]">
          {coverage.map((item) => (
            <article key={item.title} className="pb-6" style={{ borderBottom: "1px solid var(--border)" }}>
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <span className="text-[12px] font-(family-name:--font-dm-mono)" style={{ color: "var(--ink4)" }}>
                  {item.date}
                </span>
                <span className="text-[12px] font-semibold" style={{ color: "var(--green)" }}>
                  {item.outlet}
                </span>
              </div>
              <h3 className="text-[17px] font-medium tracking-[-0.02em] mb-2 leading-[1.3]" style={{ color: "var(--ink)" }}>
                {item.title}
              </h3>
              <p className="text-[14px] leading-[1.7]" style={{ color: "var(--ink3)" }}>
                {item.excerpt}
              </p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
