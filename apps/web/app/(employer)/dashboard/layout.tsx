"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogoMark } from "@/components/ui/logo";
import { useAuth } from "@/lib/auth";

/* ── SVG Icons ── */
const icons = {
  overview: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <rect x="11" y="2" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <rect x="2" y="11" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <rect x="11" y="11" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ),
  employees: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="7.5" cy="6" r="3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M2 16c0-2.5 2.5-4.5 5.5-4.5S13 13.5 13 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="14" cy="7" r="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M15.5 12.5c1.5.5 2.5 1.8 2.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  payroll: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="14" height="14" rx="3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7 7h6M7 10h6M7 13h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  analytics: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 17V10l4-3 4 5 6-9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="3" cy="17" r="1" fill="currentColor" />
      <circle cx="7" cy="7" r="1" fill="currentColor" />
      <circle cx="11" cy="12" r="1" fill="currentColor" />
      <circle cx="17" cy="3" r="1" fill="currentColor" />
    </svg>
  ),
  settings: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="10" cy="10" r="3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.22 4.22l1.42 1.42M14.36 14.36l1.42 1.42M15.78 4.22l-1.42 1.42M5.64 14.36l-1.42 1.42" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
};

const navItems = [
  { href: "/dashboard", label: "Overview", icon: icons.overview },
  { href: "/dashboard/employees", label: "Employees", icon: icons.employees },
  { href: "/dashboard/payroll", label: "Payroll", icon: icons.payroll },
  { href: "/dashboard/analytics", label: "Analytics", icon: icons.analytics },
  { href: "/dashboard/settings", label: "Settings", icon: icons.settings },
];

export default function EmployerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg)" }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-xl animate-pulse" style={{ background: "var(--bg3)" }} />
          <div className="text-[13px] font-medium" style={{ color: "var(--ink4)" }}>Loading WageNow...</div>
        </div>
      </div>
    );
  }

  const initials = user.sub.slice(0, 2).toUpperCase();

  return (
    <div className="flex min-h-screen" style={{ background: "var(--bg)" }}>
      {/* Mobile header */}
      <div className="hidden max-[1080px]:flex items-center justify-between px-4 py-3 fixed top-0 left-0 right-0 z-40"
        style={{ background: "var(--white)", borderBottom: "1px solid var(--border)" }}>
        <Link href="/" className="flex items-center gap-2 font-semibold text-[15px]" style={{ color: "var(--ink)" }}>
          <LogoMark size={28} />
          WageNow
        </Link>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 cursor-pointer" style={{ color: "var(--ink3)" }}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M4 6h14M4 11h14M4 16h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
        </button>
      </div>

      {/* Sidebar backdrop on mobile */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 hidden max-[1080px]:block" style={{ background: "rgba(0,0,0,0.3)" }} onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`w-64 shrink-0 flex flex-col fixed top-0 left-0 h-screen z-50 transition-transform duration-200 max-[1080px]:${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={{ background: "var(--white)", borderRight: "1px solid var(--border)", boxShadow: "1px 0 12px rgba(0,0,0,0.03)" }}
      >
        {/* Logo */}
        <div className="px-6 pt-7 pb-8">
          <Link href="/" className="flex items-center gap-2.5 font-semibold text-[15px] tracking-[-0.02em]" style={{ color: "var(--ink)" }}>
            <LogoMark size={30} />
            WageNow
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-0.5 px-3 flex-1">
          {navItems.map((item) => {
            const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13.5px] font-medium transition-all duration-150"
                style={{
                  background: active ? "var(--green)" : "transparent",
                  color: active ? "#fff" : "var(--ink3)",
                  boxShadow: active ? "0 2px 8px rgba(10,92,52,0.2)" : "none",
                }}
              >
                <span style={{ opacity: active ? 1 : 0.7 }}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Help link */}
        <div className="px-3 pb-2">
          <a href="mailto:support@wagenow.com.gh"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] transition-colors"
            style={{ color: "var(--ink4)" }}>
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" /><path d="M8 8a2 2 0 1 1 2.5 1.94c-.3.1-.5.37-.5.69V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /><circle cx="10" cy="14.5" r="0.75" fill="currentColor" /></svg>
            Help & Support
          </a>
        </div>

        {/* User profile */}
        <div className="mx-3 mb-4 p-3 rounded-xl" style={{ background: "var(--bg)" }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center text-[11px] font-bold tracking-wider"
              style={{ background: "var(--green)", color: "#fff" }}>
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-semibold truncate" style={{ color: "var(--ink)" }}>
                {user.role === "employer_admin" ? "Admin" : user.role}
              </div>
              <div className="text-[11px] truncate" style={{ color: "var(--ink4)" }}>Employer account</div>
            </div>
          </div>
          <button
            onClick={() => logout()}
            className="w-full mt-3 py-2 rounded-lg text-[12px] font-medium cursor-pointer transition-colors hover:bg-white/80"
            style={{ color: "var(--ink3)", background: "var(--white)", border: "1px solid var(--border)" }}
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-64 max-[1080px]:ml-0 max-[1080px]:pt-14">
        <div className="p-8 max-[1080px]:p-4">
          {children}
        </div>
      </main>
    </div>
  );
}
