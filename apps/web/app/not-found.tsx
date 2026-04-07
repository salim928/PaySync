import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--bg)" }}>
      <div className="text-center max-w-100">
        <div
          className="font-(family-name:--font-fraunces) text-[120px] font-extralight tracking-[-0.05em] leading-none mb-4"
          style={{ color: "var(--border2)" }}
        >
          404
        </div>
        <h1
          className="font-(family-name:--font-fraunces) text-[24px] font-light tracking-[-0.03em] mb-3"
          style={{ color: "var(--ink)" }}
        >
          Page not found
        </h1>
        <p className="text-[14px] mb-8" style={{ color: "var(--ink3)" }}>
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex px-6 py-3 rounded-(--r) text-[14px] font-semibold font-(family-name:--font-dm-sans)"
          style={{ background: "var(--ink)", color: "#fff" }}
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
