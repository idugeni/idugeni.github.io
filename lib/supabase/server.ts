import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { cache } from "react";

/**
 * Creates a Supabase server client with cookie-based auth.
 * Falls back to a basic client if cookies() is unavailable.
 * Based on Supabase SSR docs for Next.js 16 (May 2026).
 * 
 * Wrapped in React cache() for request-bound memoization.
 */
export const createClient = cache(async () => {
  let cookieStore;
  try {
    cookieStore = await cookies();
  } catch {
    // cookies() unavailable in this context — use basic client
    return createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );
  }

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet, _headers) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // setAll called from Server Component — safe to ignore
          }
        },
      },
    },
  );
});
