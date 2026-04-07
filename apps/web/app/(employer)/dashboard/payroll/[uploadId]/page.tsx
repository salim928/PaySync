"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import useSWR from "swr";
import { apiFetch } from "@/lib/utils";

interface PayrollUpload {
  id: string;
  employer_id: string;
  filename: string;
  pay_period: string;
  row_count: number;
  total_deductions: string;
  status: string;
  applied_at: string | null;
  created_at: string;
}

function fetcher<T>(path: string): Promise<T> {
  return apiFetch<T>(path);
}

export default function PayrollDetailPage() {
  const params = useParams();
  const uploadId = params.uploadId as string;

  // Fetch all uploads and find the matching one
  const { data: uploads, isLoading } = useSWR<PayrollUpload[]>(
    "/api/v1/employers/payroll-uploads",
    fetcher,
    { shouldRetryOnError: false, revalidateOnFocus: false }
  );

  const upload = uploads?.find((u) => u.id === uploadId);

  if (isLoading) {
    return (
      <div className="max-w-225">
        <Link href="/dashboard/payroll" className="text-[13px] font-medium mb-3 inline-block" style={{ color: "var(--green)" }}>← Back to payroll</Link>
        <div className="h-8 w-48 rounded mb-4 animate-pulse" style={{ background: "var(--bg3)" }} />
        <div className="rounded-(--r-xl) h-50 animate-pulse" style={{ background: "var(--bg2)" }} />
      </div>
    );
  }

  if (!upload) {
    return (
      <div className="max-w-225">
        <Link href="/dashboard/payroll" className="text-[13px] font-medium mb-3 inline-block" style={{ color: "var(--green)" }}>← Back to payroll</Link>
        <div className="py-16 text-center">
          <div className="text-[40px] mb-4">📋</div>
          <h2 className="font-(family-name:--font-fraunces) text-[22px] font-light mb-2" style={{ color: "var(--ink)" }}>Upload not found</h2>
          <p className="text-[13px]" style={{ color: "var(--ink3)" }}>This payroll upload may have been removed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-225">
      <Link href="/dashboard/payroll" className="text-[13px] font-medium mb-3 inline-block" style={{ color: "var(--green)" }}>← Back to payroll</Link>
      <h1 className="font-(family-name:--font-fraunces) text-[28px] font-light tracking-[-0.03em] mb-1" style={{ color: "var(--ink)" }}>Deduction report</h1>
      <p className="text-[14px] mb-8" style={{ color: "var(--ink3)" }}>Period: {upload.pay_period}</p>

      <div className="rounded-(--r-xl) p-6" style={{ background: "var(--white)", border: "1px solid var(--border)" }}>
        <div className="grid grid-cols-2 gap-6 mb-6">
          {[
            { label: "File", value: upload.filename },
            { label: "Pay period", value: upload.pay_period },
            { label: "Rows processed", value: String(upload.row_count) },
            { label: "Total deductions", value: `GHS ${parseFloat(upload.total_deductions).toLocaleString("en-GH", { minimumFractionDigits: 2 })}` },
            { label: "Status", value: upload.status === "applied" ? "Applied" : "Pending" },
            { label: "Applied at", value: upload.applied_at ? new Date(upload.applied_at).toLocaleDateString("en-GH", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "Not yet applied" },
            { label: "Created", value: new Date(upload.created_at).toLocaleDateString("en-GH", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) },
          ].map((r) => (
            <div key={r.label} className="flex justify-between py-2.5 text-[13px]" style={{ borderBottom: "1px solid var(--border)" }}>
              <span style={{ color: "var(--ink3)" }}>{r.label}</span>
              <span className="font-medium" style={{ color: "var(--ink)" }}>{r.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
