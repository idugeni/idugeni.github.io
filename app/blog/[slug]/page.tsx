import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { queryPooler, queryPoolerSingle } from "@/lib/db/pooler";
import { toCamelCase } from "@/lib/utils/case";
import { PublicLayout } from "@/components/layout/public-layout";
import { BlogDetailClient } from "@/components/pages/blog/blog-detail-client";
import { ArticleJsonLd } from "@/components/seo/article-json-ld";
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-json-ld";
import type { BlogArticle, BlogComment } from "@/types/pages";
import { renderRichHtml } from "@/lib/content/rich-html";
import { connection } from "next/server";

type Props = { params: Promise<{ slug: string }> };

async function getBlogDetailData(slug: string) {

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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  await connection();
  try {
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
        publishedTime: typeof article.publishedAt === "string" ? article.publishedAt : article.publishedAt ? new Date(article.publishedAt as string).toISOString() : undefined,
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
  } catch (error) {
    console.error("[blog-detail] generateMetadata failed:", error);
    return { title: "Blog" };
  }
}

export default async function BlogDetailPage({ params }: Props) {
  // Force full server render — prevents PPR streaming crash causing blank pages
  await connection();

  const { slug } = await params;

  let detail;
  try {
    detail = await getBlogDetailData(slug);
  } catch (error) {
    console.error("[blog-detail] Failed to fetch blog data:", error);
    return (
      <PublicLayout>
        <div className="flex min-h-[60vh] items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-red-500/30 bg-red-500/10">
              <svg className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="mb-2 text-2xl font-bold text-foreground">Gagal Memuat Artikel</h2>
            <p className="mb-6 text-sm text-muted-foreground">
              Server sedang mengalami gangguan. Silakan refresh halaman dalam beberapa saat.
            </p>
            <a href="/blog" className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary">
              Kembali ke Blog
            </a>
          </div>
        </div>
      </PublicLayout>
    );
  }

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
