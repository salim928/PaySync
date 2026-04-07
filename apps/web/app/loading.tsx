export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg)" }}>
      <div className="flex flex-col items-center gap-4">
        <div
          className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: "var(--green3)", borderTopColor: "transparent" }}
        />
        <span className="text-[13px] font-medium" style={{ color: "var(--ink3)" }}>
          Loading...
        </span>
      </div>
    </div>
  );
}
