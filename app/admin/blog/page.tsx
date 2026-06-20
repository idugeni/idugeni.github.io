import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth/rbac";
import { queryPooler } from "@/lib/db/pooler";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Edit, Eye, Loader2Icon, Plus, Star, Tag } from "@/lib/icons";

export const metadata: Metadata = { title: "Blog" };

type AdminBlogSearchParams = Promise<Record<string, string | string[] | undefined>>;

type BlogStatus = "draft" | "published";

type AdminBlogArticle = {
  id: string;
  judul: string;
  slug: string;
  ringkasan: string | null;
  konten: string | null;
  thumbnail_url: string | null;
  status: BlogStatus;
  featured: boolean | string | null;
  jumlah_view: number | string | null;
  jumlah_like: number | string | null;
  waktu_baca: number | string | null;
  published_at: string | Date | null;
  created_at: string | Date | null;
  kategori: Category | null;
};

type Category = { id: string; nama: string; warna: string | null };

type BlogStats = { total: number; published: number; draft: number; featured: number };

type BlogPagination = { page: number; pageSize: number; totalItems: number; totalPages: number };

type BlogPageData = {
  articles: AdminBlogArticle[];
  stats: BlogStats;
  categories: Category[];
  pagination: BlogPagination;
};

const ADMIN_BLOG_PAGE_SIZE = 20;
const SORT_COLUMNS: Record<string, string> = {
  date: "created_at",
  views: "jumlah_view",
  likes: "jumlah_like",
  title: "judul",
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

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

function getTotalPages(totalItems: number, pageSize: number) {
  return Math.max(1, Math.ceil(totalItems / pageSize));
}

async function getAdminBlogReadModel(rawParams: Record<string, string | string[] | undefined>): Promise<BlogPageData> {
  await requireAdmin();

  const pageParam = Number(firstParam(rawParams.page));
  const page = Number.isFinite(pageParam) && pageParam > 0 ? Math.floor(pageParam) : 1;
  const q = firstParam(rawParams.q)?.trim().slice(0, 100);
  const statusParam = firstParam(rawParams.status);
  const category = firstParam(rawParams.category);
  const featured = firstParam(rawParams.featured);
  const sortParam = firstParam(rawParams.sort) ?? "date";
  const orderParam = firstParam(rawParams.order) === "asc" ? "ASC" : "DESC";
  const sortColumn = SORT_COLUMNS[sortParam] ?? SORT_COLUMNS.date;

  const conditions: string[] = [];
  const params: unknown[] = [];
  let idx = 1;

  if (q) {
    conditions.push(`a.judul ILIKE $${idx++}`);
    params.push(`%${q}%`);
  }

  if (statusParam === "published" || statusParam === "draft") {
    conditions.push(`a.status = $${idx++}`);
    params.push(statusParam);
  }

  if (category && /^[0-9a-fA-F-]{36}$/.test(category)) {
    conditions.push(`a.kategori_id = $${idx++}`);
    params.push(category);
  }

  if (featured === "true") {
    conditions.push("a.featured = true");
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const countRows = await queryPooler<{ count: number }>(
    `SELECT COUNT(*)::int AS count FROM blog_artikel a ${whereClause}`,
    params,
  );
  const totalItems = toClientNumber(countRows[0]?.count);
  const totalPages = getTotalPages(totalItems, ADMIN_BLOG_PAGE_SIZE);
  const safePage = Math.min(page, totalPages);
  const offset = (safePage - 1) * ADMIN_BLOG_PAGE_SIZE;

  const limitIdx = idx++;
  const offsetIdx = idx++;
  const articles = await queryPooler<AdminBlogArticle>(
    `SELECT
      a.id, a.judul, a.slug, a.ringkasan, a.konten, a.thumbnail_url,
      a.status, a.featured, a.jumlah_view, a.jumlah_like, a.waktu_baca,
      a.published_at, a.created_at,
      CASE WHEN k.id IS NOT NULL
        THEN json_build_object('id', k.id, 'nama', k.nama, 'warna', k.warna)
        ELSE NULL
      END AS kategori
    FROM blog_artikel a
    LEFT JOIN kategori k ON a.kategori_id = k.id
    ${whereClause}
    ORDER BY a.${sortColumn} ${orderParam}
    LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
    [...params, ADMIN_BLOG_PAGE_SIZE, offset],
  );

  const [statsRows, categories] = await Promise.all([
    queryPooler<BlogStats>(
      `SELECT
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE status = 'published')::int AS published,
        COUNT(*) FILTER (WHERE status = 'draft')::int AS draft,
        COUNT(*) FILTER (WHERE featured = true)::int AS featured
      FROM blog_artikel`,
    ),
    queryPooler<Category>(`SELECT id, nama, warna FROM kategori ORDER BY nama ASC`),
  ]);

  const stats = statsRows[0] ?? { total: 0, published: 0, draft: 0, featured: 0 };

  return {
    articles: articles.map((article) => ({
      ...article,
      featured: toClientBoolean(article.featured),
      jumlah_view: toClientNumber(article.jumlah_view),
      jumlah_like: toClientNumber(article.jumlah_like),
      waktu_baca: toClientNumber(article.waktu_baca),
      published_at: toClientDate(article.published_at),
      created_at: toClientDate(article.created_at),
      kategori: article.kategori
        ? {
            id: String(article.kategori.id),
            nama: String(article.kategori.nama),
            warna: article.kategori.warna ? String(article.kategori.warna) : null,
          }
        : null,
    })),
    stats: {
      total: toClientNumber(stats.total),
      published: toClientNumber(stats.published),
      draft: toClientNumber(stats.draft),
      featured: toClientNumber(stats.featured),
    },
    categories: categories.map((categoryItem) => ({
      id: String(categoryItem.id),
      nama: String(categoryItem.nama),
      warna: categoryItem.warna ? String(categoryItem.warna) : null,
    })),
    pagination: {
      page: safePage,
      pageSize: ADMIN_BLOG_PAGE_SIZE,
      totalItems,
      totalPages,
    },
  };
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

function BlogHeader() {
  return (
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
  );
}

async function BlogContent({ searchParams }: { searchParams: AdminBlogSearchParams }) {
  try {
    const params = await searchParams;
    const pageData = await getAdminBlogReadModel(params);

    return (
      <div className="space-y-6">
        <BlogHeader />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total" value={pageData.stats.total} />
          <StatCard label="Published" value={pageData.stats.published} />
          <StatCard label="Draft" value={pageData.stats.draft} />
          <StatCard label="Featured" value={pageData.stats.featured} />
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
              SERVER_RENDERED_READ_MODEL
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
                          {article.kategori ? (
                            <span className="inline-flex items-center gap-2 border border-border/50 bg-secondary px-2 py-1 font-mono text-[11px]">
                              <span
                                className="h-2.5 w-2.5 rounded-full"
                                style={{ backgroundColor: article.kategori.warna || "hsl(var(--primary))" }}
                              />
                              {article.kategori.nama}
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
          Loaded {pageData.categories.length} blog categories.
        </div>
      </div>
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load blog data";

    return (
      <div className="space-y-6">
        <BlogHeader />
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
