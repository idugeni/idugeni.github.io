import { siteConfig } from "@/lib/config/site";

interface Article {
  judul: string;
  slug: string;
  ringkasan: string;
  konten: string | null;
  published_at: string | null;
  updated_at: string | null;
  featured: boolean;
  jumlah_like: number;
  jumlah_view: number;
  waktu_baca: number;
  kategori_nama: string | null;
  kategori_slug: string | null;
}

interface RelatedPost {
  judul: string;
  slug: string;
}

/**
 * Build enhanced HTML template for RSS feed item
 * Optimized for email clients and RSS readers
 */
export function buildArticleHtml(
  article: Article,
  htmlContent: string,
  relatedPosts: RelatedPost[]
): string {
  const articleUrl = `${siteConfig.url}/blog/${article.slug}`;
  
  // Badges
  const featuredBadge = article.featured
    ? '<span style="background: #10b981; color: white; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: 600; margin-right: 8px;">⭐ FEATURED</span>'
    : '';
  
  const categoryBadge = article.kategori_nama
    ? `<span style="background: #3b82f6; color: white; padding: 4px 12px; border-radius: 4px; font-size: 12px;">${article.kategori_nama}</span>`
    : '';
  
  // Stats
  const stats = `
    <div style="display: flex; gap: 16px; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; flex-wrap: wrap;">
      <span>⏱️ ${article.waktu_baca} menit baca</span>
      <span>👁️ ${article.jumlah_view.toLocaleString()} views</span>
      <span>❤️ ${article.jumlah_like} likes</span>
    </div>
  `;
  
  // Related posts
  const relatedHtml = relatedPosts.length > 0
    ? `
      <div style="margin-top: 32px; padding: 24px; background: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb;">
        <h3 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 600; color: #111827;">📚 Artikel Terkait</h3>
        <ul style="margin: 0; padding-left: 0; list-style: none;">
          ${relatedPosts
            .map(
              (post) => `
            <li style="margin-bottom: 12px; padding-left: 20px; position: relative;">
              <span style="position: absolute; left: 0; color: #3b82f6;">→</span>
              <a href="${siteConfig.url}/blog/${post.slug}" style="color: #3b82f6; text-decoration: none; font-weight: 500; line-height: 1.5;">
                ${post.judul}
              </a>
            </li>
          `
            )
            .join("")}
        </ul>
      </div>
    `
    : '';
  
  // CTA and footer
  const ctaSection = `
    <div style="margin-top: 40px; padding: 24px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; text-align: center;">
      <p style="margin: 0 0 16px 0; font-size: 15px; color: white; font-weight: 500;">
        📖 Artikel ini pertama kali dipublikasikan di ${siteConfig.name}
      </p>
      <a href="${articleUrl}" style="display: inline-block; background: white; color: #667eea; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 15px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        Baca Lengkap di Website →
      </a>
    </div>
    
    <div style="margin-top: 20px; text-align: center;">
      <a href="${articleUrl}#comments" style="color: #3b82f6; text-decoration: none; font-size: 14px; font-weight: 500;">
        💬 Lihat dan tulis komentar
      </a>
    </div>
    
    <div style="margin-top: 16px; text-align: center; font-size: 14px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
      <span style="color: #6b7280; margin-right: 8px;">Share:</span>
      <a href="https://twitter.com/intent/tweet?text=${encodeURIComponent(article.judul)}&url=${encodeURIComponent(articleUrl)}" style="color: #3b82f6; text-decoration: none; margin: 0 8px; font-weight: 500;">Twitter</a>
      <span style="color: #d1d5db;">|</span>
      <a href="https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(articleUrl)}" style="color: #3b82f6; text-decoration: none; margin: 0 8px; font-weight: 500;">LinkedIn</a>
    </div>
  `;
  
  // Main article container
  return `
    <article style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 680px; margin: 0 auto; padding: 20px; line-height: 1.6; color: #1a1a1a; background: white;">
      
      <!-- Header -->
      <div style="margin-bottom: 24px;">
        <div style="margin-bottom: 16px;">
          ${featuredBadge}${categoryBadge}
        </div>
        ${stats}
      </div>

      <!-- Content -->
      <div style="font-size: 16px; line-height: 1.8; color: #374151;">
        ${htmlContent}
      </div>

      <!-- Related Posts -->
      ${relatedHtml}

      <!-- CTA & Footer -->
      ${ctaSection}
      
    </article>
  `;
}
