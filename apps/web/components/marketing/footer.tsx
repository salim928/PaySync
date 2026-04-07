import { LogoMark } from "@/components/ui/logo";

const footerLinks = {
  Product: ["WageNow — EWA", "How it works", "Pricing", "Security", "System status"],
  Developers: ["API documentation", "Payroll integration guide", "Webhooks", "Changelog"],
  Company: ["About", "Blog", "Careers", "Press"],
  Contact: ["hello@wagenow.com.gh", "+233 30 000 0000", "Airport City, Accra", "Schedule a demo"],
};

export function Footer() {
  return (
    <div style={{ background: "var(--ink)", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="section-padding" style={{ padding: "80px 52px 40px" }}>
        {/* Grid: brand + links */}
        <div
          className="grid gap-[100px] mb-16 max-[1080px]:grid-cols-1 max-[1080px]:gap-12"
          style={{ gridTemplateColumns: "300px 1fr" }}
        >
          {/* Brand column */}
          <div>
            <div className="flex items-center gap-[10px] font-semibold text-[16px] tracking-[-0.02em] text-white mb-4">
              <LogoMark size={30} />
              WageNow Ghana
            </div>
            <p className="text-[13px] leading-[1.7] mb-7" style={{ color: "rgba(255,255,255,0.35)" }}>
              Earned wage access for Ghana&apos;s formal workforce. Built on MoMo rails. Deployed in days, not months.
            </p>
            <div
              className="inline-flex items-center gap-[7px] rounded-lg px-[14px] py-2 text-[12px]"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "rgba(255,255,255,0.4)",
              }}
            >
              <span
                className="w-[6px] h-[6px] rounded-full"
                style={{ background: "var(--green3)", animation: "pls 2.4s ease-in-out infinite" }}
              />
              All systems operational
            </div>
          </div>

          {/* Links grid */}
          <div className="grid grid-cols-4 gap-8 max-[1080px]:grid-cols-2">
            {Object.entries(footerLinks).map(([heading, links]) => (
              <div key={heading}>
                <h4
                  className="text-[11px] font-bold tracking-[0.08em] uppercase mb-[18px]"
                  style={{ color: "rgba(255,255,255,0.25)" }}
                >
                  {heading}
                </h4>
                {links.map((link) => (
                  <a
                    key={link}
                    href="#"
                    className="block text-[13px] py-1 transition-colors duration-150 hover:!text-[rgba(255,255,255,0.8)]"
                    style={{ color: "rgba(255,255,255,0.4)" }}
                  >
                    {link}
                  </a>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="flex justify-between items-center pt-7"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div
            className="text-[12px] font-[family-name:var(--font-dm-mono)]"
            style={{ color: "rgba(255,255,255,0.2)" }}
          >
            © 2026 WageNow Ghana Ltd. · Built by Pactium.
          </div>
          <div className="flex gap-6">
            {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((item) => (
              <a
                key={item}
                href="#"
                className="text-[12px] transition-colors duration-150 hover:!text-[rgba(255,255,255,0.6)]"
                style={{ color: "rgba(255,255,255,0.25)" }}
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
