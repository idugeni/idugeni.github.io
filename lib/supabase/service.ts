import { createClient } from "@supabase/supabase-js";

/**
 * Service role client for server-side operations that need elevated privileges.
 * Only use in server actions - NEVER expose to client.
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
