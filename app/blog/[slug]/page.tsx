import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { cacheLife, cacheTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache/tags";
import { queryPooler, queryPoolerSingle } from "@/lib/db/pooler";
import { toCamelCase } from "@/lib/utils/case";
import { PublicLayout } from "@/components/layout/public-layout";
import { BlogDetailClient } from "@/components/pages/blog/blog-detail-client";
import { ArticleJsonLd } from "@/components/seo/article-json-ld";
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-json-ld";
import type { BlogArticle, BlogComment } from "@/types/pages";
import { renderRichHtml } from "@/lib/content/rich-html";

type Props = { params: Promise<{ slug: string }> };

const BLOG_DETAIL_CACHE_LIFE = {
  stale: 300,
  revalidate: 300,
  expire: 3_600,
} as const;

async function getBlogSlugs() {
  "use cache";
  cacheLife(BLOG_DETAIL_CACHE_LIFE);
  cacheTag(CACHE_TAGS.blog);

  const rows = await queryPooler<{ slug: string }>(
    `SELECT slug FROM blog_artikel WHERE status='published' AND slug IS NOT NULL ORDER BY published_at DESC`
  );
  return rows.map((r) => r.slug).filter(Boolean);
}

async function getBlogDetailData(slug: string) {
  "use cache";
  cacheLife(BLOG_DETAIL_CACHE_LIFE);
  cacheTag(CACHE_TAGS.blog);

  const rawArticle = await queryPoolerSingle<Record<string, unknown>>(
    `SELECT * FROM blog_artikel WHERE slug=$1 AND status='published'`,
    [slug]
  );

  if (!rawArticle) {
    return null;
  }

  const [rawComments, rawRelated] = await Promise.all([
    queryPooler<Record<string, unknown>>(
      `SELECT * FROM blog_komentar WHERE artikel_id=$1 AND approved=true ORDER BY created_at DESC`,
      [rawArticle.id as string]
    ),
    queryPooler<Record<string, unknown>>(
      `SELECT * FROM blog_artikel WHERE status='published' AND id != $1 ORDER BY created_at DESC LIMIT 3`,
      [rawArticle.id as string]
    ),
  ]);

  const article = toCamelCase<BlogArticle>(rawArticle);
  const comments = toCamelCase<BlogComment[]>(rawComments);
  const relatedArticles = toCamelCase<BlogArticle[]>(rawRelated);
  const processedContent = await renderRichHtml(article.konten);

  return { article, comments, relatedArticles, processedContent };
}

export async function generateStaticParams() {
  const slugs = await getBlogSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const detail = await getBlogDetailData(slug);

  if (!detail) {
    return { title: "Artikel Tidak Ditemukan" };
  }

  const { article } = detail;
  const baseUrl = "https://irnk.codes";

  return {
    title: article.judul,
    description: article.ringkasan,
    authors: [{ name: "Eliyanto Sarage" }],
    openGraph: {
      title: article.judul,
      description: article.ringkasan,
      type: "article",
      publishedTime: article.publishedAt ?? undefined,
      authors: ["Eliyanto Sarage"],
      url: `${baseUrl}/blog/${article.slug}`,
      images: article.thumbnailUrl
        ? [{ url: article.thumbnailUrl, width: 1200, height: 630, alt: article.judul }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: article.judul,
      description: article.ringkasan,
      images: article.thumbnailUrl ? [article.thumbnailUrl] : undefined,
      creator: "@idugeni",
    },
    alternates: {
      canonical: `${baseUrl}/blog/${article.slug}`,
    },
  };
}

export default async function BlogDetailPage({ params }: Props) {
  const { slug } = await params;
  const detail = await getBlogDetailData(slug);

  if (!detail) {
    notFound();
  }

  const { article, comments, relatedArticles, processedContent } = detail;

  return (
    <PublicLayout>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "/" },
          { name: "Blog", url: "/blog" },
          { name: article.judul, url: `/blog/${article.slug}` },
        ]}
      />
      <ArticleJsonLd article={article} commentCount={comments.length} />
      <BlogDetailClient
        article={article}
        comments={comments}
        relatedArticles={relatedArticles}
        processedContent={processedContent}
      />
    </PublicLayout>
  );
}
