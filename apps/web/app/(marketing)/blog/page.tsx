import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/marketing/page-header";

export const metadata: Metadata = {
  title: "Blog",
  description: "Insights on earned wage access, financial inclusion, and building payroll infrastructure.",
};

const posts = [
  {
    date: "2026-04-08",
    category: "Product",
    title: "Introducing employer analytics — see how your workforce uses EWA",
    excerpt: "The new analytics dashboard gives employers real-time visibility into withdrawal patterns, department-level trends, and peak usage times. Here's what you can learn from the data.",
    readTime: "4 min read",
  },
  {
    date: "2026-03-25",
    category: "Engineering",
    title: "How we achieve ~90 second disbursements",
    excerpt: "A technical deep-dive into our disbursement pipeline — from withdrawal request to wallet confirmation. Queue architecture, retry strategies, and network-specific optimisations.",
    readTime: "7 min read",
  },
  {
    date: "2026-03-12",
    category: "Industry",
    title: "The true cost of payday loans",
    excerpt: "Loan apps advertise convenience, but the APR tells a different story. We analysed 12 popular lending apps and compared their costs to earned wage access.",
    readTime: "5 min read",
  },
  {
    date: "2026-02-28",
    category: "Company",
    title: "Why we charge a flat fee — and always will",
    excerpt: "Percentage-based fees create perverse incentives. The more an employee withdraws, the more you earn. That's not aligned with the worker's interest. Here's why flat fees matter.",
    readTime: "3 min read",
  },
  {
    date: "2026-02-15",
    category: "Company",
    title: "Introducing WageNow — earned wage access for everyone",
    excerpt: "Today we're launching WageNow, a platform that gives the formal workforce real-time access to wages they've already earned. No loans, no interest, disbursed to mobile wallets in ~90 seconds.",
    readTime: "6 min read",
  },
];

const categoryColors: Record<string, { bg: string; color: string }> = {
  Product: { bg: "var(--green-bg)", color: "var(--green)" },
  Engineering: { bg: "#e8eaff", color: "#4a4ade" },
  Industry: { bg: "var(--gold-bg)", color: "var(--gold)" },
  Company: { bg: "var(--bg2)", color: "var(--ink3)" },
};

export default function BlogPage() {
  return (
    <>
      <PageHeader
        eyebrow="Blog"
        title={<>Thoughts on <em className="italic" style={{ color: "var(--green2)" }}>building</em> for the workforce</>}
        subtitle="Insights on earned wage access, financial inclusion, payroll infrastructure, and the engineering behind WageNow."
      />

      <section className="section-padding pb-[120px] max-[1080px]:pb-20">
        <div className="flex flex-col gap-6 max-w-[760px]">
          {posts.map((post) => {
            const cc = categoryColors[post.category] || categoryColors.Company;
            return (
              <article
                key={post.title}
                className="rounded-(--r-xl) p-8 transition-shadow hover:shadow-md"
                style={{ background: "var(--white)", border: "1px solid var(--border)" }}
              >
                <div className="flex items-center gap-3 mb-4 flex-wrap">
                  <span className="text-[12px] font-(family-name:--font-dm-mono)" style={{ color: "var(--ink4)" }}>
                    {post.date}
                  </span>
                  <span
                    className="text-[10px] font-bold tracking-[0.06em] uppercase px-2 py-0.5 rounded"
                    style={{ background: cc.bg, color: cc.color }}
                  >
                    {post.category}
                  </span>
                  <span className="text-[12px]" style={{ color: "var(--ink5)" }}>{post.readTime}</span>
                </div>
                <h2 className="text-[18px] font-medium tracking-[-0.02em] mb-2 leading-[1.3]" style={{ color: "var(--ink)" }}>
                  {post.title}
                </h2>
                <p className="text-[14px] leading-[1.7]" style={{ color: "var(--ink3)" }}>
                  {post.excerpt}
                </p>
              </article>
            );
          })}
        </div>
      </section>
    </>
  );
}
