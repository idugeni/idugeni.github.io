import { createClient } from "@supabase/supabase-js";

/**
 * Service role client for server-side operations that need elevated privileges.
 * Only import in server-side code (actions, route handlers) — NEVER expose to client.
 */
export function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.DATABASE_SECRET_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
