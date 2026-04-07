import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * MoMo webhook proxy — receives Hubtel callbacks, forwards to FastAPI.
 * 
 * HMAC-SHA256 verification happens in FastAPI (services/payments/webhook_validator.py).
 * This route handler passes through the raw body and signature header.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("X-Hubtel-Signature") || "";

    // Forward to FastAPI webhook handler
    const response = await fetch(`${API_URL}/webhooks/momo/callback`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Hubtel-Signature": signature,
        "X-Forwarded-For": request.headers.get("x-forwarded-for") || "",
      },
      body,
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("MoMo webhook proxy error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 502 }
    );
  }
}
