import DOMPurify from "isomorphic-dompurify";

const ALLOWED_TAGS = [
  "a",
  "blockquote",
  "br",
  "code",
  "div",
  "em",
  "figcaption",
  "figure",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "hr",
  "img",
  "li",
  "ol",
  "p",
  "pre",
  "s",
  "span",
  "strong",
  "table",
  "tbody",
  "td",
  "th",
  "thead",
  "tr",
  "u",
  "ul",
];

const ALLOWED_ATTR = [
  "class",
  "id",
  "title",
  "aria-label",
  "data-language",
  "href",
  "target",
  "rel",
  "src",
  "alt",
  "width",
  "height",
  "loading",
  "colspan",
  "rowspan",
  "scope",
];

/**
 * Sanitizes an HTML string using DOMPurify.
 * This is Turbopack and serverless-safe, protecting against XSS in dynamic renders.
 * 
 * @param html - The raw HTML string to sanitize
 * @returns The sanitized safe HTML string
 */
export function sanitizeRichHtml(html: string | null | undefined): string {
  if (!html) return "";

  // Configure DOMPurify options
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ADD_ATTR: ["target", "rel"], // Allow target and rel on anchors
    FORCE_BODY: true,
  });
}
