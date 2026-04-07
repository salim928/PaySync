"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogoMark } from "@/components/ui/logo";
import { useAuth } from "@/lib/auth";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: "📊" },
  { href: "/dashboard/employees", label: "Employees", icon: "👥" },
  { href: "/dashboard/payroll", label: "Payroll", icon: "📋" },
  { href: "/dashboard/analytics", label: "Analytics", icon: "📈" },
  { href: "/dashboard/settings", label: "Settings", icon: "⚙️" },
];

export default function EmployerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg)" }}>
        <div className="text-[14px]" style={{ color: "var(--ink3)" }}>Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen" style={{ background: "var(--bg)" }}>
      {/* Sidebar */}
      <aside
        className="w-65 shrink-0 flex flex-col p-6 max-[1080px]:hidden"
        style={{ background: "var(--white)", borderRight: "1px solid var(--border)" }}
      >
        <Link href="/" className="flex items-center gap-2.5 font-semibold text-[15px] tracking-[-0.02em] mb-10" style={{ color: "var(--ink)" }}>
          <LogoMark size={30} />
          WageNow
        </Link>

        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map((item) => {
            const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-(--r) text-[14px] font-medium transition-colors"
                style={{
                  background: active ? "var(--green-bg)" : "transparent",
                  color: active ? "var(--green)" : "var(--ink3)",
                }}
              >
                <span className="text-[16px]">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="pt-4" style={{ borderTop: "1px solid var(--border)" }}>
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold" style={{ background: "var(--bg2)", color: "var(--ink3)" }}>
              {user.sub.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-medium truncate" style={{ color: "var(--ink)" }}>{user.role}</div>
              <div className="text-[11px]" style={{ color: "var(--ink4)" }}>Admin</div>
            </div>
            <button
              onClick={() => logout()}
              className="text-[11px] font-medium px-2 py-1 rounded-(--r) cursor-pointer"
              style={{ color: "var(--ink4)", background: "var(--bg2)" }}
            >
              Log out
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 max-[1080px]:p-4 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
