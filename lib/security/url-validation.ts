const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "127.0.0.1",
  "::1",
  "[::1]",
  "0.0.0.0",
  "metadata.google.internal",
  "metadata.google.internal.",
]);

const PRIVATE_IP_PATTERNS = [
  /^10\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^192\.168\./,
  /^169\.254\./, // Link-local (AWS/GCP metadata)
  /^127\./,
  /^0\./,
  /^fc00:/, // IPv6 ULA
  /^fd[0-9a-f]{2}:/,
  /^fe80:/, // IPv6 link-local
  /^\[::1\]$/,
];

export function isPrivateOrBlockedUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);

    if (url.protocol !== "http:" && url.protocol !== "https:") return true;

    const hostname = url.hostname.toLowerCase();

    if (BLOCKED_HOSTNAMES.has(hostname)) return true;

    if (PRIVATE_IP_PATTERNS.some((p) => p.test(hostname))) return true;

    if (hostname.endsWith(".internal") || hostname.endsWith(".local")) return true;

    return false;
  } catch {
    return true;
  }
}
