import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://irnk.codes";

  return {
    rules: [
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/admin/", "/api/", "/login", "/reset-password", "/update-password"],
      },
      {
        userAgent: "Bingbot",
        allow: "/",
        disallow: ["/admin/", "/api/", "/login", "/reset-password", "/update-password"],
      },
      {
        userAgent: "Slurp", // Yahoo
        allow: "/",
        disallow: ["/admin/", "/api/", "/login", "/reset-password", "/update-password"],
      },
      {
        userAgent: "DuckDuckBot",
        allow: "/",
        disallow: ["/admin/", "/api/", "/login", "/reset-password", "/update-password"],
      },
      {
        userAgent: "Baiduspider",
        allow: "/",
        disallow: ["/admin/", "/api/", "/login", "/reset-password", "/update-password"],
      },
      {
        userAgent: "YandexBot",
        allow: "/",
        disallow: ["/admin/", "/api/", "/login", "/reset-password", "/update-password"],
      },
      {
        userAgent: "facebookexternalhit", // Facebook/Meta crawler
        allow: "/",
      },
      {
        userAgent: "Twitterbot",
        allow: "/",
      },
      {
        userAgent: "LinkedInBot",
        allow: "/",
      },
      {
        userAgent: "WhatsApp",
        allow: "/",
      },
      {
        userAgent: "TelegramBot",
        allow: "/",
      },
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/", "/login", "/reset-password", "/update-password"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
