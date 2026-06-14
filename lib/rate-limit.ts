import { queryPoolerSingle } from "@/lib/db/pooler"
import { Ratelimit } from "@upstash/ratelimit"
import { getRedis } from "./redis"

interface RateLimitConfig {
  max: number
  window: number // milliseconds
}

// ============================================
// DATABASE-BASED RATE LIMITING
// For Server Actions (Node.js runtime)
// ============================================

/**
 * Rate limit a request using PostgreSQL database functions.
 * Persistently stored in Supabase database for reliability across serverless instances.
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
  const windowSeconds = Math.ceil(config.window / 1000)

  const result = await queryPoolerSingle<{ check_rate_limit: boolean }>(
    "SELECT private.check_rate_limit($1, $2, $3, $4)",
    [identifier, endpoint, config.max, windowSeconds]
  )

  const allowed = result?.check_rate_limit ?? true

  if (!allowed) {
    const timeResult = await queryPoolerSingle<{ remaining_seconds: number }>(
      `SELECT COALESCE(
        EXTRACT(EPOCH FROM (MIN(created_at) + ($3 || ' seconds')::interval - now()))::int,
        $4
      ) AS remaining_seconds
      FROM private.rate_limits 
      WHERE ip_address = $1 AND action = $2`,
      [identifier, endpoint, windowSeconds, windowSeconds]
    )

    const remainingTime = Math.max(1, timeResult?.remaining_seconds ?? windowSeconds)
    throw new Error(
      `Rate limit exceeded. Please try again in ${remainingTime} seconds.`
    )
  }
}

// ============================================
// REDIS-BASED RATE LIMITING
// For Middleware (Edge runtime)
// ============================================

const limiters = new Map<string, Ratelimit>()

function getLimiterConfig(identifier: string) {
  const configs: Record<string, { maxRequests: number; window: `${number} s` | `${number} m` | `${number} h` | `${number} d` }> = {
    "api": { maxRequests: 60, window: "1 m" },
    "contact": { maxRequests: 5, window: "1 h" },
    "blog-view": { maxRequests: 100, window: "1 m" },
    "login": { maxRequests: 5, window: "15 m" },
    "search": { maxRequests: 30, window: "1 m" },
  }
  return configs[identifier] || configs["api"]
}

export function getRateLimiter(identifier: string): Ratelimit | null {
  const redis = getRedis()
  if (!redis) return null

  if (!limiters.has(identifier)) {
    const config = getLimiterConfig(identifier)
    limiters.set(identifier, new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(config.maxRequests, config.window),
      analytics: true,
      prefix: `ratelimit:${identifier}`,
    }))
  }

  return limiters.get(identifier) || null
}

export async function checkRateLimit(
  identifier: string,
  clientId: string
): Promise<{ success: boolean; remaining: number; reset: number }> {
  const limiter = getRateLimiter(identifier)

  if (!limiter) {
    // Redis not configured - allow request
    return { success: true, remaining: Infinity, reset: 0 }
  }

  try {
    const result = await limiter.limit(clientId)
    return {
      success: result.success,
      remaining: result.remaining,
      reset: result.reset,
    }
  } catch (error) {
    // Graceful degradation - allow request on error
    console.error("[rate-limit] Error:", error)
    return { success: true, remaining: 0, reset: 0 }
  }
}

