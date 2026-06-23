import Link from "next/link";
import Image from "next/image";
import { cache } from "react";
import { cacheLife, cacheTag } from "next/cache";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createPublicClient } from "@/lib/supabase/public";
import { toCamelCase } from "@/lib/utils/case";
import { toPlainText, safeImageSource } from "@/lib/utils/html";
import { sanitizeRichHtml } from "@/lib/security/sanitize-html";
import { siteConfig } from "@/lib/config/site";
import { CACHE_TAGS } from "@/lib/cache/tags";
import { PublicLayout } from "@/components/layout/public-layout";
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-json-ld";
import { ShareButtons } from "@/components/pages/blog/share-buttons";
import type { BlogArticle, BlogComment } from "@/types/pages";

type Props = { params: Promise<{ slug: string }> };

type BlogDetail = {
  article: BlogArticle;
  comments: BlogComment[];
  relatedArticles: BlogArticle[];
};

export const getBlogDetailData = cache(async function getBlogDetailData(slug: string): Promise<BlogDetail | null> {
  "use cache";
  cacheLife("hours");
  cacheTag(`blog-${slug}`, CACHE_TAGS.blog);

  const supabase = createPublicClient();

  const { data: rawArticle, error } = await supabase
    .from("blog_artikel")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (error || !rawArticle) return null;

  const [commentsResult, relatedResult] = await Promise.all([
    supabase
      .from("blog_komentar")
      .select("*")
      .eq("artikel_id", rawArticle.id as string)
      .eq("approved", true)
      .order("created_at", { ascending: false }),
    supabase
      .from("blog_artikel")
      .select("*")
      .eq("status", "published")
      .neq("id", rawArticle.id as string)
      .order("created_at", { ascending: false })
      .limit(3),
  ]);

  return {
    article: toCamelCase<BlogArticle>(rawArticle),
    comments: toCamelCase<BlogComment[]>(commentsResult.data ?? []),
    relatedArticles: toCamelCase<BlogArticle[]>(relatedResult.data ?? []),
  };
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { slug } = await params;
    const detail = await getBlogDetailData(slug);
    const article = detail?.article;

    if (!article) return { title: "Artikel Tidak Ditemukan" };

    return {
      title: article.judul,
      description: article.ringkasan,
      alternates: { canonical: `${siteConfig.url}/blog/${article.slug}` },
      openGraph: {
        title: article.judul,
        description: article.ringkasan,
        type: "article",
        url: `${siteConfig.url}/blog/${article.slug}`,
        publishedTime: article.publishedAt ?? undefined,
        images: article.thumbnailUrl ? [{ url: article.thumbnailUrl, alt: article.judul }] : undefined,
      },
    };
  } catch {
    return { title: "Blog" };
  }
}

export default async function BlogDetailPage({ params }: Props) {
  const { slug } = await params;
  let detail: BlogDetail | null = null;

  try {
    detail = await getBlogDetailData(slug);
  } catch (error) {
    console.error("[blog-detail] Failed to fetch blog data:", error);
  }

  if (!detail) notFound();

  const { article, comments, relatedArticles } = detail;
  const sanitizedContent = sanitizeRichHtml(article.konten || article.ringkasan);
  const thumbnail = safeImageSource(article.thumbnailUrl);

  const publishedDate = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <PublicLayout>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "/" },
          { name: "Blog", url: "/blog" },
          { name: article.judul, url: `/blog/${article.slug}` },
        ]}
      />
      <article className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <Link href="/blog" className="mb-8 inline-flex text-sm font-mono text-primary hover:underline">
          BACK_TO_FEED
        </Link>
        <div className="mb-6 flex flex-wrap items-center gap-3 text-xs font-mono uppercase text-muted-foreground">
          <span>{article.kategoriNama || "General"}</span>
          {publishedDate && (
            <>
              <span>•</span>
              <time dateTime={article.publishedAt ?? undefined}>{publishedDate}</time>
            </>
          )}
          <span>•</span>
          <span>{article.waktuBaca || 5} min read</span>
          <span>•</span>
          <span>{article.jumlahView || 0} views</span>
        </div>
        <div className="mb-6">
          <ShareButtons
            url={`${siteConfig.url}/blog/${article.slug}`}
            title={article.judul}
          />
        </div>
        <h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground md:text-6xl">
          {article.judul}
        </h1>
        {article.ringkasan && (
          <p className="mb-10 text-lg leading-8 text-muted-foreground md:text-xl">
            {article.ringkasan}
          </p>
        )}
        {thumbnail && (
          <div className="mb-10 aspect-video w-full relative rounded-2xl border border-border overflow-hidden">
            <Image
              src={thumbnail}
              alt={article.judul}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 768px"
              priority
            />
          </div>
        )}
        <div
          className="irnk-prose"
          dangerouslySetInnerHTML={{ __html: sanitizedContent }}
        />
        <div className="mt-14 border border-primary/20 bg-card/50 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center shrink-0">
              <span className="font-orbitron text-lg font-bold text-primary">
                {siteConfig.owner.name.split(" ").map((n) => n[0]).join("")}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-mono text-[10px] uppercase tracking-widest text-primary/70 mb-1">Ditulis oleh</p>
              <p className="font-orbitron text-sm font-bold text-foreground">{siteConfig.owner.name}</p>
              <p className="font-mono text-xs text-muted-foreground mt-1">{siteConfig.owner.title}</p>
              <p className="font-mono text-xs text-muted-foreground/70 mt-2 leading-relaxed">{siteConfig.owner.bio}</p>
            </div>
            <Link href="/about" prefetch={false} className="shrink-0 font-mono text-xs text-primary hover:underline">
              Lihat Profil →
            </Link>
          </div>
        </div>
        <section className="mt-14 border-t border-border pt-8">
          <h2 className="mb-4 text-2xl font-bold">Komentar</h2>
          {comments.length === 0 ? (
            <p className="font-mono text-sm text-muted-foreground/60 py-4">
              Belum ada komentar. Jadilah yang pertama berkomentar.
            </p>
          ) : (
            <div className="space-y-4">
              {comments.slice(0, 10).map((comment) => (
                <div key={String(comment.id)} className="rounded-xl border border-border bg-secondary/30 p-4">
                  <p className="font-mono text-sm text-primary">{comment.namaKomentator}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{toPlainText(comment.isiKomentar)}</p>
                </div>
              ))}
            </div>
          )}
        </section>
        <section className="mt-14 border-t border-border pt-8">
          <h2 className="mb-4 text-2xl font-bold">Artikel Terkait</h2>
          {relatedArticles.length === 0 ? (
            <p className="font-mono text-sm text-muted-foreground/60 py-4">
              Belum ada artikel terkait.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-3">
              {relatedArticles.map((related) => (
                <Link key={String(related.id)} href={`/blog/${related.slug}`} className="rounded-xl border border-border bg-secondary/30 p-4 hover:border-primary/60">
                  <h3 className="font-semibold text-foreground">{related.judul}</h3>
                  {related.ringkasan && <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{related.ringkasan}</p>}
                </Link>
              ))}
            </div>
          )}
        </section>
      </article>
    </PublicLayout>
  );
}
