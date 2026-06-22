import { createClient } from "@supabase/supabase-js";

/**
 * Admin client with service-role privileges.
 * Bypasses Row Level Security — use only for admin operations.
 * NEVER import in Client Components or expose to the browser.
 */
export function createAdminClient() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl) {
    throw new Error(
      "SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL is required for admin operations."
    );
  }

  if (!supabaseSecretKey) {
    throw new Error(
      "SUPABASE_SECRET_KEY is required for admin operations. " +
      "Set it in your environment variables (server-only, never expose to client)."
    );
  }

  return createClient(supabaseUrl, supabaseSecretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
