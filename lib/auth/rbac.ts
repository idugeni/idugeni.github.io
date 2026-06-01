import { createClient } from "@/lib/supabase/server";

/**
 * RBAC (Role-Based Access Control) utilities for authorization.
 * 
 * IMPORTANT: This implementation assumes you have an admin role system.
 * You need to configure one of the following approaches:
 * 
 * OPTION 1: User metadata in auth.users
 * - Add role to user metadata during signup/admin assignment
 * - Check: user.user_metadata.role === "admin"
 * 
 * OPTION 2: Separate user_profiles table
 * - Create table: user_profiles (user_id, role, ...)
 * - Check: profile.role === "admin"
 * 
 * OPTION 3: Email whitelist
 * - Hardcode admin emails in environment variable
 * - Check: ADMIN_EMAILS.includes(user.email)
 */

/**
 * Requires the current user to be authenticated and have admin privileges.
 * Throws an error if not authenticated or not an admin.
 * 
 * @returns The authenticated admin user
 * @throws Error if not authenticated or not an admin
 */
export async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  // Check authentication
  if (error || !user) {
    throw new Error("Unauthorized: Authentication required");
  }

  // OPTION 3: Email whitelist (ACTIVE)
  // Add admin emails to ADMIN_EMAILS environment variable (comma-separated)
  // Example: ADMIN_EMAILS=admin@example.com,owner@example.com
  const adminEmails = process.env.ADMIN_EMAILS?.split(",").map(email => email.trim()) || [];
  
  if (adminEmails.length === 0) {
    throw new Error("Configuration Error: ADMIN_EMAILS not configured");
  }
  
  if (!adminEmails.includes(user.email || "")) {
    throw new Error("Forbidden: Admin access required");
  }

  return user;
}

/**
 * Checks if the current user is authenticated and has admin privileges.
 * Returns true/false instead of throwing an error.
 * 
 * @returns True if user is an admin, false otherwise
 */
export async function isAdmin(): Promise<boolean> {
  try {
    await requireAdmin();
    return true;
  } catch {
    return false;
  }
}

/**
 * Requires the current user to be authenticated (no role check).
 * Throws an error if not authenticated.
 * 
 * @returns The authenticated user
 * @throws Error if not authenticated
 */
export async function requireAuth() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Unauthorized: Authentication required");
  }

  return user;
}
