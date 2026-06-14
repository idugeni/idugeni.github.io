export const CACHE_STRATEGIES = {
  // Blog
  blog_list: 3600,           // 1 hour
  blog_detail: 1800,         // 30 minutes
  blog_categories: 86400,    // 24 hours
  blog_tags: 86400,          // 24 hours
  
  // Projects
  projects_list: 3600,       // 1 hour
  project_detail: 1800,      // 30 minutes
  
  // Gallery
  gallery_list: 3600,        // 1 hour
  gallery_detail: 1800,      // 30 minutes
  
  // Contact
  contact_info: 86400,       // 24 hours
  
  // Newsletter
  newsletter_stats: 3600,    // 1 hour
} as const

export type CacheKey = keyof typeof CACHE_STRATEGIES

export function getCacheTTL(key: CacheKey): number {
  return CACHE_STRATEGIES[key]
}

export function buildCacheKey(prefix: string, identifier?: string): string {
  return identifier ? `:${identifier}` : prefix
}
