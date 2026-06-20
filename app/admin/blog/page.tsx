import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { getAdminBlogArticlesPage, getBlogStats } from "@/actions/blog";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { Edit, Eye, Loader2Icon, Plus, Star, Tag } from "@/lib/icons";

export const metadata: Metadata = { title: "Blog" };

type AdminBlogSearchParams = Promise<Record<string, string | string[] | undefined>>;
type AdminBlogArticle = Awaited<ReturnType<typeof getAdminBlogArticlesPage>>["articles"][number];
type Category = { id: string; nama: string; warna: string | null };

function toClientDate(value: unknown): string | null {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") return value;
  return String(value);
}

function toClientNumber(value: unknown): number {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : 0;
}

function toClientBoolean(value: unknown): boolean {
  return value === true || value === "true";
}

function getArticleCategory(article: AdminBlogArticle): Category | null {
  const kategori = Array.isArray(article.kategori)
    ? article.kategori[0] ?? null
    : article.kategori ?? null;

  if (!kategori) return null;

  return {
    id: String(kategori.id),
    nama: String(kategori.nama),
    warna: kategori.warna ? String(kategori.warna) : null,
  };
}

function formatDate(value: unknown) {
  const dateValue = toClientDate(value);
  if (!dateValue) return "UNPUBLISHED";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "INVALID_DATE";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function excerpt(article: AdminBlogArticle) {
  const source = article.ringkasan || article.konten || "";
  return String(source).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-none border border-border/50 bg-card/70 p-5 shadow-[0_0_32px_hsl(var(--primary)/0.05)]">
      <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground">{label}</p>
      <p className="mt-2 font-orbitron text-3xl font-bold text-primary">{value}</p>
    </div>
  );
}

function ErrorPanel({ message }: { message: string }) {
  return (
    <div className="rounded-none border border-red-500/30 bg-red-500/10 p-6">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-red-300">ADMIN_BLOG_DATA_ERROR</p>
      <p className="mt-3 break-words font-mono text-sm text-red-100">{message}</p>
      <p className="mt-3 font-mono text-xs text-red-200/70">
        The admin shell remains available while the data source is recovered.
      </p>
    </div>
  );
}

