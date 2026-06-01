import { queryPoolerSingle } from "@/lib/db/pooler";

interface RateLimitConfig {
  max: number;        // Maximum requests allowed
  window: number;     // Time window in milliseconds
}

/**
 * Rate limit a request based on identifier and endpoint.
 * Persistently stored and evaluated inside the Supabase PostgreSQL database
 * to ensure correct behavior across stateless serverless instances.
 * 
 * @param identifier - Unique identifier (IP address, email, etc.)
 * @param endpoint - Endpoint name (contact, newsletter, comment, login)
 * @param config - Rate limit configuration
 * @throws Error if rate limit exceeded
 */
export async function rateLimit(
  identifier: string,
  endpoint: string,
  config: RateLimitConfig
): Promise<void> {
  const windowSeconds = Math.ceil(config.window / 1000);
  
  // Call the SECURITY DEFINER check_rate_limit function in the database
  const result = await queryPoolerSingle<{ check_rate_limit: boolean }>(
    "SELECT private.check_rate_limit($1, $2, $3, $4)",
    [identifier, endpoint, config.max, windowSeconds]
  );

  const allowed = result?.check_rate_limit ?? true;

  if (!allowed) {
    // Determine exact remaining lockout time in seconds
    const timeResult = await queryPoolerSingle<{ remaining_seconds: number }>(
      `SELECT COALESCE(
        EXTRACT(EPOCH FROM (MIN(created_at) + ($3 || ' seconds')::interval - now()))::int,
        $4
      ) AS remaining_seconds
      FROM private.rate_limits 
      WHERE ip_address = $1 AND action = $2`,
      [identifier, endpoint, windowSeconds, windowSeconds]
    );

    const remainingTime = Math.max(1, timeResult?.remaining_seconds ?? windowSeconds);
    throw new Error(
      `Rate limit exceeded. Please try again in ${remainingTime} seconds.`
    );
  }
}

/**
 * Get remaining requests for an identifier (Mocked wrapper for backward compatibility)
 */
export function getRateLimitInfo(
  identifier: string,
  endpoint: string,
  config: RateLimitConfig
): { remaining: number; resetAt: number } {
  const now = Date.now();
  return {
    remaining: config.max,
    resetAt: now + config.window,
  };
}

/**
 * Clear rate limit for an identifier (deletes entries from database)
 */
export async function clearRateLimit(identifier: string, endpoint: string): Promise<void> {
  await queryPoolerSingle(
    "DELETE FROM private.rate_limits WHERE ip_address = $1 AND action = $2",
    [identifier, endpoint]
  );
}
