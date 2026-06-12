"use server";

import { queryPooler, queryPoolerSingle } from "@/lib/db/pooler";
import { updatePublicContent, CACHE_TAGS } from "@/lib/cache/tags";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/rbac";
import { rateLimit } from "@/lib/rate-limit";
import { sanitizeRichHtml } from "@/lib/security/sanitize-html";
import { getClientIp, uuidArraySchema, uuidSchema } from "@/lib/security/server-action";
import { getPaginationRange, getTotalPages, parsePositiveInt } from "@/lib/utils/pagination";

// Validation schemas
const createBlogArticleSchema = z.object({
  judul: z.string().min(1).max(200).trim(),
  slug: z.string().min(1).max(200).trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase kebab-case"),
  ringkasan: z.string().min(1).max(500).trim(),
  konten: z.string().min(10),
  kategoriId: z.string().uuid().optional().or(z.literal("")),
  status: z.enum(["draft", "published"]),
  featured: z.boolean().optional(),
  thumbnailUrl: z.string().url().max(500).optional().or(z.literal("")),
  tags: z.array(z.string().min(1).max(40)).max(12).optional(),
  metaTitle: z.string().max(200).optional(),
  metaDescription: z.string().max(500).optional(),
  waktuBaca: z.number().int().min(1).max(120).optional(),
  jumlahView: z.number().int().min(0).max(999_999_999).optional(),
});

const updateBlogArticleSchema = createBlogArticleSchema.partial();
const createBlogCommentSchema = z.object({
  nama_komentator: z.string().min(1).max(100).trim(),
  email_komentator: z.string().email().max(255).trim().toLowerCase(),
  isi_komentar: z.string().min(3).max(2000).trim(),
  artikel_id: uuidSchema,
});
const bulkArticleUpdateSchema = z.object({
  status: z.enum(["draft", "published"]).optional(),
  featured: z.boolean().optional(),
}).refine((value) => Object.keys(value).length > 0, "At least one update field is required");
const adminBlogFiltersSchema = z.object({
  page: z.unknown().optional(),
  q: z.string().max(100).optional(),
  status: z.enum(["published", "draft"]).optional(),
  category: z.string().uuid().optional(),
  featured: z.enum(["true"]).optional(),
  sort: z.enum(["date", "views", "likes", "title"]).optional(),
  order: z.enum(["asc", "desc"]).optional(),
});
const ADMIN_BLOG_PAGE_SIZE = 20;
const blogCategorySchema = z.object({
  nama: z.string().min(1).max(100).trim(),
  slug: z.string().min(1).max(120).trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase kebab-case").optional().or(z.literal("")),
  deskripsi: z.string().max(500).trim().optional().or(z.literal("")),
  warna: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Color must be a valid hex value").optional().or(z.literal("")),
});
const blogCategoryUpdateSchema = blogCategorySchema.partial();

