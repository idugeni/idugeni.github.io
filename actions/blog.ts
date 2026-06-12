"use server";

import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { queryPooler } from "@/lib/db/pooler";
import { updatePublicContent, CACHE_TAGS } from "@/lib/cache/tags";
import { toSnakeCase } from "@/lib/utils/case";
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
  const supabase = await createClient();
  let query = supabase.from("blog_artikel").select("*").order("created_at", { ascending: false });

  if (filters?.kategori) query = query.eq("kategori_id", filters.kategori);
  if (filters?.search) query = query.textSearch("judul", filters.search);
  if (filters?.status) query = query.eq("status", filters.status);

  const { data, error } = await query;
  if (error) throw error;
  return data;
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
    const supabase = await createClient();
    const { data, error } = await supabase.from("blog_artikel").select("*").eq("slug", slug).single();
    if (error) return null;
    return data;
  } catch {
    return null;
  }
}

export async function getBlogArticleById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("blog_artikel").select("*").eq("id", id).single();
  if (error) throw error;
  return data;
}

export async function createBlogArticle(data: Record<string, unknown>) {
  await requireAdmin();

  const parsed = createBlogArticleSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error("Invalid blog article data: " + parsed.error.issues[0].message);
  }

  const supabase = await createClient();
  const { tags: _tags, metaTitle: _metaTitle, metaDescription: _metaDescription, ...articleInput } = parsed.data;
  void _tags;
  void _metaTitle;
  void _metaDescription;

  const safeData = {
    judul: articleInput.judul,
    slug: articleInput.slug,
    ringkasan: articleInput.ringkasan,
    konten: sanitizeRichHtml(articleInput.konten),
    kategoriId: articleInput.kategoriId || null,
    status: articleInput.status,
    featured: articleInput.featured ?? false,
    thumbnailUrl: articleInput.thumbnailUrl || null,
    waktuBaca: articleInput.waktuBaca ?? Math.max(1, Math.ceil(articleInput.konten.replace(/<[^>]*>/g, " ").split(/\s+/).filter(Boolean).length / 220)),
    publishedAt: articleInput.status === "published" ? new Date().toISOString() : null,
  };
  const { data: article, error } = await supabase.from("blog_artikel").insert(toSnakeCase(safeData)).select().single();
  if (error) throw error;
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

  const supabase = await createClient();
  const { tags: _tags, metaTitle: _metaTitle, metaDescription: _metaDescription, ...articleInput } = parsed.data;
  void _tags;
  void _metaTitle;
  void _metaDescription;

  const safeData: Record<string, unknown> = {};
  if (typeof articleInput.judul === "string") safeData.judul = articleInput.judul;
  if (typeof articleInput.slug === "string") safeData.slug = articleInput.slug;
  if (typeof articleInput.ringkasan === "string") safeData.ringkasan = articleInput.ringkasan;
  if (typeof articleInput.konten === "string") safeData.konten = sanitizeRichHtml(articleInput.konten);
  if (typeof articleInput.status === "string") {
    safeData.status = articleInput.status;
    safeData.publishedAt = articleInput.status === "published" ? new Date().toISOString() : null;
  }
  if (typeof articleInput.featured === "boolean") safeData.featured = articleInput.featured;
  if (typeof articleInput.kategoriId === "string") safeData.kategoriId = articleInput.kategoriId || null;
  if (typeof articleInput.thumbnailUrl === "string") safeData.thumbnailUrl = articleInput.thumbnailUrl || null;
  if (typeof articleInput.waktuBaca === "number") safeData.waktuBaca = articleInput.waktuBaca;
  if (typeof articleInput.jumlahView === "number") safeData.jumlahView = articleInput.jumlahView;

  const { data: article, error } = await supabase.from("blog_artikel").update(toSnakeCase(safeData)).eq("slug", parsedSlug.data).select().single();
  if (error) throw error;
  updatePublicContent([CACHE_TAGS.blog]);
  return article;
}

