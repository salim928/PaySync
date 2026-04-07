"use client";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="max-w-150 mx-auto py-20 text-center">
      <div className="text-[40px] mb-4">⚠️</div>
      <h2 className="font-(family-name:--font-fraunces) text-[22px] font-light tracking-[-0.03em] mb-3" style={{ color: "var(--ink)" }}>
        Dashboard error
      </h2>
      <p className="text-[14px] mb-6" style={{ color: "var(--ink3)" }}>
        {error.message || "Failed to load dashboard data."}
      </p>
      <button onClick={reset}
        className="px-6 py-3 rounded-(--r) text-[14px] font-semibold font-(family-name:--font-dm-sans)"
        style={{ background: "var(--ink)", color: "#fff" }}>
        Retry
      </button>
    </div>
  );
}