function createSlug(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export async function getBlogArticles(filters?: { kategori?: string; search?: string; status?: string }) {
  const conditions: string[] = [];
  const params: unknown[] = [];
  let idx = 1;

  if (filters?.kategori) {
    conditions.push(`kategori_id = $${idx++}`);
    params.push(filters.kategori);
  }
  if (filters?.search) {
    conditions.push(`judul ILIKE $${idx++}`);
    params.push(`%${filters.search}%`);
  }
  if (filters?.status) {
    conditions.push(`status = $${idx++}`);
    params.push(filters.status);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  return queryPooler(`SELECT * FROM blog_artikel ${whereClause} ORDER BY created_at DESC`, params);
}

export async function getAdminBlogArticlesPage(filters: Record<string, unknown> = {}) {
  await requireAdmin();

  const parsed = adminBlogFiltersSchema.safeParse(filters);
  if (!parsed.success) {
    throw new Error("Invalid admin blog filters: " + parsed.error.issues[0].message);
  }

  const page = parsePositiveInt(parsed.data.page, 1);
  const { from } = getPaginationRange(page, ADMIN_BLOG_PAGE_SIZE);
  const ALLOWED_SORT_COLUMNS: Record<string, string> = {
    date: "created_at",
    views: "jumlah_view",
    likes: "jumlah_like",
    title: "judul",
  };
  const sortColumn = ALLOWED_SORT_COLUMNS[parsed.data.sort ?? "date"] ?? "created_at";
  const sortDirection = (parsed.data.order ?? "desc") === "asc" ? "ASC" : "DESC";

  const conditions: string[] = [];
  const params: unknown[] = [];
  let idx = 1;

  if (parsed.data.q) {
    conditions.push(`a.judul ILIKE $${idx++}`);
    params.push(`%${parsed.data.q}%`);
  }
  if (parsed.data.status) {
    conditions.push(`a.status = $${idx++}`);
    params.push(parsed.data.status);
  }
  if (parsed.data.category) {
    conditions.push(`a.kategori_id = $${idx++}`);
    params.push(parsed.data.category);
  }
  if (parsed.data.featured === "true") {
    conditions.push(`a.featured = true`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const countResult = await queryPooler<{ count: number }>(
    `SELECT COUNT(*)::int AS count FROM blog_artikel a ${whereClause}`,
    params,
  );
  const totalItems = countResult[0]?.count ?? 0;

  const limitIdx = idx++;
  const offsetIdx = idx++;
  const dataParams = [...params, ADMIN_BLOG_PAGE_SIZE, from];

  const articles = await queryPooler<{
    id: string;
    judul: string;
    slug: string;
    ringkasan: string;
    konten: string;
    thumbnail_url: string | null;
    status: "draft" | "published";
    featured: boolean;
    jumlah_view: number;
    jumlah_like: number;
    waktu_baca: number;
    published_at: string | null;
    created_at: string;
    kategori: { id: string; nama: string; warna: string | null } | null;
  }>(
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
    ORDER BY a.${sortColumn} ${sortDirection}
    LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
    dataParams,
  );

  return {
    articles: articles ?? [],
    filters: parsed.data,
    pagination: {
      page,
      pageSize: ADMIN_BLOG_PAGE_SIZE,
      totalItems,
      totalPages: getTotalPages(totalItems, ADMIN_BLOG_PAGE_SIZE),
    },
  };
}

export async function getBlogArticle(slug: string) {
  try {
    const data = await queryPoolerSingle(`SELECT * FROM blog_artikel WHERE slug = $1 LIMIT 1`, [slug]);
    return data;
  } catch {
    return null;
  }
}

export async function getBlogArticleById(id: string) {
  const data = await queryPoolerSingle(`SELECT * FROM blog_artikel WHERE id = $1`, [id]);
  if (!data) throw new Error("Article not found");
  return data;
}

export async function createBlogArticle(data: Record<string, unknown>) {
  await requireAdmin();

  const parsed = createBlogArticleSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error("Invalid blog article data: " + parsed.error.issues[0].message);
  }

  const { tags: _tags, metaTitle: _metaTitle, metaDescription: _metaDescription, ...articleInput } = parsed.data;
  void _tags;
  void _metaTitle;
  void _metaDescription;

  const waktuBaca = articleInput.waktuBaca ?? Math.max(1, Math.ceil(articleInput.konten.replace(/<[^>]*>/g, " ").split(/\s+/).filter(Boolean).length / 220));
  const publishedAt = articleInput.status === "published" ? new Date().toISOString() : null;

  const [article] = await queryPooler(
    `INSERT INTO blog_artikel (judul, slug, ringkasan, konten, kategori_id, status, featured, thumbnail_url, waktu_baca, published_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING *`,
    [
      articleInput.judul,
      articleInput.slug,
      articleInput.ringkasan,
      sanitizeRichHtml(articleInput.konten),
      articleInput.kategoriId || null,
      articleInput.status,
      articleInput.featured ?? false,
      articleInput.thumbnailUrl || null,
      waktuBaca,
      publishedAt,
    ],
  );
  if (!article) throw new Error("Failed to create article");
  updatePublicContent([CACHE_TAGS.blog]);
  return article;
}

export async function updateBlogArticle(slug: string, data: Record<string, unknown>) {
  await requireAdmin();

  const parsedSlug = z.string().min(1).max(200).trim().safeParse(slug);
  if (!parsedSlug.success) {
    throw new Error("Invalid article slug");
  }

  const parsed = updateBlogArticleSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error("Invalid blog article data: " + parsed.error.issues[0].message);
  }

  const { tags: _tags, metaTitle: _metaTitle, metaDescription: _metaDescription, ...articleInput } = parsed.data;
  void _tags;
  void _metaTitle;
  void _metaDescription;

  const setClauses: string[] = [];
  const params: unknown[] = [];
  let idx = 1;

  if (typeof articleInput.judul === "string") {
    setClauses.push(`judul = $${idx++}`);
    params.push(articleInput.judul);
  }
  if (typeof articleInput.slug === "string") {
    setClauses.push(`slug = $${idx++}`);
    params.push(articleInput.slug);
  }
  if (typeof articleInput.ringkasan === "string") {
    setClauses.push(`ringkasan = $${idx++}`);
    params.push(articleInput.ringkasan);
  }
  if (typeof articleInput.konten === "string") {
    setClauses.push(`konten = $${idx++}`);
    params.push(sanitizeRichHtml(articleInput.konten));
  }
  if (typeof articleInput.status === "string") {
    setClauses.push(`status = $${idx++}`);
    params.push(articleInput.status);
    setClauses.push(`published_at = $${idx++}`);
    params.push(articleInput.status === "published" ? new Date().toISOString() : null);
  }
  if (typeof articleInput.featured === "boolean") {
    setClauses.push(`featured = $${idx++}`);
    params.push(articleInput.featured);
  }
  if (typeof articleInput.kategoriId === "string") {
    setClauses.push(`kategori_id = $${idx++}`);
    params.push(articleInput.kategoriId || null);
  }
  if (typeof articleInput.thumbnailUrl === "string") {
    setClauses.push(`thumbnail_url = $${idx++}`);
    params.push(articleInput.thumbnailUrl || null);
  }
  if (typeof articleInput.waktuBaca === "number") {
    setClauses.push(`waktu_baca = $${idx++}`);
    params.push(articleInput.waktuBaca);
  }
  if (typeof articleInput.jumlahView === "number") {
    setClauses.push(`jumlah_view = $${idx++}`);
    params.push(articleInput.jumlahView);
  }

  if (setClauses.length === 0) {
    throw new Error("No fields to update");
  }

  params.push(parsedSlug.data);
  const [article] = await queryPooler(
    `UPDATE blog_artikel SET ${setClauses.join(", ")} WHERE slug = $${idx} RETURNING *`,
    params,
  );
  if (!article) throw new Error("Article not found");
  updatePublicContent([CACHE_TAGS.blog]);
  return article;
}

export async function deleteBlogArticle(id: string) {
  await requireAdmin();

  const parsed = uuidSchema.safeParse(id);
  if (!parsed.success) {
    throw new Error("Invalid article ID: must be a valid UUID");
  }

  await queryPooler(`DELETE FROM blog_artikel WHERE id = $1`, [parsed.data]);
  updatePublicContent([CACHE_TAGS.blog]);
  return { success: true };
}

export async function toggleBlogLike(articleId: string) {
  const parsedId = uuidSchema.safeParse(articleId);
  if (!parsedId.success) {
    throw new Error("Invalid article ID: must be a valid UUID");
  }

  const ip = await getClientIp();
  await rateLimit(ip, "blog-like", { max: 30, window: 60 * 60 * 1000 });

  const existing = await queryPoolerSingle<{ id: string }>(
    `SELECT id FROM blog_like WHERE artikel_id = $1 AND ip_address = $2`,
    [parsedId.data, ip],
  );

  if (existing) {
    await queryPooler(`DELETE FROM blog_like WHERE id = $1`, [existing.id]);
    await queryPooler(`SELECT decrement_like($1)`, [parsedId.data]);
  } else {
    await queryPooler(
      `INSERT INTO blog_like (artikel_id, ip_address) VALUES ($1, $2)`,
      [parsedId.data, ip],
    );
    await queryPooler(`SELECT increment_like($1)`, [parsedId.data]);
  }
  return { success: true };
}

export async function getBlogCategories() {
  return queryPooler(`SELECT * FROM kategori ORDER BY nama`);
}

export async function getAdminBlogCategoriesPage() {
  await requireAdmin();

  const [categories, articles] = await Promise.all([
    queryPooler<{ id: string; nama: string; slug: string; deskripsi: string | null; warna: string | null; created_at: string }>(
      `SELECT id, nama, slug, deskripsi, warna, created_at FROM kategori ORDER BY nama ASC`,
    ),
    queryPooler<{ kategori_id: string | null }>(
      `SELECT kategori_id FROM blog_artikel WHERE kategori_id IS NOT NULL`,
    ),
  ]);

  const articleCounts = new Map<string, number>();
  for (const article of articles) {
    if (!article.kategori_id) continue;
    articleCounts.set(article.kategori_id, (articleCounts.get(article.kategori_id) ?? 0) + 1);
  }

  const enrichedCategories = categories.map((category) => ({
    ...category,
    article_count: articleCounts.get(category.id) ?? 0,
  }));

  return {
    categories: enrichedCategories,
    stats: {
      total: enrichedCategories.length,
      used: enrichedCategories.filter((c) => c.article_count > 0).length,
      empty: enrichedCategories.filter((c) => c.article_count === 0).length,
    },
  };
}

export async function getBlogCategoryBySlug(slug: string) {
  await requireAdmin();

  const parsed = z.string().min(1).max(120).trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid category slug").safeParse(slug);
  if (!parsed.success) {
    throw new Error("Invalid category slug");
  }

  return queryPoolerSingle(
    `SELECT id, nama, slug, deskripsi, warna, created_at FROM kategori WHERE slug = $1`,
    [parsed.data],
  );
}

export async function createBlogCategory(input: Record<string, unknown>) {
  await requireAdmin();

  const parsed = blogCategorySchema.safeParse(input);
  if (!parsed.success) {
    throw new Error("Invalid category data: " + parsed.error.issues[0].message);
  }

  const slug = parsed.data.slug || createSlug(parsed.data.nama);
  if (!slug) throw new Error("Category slug could not be generated");

  const [data] = await queryPooler(
    `INSERT INTO kategori (nama, slug, deskripsi, warna)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [parsed.data.nama, slug, parsed.data.deskripsi || null, parsed.data.warna || null],
  );
  if (!data) throw new Error("Failed to create category");
  updatePublicContent([CACHE_TAGS.blog]);
  return data;
}

export async function updateBlogCategory(id: string, input: Record<string, unknown>) {
  await requireAdmin();

  const parsedId = uuidSchema.safeParse(id);
  if (!parsedId.success) {
    throw new Error("Invalid category ID: must be a valid UUID");
  }

  const parsed = blogCategoryUpdateSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error("Invalid category data: " + parsed.error.issues[0].message);
  }

  const setClauses: string[] = [];
  const params: unknown[] = [];
  let idx = 1;

  if (typeof parsed.data.nama === "string") {
    setClauses.push(`nama = $${idx++}`);
    params.push(parsed.data.nama);
  }
  if (typeof parsed.data.slug === "string") {
    setClauses.push(`slug = $${idx++}`);
    params.push(parsed.data.slug || createSlug(parsed.data.nama ?? ""));
  }
  if (typeof parsed.data.deskripsi === "string") {
    setClauses.push(`deskripsi = $${idx++}`);
    params.push(parsed.data.deskripsi || null);
  }
  if (typeof parsed.data.warna === "string") {
    setClauses.push(`warna = $${idx++}`);
    params.push(parsed.data.warna || null);
  }

  if (setClauses.length === 0) {
    throw new Error("No category fields to update");
  }

  params.push(parsedId.data);
  const [data] = await queryPooler(
    `UPDATE kategori SET ${setClauses.join(", ")} WHERE id = $${idx} RETURNING *`,
    params,
  );
  if (!data) throw new Error("Category not found");
  updatePublicContent([CACHE_TAGS.blog]);
  return data;
}

export async function deleteBlogCategory(id: string) {
  await requireAdmin();

  const parsed = uuidSchema.safeParse(id);
  if (!parsed.success) {
    throw new Error("Invalid category ID: must be a valid UUID");
  }

  const [countResult] = await queryPooler<{ count: number }>(
    `SELECT COUNT(*)::int AS count FROM blog_artikel WHERE kategori_id = $1`,
    [parsed.data],
  );
  if ((countResult?.count ?? 0) > 0) {
    throw new Error(`Category is used by ${countResult.count} article(s). Reassign articles before deleting.`);
  }

  await queryPooler(`DELETE FROM kategori WHERE id = $1`, [parsed.data]);
  updatePublicContent([CACHE_TAGS.blog]);
  return { success: true };
}

export async function getBlogComments(articleId: string) {
  return queryPooler(
    `SELECT * FROM blog_komentar WHERE artikel_id = $1 AND approved = true ORDER BY created_at`,
    [articleId],
  );
}

export async function createBlogComment(data: Record<string, unknown>) {
  const ip = await getClientIp();
  await rateLimit(ip, "comment", { max: 10, window: 60 * 60 * 1000 });

  const parsed = createBlogCommentSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error("Data komentar tidak valid: " + parsed.error.issues[0].message);
  }

  const [comment] = await queryPooler(
    `INSERT INTO blog_komentar (artikel_id, nama_komentator, email_komentator, isi_komentar)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [parsed.data.artikel_id, parsed.data.nama_komentator, parsed.data.email_komentator, parsed.data.isi_komentar],
  );
  if (!comment) throw new Error("Failed to create comment");
  return comment;
}

export async function getBlogStats() {
  const [row] = await queryPooler<{
    total: number;
    published: number;
    draft: number;
    featured: number;
  }>(
    `SELECT
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE status = 'published')::int AS published,
      COUNT(*) FILTER (WHERE status = 'draft')::int AS draft,
      COUNT(*) FILTER (WHERE featured = true)::int AS featured
    FROM blog_artikel`,
  );
  return {
    total: row?.total ?? 0,
    published: row?.published ?? 0,
    draft: row?.draft ?? 0,
    featured: row?.featured ?? 0,
  };
}

export async function trackArticleView(articleId: string) {
  const parsedId = uuidSchema.safeParse(articleId);
  if (!parsedId.success) {
    throw new Error("Invalid article ID: must be a valid UUID");
  }

  const ip = await getClientIp();
  await rateLimit(`${ip}:${parsedId.data}`, "blog-view", { max: 10, window: 60 * 60 * 1000 });

  await queryPooler(`SELECT increment_view($1)`, [parsedId.data]);

  return { success: true };
}

export async function bulkUpdateArticles(ids: string[], updates: Partial<{ status: "draft" | "published"; featured: boolean }>) {
  await requireAdmin();
  const parsedIds = uuidArraySchema.safeParse(ids);
  if (!parsedIds.success) {
    throw new Error("Invalid article IDs: " + parsedIds.error.issues[0].message);
  }
  const parsedUpdates = bulkArticleUpdateSchema.safeParse(updates);
  if (!parsedUpdates.success) {
    throw new Error("Invalid article updates: " + parsedUpdates.error.issues[0].message);
  }

  const setClauses: string[] = [];
  const params: unknown[] = [];
  let idx = 1;

  if (parsedUpdates.data.status !== undefined) {
    setClauses.push(`status = $${idx++}`);
    params.push(parsedUpdates.data.status);
  }
  if (parsedUpdates.data.featured !== undefined) {
    setClauses.push(`featured = $${idx++}`);
    params.push(parsedUpdates.data.featured);
  }

  params.push(parsedIds.data);
  await queryPooler(
    `UPDATE blog_artikel SET ${setClauses.join(", ")} WHERE id = ANY($${idx})`,
    params,
  );
  updatePublicContent([CACHE_TAGS.blog]);
  return { success: true };
}

export async function bulkDeleteArticles(ids: string[]) {
  await requireAdmin();
  const parsedIds = uuidArraySchema.safeParse(ids);
  if (!parsedIds.success) {
    throw new Error("Invalid article IDs: " + parsedIds.error.issues[0].message);
  }

  await queryPooler(`DELETE FROM blog_artikel WHERE id = ANY($1)`, [parsedIds.data]);
  updatePublicContent([CACHE_TAGS.blog]);
  return { success: true };
}

export async function duplicateArticle(slug: string) {
  await requireAdmin();

  const original = await queryPoolerSingle(`SELECT * FROM blog_artikel WHERE slug = $1`, [slug]);
  if (!original) throw new Error("Article not found");

  const timestamp = Date.now();
  const newSlug = `${original.slug}-copy-${timestamp}`;

  await queryPooler(
    `INSERT INTO blog_artikel (judul, slug, ringkasan, konten, thumbnail_url, kategori_id, status, featured, jumlah_like, jumlah_view, waktu_baca, published_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
    [
      `${original.judul} (Copy)`,
      newSlug,
      original.ringkasan,
      original.konten,
      original.thumbnail_url,
      original.kategori_id,
      "draft",
      false,
      0,
      0,
      original.waktu_baca,
      null,
    ],
  );

  updatePublicContent([CACHE_TAGS.blog]);
  return { success: true, slug: newSlug };
}
