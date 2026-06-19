import "server-only";

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

function decorateCodeBlocks(html: string) {
  return html.replace(CODE_BLOCK_PATTERN, (match, preAttrs: string, codeAttrs: string) => {
    const language = getCodeLanguage(`${preAttrs} ${codeAttrs}`);
    const languageLabel = escapeHtml(language.toUpperCase());
    const languageClass = escapeHtml(language);

    if (/data-language\s*=/.test(preAttrs) && /class\s*=/.test(codeAttrs)) {
      return match;
    }

    return match
      .replace("<pre", `<pre data-language="${languageLabel}"`)
      .replace("<code", `<code class="language-${languageClass}"`);
  });
}

export async function renderRichHtml(content: string | null | undefined): Promise<string> {
  if (!content) return "";

  const normalizedHtml = normalizePlainTextToHtml(content);
  const safeHtml = sanitizeRichHtml(normalizedHtml);
  return decorateCodeBlocks(addHeadingIds(safeHtml));
}
