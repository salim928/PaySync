"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

const tabs = [
  { href: "/app", label: "Home", icon: "🏠" },
  { href: "/app/withdraw", label: "Withdraw", icon: "💸" },
  { href: "/app/history", label: "History", icon: "📋" },
  { href: "/app/profile", label: "Profile", icon: "👤" },
];

export default function EmployeeAppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/employee-login");
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
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg)" }}>
      {/* Top bar */}
      <header className="flex items-center justify-between px-5 py-4 shrink-0" style={{ borderBottom: "1px solid var(--border)" }}>
        <span className="font-semibold text-[15px] tracking-[-0.02em]" style={{ color: "var(--ink)" }}>
          WageNow
        </span>
        <button
          onClick={() => logout()}
          className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold cursor-pointer"
          style={{ background: "var(--bg2)", color: "var(--ink3)", border: "none" }}
          title="Log out"
        >
          {user.sub.slice(0, 2).toUpperCase()}
        </button>
      </header>

      {/* Content */}
      <main className="flex-1 px-5 py-6 pb-24 max-w-120 mx-auto w-full">
        {children}
      </main>

      {/* Bottom nav */}
      <nav
        className="fixed bottom-0 left-0 right-0 flex items-center justify-around py-3 z-50"
        style={{ background: "var(--white)", borderTop: "1px solid var(--border)" }}
      >
        {tabs.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex flex-col items-center gap-1 px-3 py-1 rounded-lg transition-colors"
              style={{ color: active ? "var(--green)" : "var(--ink4)" }}
            >
              <span className="text-[18px]">{tab.icon}</span>
              <span className="text-[10px] font-semibold tracking-[0.04em]">{tab.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
