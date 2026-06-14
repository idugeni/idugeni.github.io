import { queryPooler } from "@/lib/db/pooler";
import { siteConfig } from "@/lib/config/site";
import { markdownToHtml, truncateHtml } from "./utils/markdown";
import { buildArticleHtml } from "./utils/template";

interface BlogArticle {
  id: string;
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
  kategori_id: string | null;
  kategori_nama: string | null;
  kategori_slug: string | null;
}

interface RelatedPost {
  judul: string;
  slug: string;
}

export async function GET() {
  // Enhanced query with kategori JOIN
  const articles = await queryPooler<BlogArticle>(
    `SELECT 
       a.id,
       a.judul, 
       a.slug, 
       a.ringkasan, 
       a.konten,
       a.published_at, 
       a.updated_at,
       a.featured,
       a.jumlah_like,
       a.jumlah_view,
       a.waktu_baca,
       a.kategori_id,
       k.nama AS kategori_nama,
       k.slug AS kategori_slug
     FROM blog_artikel a
     LEFT JOIN kategori k ON a.kategori_id = k.id
     WHERE a.status = 'published' 
     ORDER BY a.published_at DESC 
     LIMIT 20`
  );

  // Fetch related posts for each article (batch optimization)
  const articlesWithRelated = await Promise.all(
    articles.map(async (article) => {
      const relatedPosts = article.kategori_id
        ? await queryPooler<RelatedPost>(
            `SELECT judul, slug 
             FROM blog_artikel 
             WHERE kategori_id = $1 
               AND id != $2 
               AND status = 'published'
             ORDER BY published_at DESC 
             LIMIT 3`,
            [article.kategori_id, article.id]
          )
        : [];
      
      return { ...article, relatedPosts };
    })
  );

  // Build RSS items
  const items = articlesWithRelated
    .map((article) => {
      const articleUrl = `${siteConfig.url}/blog/${article.slug}`;
      
      // Convert markdown to HTML and truncate for hybrid approach
      const fullHtml = markdownToHtml(article.konten || "");
      const truncatedHtml = truncateHtml(fullHtml, 2000);
      
      // Build enhanced HTML template
      const enhancedHtml = buildArticleHtml(
        {
          judul: article.judul,
          slug: article.slug,
          ringkasan: article.ringkasan,
          konten: article.konten,
          published_at: article.published_at,
          updated_at: article.updated_at,
          featured: article.featured,
          jumlah_like: article.jumlah_like,
          jumlah_view: article.jumlah_view,
          waktu_baca: article.waktu_baca,
          kategori_nama: article.kategori_nama,
          kategori_slug: article.kategori_slug,
        },
        truncatedHtml,
        article.relatedPosts
      );

      const pubDate = new Date(
        article.published_at ?? article.updated_at ?? new Date()
      ).toUTCString();

      return `
    <item>
      <title><![CDATA[${article.judul}]]></title>
      <link>${articleUrl}</link>
      <guid isPermaLink="true">${articleUrl}</guid>
      <description><![CDATA[${article.ringkasan}]]></description>
      <content:encoded><![CDATA[${enhancedHtml}]]></content:encoded>
      <pubDate>${pubDate}</pubDate>
      <author>${siteConfig.contact.email} (${siteConfig.owner.name})</author>
      ${article.kategori_nama ? `<category>${article.kategori_nama}</category>` : ""}
      <dc:creator>${siteConfig.owner.name}</dc:creator>
    </item>`;
    })
    .join("");

  const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" 
  xmlns:atom="http://www.w3.org/2005/Atom" 
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${siteConfig.name} — Blog</title>
    <link>${siteConfig.url}/blog</link>
    <description>${siteConfig.seo.description}</description>
    <language>id</language>
    <managingEditor>${siteConfig.contact.email} (${siteConfig.owner.name})</managingEditor>
    <webMaster>${siteConfig.contact.email} (${siteConfig.owner.name})</webMaster>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteConfig.url}/feed" rel="self" type="application/rss+xml"/>
    <image>
      <url>${siteConfig.url}/irnk.png</url>
      <title>${siteConfig.name}</title>
      <link>${siteConfig.url}</link>
    </image>${items}
  </channel>
</rss>`;

  return new Response(feed, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
