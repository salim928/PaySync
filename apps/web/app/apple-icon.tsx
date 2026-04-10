import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          background: "#18160f",
          borderRadius: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg
          viewBox="0 0 20 20"
          width="106"
          height="106"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect x="2" y="2" width="7" height="7" rx="2" fill="white" opacity="0.95" />
          <rect x="11" y="2" width="7" height="7" rx="2" fill="white" opacity="0.4" />
          <rect x="2" y="11" width="7" height="7" rx="2" fill="white" opacity="0.4" />
          <rect x="11" y="11" width="7" height="7" rx="2" fill="#28c840" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
