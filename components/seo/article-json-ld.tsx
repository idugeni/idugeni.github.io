import { siteConfig } from "@/lib/config/site";
import type { BlogArticle } from "@/types/pages";

interface ArticleJsonLdProps {
  article: BlogArticle;
}

export function ArticleJsonLd({ article }: ArticleJsonLdProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.judul,
    description: article.ringkasan,
    image: article.thumbnailUrl
      ? article.thumbnailUrl
      : `${siteConfig.url}/opengraph.jpg`,
    author: {
      "@type": "Person",
      name: siteConfig.owner.name,
      url: siteConfig.url,
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      logo: {
        "@type": "ImageObject",
        url: `${siteConfig.url}/irnk.png`,
      },
    },
    datePublished: article.publishedAt || article.createdAt,
    dateModified: article.updatedAt,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${siteConfig.url}/blog/${article.slug}`,
    },
    url: `${siteConfig.url}/blog/${article.slug}`,
    inLanguage: "id-ID",
    wordCount: article.konten?.split(/\s+/).length || 0,
    timeRequired: `PT${article.waktuBaca || 5}M`,
    interactionStatistic: [
      {
        "@type": "InteractionCounter",
        interactionType: "https://schema.org/LikeAction",
        userInteractionCount: article.jumlahLike,
      },
      {
        "@type": "InteractionCounter",
        interactionType: "https://schema.org/ReadAction",
        userInteractionCount: article.jumlahView,
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
