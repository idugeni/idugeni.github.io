const VIDEO_EXTENSIONS = /\.(m3u8|mov|mp4|mpeg|mpg|ogv|webm)(?:[?#].*)?$/i;
const BYPASS_OPTIMIZER_EXTENSIONS = /\.(gif|svg)(?:[?#].*)?$/i;

const OPTIMIZABLE_HOSTS = new Set([
  "images.unsplash.com",
  "i.pravatar.cc",
  "i.ytimg.com",
]);

function parseUrl(src: string) {
  try {
    return new URL(src, "https://irnk.codes");
  } catch {
    return null;
  }
}

export function isYouTubeUrl(src: string | null | undefined): boolean {
  if (!src) return false;

  const url = parseUrl(src);
  if (!url) return false;

  return (
    url.hostname === "youtu.be" ||
    url.hostname.endsWith(".youtu.be") ||
    url.hostname === "youtube.com" ||
    url.hostname.endsWith(".youtube.com")
  );
}

export function getYouTubeThumbnailUrl(src: string | null | undefined): string | null {
  if (!src) return null;

  const patterns = [
    /youtube\.com\/embed\/([^?&/]+)/i,
    /youtube\.com\/watch\?v=([^?&/]+)/i,
    /youtu\.be\/([^?&/]+)/i,
  ];

  for (const pattern of patterns) {
    const match = src.match(pattern);
    if (match?.[1]) {
      return `https://i.ytimg.com/vi_webp/${encodeURIComponent(match[1])}/sddefault.webp`;
    }
  }

  return null;
}

export function isVideoLikeUrl(src: string | null | undefined): boolean {
  if (!src) return false;
  const url = parseUrl(src);
  return Boolean(url?.pathname && VIDEO_EXTENSIONS.test(url.pathname));
}

export function isOptimizableImageUrl(src: string | null | undefined): boolean {
  if (!src) return false;

  if (src.startsWith("/") && !src.startsWith("//")) return !isVideoLikeUrl(src);
  if (src.startsWith("data:") || src.startsWith("blob:")) return false;
  if (isYouTubeUrl(src)) return false;
  if (isVideoLikeUrl(src)) return false;

  const url = parseUrl(src);
  if (!url || url.protocol !== "https:") return false;

  return OPTIMIZABLE_HOSTS.has(url.hostname) || url.hostname.endsWith(".supabase.co") || url.hostname.endsWith(".googleusercontent.com") || url.hostname.endsWith(".ytimg.com");
}

export function shouldBypassImageOptimization(src: string | null | undefined): boolean {
  if (!src) return false;
  const url = parseUrl(src);
  const pathname = url?.pathname ?? src;
  return BYPASS_OPTIMIZER_EXTENSIONS.test(pathname);
}

export function getSafeImageSource(
  primary: string | null | undefined,
  fallback?: string | null | undefined
): string | null {
  const candidates = [primary, fallback];

  for (const candidate of candidates) {
    if (!candidate) continue;

    if (isYouTubeUrl(candidate)) {
      const thumbnail = getYouTubeThumbnailUrl(candidate);
      if (thumbnail && isOptimizableImageUrl(thumbnail)) return thumbnail;
      continue;
    }

    if (isOptimizableImageUrl(candidate)) return candidate;
  }

  return null;
}
