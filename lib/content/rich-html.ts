import "server-only";

import { codeToHtml } from "shiki";
import { sanitizeRichHtml } from "@/lib/security/sanitize-html";
import { slugify } from "@/lib/utils/slug";

const HEADING_ID_OFFSET_CLASS = "scroll-mt-24";
const HTML_TAG_PATTERN = /<([a-z][\w:-]*)(?:\s[^>]*)?>/i;
const CODE_BLOCK_PATTERN = /<pre([^>]*)>\s*<code([^>]*)>([\s\S]*?)<\/code>\s*<\/pre>/gi;
const HEADING_PATTERN = /<h([23])([^>]*)>([\s\S]*?)<\/h\1>/gi;
const CLASS_ATTR_PATTERN = /class\s*=\s*("([^"]*)"|'([^']*)'|([^\s"'>]+))/i;

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function decodeHtml(value: string) {
  return value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");
}

export function richHtmlToPlainText(content: string | null | undefined) {
  if (!content) return "";

  return sanitizeRichHtml(content)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<\/h[1-6]>/gi, "\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizePlainTextToHtml(content: string) {
  if (HTML_TAG_PATTERN.test(content)) return content;

  return content
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, "<br />")}</p>`)
    .join("\n");
}

function getClassAttribute(attributes: string) {
  const match = attributes.match(CLASS_ATTR_PATTERN);
  return match?.[2] ?? match?.[3] ?? match?.[4] ?? "";
}

function getCodeLanguage(attributes: string) {
  const className = getClassAttribute(attributes);
  const language = className
    .split(/\s+/)
    .find((value) => value.startsWith("language-"))
    ?.replace("language-", "")
    .trim();

  return language || "text";
}

function addHeadingIds(html: string) {
  const slugCount: Record<string, number> = {};

  return html.replace(HEADING_PATTERN, (match, level: string, attrs: string, innerHtml: string) => {
    if (/\sid\s*=/.test(attrs)) return match;

    const text = innerHtml.replace(/<[^>]*>/g, "").trim();
    let slug = slugify(text);
    if (!slug) return match;

    if (slugCount[slug] !== undefined) {
      slugCount[slug]++;
      slug = `${slug}-${slugCount[slug]}`;
    } else {
      slugCount[slug] = 0;
    }

    const existingClass = getClassAttribute(attrs);
    const attrsWithoutClass = attrs.replace(CLASS_ATTR_PATTERN, "").trim();
    const className = [existingClass, HEADING_ID_OFFSET_CLASS].filter(Boolean).join(" ");
    const normalizedAttrs = attrsWithoutClass ? ` ${attrsWithoutClass}` : "";

    return `<h${level}${normalizedAttrs} id="${slug}" class="${className}">${innerHtml}</h${level}>`;
  });
}

function enhanceHighlightedCode(html: string, language: string) {
  return html
    .replace("<pre", `<pre data-language="${escapeHtml(language.toUpperCase())}"`)
    .replace("<code", `<code class="language-${escapeHtml(language)}"`);
}

export async function renderRichHtml(content: string | null | undefined): Promise<string> {
  if (!content) return "";

  // Timeout guard: if Shiki takes too long, fall back to raw content
  const timeoutMs = 5000; // 5 seconds
  
  const renderPromise = (async () => {
    const normalizedHtml = normalizePlainTextToHtml(content);
    const safeHtml = addHeadingIds(sanitizeRichHtml(normalizedHtml));
    const highlightedBlocks: string[] = [];

    const htmlWithPlaceholders = safeHtml.replace(
      CODE_BLOCK_PATTERN,
      (_match, preAttrs: string, codeAttrs: string, rawCode: string) => {
        const language = getCodeLanguage(`${preAttrs} ${codeAttrs}`);
        const code = decodeHtml(rawCode.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]*>/g, ""));
        const placeholder = `___IRNK_CODE_BLOCK_${highlightedBlocks.length}___`;
        highlightedBlocks.push(JSON.stringify({ code, language }));
        return placeholder;
      },
    );

    const highlightedHtml = await Promise.all(
      highlightedBlocks.map(async (payload) => {
        const { code, language } = JSON.parse(payload) as { code: string; language: string };
        try {
          const html = await codeToHtml(code, {
            lang: language,
            themes: {
              light: "github-light",
              dark: "github-dark",
            },
          });
          return enhanceHighlightedCode(html, language);
        } catch {
          const escapedCode = escapeHtml(code);
          return `<pre data-language="TEXT"><code class="language-text">${escapedCode}</code></pre>`;
        }
      }),
    );

    return highlightedHtml.reduce(
      (html, block, index) => html.replace(`___IRNK_CODE_BLOCK_${index}___`, block),
      htmlWithPlaceholders,
    );
  })();

  const timeoutPromise = new Promise<string>((_, reject) => {
    setTimeout(() => reject(new Error(`renderRichHtml timeout after ${timeoutMs}ms`)), timeoutMs);
  });

  try {
    return await Promise.race([renderPromise, timeoutPromise]);
  } catch (error) {
    console.error("[renderRichHtml] Timeout or error, falling back to raw content:", error);
    // Fall back to basic HTML without syntax highlighting
    const normalizedHtml = normalizePlainTextToHtml(content);
    return addHeadingIds(sanitizeRichHtml(normalizedHtml));
  }
}