async function BlogContent({ searchParams }: { searchParams: AdminBlogSearchParams }) {
  try {
    const params = await searchParams;
    const [pageData, stats] = await Promise.all([
      getAdminBlogArticlesPage(params),
      getBlogStats(),
    ]);

    const supabase = await createClient();
    const { data: categories } = await supabase
      .from("kategori")
      .select("id, nama, warna")
      .order("nama");

    return (
      <div className="space-y-6">
        <AdminPageHeader
          eyebrow="EDITORIAL_CONTROL_CENTER"
          title="Blog"
          subtitle="Manage editorial transmissions, categories, status pipeline, featured placement, and SEO publication signals."
          actions={
            <>
              <Button asChild variant="outline" className="rounded-none font-mono">
                <Link href="/admin/categories" prefetch={false}>
                  <Tag className="mr-2 h-4 w-4" /> CATEGORIES
                </Link>
              </Button>
              <Button asChild className="rounded-none bg-primary font-mono text-primary-foreground hover:bg-primary/90">
                <Link href="/admin/blog/new" prefetch={false}>
                  <Plus className="mr-2 h-4 w-4" /> NEW_TRANSMISSION
                </Link>
              </Button>
            </>
          }
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total" value={toClientNumber(stats.total)} />
          <StatCard label="Published" value={toClientNumber(stats.published)} />
          <StatCard label="Draft" value={toClientNumber(stats.draft)} />
          <StatCard label="Featured" value={toClientNumber(stats.featured)} />
        </div>

        <div className="rounded-none border border-border/50 bg-card/70">
          <div className="flex flex-col gap-2 border-b border-border/50 p-5 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="font-orbitron text-xl font-bold text-foreground">TRANSMISSION_LOGS</h2>
              <p className="mt-1 font-mono text-xs text-muted-foreground">
                PAGE {pageData.pagination.page}/{pageData.pagination.totalPages} · {pageData.pagination.totalItems} ITEMS
              </p>
            </div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
              SERVER_RENDERED_SAFE_MODE
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] border-collapse text-left">
              <thead>
                <tr className="border-b border-border/50 bg-secondary/40 font-mono text-xs text-primary">
                  <th className="px-5 py-4">ARTICLE_DETAIL</th>
                  <th className="px-5 py-4">CATEGORY</th>
                  <th className="px-5 py-4">STATUS</th>
                  <th className="px-5 py-4">METRICS</th>
                  <th className="px-5 py-4 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {pageData.articles.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center font-mono text-sm text-muted-foreground">
                      NO_ARTICLES_FOUND
                    </td>
                  </tr>
                ) : (
                  pageData.articles.map((article) => {
                    const category = getArticleCategory(article);
                    const isPublished = article.status === "published";
                    const isFeatured = toClientBoolean(article.featured);

                    return (
                      <tr key={article.id} className="border-b border-border/40 align-top transition-colors hover:bg-secondary/35">
                        <td className="px-5 py-5">
                          <div className="max-w-xl space-y-2">
                            <div className="flex items-start gap-2">
                              {isFeatured && <Star className="mt-1 h-4 w-4 shrink-0 fill-yellow-500 text-yellow-500" />}
                              <h3 className="break-words font-mono text-base font-semibold text-foreground">
                                {article.judul}
                              </h3>
                            </div>
                            <p className="break-all font-mono text-xs text-primary/80">/{article.slug}</p>
                            <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">{excerpt(article)}</p>
                            <p className="font-mono text-[11px] text-muted-foreground">{formatDate(article.published_at)}</p>
                          </div>
                        </td>
                        <td className="px-5 py-5">
                          {category ? (
                            <span className="inline-flex items-center gap-2 border border-border/50 bg-secondary px-2 py-1 font-mono text-[11px]">
                              <span
                                className="h-2.5 w-2.5 rounded-full"
                                style={{ backgroundColor: category.warna || "hsl(var(--primary))" }}
                              />
                              {category.nama}
                            </span>
                          ) : (
                            <span className="border border-border/50 px-2 py-1 font-mono text-[11px] text-muted-foreground">NO_CATEGORY</span>
                          )}
                        </td>
                        <td className="px-5 py-5">
                          <span className={isPublished
                            ? "border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 font-mono text-[11px] text-emerald-300"
                            : "border border-amber-500/30 bg-amber-500/10 px-2 py-1 font-mono text-[11px] text-amber-300"
                          }>
                            {String(article.status).toUpperCase()}
                          </span>
                        </td>
                        <td className="px-5 py-5 font-mono text-xs text-muted-foreground">
                          <div>{toClientNumber(article.jumlah_view)} views</div>
                          <div>{toClientNumber(article.jumlah_like)} likes</div>
                          <div>{toClientNumber(article.waktu_baca)} min read</div>
                        </td>
                        <td className="px-5 py-5 text-right">
                          <div className="flex justify-end gap-2">
                            {isPublished && (
                              <Button asChild variant="outline" size="sm" className="rounded-none font-mono">
                                <Link href={`/blog/${article.slug}`} target="_blank" prefetch={false}>
                                  <Eye className="mr-2 h-3.5 w-3.5" /> VIEW
                                </Link>
                              </Button>
                            )}
                            <Button asChild variant="outline" size="sm" className="rounded-none font-mono">
                              <Link href={`/admin/blog/${article.slug}/edit`} prefetch={false}>
                                <Edit className="mr-2 h-3.5 w-3.5" /> EDIT
                              </Link>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="sr-only" aria-hidden="true">
          Loaded {categories?.length ?? 0} blog categories.
        </div>
      </div>
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load blog data";

    return (
      <div className="space-y-6">
        <AdminPageHeader
          eyebrow="EDITORIAL_CONTROL_CENTER"
          title="Blog"
          subtitle="The admin blog shell is available, but the data pipeline returned an error."
          actions={
            <Button asChild className="rounded-none bg-primary font-mono text-primary-foreground hover:bg-primary/90">
              <Link href="/admin/blog/new" prefetch={false}>
                <Plus className="mr-2 h-4 w-4" /> NEW_TRANSMISSION
              </Link>
            </Button>
          }
        />
        <ErrorPanel message={message} />
      </div>
    );
  }
}

function BlogLoading() {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 py-20">
      <Loader2Icon className="h-8 w-8 animate-spin text-primary" />
      <p className="font-mono text-xs text-muted-foreground">Loading blog data...</p>
    </div>
  );
}

export default function AdminBlog({ searchParams }: { searchParams: AdminBlogSearchParams }) {
  return (
    <Suspense fallback={<BlogLoading />}>
      <BlogContent searchParams={searchParams} />
    </Suspense>
  );
}
