import type { Metadata } from "next";
import { PageHeader } from "@/components/marketing/page-header";

export const metadata: Metadata = {
  title: "Security",
  description: "How WageNow protects employer data, employee information, and financial transactions.",
};

const principles = [
  {
    icon: "🔐",
    title: "Encryption at rest and in transit",
    body: "All data is encrypted with AES-256 at rest and TLS 1.3 in transit. Database credentials, API keys, and secrets are managed through isolated vaults — never stored in source code.",
  },
  {
    icon: "🛡️",
    title: "Row-level security",
    body: "Every database query is scoped to the authenticated employer. Employer A can never access Employer B's data — enforced at the database level, not the application layer.",
  },
  {
    icon: "🔑",
    title: "Authentication & access control",
    body: "Supabase Auth with JWT tokens. Session tokens rotate automatically. Employer accounts support TOTP-based two-factor authentication. Employee access is phone-verified via OTP.",
  },
  {
    icon: "📋",
    title: "SOC 2 aligned practices",
    body: "Our infrastructure and processes follow SOC 2 Type II controls. Automated vulnerability scanning, dependency auditing, and security-focused code review on every merge.",
  },
  {
    icon: "🏦",
    title: "PCI-aware transaction handling",
    body: "WageNow never stores credit card data. MoMo disbursements flow through licensed payment service providers with PCI DSS compliance. We handle tokens, not credentials.",
  },
  {
    icon: "📊",
    title: "Audit logging",
    body: "Every admin action, data access, and financial transaction is logged with timestamps, actor identity, and IP address. Logs are immutable and retained for 12 months.",
  },
];

export default function SecurityPage() {
  return (
    <>
      <PageHeader
        eyebrow="Security"
        title={<>Your data is <em className="italic" style={{ color: "var(--green2)" }}>non-negotiable</em></>}
        subtitle="WageNow is built with security-first architecture. Employer data, employee PII, and financial transactions are protected at every layer."
      />

      <section className="section-padding pb-[120px] max-[1080px]:pb-20">
        <div className="grid grid-cols-2 max-[1080px]:grid-cols-1 gap-5">
          {principles.map((p) => (
            <div
              key={p.title}
              className="rounded-(--r-xl) p-8"
              style={{ background: "var(--white)", border: "1px solid var(--border)" }}
            >
              <div className="text-[24px] mb-4">{p.icon}</div>
              <h3 className="text-[17px] font-medium tracking-[-0.02em] mb-2" style={{ color: "var(--ink)" }}>
                {p.title}
              </h3>
              <p className="text-[14px] leading-[1.7]" style={{ color: "var(--ink3)" }}>
                {p.body}
              </p>
            </div>
          ))}
        </div>

        <div
          className="mt-16 rounded-(--r-xl) p-10"
          style={{ background: "var(--ink)", color: "#fff" }}
        >
          <h3
            className="font-(family-name:--font-fraunces) font-light text-[22px] tracking-[-0.02em] mb-3"
          >
            Responsible disclosure
          </h3>
          <p className="text-[14px] leading-[1.75] max-w-[600px]" style={{ color: "rgba(255,255,255,0.5)" }}>
            If you discover a security vulnerability, please report it to{" "}
            <a href="mailto:security@wagenow.com.gh" className="underline" style={{ color: "rgba(255,255,255,0.7)" }}>
              security@wagenow.com.gh
            </a>
            . We take all reports seriously and will respond within 24 hours.
          </p>
        </div>
      </section>
    </>
  );
}
