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
  signUpEmployer: (email: string, password: string, metadata?: Record<string, unknown>) => Promise<string>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  supabaseUser: null,
  loading: true,
  loginWithSupabase: async () => {},
  loginWithCustomJWT: () => {},
  signUpEmployer: async () => "",
  logout: async () => {},
});

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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    let mounted = true;

    const restoreSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession() as { data: { session: { user: SupabaseUser; access_token: string } | null } };

        if (!mounted) return;

        if (session?.user) {
          setSupabaseUser(session.user);

          // Try to get FastAPI JWT, fall back to Supabase token
          const apiToken = await fetchFastAPIToken(session.access_token);

          if (!mounted) return;

          if (apiToken) {
            const payload = parseJwt(apiToken);
            if (payload) {
              setCookie("wagenow_token", apiToken, 1);
              localStorage.setItem("wagenow_token", apiToken);
              setUser({
                sub: payload.sub as string,
                employer_id: payload.employer_id as string,
                role: payload.role as AuthUser["role"],
                token: apiToken,
                source: "supabase",
              });
              setLoading(false);
              return;
            }
          }

          // Fallback: use Supabase session directly
          const token = session.access_token;
          setCookie("wagenow_token", token, 1);
          localStorage.setItem("wagenow_token", token);
          setUser({
            sub: session.user.id,
            employer_id: session.user.id,
            role: "employer_admin",
            token,
            source: "supabase",
          });
        } else {
          // Check for custom JWT (employee OTP login)
          const customToken = getCookie("wagenow_token");
          if (customToken) {
            const payload = parseJwt(customToken);
            if (payload && typeof payload.exp === "number" && payload.exp * 1000 > Date.now()) {
              setUser({
                sub: payload.sub as string,
                employer_id: payload.employer_id as string,
                role: payload.role as AuthUser["role"],
                token: customToken,
                source: "custom_jwt",
              });
            } else {
              deleteCookie("wagenow_token");
            }
          }
        }
      } catch {
        // Session restore failed — continue as logged out
      }

      if (mounted) setLoading(false);
    };

    restoreSession();

    // Listen for auth state changes (ignore during initial load)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: string, session: { user: SupabaseUser } | null) => {
      setSupabaseUser(session?.user ?? null);
      // Only clear user on explicit sign-out, not during initial load
      if (!session && !loading) {
        setUser(null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Exchange Supabase token for FastAPI JWT
  const fetchFastAPIToken = async (supabaseToken: string): Promise<string | null> => {
    try {
      const res = await fetch("/api/v1/auth/employer/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Supabase-Token": supabaseToken,
        },
        body: JSON.stringify({ supabase_token: supabaseToken }),
      });
      if (res.ok) {
        const data = await res.json();
        return data.access_token;
      }
    } catch {
      // Token exchange failed — user will need to log in manually
    }
    return null;
  };

  const loginWithSupabase = useCallback(async (email: string, password: string) => {
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);

    setSupabaseUser(data.user);

    // Try to get FastAPI JWT for API calls (optional — backend may not be running)
    try {
      const res = await fetch("/api/v1/auth/employer/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        const apiData = await res.json();
        const payload = parseJwt(apiData.access_token);
        if (payload) {
          setCookie("wagenow_token", apiData.access_token, 1);
          localStorage.setItem("wagenow_token", apiData.access_token);
          setUser({
            sub: payload.sub as string,
            employer_id: payload.employer_id as string,
            role: payload.role as AuthUser["role"],
            token: apiData.access_token,
            source: "supabase",
          });
          return;
        }
      }
    } catch {
      // FastAPI backend not available — fall through to Supabase-only auth
    }

    // Fallback: use Supabase session directly (no FastAPI token)
    const supabaseToken = data.session?.access_token ?? "";
    setCookie("wagenow_token", supabaseToken, 1);
    localStorage.setItem("wagenow_token", supabaseToken);
    setUser({
      sub: data.user.id,
      employer_id: data.user.id,
      role: "employer_admin",
      token: supabaseToken,
      source: "supabase",
    });
  }, []);

  const signUpEmployer = useCallback(async (
    email: string,
    password: string,
    metadata?: Record<string, unknown>
  ): Promise<string> => {
    const supabase = createSupabaseBrowserClient();

    // 1. Create Supabase Auth user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: metadata },
    });
    if (error) throw new Error(error.message);

    setSupabaseUser(data.user);

    // 2. Return the Supabase user ID for linking to employer record
    return data.user?.id || "";
  }, []);

  const loginWithCustomJWT = useCallback((token: string) => {
    const payload = parseJwt(token);
    if (!payload) return;

    setCookie("wagenow_token", token, 1);
    localStorage.setItem("wagenow_token", token);

    if (payload.role === "employee") {
      localStorage.setItem("wagenow_employee_id", payload.sub as string);
    }

    setUser({
      sub: payload.sub as string,
      employer_id: payload.employer_id as string,
      role: payload.role as AuthUser["role"],
      token,
      source: "custom_jwt",
    });
  }, []);

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
    <AuthContext.Provider value={{
      user,
      supabaseUser,
      loading,
      loginWithSupabase,
      loginWithCustomJWT,
      signUpEmployer,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
