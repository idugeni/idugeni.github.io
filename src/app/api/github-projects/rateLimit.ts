// src/app/api/github-projects/rateLimit.ts

// Konfigurasi rate limiting
export const RATE_LIMIT = 10; // 10 permintaan per menit
export const RATE_LIMIT_WINDOW = 60000; // 1 menit

// Penyimpanan sederhana untuk rate limit (gunakan database/redis untuk produksi)
const rateLimitStore: Record<string, { count: number; timestamp: number }> = {};

export function isRateLimited(clientIdentifier: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  if (!rateLimitStore[clientIdentifier]) {
    rateLimitStore[clientIdentifier] = { count: 1, timestamp: now };
    return false;
  }
  const clientData = rateLimitStore[clientIdentifier];
  if (now - clientData.timestamp > windowMs) {
    rateLimitStore[clientIdentifier] = { count: 1, timestamp: now };
    return false;
  }
  clientData.count += 1;
  if (clientData.count > limit) {
    return true;
  }
  return false;
}
