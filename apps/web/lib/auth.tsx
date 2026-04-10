"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import type { User as SupabaseUser } from "@supabase/supabase-js";

/* ── Types ── */

interface AuthUser {
  sub: string;
  employer_id: string;
  role: "employer_admin" | "manager" | "employee";
  token: string;
  source: "supabase" | "custom_jwt";
}

interface AuthContextType {
  user: AuthUser | null;
  supabaseUser: SupabaseUser | null;
  loading: boolean;
  loginWithSupabase: (email: string, password: string) => Promise<void>;
  loginWithCustomJWT: (token: string) => void;
  signUpEmployer: (
    email: string,
    password: string,
    metadata?: Record<string, unknown>,
  ) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  supabaseUser: null,
  loading: true,
  loginWithSupabase: async () => {},
  loginWithCustomJWT: () => {},
  signUpEmployer: async () => {},
  logout: async () => {},
});

/* ── Helpers ── */

function parseJwt(token: string): Record<string, unknown> | null {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}

function setCookie(name: string, value: string, days: number) {
  document.cookie = `${name}=${value}; expires=${new Date(Date.now() + days * 864e5).toUTCString()}; path=/; SameSite=Lax`;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}

function getCookie(name: string): string | null {
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return m ? m[1] : null;
}

/**
 * Exchange a Supabase access token for a FastAPI JWT.
 *
 * The backend `/auth/token/exchange` endpoint:
 *  - decodes the Supabase token to get the user's email
 *  - looks up (or auto-creates) the Employer record
 *  - returns a FastAPI JWT with the correct employer_id
 */
async function exchangeForFastAPIToken(
  supabaseToken: string,
): Promise<string | null> {
  try {
    const res = await fetch("/api/v1/auth/token/exchange", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${supabaseToken}`,
      },
    });
    if (res.ok) {
      const data = await res.json();
      return data.access_token;
    }
  } catch {
    // Backend not reachable — caller handles fallback
  }
  return null;
}

/** Persist a FastAPI JWT and return the parsed AuthUser. */
function persistToken(token: string, source: AuthUser["source"]): AuthUser | null {
  const payload = parseJwt(token);
  if (!payload) return null;

  setCookie("wagenow_token", token, 1);
  localStorage.setItem("wagenow_token", token);

  return {
    sub: payload.sub as string,
    employer_id: payload.employer_id as string,
    role: payload.role as AuthUser["role"],
    token,
    source,
  };
}

/* ── Provider ── */

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  /* Restore session on mount */
  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    let mounted = true;

    const restoreSession = async () => {
      try {
        // 1. Check for existing Supabase session
        const {
          data: { session },
        } = (await supabase.auth.getSession()) as {
          data: {
            session: {
              user: SupabaseUser;
              access_token: string;
            } | null;
          };
        };

        if (!mounted) return;

        if (session?.user) {
          setSupabaseUser(session.user);

          // 2. Exchange Supabase token for FastAPI JWT
          const apiToken = await exchangeForFastAPIToken(session.access_token);
          if (!mounted) return;

          if (apiToken) {
            const authUser = persistToken(apiToken, "supabase");
            if (authUser) {
              setUser(authUser);
              setLoading(false);
              return;
            }
          }

          // 3. Fallback: use Supabase token directly (backend down)
          setCookie("wagenow_token", session.access_token, 1);
          localStorage.setItem("wagenow_token", session.access_token);
          setUser({
            sub: session.user.id,
            employer_id: session.user.id,
            role: "employer_admin",
            token: session.access_token,
            source: "supabase",
          });
        } else {
          // 4. Check for custom JWT (employee OTP login)
          const customToken = getCookie("wagenow_token");
          if (customToken) {
            const payload = parseJwt(customToken);
            if (
              payload &&
              typeof payload.exp === "number" &&
              payload.exp * 1000 > Date.now()
            ) {
              setUser({
                sub: payload.sub as string,
                employer_id: payload.employer_id as string,
                role: payload.role as AuthUser["role"],
                token: customToken,
                source: "custom_jwt",
              });
            } else {
              deleteCookie("wagenow_token");
              localStorage.removeItem("wagenow_token");
            }
          }
        }
      } catch {
        // Session restore failed — continue as logged out
      }

      if (mounted) setLoading(false);
    };

    restoreSession();

    // Listen for Supabase auth changes (sign-out, token refresh, etc.)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event: string, session: { user: SupabaseUser } | null) => {
        setSupabaseUser(session?.user ?? null);
        if (!session && !loading) {
          setUser(null);
          deleteCookie("wagenow_token");
          localStorage.removeItem("wagenow_token");
        }
      },
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  /* ── Employer login (Supabase) ── */
  const loginWithSupabase = useCallback(
    async (email: string, password: string) => {
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw new Error(error.message);

      setSupabaseUser(data.user);

      const supabaseToken = data.session?.access_token ?? "";

      // Exchange for FastAPI JWT (has correct employer_id)
      const apiToken = await exchangeForFastAPIToken(supabaseToken);
      if (apiToken) {
        const authUser = persistToken(apiToken, "supabase");
        if (authUser) {
          setUser(authUser);
          return;
        }
      }

      // Fallback: use Supabase token directly
      setCookie("wagenow_token", supabaseToken, 1);
      localStorage.setItem("wagenow_token", supabaseToken);
      setUser({
        sub: data.user.id,
        employer_id: data.user.id,
        role: "employer_admin",
        token: supabaseToken,
        source: "supabase",
      });
    },
    [],
  );

  /* ── Employer signup (Supabase + auto-provision via token exchange) ── */
  const signUpEmployer = useCallback(
    async (
      email: string,
      password: string,
      metadata?: Record<string, unknown>,
    ): Promise<void> => {
      const supabase = createSupabaseBrowserClient();

      // 1. Create Supabase Auth user with company metadata
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: metadata },
      });
      if (error) throw new Error(error.message);

      setSupabaseUser(data.user);

      // 2. If Supabase returned a session (email confirm disabled),
      //    exchange it for FastAPI JWT (auto-creates employer profile)
      const supabaseToken = data.session?.access_token;
      if (supabaseToken) {
        const apiToken = await exchangeForFastAPIToken(supabaseToken);
        if (apiToken) {
          const authUser = persistToken(apiToken, "supabase");
          if (authUser) {
            setUser(authUser);
            return;
          }
        }
      }

      // If no session yet (email confirmation required), user must confirm first
    },
    [],
  );

  /* ── Employee login (FastAPI custom JWT from OTP verify) ── */
  const loginWithCustomJWT = useCallback((token: string) => {
    const authUser = persistToken(token, "custom_jwt");
    if (!authUser) return;

    if (authUser.role === "employee") {
      localStorage.setItem("wagenow_employee_id", authUser.sub);
    }

    setUser(authUser);
  }, []);

  /* ── Logout ── */
  const logout = useCallback(async () => {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();

    deleteCookie("wagenow_token");
    localStorage.removeItem("wagenow_token");
    localStorage.removeItem("wagenow_employee_id");
    setUser(null);
    setSupabaseUser(null);
    window.location.href = "/";
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        supabaseUser,
        loading,
        loginWithSupabase,
        loginWithCustomJWT,
        signUpEmployer,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
