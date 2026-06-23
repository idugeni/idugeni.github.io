"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { updatePublicContent, CACHE_TAGS } from "@/lib/cache/tags";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/rbac";
import { rateLimit } from "@/lib/rate-limit";
import { sanitizeRichHtml } from "@/lib/security/sanitize-html";
import { getClientIp, uuidArraySchema, uuidSchema } from "@/lib/security/server-action";
import { validateCSRFToken } from "@/lib/security/csrf";
import { getPaginationRange, getTotalPages, parsePositiveInt } from "@/lib/utils/pagination";
import { slugify as createSlug } from "@/lib/utils/slug";

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

export async function getBlogArticles(filters?: { kategori?: string; search?: string; status?: string }) {
  const supabase = createAdminClient();

  let query = supabase.from("blog_artikel").select("*");
  if (filters?.kategori) {
    query = query.eq("kategori_id", filters.kategori);
  }
  if (filters?.search) {
    query = query.ilike("judul", `%${filters.search}%`);
  }
  if (filters?.status) {
    query = query.eq("status", filters.status);
  }

  const { data: articles, error } = await query.order("created_at", { ascending: false }).limit(500);
  if (error) throw error;

  const { data: comments } = await supabase
    .from("blog_komentar")
    .select("artikel_id")
    .eq("approved", true);

  const commentCounts = new Map<string, number>();
  for (const c of comments ?? []) {
    commentCounts.set(c.artikel_id, (commentCounts.get(c.artikel_id) ?? 0) + 1);
  }

  return (articles ?? []).map((a) => ({
    ...a,
    comment_count: commentCounts.get(a.id) ?? 0,
  }));
}

export async function getAdminBlogArticlesPage(filters: Record<string, unknown> = {}) {
  await requireAdmin();
  const supabase = createAdminClient();

  const parsed = adminBlogFiltersSchema.safeParse(filters);
  if (!parsed.success) {
    throw new Error("Invalid admin blog filters: " + parsed.error.issues[0].message);
  }
  const d = parsed.data;

  const page = parsePositiveInt(d.page, 1);
  const { from } = getPaginationRange(page, ADMIN_BLOG_PAGE_SIZE);
  const ALLOWED_SORT_COLUMNS: Record<string, string> = {
    date: "created_at",
    views: "jumlah_view",
    likes: "jumlah_like",
    title: "judul",
  };
  const sortColumn = ALLOWED_SORT_COLUMNS[d.sort ?? "date"] ?? "created_at";
  const sortAscending = (d.order ?? "desc") === "asc";

  function applyFilters(q: any) {
    if (d.q) {
      q = q.ilike("judul", `%${d.q}%`);
    }
    if (d.status) {
      q = q.eq("status", d.status);
    }
    if (d.category) {
      q = q.eq("kategori_id", d.category);
    }
    if (d.featured === "true") {
      q = q.eq("featured", true);
    }
    return q;
  }

  const [countResult, dataResult] = await Promise.all([
    applyFilters(supabase.from("blog_artikel").select("*", { count: "exact", head: true })),
    applyFilters(
      supabase.from("blog_artikel").select("id, judul, slug, ringkasan, konten, thumbnail_url, status, featured, jumlah_view, jumlah_like, waktu_baca, published_at, created_at, kategori:kategori_id(id, nama, warna)")
    ).order(sortColumn, { ascending: sortAscending }).range(from, from + ADMIN_BLOG_PAGE_SIZE - 1),
  ]);

  const totalItems = countResult.count ?? 0;

  return {
    articles: dataResult.data ?? [],
    filters: d,
    pagination: {
      page,
      pageSize: ADMIN_BLOG_PAGE_SIZE,
      totalItems,
      totalPages: getTotalPages(totalItems, ADMIN_BLOG_PAGE_SIZE),
    },
  };
}

export async function getBlogArticle(slug: string) {
  const supabase = createAdminClient();
  const { data } = await supabase.from("blog_artikel").select("*").eq("slug", slug).limit(1).maybeSingle();
  return data;
}

export async function getBlogArticleById(id: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("blog_artikel").select("*").eq("id", id).single();
  if (error || !data) throw new Error("Article not found");
  return data;
}

export async function createBlogArticle(data: Record<string, unknown>) {
  await requireAdmin();
  const supabase = createAdminClient();

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

  const { data: article, error } = await supabase
    .from("blog_artikel")
    .insert({
      judul: articleInput.judul,
      slug: articleInput.slug,
      ringkasan: articleInput.ringkasan,
      konten: sanitizeRichHtml(articleInput.konten),
      kategori_id: articleInput.kategoriId || null,
      status: articleInput.status,
      featured: articleInput.featured ?? false,
      thumbnail_url: articleInput.thumbnailUrl || null,
      waktu_baca: waktuBaca,
      published_at: publishedAt,
    })
    .select()
    .single();

  if (error || !article) throw new Error("Failed to create article");
  updatePublicContent([CACHE_TAGS.blog]);
  return article;
}

