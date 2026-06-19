import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { queryPooler, queryPoolerSingle } from "@/lib/db/pooler";
import { toCamelCase } from "@/lib/utils/case";
import { PublicLayout } from "@/components/layout/public-layout";
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-json-ld";
import type { BlogArticle, BlogComment } from "@/types/pages";

export const dynamic = "force-dynamic";

const BASE_URL = "https://irnk.codes";

type Props = { params: Promise<{ slug: string }> };

type BlogDetail = {
  article: BlogArticle;
  comments: BlogComment[];
  relatedArticles: BlogArticle[];
};

function toPlainText(value: unknown) {
  return String(value ?? "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/h[1-6]>/gi, "\n\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function getParagraphs(content: unknown) {
  const text = toPlainText(content);
  return text ? text.split(/\n{2,}/).map((item) => item.trim()).filter(Boolean) : [];
}

function safeImageSource(value: unknown) {
  const src = typeof value === "string" ? value.trim() : "";
  if (!src) return null;
  if (src.startsWith("/") || /^https?:\/\//i.test(src)) return src;
  return null;
}

async function getBlogDetailData(slug: string): Promise<BlogDetail | null> {
  const rawArticle = await queryPoolerSingle<Record<string, unknown>>(
    `SELECT * FROM blog_artikel WHERE slug=$1 AND status='published'`,
    [slug]
  );

  if (!rawArticle) return null;

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

  return {
    article: toCamelCase<BlogArticle>(rawArticle),
    comments: toCamelCase<BlogComment[]>(rawComments),
    relatedArticles: toCamelCase<BlogArticle[]>(rawRelated),
  };
}

async function getBlogMetadataData(slug: string) {
  const rawArticle = await queryPoolerSingle<Record<string, unknown>>(
    `SELECT judul, ringkasan, slug, published_at AS "publishedAt", thumbnail_url AS "thumbnailUrl" FROM blog_artikel WHERE slug=$1 AND status='published'`,
    [slug]
  );

  return rawArticle ? toCamelCase<BlogArticle>(rawArticle) : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { slug } = await params;
    const article = await getBlogMetadataData(slug);

    if (!article) return { title: "Artikel Tidak Ditemukan" };

    return {
      title: article.judul,
      description: article.ringkasan,
      alternates: { canonical: `${BASE_URL}/blog/${article.slug}` },
      openGraph: {
        title: article.judul,
        description: article.ringkasan,
        type: "article",
        url: `${BASE_URL}/blog/${article.slug}`,
        images: article.thumbnailUrl ? [{ url: article.thumbnailUrl, alt: article.judul }] : undefined,
      },
    };
  } catch (error) {
    console.error("[blog-detail] generateMetadata failed:", error);
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
  const paragraphs = getParagraphs(article.konten || article.ringkasan);
  const thumbnail = safeImageSource(article.thumbnailUrl);

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
        <a href="/blog" className="mb-8 inline-flex text-sm font-mono text-primary hover:underline">
          BACK_TO_FEED
        </a>
        <div className="mb-6 flex flex-wrap items-center gap-3 text-xs font-mono uppercase text-muted-foreground">
          <span>{article.kategoriNama || "General"}</span>
          <span>•</span>
          <span>{article.waktuBaca || 5} min read</span>
          <span>•</span>
          <span>{article.jumlahView || 0} views</span>
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
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbnail}
            alt={article.judul}
            className="mb-10 aspect-video w-full rounded-2xl border border-border object-cover"
            loading="eager"
          />
        )}
        <div className="space-y-6 text-base leading-8 text-foreground md:text-lg">
          {paragraphs.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
        {comments.length > 0 && (
          <section className="mt-14 border-t border-border pt-8">
            <h2 className="mb-4 text-2xl font-bold">Komentar</h2>
            <div className="space-y-4">
              {comments.slice(0, 10).map((comment) => (
                <div key={String(comment.id)} className="rounded-xl border border-border bg-secondary/30 p-4">
                  <p className="font-mono text-sm text-primary">{comment.namaKomentator}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{toPlainText(comment.isiKomentar)}</p>
                </div>
              ))}
            </div>
          </section>
        )}
        {relatedArticles.length > 0 && (
          <section className="mt-14 border-t border-border pt-8">
            <h2 className="mb-4 text-2xl font-bold">Artikel Terkait</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {relatedArticles.map((related) => (
                <a key={String(related.id)} href={`/blog/${related.slug}`} className="rounded-xl border border-border bg-secondary/30 p-4 hover:border-primary/60">
                  <h3 className="font-semibold text-foreground">{related.judul}</h3>
                  {related.ringkasan && <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{related.ringkasan}</p>}
                </a>
              ))}
            </div>
          </section>
        )}
      </article>
    </PublicLayout>
  );
}
