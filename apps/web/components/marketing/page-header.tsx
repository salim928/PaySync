export function PageHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: React.ReactNode;
  subtitle: string;
}) {
  return (
    <div className="section-padding pt-[140px] pb-20 max-[1080px]:pt-[120px] max-[1080px]:pb-14">
      <div className="eyebrow mb-5">
        <span className="inline-block w-6 h-px" style={{ background: "var(--ink4)" }} />
        {eyebrow}
      </div>
      <h1
        className="font-(family-name:--font-fraunces) font-light tracking-[-0.04em] leading-[1.06] mb-5"
        style={{ fontSize: "clamp(36px, 4.5vw, 60px)", color: "var(--ink)" }}
      >
        {title}
      </h1>
      <p className="text-[17px] leading-[1.75] max-w-[640px]" style={{ color: "var(--ink3)" }}>
        {subtitle}
      </p>
    </div>
  );
}
