import { getRedis } from "@/lib/redis"

export async function getCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 3600
): Promise<T> {
  const redis = getRedis()
  
  if (!redis) {
    return fetcher()
  }
  
  try {
    const cached = await redis.get<T>(key)
    if (cached) {
      return cached
    }
  } catch (error) {
    console.warn(`[cache] Failed to get ${key}:`, error)
  }
  
  const data = await fetcher()
  
  try {
    await redis.set(key, data, { ex: ttl })
  } catch (error) {
    console.warn(`[cache] Failed to set ${key}:`, error)
  }
  
  return data
}

export async function invalidateCache(key: string): Promise<void> {
  const redis = getRedis()
  
  if (!redis) {
    return
  }
  
  try {
    await redis.del(key)
  } catch (error) {
    console.warn(`[cache] Failed to invalidate ${key}:`, error)
  }
}

export async function invalidateCachePattern(pattern: string): Promise<void> {
  const redis = getRedis()
  
  if (!redis) {
    return
  }
  
  try {
    const keys = await redis.keys(pattern)
    if (keys.length > 0) {
      await redis.del(...keys)
    }
  } catch (error) {
    console.warn(`[cache] Failed to invalidate pattern ${pattern}:`, error)
  }
}
