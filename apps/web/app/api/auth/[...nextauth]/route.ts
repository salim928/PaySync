import { NextRequest, NextResponse } from "next/server";

/**
 * Auth route handler — delegates to Supabase Auth.
 * 
 * In the WageNow architecture:
 * - Employer auth: Supabase Auth (email/password + TOTP via FastAPI)
 * - Employee auth: FastAPI OTP (phone SMS, no Supabase Auth)
 * 
 * This catch-all handles Supabase Auth callbacks (email confirmation,
 * password reset, OAuth if added later).
 */

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    // Exchange Supabase auth code for session
    const { createServerClient } = await import("@supabase/ssr");
    const response = NextResponse.redirect(new URL("/dashboard", request.url));

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    await supabase.auth.exchangeCodeForSession(code);
    return response;
  }

  return NextResponse.redirect(new URL("/login", request.url));
}

export async function POST(request: NextRequest) {
  // POST requests to auth — handle sign-out callback
  return NextResponse.json({ message: "Auth handler active" });
}