export async function deleteBlogArticle(id: string) {
  await requireAdmin();

  const parsed = uuidSchema.safeParse(id);
  if (!parsed.success) {
    throw new Error("Invalid article ID: must be a valid UUID");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("blog_artikel").delete().eq("id", parsed.data);
  if (error) throw error;
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

  const supabase = await createClient();
  const serviceClient = createServiceClient();
  const { data: existing } = await supabase.from("blog_like").select("id").eq("artikel_id", parsedId.data).eq("ip_address", ip).single();

  if (existing) {
    await supabase.from("blog_like").delete().eq("id", existing.id);
    await serviceClient.rpc("decrement_like", { article_id: parsedId.data });
  } else {
    await supabase.from("blog_like").insert({ artikel_id: parsedId.data, ip_address: ip });
    await serviceClient.rpc("increment_like", { article_id: parsedId.data });
  }
  return { success: true };
}

export async function getBlogCategories() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("kategori").select("*").order("nama");
  if (error) throw error;
  return data;
}

export async function getAdminBlogCategoriesPage() {
  await requireAdmin();

  const supabase = await createClient();
  const [categoriesResult, articlesResult] = await Promise.all([
    supabase
      .from("kategori")
      .select("id, nama, slug, deskripsi, warna, created_at")
      .order("nama", { ascending: true }),
    supabase
      .from("blog_artikel")
      .select("kategori_id")
      .not("kategori_id", "is", null),
  ]);

  if (categoriesResult.error) throw categoriesResult.error;
  if (articlesResult.error) throw articlesResult.error;

  const articleCounts = new Map<string, number>();
  for (const article of articlesResult.data ?? []) {
    if (!article.kategori_id) continue;
    articleCounts.set(article.kategori_id, (articleCounts.get(article.kategori_id) ?? 0) + 1);
  }

  const categories = (categoriesResult.data ?? []).map((category) => ({
    ...category,
    article_count: articleCounts.get(category.id) ?? 0,
  }));

  return {
    categories,
    stats: {
      total: categories.length,
      used: categories.filter((category) => category.article_count > 0).length,
      empty: categories.filter((category) => category.article_count === 0).length,
    },
  };
}

