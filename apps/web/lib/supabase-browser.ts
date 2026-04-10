import { createBrowserClient } from "@supabase/ssr";

let client: ReturnType<typeof createBrowserClient> | null = null;

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Debug: remove after auth works
console.log("[Supabase] URL loaded:", SUPABASE_URL ? `${SUPABASE_URL.slice(0, 30)}...` : "(empty)");
console.log("[Supabase] Key loaded:", SUPABASE_KEY ? `${SUPABASE_KEY.slice(0, 20)}...` : "(empty)");

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_KEY);

export function createSupabaseBrowserClient() {
  if (client) return client;

  if (!isSupabaseConfigured) {
    // Return a stub that won't crash — auth calls will simply fail gracefully
    return {
      auth: {
        getSession: async () => ({ data: { session: null }, error: null }),
        getUser: async () => ({ data: { user: null }, error: null }),
        signInWithPassword: async () => ({ data: { user: null, session: null }, error: { message: "Supabase not configured" } }),
        signUp: async () => ({ data: { user: null, session: null }, error: { message: "Supabase not configured" } }),
        signOut: async () => ({ error: null }),
        onAuthStateChange: (_cb: unknown) => ({ data: { subscription: { unsubscribe: () => {} } } }),
      },
    } as unknown as ReturnType<typeof createBrowserClient>;
  }

  client = createBrowserClient(SUPABASE_URL, SUPABASE_KEY);

  return client;
}
