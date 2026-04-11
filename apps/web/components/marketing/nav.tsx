"use client";

import Link from "next/link";
import { LogoMark } from "@/components/ui/logo";

export function Nav() {
  return (
    <nav
      className="fixed top-0 left-0 right-0 z-500 flex items-center px-13 max-[1080px]:px-8"
      style={{
        height: "var(--nav-h)",
        background: "rgba(245,242,235,0.86)",
        backdropFilter: "blur(28px) saturate(1.6)",
        WebkitBackdropFilter: "blur(28px) saturate(1.6)",
        borderBottom: "1px solid rgba(221,215,203,0.6)",
        transition: "background 0.3s",
      }}
    >
      {/* Logo */}
      <Link
        href="/"
        className="flex items-center gap-2.75 mr-auto font-semibold text-[16px] tracking-[-0.02em]"
        style={{ color: "var(--ink)" }}
      >
        <LogoMark size={34} />
        WageNow
      </Link>

      {/* Center links */}
      <div className="hidden md:flex items-center gap-0.5 absolute left-1/2 -translate-x-1/2">
        {[
          { href: "#product", label: "Product" },
          { href: "#features", label: "Features" },
          { href: "#pricing", label: "Pricing" },
          { href: "#testi", label: "Customers" },
          { href: "#contact", label: "Contact" },
        ].map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="text-[13.5px] font-normal px-3.5 py-1.5 rounded-md transition-colors duration-150"
            style={{ color: "var(--ink3)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--ink)";
              e.currentTarget.style.background = "var(--bg3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--ink3)";
              e.currentTarget.style.background = "transparent";
            }}
          >
            {link.label}
          </a>
        ))}
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        <Link
          href="/employee-login"
          className="hidden sm:block text-[13.5px] font-normal px-3.5 py-1.5 rounded-md transition-colors duration-150 font-(family-name:--font-dm-sans)"
          style={{ color: "var(--ink3)", background: "none", border: "none" }}
        >
          Employee
        </Link>
        <Link
          href="/login"
          className="hidden sm:block text-[13.5px] font-normal px-3.5 py-1.5 rounded-md transition-colors duration-150 font-(family-name:--font-dm-sans)"
          style={{ color: "var(--ink3)", background: "none", border: "none" }}
        >
          Employer sign in
        </Link>
        <a
          href="#contact"
          className="inline-flex items-center gap-1.75 text-[13.5px] font-medium px-5 py-2 rounded-lg border-none cursor-pointer transition-opacity duration-150 hover:opacity-[0.82] active:scale-[0.98] font-(family-name:--font-dm-sans)"
          style={{
            background: "var(--ink)",
            color: "#fff",
            letterSpacing: "-0.01em",
          }}
        >
          Request access <span className="text-[13px] transition-transform duration-200 group-hover:translate-x-0.5">→</span>
        </a>
      </div>
    </nav>
  );
}
