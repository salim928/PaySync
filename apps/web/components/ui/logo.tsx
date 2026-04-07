export function LogoMark({ size = 34 }: { size?: number }) {
  return (
    <div
      className="flex items-center justify-center shrink-0"
      style={{
        width: size,
        height: size,
        background: "var(--ink)",
        borderRadius: 9,
      }}
    >
      <svg
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: size * 0.59, height: size * 0.59 }}
      >
        <rect x="2" y="2" width="7" height="7" rx="2" fill="white" opacity="0.95" />
        <rect x="11" y="2" width="7" height="7" rx="2" fill="white" opacity="0.4" />
        <rect x="2" y="11" width="7" height="7" rx="2" fill="white" opacity="0.4" />
        <rect x="11" y="11" width="7" height="7" rx="2" fill="#28c840" />
      </svg>
    </div>
  );
}
