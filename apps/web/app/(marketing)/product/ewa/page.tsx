import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/marketing/page-header";

export const metadata: Metadata = {
  title: "Earned Wage Access",
  description: "Give employees real-time access to wages they've already earned. No loans, no interest — disbursed to MoMo in ~90 seconds.",
};

const benefits = [
  {
    icon: "01",
    title: "Instant access to earned wages",
    body: "Employees can withdraw a percentage of wages already accrued at any point in the pay cycle. No waiting for month-end. No paperwork.",
  },
  {
    icon: "02",
    title: "GHS 3 flat fee per withdrawal",
    body: "No interest, no percentage of salary, no hidden charges. The lowest cost financial access product in Ghana — cheaper than any loan app or bank overdraft.",
  },
  {
    icon: "03",
    title: "MoMo disbursement in ~90 seconds",
    body: "Funds hit the employee's Mobile Money wallet in about 90 seconds. All networks supported — MTN, Vodafone Cash, AirtelTigo Money.",
  },
  {
    icon: "04",
    title: "Zero risk for employers",
    body: "WageNow only advances wages already earned. Automatic payroll deduction means employers carry zero credit risk and zero admin burden.",
  },
  {
    icon: "05",
    title: "No app download required",
    body: "Employees access WageNow through a progressive web app or WhatsApp. No friction, no app store, no compatibility issues.",
  },
  {
    icon: "06",
    title: "Automatic payroll reconciliation",
    body: "At pay cycle end, WageNow generates a deduction report. Import it into your payroll system and net salaries are adjusted automatically.",
  },
];

export default function EWAPage() {
  return (
    <>
      <PageHeader
        eyebrow="Product"
        title={<>Earned wage access for <em className="italic" style={{ color: "var(--green2)" }}>Ghana&apos;s</em> workforce</>}
        subtitle="WageNow lets employees withdraw a portion of their already-earned salary at any time during the pay cycle — disbursed to Mobile Money in about 90 seconds, for a flat GHS 3 fee."
      />

      <section className="section-padding pb-[120px] max-[1080px]:pb-20">
        <div className="grid grid-cols-3 max-[1080px]:grid-cols-1 gap-5">
          {benefits.map((b) => (
            <div
              key={b.icon}
              className="rounded-(--r-xl) p-8"
              style={{ background: "var(--white)", border: "1px solid var(--border)" }}
            >
              <div
                className="w-10 h-10 rounded-(--r) flex items-center justify-center text-[13px] font-semibold mb-5 font-(family-name:--font-dm-mono)"
                style={{ background: "var(--green-bg)", color: "var(--green)" }}
              >
                {b.icon}
              </div>
              <h3 className="text-[17px] font-medium tracking-[-0.02em] mb-2" style={{ color: "var(--ink)" }}>
                {b.title}
              </h3>
              <p className="text-[14px] leading-[1.7]" style={{ color: "var(--ink3)" }}>
                {b.body}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Link
            href="#contact"
            className="inline-flex items-center gap-2 text-[14px] font-semibold px-8 py-3.5 rounded-lg transition-opacity hover:opacity-90"
            style={{ background: "var(--ink)", color: "#fff" }}
          >
            Request access →
          </Link>
        </div>
      </section>
    </>
  );
}
