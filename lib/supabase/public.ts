import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_PUBLISHABLE_KEY;

/**
 * Unauthenticated Supabase client for public read-only queries.
 * Disables session persistence and auto-refresh.
 * Used in server components and route handlers that serve public data.
 */
export function createPublicClient() {
  return createClient(
    supabaseUrl!,
    supabaseKey!,
    {
      auth: {
        autoRefreshToken: false,
        detectSessionInUrl: false,
        persistSession: false,
      },
    },
  );
}