export async function updateBlogArticle(slug: string, data: Record<string, unknown>) {
  await requireAdmin();
  const supabase = createAdminClient();

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

  const updateObj: Record<string, unknown> = {};

  if (typeof articleInput.judul === "string") {
    updateObj.judul = articleInput.judul;
  }
  if (typeof articleInput.slug === "string") {
    updateObj.slug = articleInput.slug;
  }
  if (typeof articleInput.ringkasan === "string") {
    updateObj.ringkasan = articleInput.ringkasan;
  }
  if (typeof articleInput.konten === "string") {
    updateObj.konten = sanitizeRichHtml(articleInput.konten);
  }
  if (typeof articleInput.status === "string") {
    updateObj.status = articleInput.status;
    updateObj.published_at = articleInput.status === "published" ? new Date().toISOString() : null;
  }
  if (typeof articleInput.featured === "boolean") {
    updateObj.featured = articleInput.featured;
  }
  if (typeof articleInput.kategoriId === "string") {
    updateObj.kategori_id = articleInput.kategoriId || null;
  }
  if (typeof articleInput.thumbnailUrl === "string") {
    updateObj.thumbnail_url = articleInput.thumbnailUrl || null;
  }
  if (typeof articleInput.waktuBaca === "number") {
    updateObj.waktu_baca = articleInput.waktuBaca;
  }
  if (typeof articleInput.jumlahView === "number") {
    updateObj.jumlah_view = articleInput.jumlahView;
  }

  if (Object.keys(updateObj).length === 0) {
    throw new Error("No fields to update");
  }

  const { data: article, error } = await supabase
    .from("blog_artikel")
    .update(updateObj)
    .eq("slug", parsedSlug.data)
    .select()
    .single();

  if (error || !article) throw new Error("Article not found");
  updatePublicContent([CACHE_TAGS.blog]);
  return article;
}

export async function deleteBlogArticle(id: string) {
  await requireAdmin();

  const parsed = uuidSchema.safeParse(id);
  if (!parsed.success) {
    throw new Error("Invalid article ID: must be a valid UUID");
  }

  const supabase = createAdminClient();
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

  const supabase = createAdminClient();

  const { data: existing } = await supabase
    .from("blog_like")
    .select("id")
    .eq("artikel_id", parsedId.data)
    .eq("ip_address", ip)
    .maybeSingle();

  if (existing) {
    await supabase.from("blog_like").delete().eq("id", existing.id);
    await supabase.rpc("decrement_like", { article_id: parsedId.data });
  } else {
    await supabase.from("blog_like").insert({ artikel_id: parsedId.data, ip_address: ip });
    await supabase.rpc("increment_like", { article_id: parsedId.data });
  }
  return { success: true };
}

export async function getBlogCategories() {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("kategori").select("*").order("nama");
  if (error) throw error;
  return data ?? [];
}

