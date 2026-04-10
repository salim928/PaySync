import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/marketing/page-header";

export const metadata: Metadata = {
  title: "How It Works",
  description: "See how WageNow integrates with your payroll in 5 days — from CSV upload to first employee withdrawal.",
};

const steps = [
  {
    number: "01",
    title: "Upload your payroll data",
    description: "Upload a CSV of your employee roster with names, phone numbers, departments, and gross salary. WageNow validates and imports in seconds.",
    detail: "Supports all major payroll export formats. One-time setup — subsequent months sync automatically via API.",
  },
  {
    number: "02",
    title: "Configure accrual rules",
    description: "Set the percentage of earned wages employees can access (typically 50%), any department-specific rules, and your pay cycle dates.",
    detail: "Accrual is calculated daily based on work days elapsed in the pay period. Configurable per department or role.",
  },
  {
    number: "03",
    title: "Employees access their wages",
    description: "Employees log in via the WageNow web app or WhatsApp to view their available balance and request a withdrawal to their MoMo wallet.",
    detail: "No app download needed. Phone number verification via OTP. Balance updates in real-time.",
  },
  {
    number: "04",
    title: "Instant MoMo disbursement",
    description: "Approved withdrawals are disbursed to the employee's Mobile Money wallet in approximately 90 seconds. All networks supported.",
    detail: "MTN MoMo, Vodafone Cash, and AirtelTigo Money. Flat GHS 3 fee per transaction, paid by the employee.",
  },
  {
    number: "05",
    title: "Automatic payroll deduction",
    description: "At the end of each pay cycle, WageNow generates a deduction report. Import it into your payroll system to adjust net salaries.",
    detail: "CSV export compatible with all payroll systems. Total amounts advanced are deducted before salary disbursement.",
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <PageHeader
        eyebrow="How it works"
        title={<>Live in <em className="italic" style={{ color: "var(--green2)" }}>5 days</em>, from signup to first withdrawal</>}
        subtitle="WageNow is designed to deploy fast. No IT project, no infrastructure changes, no payroll system migration. Upload a CSV and you're live."
      />

      <section className="section-padding pb-[120px] max-[1080px]:pb-20">
        <div className="flex flex-col gap-6">
          {steps.map((step, i) => (
            <div
              key={step.number}
              className="grid grid-cols-[80px_1fr] max-[1080px]:grid-cols-1 gap-8 rounded-(--r-xl) p-10 max-[1080px]:p-8"
              style={{ background: "var(--white)", border: "1px solid var(--border)" }}
            >
              <div
                className="text-[32px] font-(family-name:--font-fraunces) font-light"
                style={{ color: i === steps.length - 1 ? "var(--green2)" : "var(--ink5)" }}
              >
                {step.number}
              </div>
              <div>
                <h3 className="text-[20px] font-medium tracking-[-0.02em] mb-2" style={{ color: "var(--ink)" }}>
                  {step.title}
                </h3>
                <p className="text-[15px] leading-[1.75] mb-3" style={{ color: "var(--ink3)" }}>
                  {step.description}
                </p>
                <p className="text-[13px] leading-[1.7]" style={{ color: "var(--ink4)" }}>
                  {step.detail}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Link
            href="#contact"
            className="inline-flex items-center gap-2 text-[14px] font-semibold px-8 py-3.5 rounded-lg transition-opacity hover:opacity-90"
            style={{ background: "var(--ink)", color: "#fff" }}
          >
            Get started →
          </Link>
        </div>
      </section>
    </>
  );
}
