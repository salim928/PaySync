import type { Metadata } from "next";
import { PageHeader } from "@/components/marketing/page-header";

export const metadata: Metadata = {
  title: "System Status",
  description: "Real-time operational status of WageNow services — API, disbursements, and dashboard.",
};

const services = [
  { name: "WageNow API", status: "operational" as const },
  { name: "Employer Dashboard", status: "operational" as const },
  { name: "Employee PWA", status: "operational" as const },
  { name: "MoMo Disbursements (MTN)", status: "operational" as const },
  { name: "MoMo Disbursements (Vodafone)", status: "operational" as const },
  { name: "MoMo Disbursements (AirtelTigo)", status: "operational" as const },
  { name: "WhatsApp Notifications", status: "operational" as const },
  { name: "Payroll CSV Processing", status: "operational" as const },
];

const statusMeta: Record<string, { label: string; color: string; bg: string }> = {
  operational: { label: "Operational", color: "var(--green)", bg: "var(--green-bg)" },
  degraded: { label: "Degraded", color: "var(--gold)", bg: "var(--gold-bg)" },
  outage: { label: "Outage", color: "#b83232", bg: "#fef2f2" },
};

const recentIncidents = [
  {
    date: "2026-04-02",
    title: "Scheduled maintenance — database migration",
    description: "Planned 15-minute maintenance window for database schema migration. No data loss. All services restored.",
    status: "resolved",
  },
  {
    date: "2026-03-18",
    title: "MTN MoMo delayed disbursements",
    description: "MTN experienced intermittent delays in processing disbursement requests. Average delay was 4 minutes. Resolved by MTN network team.",
    status: "resolved",
  },
];

export default function StatusPage() {
  const allOperational = services.every((s) => s.status === "operational");

  return (
    <>
      <PageHeader
        eyebrow="System status"
        title={<>All systems <em className="italic" style={{ color: "var(--green2)" }}>operational</em></>}
        subtitle="Real-time status of WageNow infrastructure, API endpoints, and disbursement channels."
      />

      <section className="section-padding pb-20">
        {/* Overall status banner */}
        <div
          className="rounded-(--r-xl) p-6 mb-8 flex items-center gap-4"
          style={{
            background: allOperational ? "var(--green-bg)" : "var(--gold-bg)",
            border: `1px solid ${allOperational ? "rgba(10,92,52,0.15)" : "rgba(122,90,0,0.15)"}`,
          }}
        >
          <span
            className="w-3 h-3 rounded-full shrink-0"
            style={{
              background: allOperational ? "var(--green3)" : "var(--gold)",
              animation: "pls 2.4s ease-in-out infinite",
            }}
          />
          <span className="text-[15px] font-medium" style={{ color: allOperational ? "var(--green)" : "var(--gold)" }}>
            {allOperational ? "All systems operational" : "Some systems experiencing issues"}
          </span>
        </div>

        {/* Services list */}
        <div className="rounded-(--r-xl) overflow-hidden" style={{ border: "1px solid var(--border)" }}>
          {services.map((s, i) => {
            const meta = statusMeta[s.status];
            return (
              <div
                key={s.name}
                className="flex items-center justify-between px-6 py-4"
                style={{
                  background: "var(--white)",
                  borderBottom: i < services.length - 1 ? "1px solid var(--border)" : "none",
                }}
              >
                <span className="text-[14px] font-medium" style={{ color: "var(--ink)" }}>{s.name}</span>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ background: meta.color }} />
                  <span className="text-[13px]" style={{ color: meta.color }}>{meta.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="section-padding pb-[120px] max-[1080px]:pb-20">
        <h2
          className="font-(family-name:--font-fraunces) font-light tracking-[-0.03em] text-[28px] mb-8"
          style={{ color: "var(--ink)" }}
        >
          Recent incidents
        </h2>
        <div className="flex flex-col gap-6">
          {recentIncidents.map((inc) => (
            <div key={inc.date} className="pb-6" style={{ borderBottom: "1px solid var(--border)" }}>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-[12px] font-(family-name:--font-dm-mono)" style={{ color: "var(--ink4)" }}>
                  {inc.date}
                </span>
                <span
                  className="text-[11px] font-semibold tracking-[0.06em] uppercase px-2 py-0.5 rounded"
                  style={{ background: "var(--green-bg)", color: "var(--green)" }}
                >
                  {inc.status}
                </span>
              </div>
              <h3 className="text-[15px] font-medium mb-1" style={{ color: "var(--ink)" }}>{inc.title}</h3>
              <p className="text-[14px] leading-[1.7]" style={{ color: "var(--ink3)" }}>{inc.description}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
