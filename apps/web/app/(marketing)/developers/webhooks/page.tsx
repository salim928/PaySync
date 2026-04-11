import type { Metadata } from "next";
import { PageHeader } from "@/components/marketing/page-header";

export const metadata: Metadata = {
  title: "Webhooks",
  description: "Receive real-time notifications for WageNow events — withdrawals, disbursements, payroll uploads, and more.",
};

const events = [
  {
    name: "ewa.withdrawal.requested",
    description: "Fired when an employee submits a withdrawal request. Includes employee ID, amount, and wallet details.",
  },
  {
    name: "ewa.withdrawal.completed",
    description: "Fired when funds are successfully disbursed to the employee's mobile wallet. Includes transaction reference.",
  },
  {
    name: "ewa.withdrawal.failed",
    description: "Fired when a disbursement fails (e.g., invalid wallet number, network timeout). Includes failure reason.",
  },
  {
    name: "employee.created",
    description: "Fired when a new employee record is created — via dashboard, CSV upload, or API.",
  },
  {
    name: "employee.updated",
    description: "Fired when an employee record is modified — salary change, department transfer, or status change.",
  },
  {
    name: "payroll.upload.completed",
    description: "Fired when a CSV upload is confirmed and all employee records are created or updated.",
  },
  {
    name: "deduction.report.ready",
    description: "Fired at the end of a pay cycle when the deduction report is generated and ready for download.",
  },
];

const examplePayload = `{
  "event": "ewa.withdrawal.completed",
  "timestamp": "2026-04-10T14:32:00Z",
  "data": {
    "transaction_id": "txn_abc123",
    "employee_id": "emp_def456",
    "amount": 150.00,
    "fee": 3.00,
    "currency": "USD",
    "wallet_network": "mobile_money",
    "wallet_reference": "WLT-789012",
    "status": "completed"
  }
}`;

export default function WebhooksPage() {
  return (
    <>
      <PageHeader
        eyebrow="Developers"
        title={<>Real-time <em className="italic" style={{ color: "var(--green2)" }}>webhooks</em></>}
        subtitle="Subscribe to WageNow events and receive HTTP POST notifications to your endpoint in real-time. All payloads are signed with HMAC-SHA256 for verification."
      />

      <section className="section-padding pb-10">
        <div
          className="rounded-(--r-xl) p-8"
          style={{ background: "var(--ink)", color: "#fff" }}
        >
          <h3 className="text-[14px] font-semibold mb-4" style={{ color: "rgba(255,255,255,0.5)" }}>
            Example payload
          </h3>
          <pre
            className="text-[13px] leading-[1.7] font-(family-name:--font-dm-mono) overflow-x-auto"
            style={{ color: "var(--green3)" }}
          >
            {examplePayload}
          </pre>
        </div>
      </section>

      <section className="section-padding pb-[120px] max-[1080px]:pb-20">
        <h2
          className="font-(family-name:--font-fraunces) font-light tracking-[-0.03em] text-[28px] mb-8"
          style={{ color: "var(--ink)" }}
        >
          Available events
        </h2>
        <div className="rounded-(--r-xl) overflow-hidden" style={{ border: "1px solid var(--border)" }}>
          {events.map((ev, i) => (
            <div
              key={ev.name}
              className="flex items-start gap-6 px-6 py-5 max-[1080px]:flex-col max-[1080px]:gap-2"
              style={{
                background: "var(--white)",
                borderBottom: i < events.length - 1 ? "1px solid var(--border)" : "none",
              }}
            >
              <code
                className="text-[13px] font-(family-name:--font-dm-mono) shrink-0 min-w-[280px] max-[1080px]:min-w-0"
                style={{ color: "var(--ink)" }}
              >
                {ev.name}
              </code>
              <p className="text-[13px] leading-[1.6]" style={{ color: "var(--ink3)" }}>
                {ev.description}
              </p>
            </div>
          ))}
        </div>

        <div
          className="mt-10 rounded-(--r-xl) p-8"
          style={{ background: "var(--white)", border: "1px solid var(--border)" }}
        >
          <h3 className="text-[17px] font-medium tracking-[-0.02em] mb-3" style={{ color: "var(--ink)" }}>
            Signature verification
          </h3>
          <p className="text-[14px] leading-[1.7] mb-4" style={{ color: "var(--ink3)" }}>
            Every webhook request includes a <code className="font-(family-name:--font-dm-mono) text-[13px]" style={{ color: "var(--ink2)" }}>X-WageNow-Signature</code> header
            containing an HMAC-SHA256 hash of the request body using your webhook secret. Always verify this signature before processing the event.
          </p>
          <p className="text-[13px] leading-[1.6]" style={{ color: "var(--ink4)" }}>
            Webhook secret is available in your dashboard under Settings → Webhooks. Rotate it anytime — active deliveries will use the new secret immediately.
          </p>
        </div>
      </section>
    </>
  );
}
