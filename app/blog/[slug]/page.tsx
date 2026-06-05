import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { cacheLife, cacheTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache/tags";
import { createPublicClient } from "@/lib/supabase/public";
import { toCamelCase } from "@/lib/utils/case";
import { PublicLayout } from "@/components/layout/public-layout";
import { BlogDetailClient } from "@/components/pages/blog/blog-detail-client";
import { ArticleJsonLd } from "@/components/seo/article-json-ld";
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

  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("blog_artikel")
    .select("slug")
    .eq("status", "published")
    .not("slug", "is", null)
    .order("published_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? [])
    .map((article) => article.slug)
    .filter((slug): slug is string => Boolean(slug));
}

async function getBlogDetailData(slug: string) {
  "use cache";
  cacheLife(BLOG_DETAIL_CACHE_LIFE);
  cacheTag(CACHE_TAGS.blog);

  const supabase = createPublicClient();

  const { data: rawArticle, error: articleError } = await supabase
    .from("blog_artikel")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (articleError) {
    throw articleError;
  }

  if (!rawArticle) {
    return null;
  }

  const [{ data: rawComments, error: commentsError }, { data: rawRelated, error: relatedError }] =
    await Promise.all([
      supabase
        .from("blog_komentar")
        .select("*")
        .eq("artikel_id", rawArticle.id)
        .eq("approved", true)
        .order("created_at", { ascending: false }),
      supabase
        .from("blog_artikel")
        .select("*")
        .eq("status", "published")
        .neq("id", rawArticle.id)
        .order("created_at", { ascending: false })
        .limit(3),
    ]);

  if (commentsError) {
    throw commentsError;
  }

  if (relatedError) {
    throw relatedError;
  }

  const article = toCamelCase<BlogArticle>(rawArticle);
  const comments = toCamelCase<BlogComment[]>(rawComments ?? []);
  const relatedArticles = toCamelCase<BlogArticle[]>(rawRelated ?? []);
  const processedContent = await renderRichHtml(article.konten);

  return {
    article,
    comments,
    relatedArticles,
    processedContent,
  };
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
      <ArticleJsonLd article={article} />
      <BlogDetailClient
        article={article}
        comments={comments}
        relatedArticles={relatedArticles}
        processedContent={processedContent}
      />
    </PublicLayout>
  );
}
