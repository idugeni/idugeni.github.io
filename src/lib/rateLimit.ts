// lib/rate-limit.ts
const rateLimitMap = new Map<string, number[]>();

export function isRateLimited(ip: string, limit = 5, windowMs = 60_000): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) || [];
  const recent = timestamps.filter((t) => now - t < windowMs);

  if (recent.length >= limit) return true;

  rateLimitMap.set(ip, [...recent, now]);
  return false;
}
