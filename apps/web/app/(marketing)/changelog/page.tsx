import type { Metadata } from "next";
import { PageHeader } from "@/components/marketing/page-header";

export const metadata: Metadata = {
  title: "Changelog",
  description: "What's new at WageNow — product updates, new features, and improvements.",
};

const entries = [
  {
    date: "2026-04-10",
    version: "v1.4.0",
    title: "Employer analytics dashboard",
    tags: ["Feature"],
    items: [
      "New analytics page with workforce insights — withdrawal frequency, department trends, and peak usage times",
      "Downloadable PDF reports for quarterly business reviews",
      "Real-time active withdrawal count on the dashboard home page",
    ],
  },
  {
    date: "2026-04-02",
    version: "v1.3.0",
    title: "Token exchange authentication",
    tags: ["Improvement"],
    items: [
      "New /auth/token/exchange endpoint — Supabase tokens are automatically exchanged for WageNow API JWTs",
      "Auto-provisioning of employer profiles on first login",
      "Improved session restore on page refresh",
    ],
  },
  {
    date: "2026-03-20",
    version: "v1.2.0",
    title: "Employee CSV upload improvements",
    tags: ["Feature", "Improvement"],
    items: [
      "Preview screen before confirming bulk uploads — see validation errors before committing",
      "Support for department and role columns in CSV",
      "Duplicate phone number detection across employers",
    ],
  },
  {
    date: "2026-03-08",
    version: "v1.1.0",
    title: "Employee self-service portal",
    tags: ["Feature"],
    items: [
      "New employee PWA — view accrual balance, request withdrawals, see transaction history",
      "Phone-verified OTP login for employees",
      "Email-based login option as an alternative to OTP",
    ],
  },
  {
    date: "2026-02-15",
    version: "v1.0.0",
    title: "WageNow launch",
    tags: ["Launch"],
    items: [
      "Employer onboarding — register, upload payroll CSV, configure accrual rules",
      "Employee earned wage access with mobile wallet disbursement",
      "Employer dashboard with employee management and deduction reports",
      "Flat fee per withdrawal — no interest, no percentage",
    ],
  },
];

const tagColors: Record<string, { bg: string; color: string }> = {
  Feature: { bg: "var(--green-bg)", color: "var(--green)" },
  Improvement: { bg: "#e8eaff", color: "#4a4ade" },
  Fix: { bg: "#fef2f2", color: "#b83232" },
  Launch: { bg: "var(--gold-bg)", color: "var(--gold)" },
};

export default function ChangelogPage() {
  return (
    <>
      <PageHeader
        eyebrow="Changelog"
        title={<>What&apos;s <em className="italic" style={{ color: "var(--green2)" }}>new</em></>}
        subtitle="Product updates, new features, and improvements to WageNow. Follow along as we build the future of earned wage access."
      />

      <section className="section-padding pb-[120px] max-[1080px]:pb-20">
        <div className="max-w-[720px]">
          {entries.map((entry, i) => (
            <div
              key={entry.version}
              className="relative pl-8 pb-12"
              style={{
                borderLeft: i < entries.length - 1 ? "1px solid var(--border)" : "1px solid transparent",
              }}
            >
              {/* Timeline dot */}
              <div
                className="absolute left-[-5px] top-1 w-2.5 h-2.5 rounded-full"
                style={{ background: i === 0 ? "var(--green3)" : "var(--ink5)" }}
              />

              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <span className="text-[12px] font-(family-name:--font-dm-mono)" style={{ color: "var(--ink4)" }}>
                  {entry.date}
                </span>
                <span
                  className="text-[12px] font-semibold font-(family-name:--font-dm-mono) px-2 py-0.5 rounded"
                  style={{ background: "var(--bg2)", color: "var(--ink3)" }}
                >
                  {entry.version}
                </span>
                {entry.tags.map((tag) => {
                  const tc = tagColors[tag] || tagColors.Feature;
                  return (
                    <span
                      key={tag}
                      className="text-[10px] font-bold tracking-[0.06em] uppercase px-2 py-0.5 rounded"
                      style={{ background: tc.bg, color: tc.color }}
                    >
                      {tag}
                    </span>
                  );
                })}
              </div>

              <h3 className="text-[18px] font-medium tracking-[-0.02em] mb-3" style={{ color: "var(--ink)" }}>
                {entry.title}
              </h3>

              <ul className="flex flex-col gap-2">
                {entry.items.map((item, j) => (
                  <li key={j} className="flex items-start gap-2.5 text-[14px] leading-[1.6]" style={{ color: "var(--ink3)" }}>
                    <span className="text-[8px] mt-[7px] shrink-0" style={{ color: "var(--ink5)" }}>●</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
