import { Redis } from "@upstash/redis"

let redis: Redis | null = null

export function getRedis(): Redis | null {
  if (redis) return redis
  
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  
  if (!url || !token) {
    console.warn("[redis] Upstash Redis not configured, rate limiting and caching disabled")
    return null
  }
  
  try {
    redis = new Redis({ 
      url, 
      token,
      automaticDeserialization: true,
    })
    return redis
  } catch (error) {
    console.error("[redis] Failed to initialize Redis client:", error)
    return null
  }
}