export async function getBlogCategoryBySlug(slug: string) {
  await requireAdmin();

  const parsed = z.string().min(1).max(120).trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid category slug").safeParse(slug);
  if (!parsed.success) {
    throw new Error("Invalid category slug");
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("kategori")
    .select("id, nama, slug, deskripsi, warna, created_at")
    .eq("slug", parsed.data)
    .single();

  if (error) return null;
  return data;
}

export async function createBlogCategory(input: Record<string, unknown>) {
  await requireAdmin();

  const parsed = blogCategorySchema.safeParse(input);
  if (!parsed.success) {
    throw new Error("Invalid category data: " + parsed.error.issues[0].message);
  }

  const slug = parsed.data.slug || createSlug(parsed.data.nama);
  if (!slug) throw new Error("Category slug could not be generated");

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("kategori")
    .insert({
      nama: parsed.data.nama,
      slug,
      deskripsi: parsed.data.deskripsi || null,
      warna: parsed.data.warna || null,
    })
    .select()
    .single();

  if (error) throw error;
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

  const updateData: Record<string, string | null> = {};
  if (typeof parsed.data.nama === "string") updateData.nama = parsed.data.nama;
  if (typeof parsed.data.slug === "string") updateData.slug = parsed.data.slug || createSlug(parsed.data.nama ?? "");
  if (typeof parsed.data.deskripsi === "string") updateData.deskripsi = parsed.data.deskripsi || null;
  if (typeof parsed.data.warna === "string") updateData.warna = parsed.data.warna || null;

  if (Object.keys(updateData).length === 0) {
    throw new Error("No category fields to update");
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("kategori")
    .update(updateData)
    .eq("id", parsedId.data)
    .select()
    .single();

  if (error) throw error;
  updatePublicContent([CACHE_TAGS.blog]);
  return data;
}

export async function deleteBlogCategory(id: string) {
  await requireAdmin();

  const parsed = uuidSchema.safeParse(id);
  if (!parsed.success) {
    throw new Error("Invalid category ID: must be a valid UUID");
  }

  const supabase = await createClient();
  const { count, error: countError } = await supabase
    .from("blog_artikel")
    .select("id", { count: "exact", head: true })
    .eq("kategori_id", parsed.data);

  if (countError) throw countError;
  if ((count ?? 0) > 0) {
    throw new Error(`Category is used by ${count} article(s). Reassign articles before deleting.`);
  }

  const { error } = await supabase.from("kategori").delete().eq("id", parsed.data);
  if (error) throw error;
  updatePublicContent([CACHE_TAGS.blog]);
  return { success: true };
}

export async function getBlogComments(articleId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("blog_komentar").select("*").eq("artikel_id", articleId).eq("approved", true).order("created_at");
  if (error) throw error;
  return data;
}

export async function createBlogComment(data: Record<string, unknown>) {
  const ip = await getClientIp();
  await rateLimit(ip, "comment", { max: 10, window: 60 * 60 * 1000 });

  const parsed = createBlogCommentSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error("Data komentar tidak valid: " + parsed.error.issues[0].message);
  }

  const supabase = await createClient();
  const { data: comment, error } = await supabase.from("blog_komentar").insert({
    artikel_id: parsed.data.artikel_id,
    nama_komentator: parsed.data.nama_komentator,
    email_komentator: parsed.data.email_komentator,
    isi_komentar: parsed.data.isi_komentar,
  }).select().single();
  if (error) throw error;
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
  // Rate limit: Max 10 view increments per IP per hour per article to prevent view count manipulation
  await rateLimit(`${ip}:${parsedId.data}`, "blog-view", { max: 10, window: 60 * 60 * 1000 });

  const serviceClient = createServiceClient();
  const { error } = await serviceClient.rpc("increment_view", { article_id: parsedId.data });
  if (error) throw error;

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

  const supabase = createServiceClient();
  const { error } = await supabase.from("blog_artikel").update(parsedUpdates.data).in("id", parsedIds.data);
  if (error) throw error;
  updatePublicContent([CACHE_TAGS.blog]);
  return { success: true };
}

export async function bulkDeleteArticles(ids: string[]) {
  await requireAdmin();
  const parsedIds = uuidArraySchema.safeParse(ids);
  if (!parsedIds.success) {
    throw new Error("Invalid article IDs: " + parsedIds.error.issues[0].message);
  }

  const supabase = createServiceClient();
  const { error } = await supabase.from("blog_artikel").delete().in("id", parsedIds.data);
  if (error) throw error;
  updatePublicContent([CACHE_TAGS.blog]);
  return { success: true };
}

export async function duplicateArticle(slug: string) {
  await requireAdmin();
  const supabase = createServiceClient();
  
  // Get original article
  const { data: original, error: fetchError } = await supabase
    .from("blog_artikel")
    .select("*")
    .eq("slug", slug)
    .single();
  
  if (fetchError || !original) throw new Error("Article not found");
  
  // Create duplicate with modified fields
  const timestamp = Date.now();
  const duplicate = {
    judul: `${original.judul} (Copy)`,
    slug: `${original.slug}-copy-${timestamp}`,
    ringkasan: original.ringkasan,
    konten: original.konten,
    thumbnail_url: original.thumbnail_url,
    kategori_id: original.kategori_id,
    status: "draft" as const,
    featured: false,
    jumlah_like: 0,
    jumlah_view: 0,
    waktu_baca: original.waktu_baca,
    published_at: null,
  };
  
  const { error: insertError } = await supabase.from("blog_artikel").insert(duplicate);
  if (insertError) throw insertError;
  
  updatePublicContent([CACHE_TAGS.blog]);
  return { success: true, slug: duplicate.slug };
}
