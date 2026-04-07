"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--bg)" }}>
      <div className="text-center max-w-100">
        <div className="text-[48px] mb-4">⚠️</div>
        <h2
          className="font-(family-name:--font-fraunces) text-[24px] font-light tracking-[-0.03em] mb-3"
          style={{ color: "var(--ink)" }}
        >
          Something went wrong
        </h2>
        <p className="text-[14px] mb-6" style={{ color: "var(--ink3)" }}>
          {error.message || "An unexpected error occurred. Please try again."}
        </p>
        <button
          onClick={reset}
          className="px-6 py-3 rounded-(--r) text-[14px] font-semibold cursor-pointer font-(family-name:--font-dm-sans)"
          style={{ background: "var(--ink)", color: "#fff" }}
        >
          Try again
        </button>
      </div>
    </div>
  );
}
