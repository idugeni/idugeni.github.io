import { marked } from "marked";

// Configure marked for RSS feed output
marked.setOptions({
  breaks: true, // Convert \n to <br>
  gfm: true, // GitHub Flavored Markdown
});

/**
 * Convert Markdown to HTML with email-optimized styling
 */
export function markdownToHtml(markdown: string): string {
  if (!markdown) return "";
  
  const html = marked(markdown) as string;
  
  // Add inline styles for better email client compatibility
  return html
    .replace(/<h1/g, '<h1 style="font-size: 28px; font-weight: 700; margin: 32px 0 16px 0; color: #111827;"')
    .replace(/<h2/g, '<h2 style="font-size: 24px; font-weight: 700; margin: 28px 0 14px 0; color: #1f2937;"')
    .replace(/<h3/g, '<h3 style="font-size: 20px; font-weight: 600; margin: 24px 0 12px 0; color: #374151;"')
    .replace(/<p>/g, '<p style="margin: 0 0 16px 0; line-height: 1.7; color: #374151;">')
    .replace(/<ul>/g, '<ul style="margin: 0 0 16px 0; padding-left: 24px;">')
    .replace(/<ol>/g, '<ol style="margin: 0 0 16px 0; padding-left: 24px;">')
    .replace(/<li>/g, '<li style="margin-bottom: 8px; line-height: 1.6; color: #374151;">')
    .replace(/<code>/g, '<code style="background: #f3f4f6; padding: 2px 6px; border-radius: 4px; font-family: \'Courier New\', monospace; font-size: 14px; color: #dc2626;">')
    .replace(/<pre>/g, '<pre style="background: #1f2937; color: #f9fafb; padding: 16px; border-radius: 8px; overflow-x: auto; margin: 16px 0; font-size: 14px; line-height: 1.5;"><code style="background: none; padding: 0; color: inherit;">')
    .replace(/<\/pre>/g, '</code></pre>')
    .replace(/<blockquote>/g, '<blockquote style="border-left: 4px solid #3b82f6; margin: 16px 0; padding: 12px 16px; background: #eff6ff; color: #1e40af; font-style: italic;">')
    .replace(/<a /g, '<a style="color: #3b82f6; text-decoration: underline; font-weight: 500;" ')
    .replace(/<strong>/g, '<strong style="font-weight: 700; color: #111827;">')
    .replace(/<em>/g, '<em style="font-style: italic;">')
    .replace(/<table>/g, '<table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px;">')
    .replace(/<thead>/g, '<thead style="background: #f9fafb;">')
    .replace(/<th>/g, '<th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb; font-weight: 600; color: #111827;">')
    .replace(/<td>/g, '<td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #374151;">')
    .replace(/<tr>/g, '<tr style="border-bottom: 1px solid #e5e7eb;">')
    .replace(/<hr>/g, '<hr style="border: none; border-top: 2px solid #e5e7eb; margin: 32px 0;">');
}

/**
 * Truncate HTML content to approximate character limit
 * Preserves HTML tags and structure
 */
export function truncateHtml(html: string, maxLength: number = 2000): string {
  if (html.length <= maxLength) return html;
  
  // Find a good breaking point (end of paragraph or section)
  const truncated = html.substring(0, maxLength);
  const lastParagraph = truncated.lastIndexOf("</p>");
  const lastSection = truncated.lastIndexOf("</h2>");
  const breakPoint = Math.max(lastParagraph, lastSection);
  
  if (breakPoint > maxLength * 0.7) {
    return truncated.substring(0, breakPoint + 4) + 
           '<p style="margin: 24px 0; padding: 16px; background: #fef3c7; border-left: 4px solid #f59e0b; color: #92400e;"><strong>📖 Artikel dilanjutkan...</strong><br>Lanjutkan membaca di website untuk konten lengkap.</p>';
  }
  
  return truncated + '...<p style="margin: 24px 0; padding: 16px; background: #fef3c7; border-left: 4px solid #f59e0b; color: #92400e;"><strong>📖 Artikel dilanjutkan...</strong><br>Lanjutkan membaca di website untuk konten lengkap.</p>';
}
