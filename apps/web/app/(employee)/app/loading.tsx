export default function AppLoading() {
  return (
    <div className="flex flex-col gap-4">
      <div className="h-5 w-32 rounded animate-pulse" style={{ background: "var(--bg3)" }} />
      <div className="h-7 w-48 rounded animate-pulse" style={{ background: "var(--bg2)" }} />
      <div className="rounded-(--r-xl) h-[180px] animate-pulse" style={{ background: "var(--bg3)" }} />
      <div className="rounded-(--r-lg) h-[52px] animate-pulse" style={{ background: "var(--bg2)" }} />
      <div className="rounded-(--r-lg) h-[240px] animate-pulse" style={{ background: "var(--bg2)", border: "1px solid var(--border)" }} />
    </div>
  );
}
