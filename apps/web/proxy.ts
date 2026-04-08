import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const EMPLOYER_PROTECTED = ["/dashboard"];
const EMPLOYEE_PROTECTED = ["/app"];
const AUTH_PAGES = ["/login", "/register", "/employee-login"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isEmployerRoute = EMPLOYER_PROTECTED.some((p) => pathname.startsWith(p));
  const isEmployeeRoute = EMPLOYEE_PROTECTED.some((p) => pathname.startsWith(p));
  const isAuthPage = AUTH_PAGES.some((p) => pathname.startsWith(p));

  if (!isEmployerRoute && !isEmployeeRoute && !isAuthPage) {
    return NextResponse.next();
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";

  // If Supabase is not configured, allow all requests through
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.next();
  }

  // Create a response to pass to Supabase (it needs to set cookies)
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session — this is required for Supabase SSR to work
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Also check for our custom FastAPI JWT as fallback
  // (employee OTP login goes through FastAPI, not Supabase Auth)
  const customToken = request.cookies.get("wagenow_token")?.value;

  if (!user && !customToken) {
    if (isEmployerRoute) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (isEmployeeRoute) {
      return NextResponse.redirect(new URL("/employee-login", request.url));
    }
  }

  // Redirect logged-in users away from auth pages
  if ((user || customToken) && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/dashboard/:path*", "/app/:path*", "/login", "/register", "/employee-login"],
};
