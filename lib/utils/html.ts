/**
 * Strip HTML tags and decode entities to produce plain text.
 */
export function toPlainText(value: unknown) {
  return String(value ?? "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/h[1-6]>/gi, "\n\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Split HTML content into paragraphs.
 */
export function getParagraphs(content: unknown) {
  const text = toPlainText(content);
  return text ? text.split(/\n{2,}/).map((item) => item.trim()).filter(Boolean) : [];
}

/**
 * Validate and return a safe image URL, or null.
 */
export function safeImageSource(value: unknown) {
  const src = typeof value === "string" ? value.trim() : "";
  if (!src) return null;
  if (src.startsWith("/") || /^https?:\/\//i.test(src)) return src;
  return null;
}