export async function getAdminBlogCategoriesPage() {
  await requireAdmin();
  const supabase = createAdminClient();

  const [categoriesResult, articlesResult] = await Promise.all([
    supabase.from("kategori").select("id, nama, slug, deskripsi, warna, created_at").order("nama", { ascending: true }),
    supabase.from("blog_artikel").select("kategori_id").not("kategori_id", "is", null),
  ]);

  const categories = categoriesResult.data ?? [];
  const articles = articlesResult.data ?? [];

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

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("kategori")
    .select("id, nama, slug, deskripsi, warna, created_at")
    .eq("slug", parsed.data)
    .maybeSingle();

  if (error) throw error;
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

  const supabase = createAdminClient();
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

  if (error || !data) throw new Error("Failed to create category");
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

  const updateObj: Record<string, unknown> = {};

  if (typeof parsed.data.nama === "string") {
    updateObj.nama = parsed.data.nama;
  }
  if (typeof parsed.data.slug === "string") {
    updateObj.slug = parsed.data.slug || createSlug(parsed.data.nama ?? "");
  }
  if (typeof parsed.data.deskripsi === "string") {
    updateObj.deskripsi = parsed.data.deskripsi || null;
  }
  if (typeof parsed.data.warna === "string") {
    updateObj.warna = parsed.data.warna || null;
  }

  if (Object.keys(updateObj).length === 0) {
    throw new Error("No category fields to update");
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("kategori")
    .update(updateObj)
    .eq("id", parsedId.data)
    .select()
    .single();

  if (error || !data) throw new Error("Category not found");
  updatePublicContent([CACHE_TAGS.blog]);
  return data;
}

export async function deleteBlogCategory(id: string) {
  await requireAdmin();

  const parsed = uuidSchema.safeParse(id);
  if (!parsed.success) {
    throw new Error("Invalid category ID: must be a valid UUID");
  }

  const supabase = createAdminClient();

  const { count } = await supabase
    .from("blog_artikel")
    .select("*", { count: "exact", head: true })
    .eq("kategori_id", parsed.data);

  if ((count ?? 0) > 0) {
    throw new Error(`Category is used by ${count} article(s). Reassign articles before deleting.`);
  }

  const { error } = await supabase.from("kategori").delete().eq("id", parsed.data);
  if (error) throw error;
  updatePublicContent([CACHE_TAGS.blog]);
  return { success: true };
}

export async function getBlogComments(articleId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("blog_komentar")
    .select("*")
    .eq("artikel_id", articleId)
    .eq("approved", true)
    .order("created_at");
  if (error) throw error;
  return data ?? [];
}

export async function createBlogComment(data: Record<string, unknown>) {
  const ip = await getClientIp();
  await rateLimit(ip, "comment", { max: 10, window: 60 * 60 * 1000 });

  // Validate CSRF token
  const csrfToken = data.csrf_token;
  if (typeof csrfToken !== "string" || !validateCSRFToken(csrfToken)) {
    throw new Error("Invalid security token. Please refresh the page and try again.");
  }

  const parsed = createBlogCommentSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error("Data komentar tidak valid: " + parsed.error.issues[0].message);
  }

  const sanitizedContent = sanitizeRichHtml(parsed.data.isi_komentar);

  const supabase = createAdminClient();
  const { data: comment, error } = await supabase
    .from("blog_komentar")
    .insert({
      artikel_id: parsed.data.artikel_id,
      nama_komentator: parsed.data.nama_komentator,
      email_komentator: parsed.data.email_komentator,
      isi_komentar: sanitizedContent,
    })
    .select()
    .single();

  if (error || !comment) throw new Error("Failed to create comment");
  return comment;
}

export async function getBlogStats() {
  await requireAdmin();
  const supabase = createAdminClient();

  const [totalRes, publishedRes, draftRes, featuredRes] = await Promise.all([
    supabase.from("blog_artikel").select("*", { count: "exact", head: true }),
    supabase.from("blog_artikel").select("*", { count: "exact", head: true }).eq("status", "published"),
    supabase.from("blog_artikel").select("*", { count: "exact", head: true }).eq("status", "draft"),
    supabase.from("blog_artikel").select("*", { count: "exact", head: true }).eq("featured", true),
  ]);

  return {
    total: totalRes.count ?? 0,
    published: publishedRes.count ?? 0,
    draft: draftRes.count ?? 0,
    featured: featuredRes.count ?? 0,
  };
}

export async function trackArticleView(articleId: string) {
  const parsedId = uuidSchema.safeParse(articleId);
  if (!parsedId.success) {
    throw new Error("Invalid article ID: must be a valid UUID");
  }

  const ip = await getClientIp();
  await rateLimit(`${ip}:${parsedId.data}`, "blog-view", { max: 10, window: 60 * 60 * 1000 });

  const supabase = createAdminClient();
  const { error } = await supabase.rpc("increment_view", { article_id: parsedId.data });
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

  const updateObj: Record<string, unknown> = {};
  if (parsedUpdates.data.status !== undefined) {
    updateObj.status = parsedUpdates.data.status;
  }
  if (parsedUpdates.data.featured !== undefined) {
    updateObj.featured = parsedUpdates.data.featured;
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("blog_artikel").update(updateObj).in("id", parsedIds.data);
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

  const supabase = createAdminClient();
  const { error } = await supabase.from("blog_artikel").delete().in("id", parsedIds.data);
  if (error) throw error;
  updatePublicContent([CACHE_TAGS.blog]);
  return { success: true };
}

export async function duplicateArticle(slug: string) {
  await requireAdmin();
  const supabase = createAdminClient();

  const { data: original, error: fetchError } = await supabase.from("blog_artikel").select("*").eq("slug", slug).single();
  if (fetchError || !original) throw new Error("Article not found");

  const timestamp = Date.now();
  const newSlug = `${original.slug}-copy-${timestamp}`;

  const { error: insertError } = await supabase.from("blog_artikel").insert({
    judul: `${original.judul} (Copy)`,
    slug: newSlug,
    ringkasan: original.ringkasan,
    konten: original.konten,
    thumbnail_url: original.thumbnail_url,
    kategori_id: original.kategori_id,
    status: "draft",
    featured: false,
    jumlah_like: 0,
    jumlah_view: 0,
    waktu_baca: original.waktu_baca,
    published_at: null,
  });

  if (insertError) throw insertError;

  updatePublicContent([CACHE_TAGS.blog]);
  return { success: true, slug: newSlug };
}
