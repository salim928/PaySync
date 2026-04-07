"use client";

import { useState } from "react";
import Link from "next/link";
import { useEmployees } from "@/lib/hooks";
import { apiFetch } from "@/lib/utils";

export default function EmployeesPage() {
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState({
    full_name: "", phone: "", momo_number: "", momo_provider: "mtn",
    monthly_salary: "", ewa_limit_pct: "50", department: "", start_date: new Date().toISOString().slice(0, 10),
  });

  const { data, isLoading, mutate } = useEmployees({
    search: search || undefined,
    department: deptFilter || undefined,
  });

  const employees = data?.employees ?? [];
  const total = data?.total ?? 0;

  // Extract unique departments from results
  const departments = [...new Set(employees.map((e) => e.department).filter(Boolean))] as string[];

  const updateForm = (key: string, val: string) => setForm((f) => ({ ...f, [key]: val }));

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError("");
    try {
      // Format phone to E.164
      let phone = form.phone.replace(/\s|-/g, "");
      if (phone.startsWith("0") && phone.length === 10) phone = `+233${phone.slice(1)}`;
      else if (!phone.startsWith("+")) phone = `+233${phone}`;

      // MoMo number should be 10 digits starting with 0
      let momo = form.momo_number.replace(/\s|-/g, "");
      if (!momo) momo = `0${phone.slice(4)}`; // Default to same as phone

      await apiFetch("/api/v1/employees", {
        method: "POST",
        body: JSON.stringify({
          full_name: form.full_name,
          phone,
          momo_number: momo,
          momo_provider: form.momo_provider,
          monthly_salary: form.monthly_salary,
          ewa_limit_pct: form.ewa_limit_pct,
          department: form.department || null,
          start_date: form.start_date,
        }),
      });
      setShowForm(false);
      setForm({ full_name: "", phone: "", momo_number: "", momo_provider: "mtn", monthly_salary: "", ewa_limit_pct: "50", department: "", start_date: new Date().toISOString().slice(0, 10) });
      mutate();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to add employee");
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="max-w-275">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-(family-name:--font-fraunces) text-[28px] font-light tracking-[-0.03em]" style={{ color: "var(--ink)" }}>Employees</h1>
          <p className="text-[14px] mt-1" style={{ color: "var(--ink3)" }}>{total} active employees</p>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard/employees/upload"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-(--r) text-[13px] font-medium font-(family-name:--font-dm-sans)"
            style={{ background: "var(--bg2)", color: "var(--ink)", border: "1px solid var(--border)" }}>
            📄 CSV upload
          </Link>
          <button onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-(--r) text-[13px] font-medium font-(family-name:--font-dm-sans) cursor-pointer"
            style={{ background: "var(--ink)", color: "#fff" }}>
            + Add employee
          </button>
        </div>
      </div>

      {/* Add employee form */}
      {showForm && (
        <div className="rounded-(--r-xl) p-6 mb-6" style={{ background: "var(--white)", border: "1px solid var(--border)" }}>
          <h2 className="font-(family-name:--font-fraunces) text-[18px] font-normal tracking-[-0.02em] mb-4" style={{ color: "var(--ink)" }}>Add new employee</h2>
          {formError && <div className="mb-4 p-3 rounded-(--r) text-[13px]" style={{ background: "#fef2f2", color: "#b83232", border: "1px solid #fecaca" }}>{formError}</div>}
          <form onSubmit={handleAddEmployee} className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold tracking-[0.06em] uppercase mb-1.5" style={{ color: "var(--ink4)" }}>Full name *</label>
              <input type="text" required value={form.full_name} onChange={(e) => updateForm("full_name", e.target.value)}
                className="w-full px-3 py-2.5 rounded-(--r) text-[13px] outline-none font-(family-name:--font-dm-sans)"
                style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--ink)" }} placeholder="Kwame Asante" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold tracking-[0.06em] uppercase mb-1.5" style={{ color: "var(--ink4)" }}>Phone number *</label>
              <input type="tel" required value={form.phone} onChange={(e) => updateForm("phone", e.target.value)}
                className="w-full px-3 py-2.5 rounded-(--r) text-[13px] outline-none font-(family-name:--font-dm-sans)"
                style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--ink)" }} placeholder="024 123 4567" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold tracking-[0.06em] uppercase mb-1.5" style={{ color: "var(--ink4)" }}>Monthly salary (GHS) *</label>
              <input type="number" required step="0.01" min="1" value={form.monthly_salary} onChange={(e) => updateForm("monthly_salary", e.target.value)}
                className="w-full px-3 py-2.5 rounded-(--r) text-[13px] outline-none font-(family-name:--font-dm-sans)"
                style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--ink)" }} placeholder="3500.00" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold tracking-[0.06em] uppercase mb-1.5" style={{ color: "var(--ink4)" }}>MoMo provider *</label>
              <select value={form.momo_provider} onChange={(e) => updateForm("momo_provider", e.target.value)}
                className="w-full px-3 py-2.5 rounded-(--r) text-[13px] outline-none font-(family-name:--font-dm-sans)"
                style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--ink)" }}>
                <option value="mtn">Network 1 (MoMo)</option>
                <option value="vodafone">Network 2 (MoMo)</option>
                <option value="airteltigo">Network 3 (MoMo)</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold tracking-[0.06em] uppercase mb-1.5" style={{ color: "var(--ink4)" }}>MoMo number</label>
              <input type="tel" value={form.momo_number} onChange={(e) => updateForm("momo_number", e.target.value)}
                className="w-full px-3 py-2.5 rounded-(--r) text-[13px] outline-none font-(family-name:--font-dm-sans)"
                style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--ink)" }} placeholder="0241234567 (defaults to phone)" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold tracking-[0.06em] uppercase mb-1.5" style={{ color: "var(--ink4)" }}>Department</label>
              <input type="text" value={form.department} onChange={(e) => updateForm("department", e.target.value)}
                className="w-full px-3 py-2.5 rounded-(--r) text-[13px] outline-none font-(family-name:--font-dm-sans)"
                style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--ink)" }} placeholder="Engineering" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold tracking-[0.06em] uppercase mb-1.5" style={{ color: "var(--ink4)" }}>EWA limit (%)</label>
              <input type="number" min="1" max="80" value={form.ewa_limit_pct} onChange={(e) => updateForm("ewa_limit_pct", e.target.value)}
                className="w-full px-3 py-2.5 rounded-(--r) text-[13px] outline-none font-(family-name:--font-dm-sans)"
                style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--ink)" }} />
            </div>
            <div>
              <label className="block text-[11px] font-semibold tracking-[0.06em] uppercase mb-1.5" style={{ color: "var(--ink4)" }}>Start date</label>
              <input type="date" value={form.start_date} onChange={(e) => updateForm("start_date", e.target.value)}
                className="w-full px-3 py-2.5 rounded-(--r) text-[13px] outline-none font-(family-name:--font-dm-sans)"
                style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--ink)" }} />
            </div>
            <div className="col-span-2 flex gap-3 justify-end pt-2">
              <button type="button" onClick={() => { setShowForm(false); setFormError(""); }}
                className="px-5 py-2.5 rounded-(--r) text-[13px] font-medium font-(family-name:--font-dm-sans) cursor-pointer"
                style={{ background: "var(--bg2)", color: "var(--ink)", border: "1px solid var(--border)" }}>Cancel</button>
              <button type="submit" disabled={formLoading}
                className="px-6 py-2.5 rounded-(--r) text-[13px] font-semibold font-(family-name:--font-dm-sans) cursor-pointer disabled:opacity-50"
                style={{ background: "var(--green)", color: "#fff" }}>
                {formLoading ? "Adding..." : "Add employee →"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <input type="text" placeholder="Search employees..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="flex-1 max-w-75 px-4 py-2.5 rounded-(--r) text-[13px] outline-none font-(family-name:--font-dm-sans)"
          style={{ background: "var(--white)", border: "1px solid var(--border)", color: "var(--ink)" }} />
        <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}
          className="px-4 py-2.5 rounded-(--r) text-[13px] outline-none font-(family-name:--font-dm-sans)"
          style={{ background: "var(--white)", border: "1px solid var(--border)", color: "var(--ink)" }}>
          <option value="">All departments</option>
          {departments.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="rounded-(--r-lg) overflow-hidden" style={{ background: "var(--white)", border: "1px solid var(--border)" }}>
        <div className="grid px-6 py-3 text-[10px] font-bold tracking-[0.06em] uppercase" style={{ gridTemplateColumns: "1fr 100px 100px 80px 80px", color: "var(--ink4)", borderBottom: "1px solid var(--border)" }}>
          <span>Employee</span><span>Department</span><span>Salary (GHS)</span><span>Provider</span><span>Status</span>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-[13px]" style={{ color: "var(--ink4)" }}>Loading employees...</div>
        ) : employees.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-[32px] mb-3">👥</div>
            <p className="text-[14px] font-medium mb-2" style={{ color: "var(--ink)" }}>No employees yet</p>
            <p className="text-[13px] mb-4" style={{ color: "var(--ink3)" }}>Upload a CSV to get started</p>
            <Link href="/dashboard/employees/upload" className="text-[13px] font-medium" style={{ color: "var(--green)" }}>Upload CSV →</Link>
          </div>
        ) : (
          employees.map((e) => (
            <Link key={e.id} href={`/dashboard/employees/${e.id}`}
              className="grid px-6 py-3 items-center hover:bg-(--bg) transition-colors cursor-pointer"
              style={{ gridTemplateColumns: "1fr 100px 100px 80px 80px", borderBottom: "1px solid var(--border)" }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold" style={{ background: "var(--bg2)", color: "var(--ink3)" }}>
                  {e.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </div>
                <div>
                  <div className="text-[13px] font-medium" style={{ color: "var(--ink)" }}>{e.full_name}</div>
                  <div className="text-[11px] font-(family-name:--font-dm-mono)" style={{ color: "var(--ink4)" }}>{e.phone}</div>
                </div>
              </div>
              <span className="text-[12px]" style={{ color: "var(--ink3)" }}>{e.department || "—"}</span>
              <span className="text-[12px] font-medium font-(family-name:--font-dm-mono)" style={{ color: "var(--ink)" }}>
                {parseFloat(e.monthly_salary).toLocaleString("en-GH", { minimumFractionDigits: 2 })}
              </span>
              <span className="text-[11px] uppercase" style={{ color: "var(--ink3)" }}>{e.momo_provider}</span>
              <span className="inline-flex text-[10px] font-semibold px-2 py-0.75 rounded-full w-fit"
                style={{ background: e.is_active ? "var(--green-bg)" : "var(--bg3)", color: e.is_active ? "var(--green)" : "var(--ink4)" }}>
                {e.is_active ? "Active" : "Inactive"}
              </span>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
