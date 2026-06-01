import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { toCamelCase } from "@/lib/utils/case";
import { PublicLayout } from "@/components/layout/public-layout";
import { BlogDetailClient } from "@/components/pages/blog/blog-detail-client";
import { ArticleJsonLd } from "@/components/seo/article-json-ld";
import type { BlogArticle, BlogComment } from "@/types/pages";
import { renderRichHtml } from "@/lib/content/rich-html";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: article } = await supabase
    .from("blog_artikel")
    .select("judul, ringkasan, thumbnail_url, published_at, slug, kategori_id")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (!article) {
    return { title: "Artikel Tidak Ditemukan" };
  }

  const baseUrl = "https://irnk.codes";

  return {
    title: article.judul,
    description: article.ringkasan,
    authors: [{ name: "Eliyanto Sarage" }],
    openGraph: {
      title: article.judul,
      description: article.ringkasan,
      type: "article",
      publishedTime: article.published_at ?? undefined,
      authors: ["Eliyanto Sarage"],
      url: `${baseUrl}/blog/${article.slug}`,
      images: article.thumbnail_url
        ? [{ url: article.thumbnail_url, width: 1200, height: 630, alt: article.judul }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: article.judul,
      description: article.ringkasan,
      images: article.thumbnail_url ? [article.thumbnail_url] : undefined,
      creator: "@idugeni",
    },
    alternates: {
      canonical: `${baseUrl}/blog/${article.slug}`,
    },
  };
}

export default async function BlogDetailPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: rawArticle } = await supabase
    .from("blog_artikel")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (!rawArticle) {
    notFound();
  }

  const { data: rawComments } = await supabase
    .from("blog_komentar")
    .select("*")
    .eq("artikel_id", rawArticle.id)
    .eq("approved", true)
    .order("created_at", { ascending: false });

  const { data: rawRelated } = await supabase
    .from("blog_artikel")
    .select("*")
    .eq("status", "published")
    .neq("id", rawArticle.id)
    .order("created_at", { ascending: false })
    .limit(3);

  const article = toCamelCase<BlogArticle>(rawArticle);
  const comments = toCamelCase<BlogComment[]>(rawComments ?? []);
  const relatedArticles = toCamelCase<BlogArticle[]>(rawRelated ?? []);
  const processedContent = await renderRichHtml(article.konten);

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
