import { createPublicClient } from "@/lib/supabase/public";
import { siteConfig } from "@/lib/config/site";
import { markdownToHtml, truncateHtml } from "./utils/markdown";
import { buildArticleHtml } from "./utils/template";

function escapeXml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function safeCdata(value: unknown): string {
  return String(value ?? "").replace(/]]>/g, "]]]]><![CDATA[>");
}

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
  kategori_nama?: string | null;
  kategori_slug?: string | null;
}

interface RelatedPost {
  judul: string;
  slug: string;
}

export async function GET() {
  const supabase = createPublicClient();

  const { data: rawArticles } = await supabase
    .from("blog_artikel")
    .select("id, judul, slug, ringkasan, konten, published_at, updated_at, featured, jumlah_like, jumlah_view, waktu_baca, kategori_id")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(20);

  const articles: BlogArticle[] = rawArticles ?? [];

  if (articles.length > 0) {
    const kategoriIds = [...new Set(articles.map((a) => a.kategori_id).filter(Boolean))] as string[];

    if (kategoriIds.length > 0) {
      const { data: kategoriRows } = await supabase
        .from("kategori")
        .select("id, nama, slug")
        .in("id", kategoriIds);

      const kategoriMap = new Map((kategoriRows ?? []).map((k) => [k.id, k]));

      for (const article of articles) {
        const kat = article.kategori_id ? kategoriMap.get(article.kategori_id) : null;
        article.kategori_nama = kat?.nama ?? null;
        article.kategori_slug = kat?.slug ?? null;
      }
    }
  }

  const articlesWithRelated = await Promise.all(
    articles.map(async (article) => {
      let relatedPosts: RelatedPost[] = [];
      if (article.kategori_id) {
        const { data } = await supabase
          .from("blog_artikel")
          .select("judul, slug")
          .eq("kategori_id", article.kategori_id)
          .neq("id", article.id)
          .eq("status", "published")
          .order("published_at", { ascending: false })
          .limit(3);
        relatedPosts = data ?? [];
      }
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
          kategori_nama: article.kategori_nama ?? null,
          kategori_slug: article.kategori_slug ?? null,
        },
        truncatedHtml,
        article.relatedPosts
      );

      const pubDate = new Date(
        article.published_at ?? article.updated_at ?? new Date()
      ).toUTCString();

      return `
    <item>
      <title><![CDATA[${safeCdata(article.judul)}]]></title>
      <link>${escapeXml(articleUrl)}</link>
      <guid isPermaLink="true">${escapeXml(articleUrl)}</guid>
      <description><![CDATA[${safeCdata(article.ringkasan)}]]></description>
      <content:encoded><![CDATA[${safeCdata(enhancedHtml)}]]></content:encoded>
      <pubDate>${escapeXml(pubDate)}</pubDate>
      <author>${escapeXml(`${siteConfig.contact.email} (${siteConfig.owner.name})`)}</author>
      ${article.kategori_nama ? `<category>${escapeXml(article.kategori_nama)}</category>` : ""}
      <dc:creator>${escapeXml(siteConfig.owner.name)}</dc:creator>
    </item>`;
    })
    .join("");

  const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" 
  xmlns:atom="http://www.w3.org/2005/Atom" 
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${escapeXml(`${siteConfig.name} — Blog`)}</title>
    <link>${escapeXml(`${siteConfig.url}/blog`)}</link>
    <description>${escapeXml(siteConfig.seo.description)}</description>
    <language>id</language>
    <managingEditor>${escapeXml(`${siteConfig.contact.email} (${siteConfig.owner.name})`)}</managingEditor>
    <webMaster>${escapeXml(`${siteConfig.contact.email} (${siteConfig.owner.name})`)}</webMaster>
    <lastBuildDate>${escapeXml(new Date().toUTCString())}</lastBuildDate>
    <atom:link href="${escapeXml(`${siteConfig.url}/feed`)}" rel="self" type="application/rss+xml"/>
    <image>
      <url>${escapeXml(`${siteConfig.url}/irnk.png`)}</url>
      <title>${escapeXml(siteConfig.name)}</title>
      <link>${escapeXml(siteConfig.url)}</link>
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
