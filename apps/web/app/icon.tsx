import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          background: "#18160f",
          borderRadius: 7,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg
          viewBox="0 0 20 20"
          width="19"
          height="19"
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
