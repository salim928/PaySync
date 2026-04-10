import type { Metadata } from "next";
import { PageHeader } from "@/components/marketing/page-header";

export const metadata: Metadata = {
  title: "Payroll Integration Guide",
  description: "Step-by-step guide to integrating WageNow with your existing payroll system — CSV, API, or direct HRIS connection.",
};

const methods = [
  {
    title: "CSV Upload",
    difficulty: "Easiest",
    time: "30 minutes",
    description: "Upload your payroll data as a CSV file through the WageNow dashboard. Best for companies with fewer than 250 employees or those using payroll software that exports to CSV.",
    steps: [
      "Export your employee roster from your payroll system as CSV",
      "Log in to the WageNow employer dashboard",
      "Navigate to Employees → Upload and select your file",
      "Review the preview — WageNow validates names, phone numbers, and salaries",
      "Confirm the upload to create employee records",
      "At pay cycle end, download the deduction report CSV and import it back into payroll",
    ],
  },
  {
    title: "REST API Integration",
    difficulty: "Moderate",
    time: "1–3 days",
    description: "Use the WageNow REST API to programmatically sync employee data and retrieve deduction reports. Best for companies with custom payroll systems or development resources.",
    steps: [
      "Generate an API token from the WageNow dashboard (Settings → API)",
      "Use POST /api/v1/employees to create employee records from your payroll system",
      "Sync salary changes with PATCH /api/v1/employees/:id as they occur",
      "At pay cycle end, call GET /api/v1/employers/deductions/export to retrieve the deduction CSV",
      "Import the deduction CSV into your payroll run before disbursement",
      "Optionally, set up webhooks to receive real-time withdrawal notifications",
    ],
  },
  {
    title: "Direct HRIS Integration",
    difficulty: "Enterprise",
    time: "1–2 weeks",
    description: "For Enterprise customers, WageNow can integrate directly with your HR Information System (HRIS) for fully automated bidirectional sync. No manual CSV uploads, no API calls.",
    steps: [
      "Contact WageNow sales to discuss your HRIS platform",
      "Our team configures the connector for your specific system",
      "Employee data syncs automatically when changes are made in your HRIS",
      "Deductions are written back to your payroll module automatically",
      "WageNow monitors sync health and alerts you to any issues",
      "Quarterly review calls to optimise accrual rules and usage",
    ],
  },
];

export default function IntegrationGuidePage() {
  return (
    <>
      <PageHeader
        eyebrow="Developers"
        title={<>Payroll <em className="italic" style={{ color: "var(--green2)" }}>integration</em> guide</>}
        subtitle="Choose the integration method that fits your team. From a 30-minute CSV upload to a fully automated HRIS connection — WageNow meets you where you are."
      />

      <section className="section-padding pb-[120px] max-[1080px]:pb-20">
        <div className="flex flex-col gap-8">
          {methods.map((m) => (
            <div
              key={m.title}
              className="rounded-(--r-xl) p-10 max-[1080px]:p-8"
              style={{ background: "var(--white)", border: "1px solid var(--border)" }}
            >
              <div className="flex items-center gap-3 mb-5 flex-wrap">
                <h3 className="text-[20px] font-medium tracking-[-0.02em]" style={{ color: "var(--ink)" }}>
                  {m.title}
                </h3>
                <span
                  className="text-[11px] font-semibold tracking-[0.06em] uppercase px-2.5 py-1 rounded-full"
                  style={{ background: "var(--green-bg)", color: "var(--green)" }}
                >
                  {m.difficulty}
                </span>
                <span
                  className="text-[11px] font-(family-name:--font-dm-mono)"
                  style={{ color: "var(--ink4)" }}
                >
                  ~{m.time}
                </span>
              </div>
              <p className="text-[15px] leading-[1.75] mb-6 max-w-[680px]" style={{ color: "var(--ink3)" }}>
                {m.description}
              </p>
              <div className="flex flex-col gap-3">
                {m.steps.map((step, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span
                      className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-semibold shrink-0 mt-px font-(family-name:--font-dm-mono)"
                      style={{ background: "var(--bg2)", color: "var(--ink4)" }}
                    >
                      {i + 1}
                    </span>
                    <p className="text-[14px] leading-[1.6]" style={{ color: "var(--ink2)" }}>
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
