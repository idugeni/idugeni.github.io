import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { cache } from "react";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_PUBLISHABLE_KEY;

/**
 * Creates a Supabase server client with cookie-based auth.
 * Falls back to a basic client if cookies() is unavailable.
 *
 * Wrapped in React cache() for request-bound memoization.
 */
export const createClient = cache(async () => {
  let cookieStore;
  try {
    cookieStore = await cookies();
  } catch {
    return createSupabaseClient(supabaseUrl!, supabaseKey!, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }

  return createServerClient(supabaseUrl!, supabaseKey!, {
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
  });
});
