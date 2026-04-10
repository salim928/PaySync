import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ size: string }> }
) {
  const { size: sizeStr } = await params;
  const size = parseInt(sizeStr, 10) || 192;
  const radius = Math.round(size * 0.22);
  const svgSize = Math.round(size * 0.59);

  return new ImageResponse(
    (
      <div
        style={{
          width: size,
          height: size,
          background: "#18160f",
          borderRadius: radius,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg
          viewBox="0 0 20 20"
          width={svgSize}
          height={svgSize}
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
    { width: size, height: size }
  );
}
