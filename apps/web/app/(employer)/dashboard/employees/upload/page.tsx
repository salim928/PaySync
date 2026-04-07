"use client";

import { useState, useCallback } from "react";
import Link from "next/link";

interface PreviewEmployee {
  full_name: string;
  phone: string;
  momo_provider: string;
  monthly_salary: string;
  department: string | null;
  ewa_limit_pct: string;
}

interface ParseError {
  row: number;
  column: string;
  message: string;
}

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [preview, setPreview] = useState<PreviewEmployee[]>([]);
  const [errors, setErrors] = useState<ParseError[]>([]);
  const [stats, setStats] = useState({ total: 0, valid: 0 });
  const [step, setStep] = useState<"upload" | "preview" | "done">("upload");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState({ created: 0, skipped: 0 });

  const handleFile = useCallback(async (f: File) => {
    setFile(f);
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", f);
      const res = await fetch("/api/v1/employees/upload/preview", {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("wagenow_token") || ""}` },
        body: formData,
      });
      const data = await res.json();
      setPreview(data.preview || []);
      setErrors(data.errors || []);
      setStats({ total: data.total_rows, valid: data.valid_rows });
      setStep("preview");
    } catch {
      setErrors([{ row: 0, column: "", message: "Failed to parse CSV. Check the file format." }]);
      setStep("preview");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleConfirm = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/v1/employees/upload/confirm", {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("wagenow_token") || ""}` },
        body: formData,
      });
      const data = await res.json();
      setResult({ created: data.created, skipped: data.skipped });
      setStep("done");
    } catch {
      setErrors([{ row: 0, column: "", message: "Upload failed. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-200">
      <div className="mb-8">
        <Link href="/dashboard/employees" className="text-[13px] font-medium mb-3 inline-block" style={{ color: "var(--green)" }}>← Back to employees</Link>
        <h1 className="font-(family-name:--font-fraunces) text-[28px] font-light tracking-[-0.03em]" style={{ color: "var(--ink)" }}>Upload employees</h1>
        <p className="text-[14px] mt-1" style={{ color: "var(--ink3)" }}>Import employees from a CSV file</p>
      </div>

      {step === "upload" && (
        <div
          className="rounded-(--r-xl) p-12 text-center cursor-pointer transition-colors"
          style={{
            background: dragging ? "var(--green-bg)" : "var(--white)",
            border: `2px dashed ${dragging ? "var(--green3)" : "var(--border2)"}`,
          }}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
          onClick={() => { const input = document.createElement("input"); input.type = "file"; input.accept = ".csv"; input.onchange = (e) => { const f = (e.target as HTMLInputElement).files?.[0]; if (f) handleFile(f); }; input.click(); }}
        >
          <div className="text-[40px] mb-4">📄</div>
          <h3 className="font-(family-name:--font-fraunces) text-[20px] font-light tracking-[-0.02em] mb-2" style={{ color: "var(--ink)" }}>
            Drop your CSV file here
          </h3>
          <p className="text-[13px] mb-4" style={{ color: "var(--ink3)" }}>or click to browse. Max 5MB.</p>
          <p className="text-[11px] font-(family-name:--font-dm-mono)" style={{ color: "var(--ink4)" }}>
            Required columns: full_name, phone, monthly_salary
          </p>
        </div>
      )}

      {step === "preview" && (
        <div className="rounded-(--r-xl)" style={{ background: "var(--white)", border: "1px solid var(--border)" }}>
          <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border)" }}>
            <div>
              <h2 className="text-[16px] font-semibold" style={{ color: "var(--ink)" }}>Preview: {file?.name}</h2>
              <p className="text-[12px] mt-1" style={{ color: "var(--ink3)" }}>
                {stats.valid} valid of {stats.total} rows · {errors.length} errors
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setStep("upload"); setFile(null); setPreview([]); setErrors([]); }}
                className="px-4 py-2 rounded-(--r) text-[13px] font-medium font-(family-name:--font-dm-sans)"
                style={{ background: "var(--bg2)", color: "var(--ink)", border: "1px solid var(--border)" }}>
                Cancel
              </button>
              <button onClick={handleConfirm} disabled={loading || stats.valid === 0}
                className="px-5 py-2 rounded-(--r) text-[13px] font-semibold font-(family-name:--font-dm-sans) disabled:opacity-50"
                style={{ background: "var(--green)", color: "#fff" }}>
                {loading ? "Uploading..." : `Import ${stats.valid} employees →`}
              </button>
            </div>
          </div>

          {errors.length > 0 && (
            <div className="px-6 py-3" style={{ background: "#fef2f2", borderBottom: "1px solid #fecaca" }}>
              {errors.slice(0, 5).map((e, i) => (
                <div key={i} className="text-[12px] py-1" style={{ color: "#b83232" }}>
                  Row {e.row}: {e.column && `[${e.column}] `}{e.message}
                </div>
              ))}
              {errors.length > 5 && <div className="text-[12px] font-medium" style={{ color: "#b83232" }}>+{errors.length - 5} more errors</div>}
            </div>
          )}

          {preview.length > 0 && (
            <>
              <div className="grid px-6 py-2 text-[10px] font-bold tracking-[0.06em] uppercase" style={{ gridTemplateColumns: "1fr 100px 90px 70px", color: "var(--ink4)", borderBottom: "1px solid var(--border)" }}>
                <span>Name</span><span>Salary</span><span>Provider</span><span>Limit</span>
              </div>
              {preview.map((p) => (
                <div key={p.phone} className="grid px-6 py-2 text-[13px]" style={{ gridTemplateColumns: "1fr 100px 90px 70px", borderBottom: "1px solid var(--border)" }}>
                  <span style={{ color: "var(--ink)" }}>{p.full_name}</span>
                  <span className="font-(family-name:--font-dm-mono) text-[12px]" style={{ color: "var(--ink2)" }}>GHS {p.monthly_salary}</span>
                  <span className="text-[12px] uppercase" style={{ color: "var(--ink3)" }}>{p.momo_provider}</span>
                  <span className="text-[12px] font-(family-name:--font-dm-mono)" style={{ color: "var(--ink4)" }}>{p.ewa_limit_pct}%</span>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {step === "done" && (
        <div className="rounded-(--r-xl) p-12 text-center" style={{ background: "var(--white)", border: "1px solid var(--border)" }}>
          <div className="text-[48px] mb-4">✅</div>
          <h2 className="font-(family-name:--font-fraunces) text-[24px] font-light tracking-[-0.03em] mb-3" style={{ color: "var(--ink)" }}>
            Upload complete
          </h2>
          <p className="text-[14px] mb-6" style={{ color: "var(--ink3)" }}>
            {result.created} employees created · {result.skipped} skipped (already exist)
          </p>
          <Link href="/dashboard/employees"
            className="inline-flex px-6 py-3 rounded-(--r) text-[14px] font-medium font-(family-name:--font-dm-sans)"
            style={{ background: "var(--ink)", color: "#fff" }}>
            View employees →
          </Link>
        </div>
      )}
    </div>
  );
}
