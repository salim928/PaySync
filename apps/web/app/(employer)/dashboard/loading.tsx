export default function DashboardLoading() {
  return (
    <div className="max-w-275">
      <div className="h-8 w-48 rounded mb-2 animate-pulse" style={{ background: "var(--bg3)" }} />
      <div className="h-4 w-72 rounded mb-8 animate-pulse" style={{ background: "var(--bg2)" }} />
      <div className="grid grid-cols-4 max-[1080px]:grid-cols-2 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-(--r-lg) p-5 h-[120px] animate-pulse" style={{ background: "var(--bg2)", border: "1px solid var(--border)" }} />
        ))}
      </div>
      <div className="rounded-(--r-lg) h-[400px] animate-pulse" style={{ background: "var(--bg2)", border: "1px solid var(--border)" }} />
    </div>
  );
}
