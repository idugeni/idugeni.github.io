import { createClient } from "@/lib/supabase/server";
import { siteConfig } from "@/lib/config/site";

export async function GET() {
  const supabase = await createClient();

  const { data: articles } = await supabase
    .from("blog_artikel")
    .select("judul, slug, ringkasan, published_at, updated_at")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(50);

  const items = (articles ?? [])
    .map(
      (article) => `
    <item>
      <title><![CDATA[${article.judul}]]></title>
      <link>${siteConfig.url}/blog/${article.slug}</link>
      <guid isPermaLink="true">${siteConfig.url}/blog/${article.slug}</guid>
      <description><![CDATA[${article.ringkasan}]]></description>
      <pubDate>${new Date(article.published_at || article.updated_at).toUTCString()}</pubDate>
      <author>${siteConfig.contact.email} (${siteConfig.owner.name})</author>
    </item>`
    )
    .join("");

  const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${siteConfig.name} — Blog</title>
    <link>${siteConfig.url}/blog</link>
    <description>${siteConfig.seo.description}</description>
    <language>id</language>
    <managingEditor>${siteConfig.contact.email} (${siteConfig.owner.name})</managingEditor>
    <webMaster>${siteConfig.contact.email} (${siteConfig.owner.name})</webMaster>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteConfig.url}/feed.xml" rel="self" type="application/rss+xml"/>
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
