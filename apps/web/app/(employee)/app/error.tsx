"use client";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="py-16 text-center">
      <div className="text-[40px] mb-4">⚠️</div>
      <h2 className="font-(family-name:--font-fraunces) text-[20px] font-light tracking-[-0.03em] mb-3" style={{ color: "var(--ink)" }}>
        Something went wrong
      </h2>
      <p className="text-[13px] mb-6" style={{ color: "var(--ink3)" }}>
        {error.message || "Failed to load. Please try again."}
      </p>
      <button onClick={reset}
        className="px-5 py-3 rounded-(--r) text-[14px] font-semibold font-(family-name:--font-dm-sans)"
        style={{ background: "var(--ink)", color: "#fff" }}>
        Retry
      </button>
    </div>
  );
}
