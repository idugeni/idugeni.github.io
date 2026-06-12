import { queryPooler } from "@/lib/db/pooler";

export async function GET() {
  const baseUrl = "https://irnk.codes";

  const staticPages = [
    { url: baseUrl, changefreq: "weekly", priority: "1.0" },
    { url: `${baseUrl}/about`, changefreq: "monthly", priority: "0.9" },
    { url: `${baseUrl}/projects`, changefreq: "weekly", priority: "0.9" },
    { url: `${baseUrl}/blog`, changefreq: "daily", priority: "0.9" },
    { url: `${baseUrl}/services`, changefreq: "monthly", priority: "0.8" },
    { url: `${baseUrl}/gallery`, changefreq: "weekly", priority: "0.7" },
    { url: `${baseUrl}/contact`, changefreq: "yearly", priority: "0.7" },
    { url: `${baseUrl}/resume`, changefreq: "monthly", priority: "0.6" },
    { url: `${baseUrl}/sitemap`, changefreq: "monthly", priority: "0.5" },
    { url: `${baseUrl}/privacy`, changefreq: "yearly", priority: "0.3" },
    { url: `${baseUrl}/terms`, changefreq: "yearly", priority: "0.3" },
  ];

  const [articles, projects, services] = await Promise.all([
    queryPooler<{ slug: string; updated_at: string | null; created_at: string }>(
      `SELECT slug, updated_at, created_at FROM blog_artikel WHERE status='published' ORDER BY created_at DESC`
    ),
    queryPooler<{ slug: string; updated_at: string | null; created_at: string }>(
      `SELECT slug, updated_at, created_at FROM projects ORDER BY created_at DESC`
    ),
    queryPooler<{ slug: string; updated_at: string | null; created_at: string }>(
      `SELECT slug, updated_at, created_at FROM services WHERE aktif=true ORDER BY urutan`
    ),
  ]);

  const now = new Date().toISOString();

  const urls = [
    ...staticPages.map((p) => `
    <url>
      <loc>${p.url}</loc>
      <lastmod>${now}</lastmod>
      <changefreq>${p.changefreq}</changefreq>
      <priority>${p.priority}</priority>
    </url>`),
    ...articles.map((a) => `
    <url>
      <loc>${baseUrl}/blog/${a.slug}</loc>
      <lastmod>${new Date(a.updated_at || a.created_at).toISOString()}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.8</priority>
    </url>`),
    ...projects.map((p) => `
    <url>
      <loc>${baseUrl}/projects/${p.slug}</loc>
      <lastmod>${new Date(p.updated_at || p.created_at).toISOString()}</lastmod>
      <changefreq>monthly</changefreq>
      <priority>0.7</priority>
    </url>`),
    ...services.map((s) => `
    <url>
      <loc>${baseUrl}/services/${s.slug}</loc>
      <lastmod>${new Date(s.updated_at || s.created_at).toISOString()}</lastmod>
      <changefreq>monthly</changefreq>
      <priority>0.7</priority>
    </url>`),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join("")}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
