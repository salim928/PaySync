import type { Metadata } from "next";
import { PageHeader } from "@/components/marketing/page-header";

export const metadata: Metadata = {
  title: "Careers",
  description: "Join WageNow — we're building financial infrastructure that gives the workforce real-time access to earned wages.",
};

const openings = [
  {
    title: "Senior Backend Engineer",
    department: "Engineering",
    location: "Accra / Remote",
    type: "Full-time",
    description: "Build and scale the FastAPI backend powering EWA transactions, payroll integrations, and mobile wallet disbursements. Python, PostgreSQL, async architecture.",
  },
  {
    title: "Frontend Engineer",
    department: "Engineering",
    location: "Accra / Remote",
    type: "Full-time",
    description: "Own the employer dashboard and employee PWA built with Next.js and React. Focus on performance, accessibility, and delightful UX.",
  },
  {
    title: "Product Designer",
    department: "Design",
    location: "Accra / Remote",
    type: "Full-time",
    description: "Design financial products that work for people who've never used one. User research, prototyping, and design systems for web and WhatsApp interfaces.",
  },
  {
    title: "Business Development Lead",
    department: "Commercial",
    location: "Accra / Hybrid",
    type: "Full-time",
    description: "Own employer acquisition in target markets. Build relationships with HR leaders, run demos, and close deals. Background in B2B SaaS or fintech preferred.",
  },
  {
    title: "Customer Success Manager",
    department: "Operations",
    location: "Accra / Hybrid",
    type: "Full-time",
    description: "Onboard new employers, train HR teams, and ensure successful deployment. Be the voice of the customer inside WageNow.",
  },
];

const perks = [
  { title: "Competitive salary", body: "Market-rate compensation in GHS or USD, benchmarked to international standards." },
  { title: "Remote-friendly", body: "Work from anywhere. We care about output, not office hours." },
  { title: "Health coverage", body: "Comprehensive health insurance for you and your dependents." },
  { title: "Learning budget", body: "Annual budget for courses, conferences, and books. Invest in yourself." },
  { title: "WageNow EWA", body: "Obviously. Access your own earned wages in real-time. We use what we build." },
  { title: "Equity", body: "Early employees receive meaningful equity. We're building this together." },
];

export default function CareersPage() {
  return (
    <>
      <PageHeader
        eyebrow="Careers"
        title={<>Build something that <em className="italic" style={{ color: "var(--green2)" }}>matters</em></>}
        subtitle="WageNow is eliminating the gap between earning and accessing wages for the modern workforce. We're a small, fast team — every person here has outsized impact."
      />

      {/* Perks */}
      <section className="section-padding pb-16">
        <h2
          className="font-(family-name:--font-fraunces) font-light tracking-[-0.03em] text-[28px] mb-8"
          style={{ color: "var(--ink)" }}
        >
          Why WageNow
        </h2>
        <div className="grid grid-cols-3 max-[1080px]:grid-cols-1 gap-5">
          {perks.map((p) => (
            <div
              key={p.title}
              className="rounded-(--r-xl) p-7"
              style={{ background: "var(--white)", border: "1px solid var(--border)" }}
            >
              <h3 className="text-[15px] font-medium mb-1.5" style={{ color: "var(--ink)" }}>{p.title}</h3>
              <p className="text-[13px] leading-[1.6]" style={{ color: "var(--ink3)" }}>{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Open positions */}
      <section className="section-padding pb-[120px] max-[1080px]:pb-20" style={{ borderTop: "1px solid var(--border)" }}>
        <h2
          className="font-(family-name:--font-fraunces) font-light tracking-[-0.03em] text-[28px] mb-8 pt-16"
          style={{ color: "var(--ink)" }}
        >
          Open positions
        </h2>
        <div className="flex flex-col gap-4">
          {openings.map((job) => (
            <div
              key={job.title}
              className="rounded-(--r-xl) p-8 transition-shadow hover:shadow-md"
              style={{ background: "var(--white)", border: "1px solid var(--border)" }}
            >
              <div className="flex items-start justify-between gap-4 max-[1080px]:flex-col">
                <div className="flex-1">
                  <h3 className="text-[17px] font-medium tracking-[-0.02em] mb-1" style={{ color: "var(--ink)" }}>
                    {job.title}
                  </h3>
                  <div className="flex items-center gap-3 mb-3 flex-wrap">
                    <span
                      className="text-[11px] font-semibold tracking-[0.06em] uppercase px-2 py-0.5 rounded"
                      style={{ background: "var(--green-bg)", color: "var(--green)" }}
                    >
                      {job.department}
                    </span>
                    <span className="text-[12px]" style={{ color: "var(--ink4)" }}>{job.location}</span>
                    <span className="text-[12px]" style={{ color: "var(--ink4)" }}>{job.type}</span>
                  </div>
                  <p className="text-[14px] leading-[1.7]" style={{ color: "var(--ink3)" }}>
                    {job.description}
                  </p>
                </div>
                <a
                  href={`mailto:careers@wagenow.com.gh?subject=Application: ${job.title}`}
                  className="shrink-0 text-[13px] font-medium px-5 py-2.5 rounded-lg transition-opacity hover:opacity-90"
                  style={{ background: "var(--ink)", color: "#fff" }}
                >
                  Apply →
                </a>
              </div>
            </div>
          ))}
        </div>

        <div
          className="mt-12 rounded-(--r-xl) p-8 text-center"
          style={{ background: "var(--bg2)", border: "1px solid var(--border)" }}
        >
          <p className="text-[15px] leading-[1.7]" style={{ color: "var(--ink3)" }}>
            Don&apos;t see a role that fits?{" "}
            <a href="mailto:careers@wagenow.com.gh" className="font-medium" style={{ color: "var(--green)" }}>
              Send us your CV anyway →
            </a>
          </p>
          <p className="text-[13px] mt-2" style={{ color: "var(--ink4)" }}>
            We&apos;re always looking for exceptional people. Tell us what you&apos;d build at WageNow.
          </p>
        </div>
      </section>
    </>
  );
}
