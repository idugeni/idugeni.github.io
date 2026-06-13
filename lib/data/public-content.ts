import { cacheLife, cacheTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache/tags";
import { queryPooler } from "@/lib/db/pooler";
import { toCamelCase } from "@/lib/utils/case";
import type { BlogArticle, BlogCategory, GalleryItem, Project, Service, Testimonial } from "@/types/pages";

const PUBLIC_CONTENT_CACHE_LIFE = {
  stale: 300,
  revalidate: 300,
  expire: 3_600,
} as const;
const BLOG_PAGE_SIZE = 9;
const PROJECT_PAGE_SIZE = 9;

export interface BlogIndexPageParams {
  category?: string;
  page?: number;
}

export interface ProjectsIndexPageParams {
  category?: string;
  status?: string;
  tech?: string;
  page?: number;
}

function applyPublicContentCacheTags(...tags: Array<(typeof CACHE_TAGS)[keyof typeof CACHE_TAGS]>) {
  cacheLife(PUBLIC_CONTENT_CACHE_LIFE);
  cacheTag(...tags);
}

export async function getHomeData() {
  "use cache";
  applyPublicContentCacheTags(
    CACHE_TAGS.home,
    CACHE_TAGS.projects,
    CACHE_TAGS.services,
    CACHE_TAGS.testimonials,
    CACHE_TAGS.blog,
    CACHE_TAGS.gallery,
  );

  const [projectsResult, servicesResult, testimonialsResult, articlesResult, galleryResult] = await Promise.allSettled([
    queryPooler<any>(`SELECT id,nama,slug,deskripsi,kategori,status,featured,thumbnail_url,thumbnail_aspect_ratio,github_url,live_url,tech_stack,urutan,created_at,updated_at FROM projects WHERE featured=true ORDER BY urutan LIMIT 6`),
    queryPooler<any>(`SELECT id,nama,slug,deskripsi_pendek,deskripsi_panjang,icon,harga_mulai,fitur,aktif,urutan,created_at,updated_at FROM services WHERE aktif=true ORDER BY urutan LIMIT 9`),
    queryPooler<any>(`SELECT id,nama,jabatan,perusahaan,isi,rating,avatar_url,avatar_aspect_ratio,featured,tampil,created_at FROM testimonials WHERE tampil=true AND featured=true ORDER BY created_at DESC LIMIT 6`),
    queryPooler<any>(`SELECT id,judul,slug,ringkasan,thumbnail_url,thumbnail_aspect_ratio,kategori_id,status,featured,published_at,jumlah_like,jumlah_view,waktu_baca,created_at,updated_at FROM blog_artikel WHERE status='published' ORDER BY created_at DESC LIMIT 3`),
    queryPooler<any>(`SELECT id,judul,deskripsi,file_url,thumbnail_url,tipe,kategori,aspect_ratio,urutan,created_at FROM gallery ORDER BY urutan LIMIT 8`),
  ]);

  const projects = projectsResult.status === "fulfilled" ? projectsResult.value : [];
  const services = servicesResult.status === "fulfilled" ? servicesResult.value : [];
  const testimonials = testimonialsResult.status === "fulfilled" ? testimonialsResult.value : [];
  const articles = articlesResult.status === "fulfilled" ? articlesResult.value : [];
  const galleryItems = galleryResult.status === "fulfilled" ? galleryResult.value : [];

  return {
    projects: toCamelCase<Project[]>(projects),
    services: toCamelCase<Service[]>(services),
    testimonials: toCamelCase<Testimonial[]>(testimonials),
    articles: toCamelCase<BlogArticle[]>(articles),
    galleryItems: toCamelCase<GalleryItem[]>(galleryItems),
    error: null,
  };
}

export async function getBlogIndexData() {
  "use cache";
  applyPublicContentCacheTags(CACHE_TAGS.blog);

  const [articles, categories] = await Promise.all([
    queryPooler<any>(`SELECT id,judul,slug,ringkasan,thumbnail_url,thumbnail_aspect_ratio,kategori_id,status,featured,published_at,jumlah_like,jumlah_view,waktu_baca,created_at,updated_at FROM blog_artikel WHERE status='published' ORDER BY created_at DESC LIMIT 24`),
    queryPooler<any>(`SELECT id,nama,slug,created_at FROM kategori ORDER BY nama`),
  ]);

  return {
    articles: toCamelCase<BlogArticle[]>(articles),
    categories: toCamelCase<BlogCategory[]>(categories),
    error: null,
  };
}

export async function getBlogIndexPageData({ category, page = 1 }: BlogIndexPageParams = {}) {
  "use cache";
  applyPublicContentCacheTags(CACHE_TAGS.blog);

  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
  const safeCategory = category?.trim() || undefined;
  const from = (safePage - 1) * BLOG_PAGE_SIZE;

  const conditions: string[] = [`status = 'published'`];
  const params: unknown[] = [];
  let idx = 1;

  if (safeCategory) {
    conditions.push(`kategori_id = $${idx++}`);
    params.push(safeCategory);
  }

  const whereClause = `WHERE ${conditions.join(" AND ")}`;
  const limitIdx = idx + 1;
  const offsetIdx = idx + 2;

  const [countResult, articlesResult, categoriesResult] = await Promise.all([
    queryPooler<{ count: number }>(
      `SELECT COUNT(*)::int AS count FROM blog_artikel ${whereClause}`,
      params,
    ),
    queryPooler<Record<string, unknown>>(
      `SELECT id,judul,slug,ringkasan,thumbnail_url,thumbnail_aspect_ratio,kategori_id,status,featured,published_at,jumlah_like,jumlah_view,waktu_baca,created_at,updated_at FROM blog_artikel ${whereClause} ORDER BY created_at DESC LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
      [...params, BLOG_PAGE_SIZE, from],
    ),
    queryPooler<Record<string, unknown>>(
      `SELECT id,nama,slug,created_at FROM kategori ORDER BY nama ASC`,
    ),
  ]);

  const totalItems = countResult[0]?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / BLOG_PAGE_SIZE));

  return {
    articles: toCamelCase<BlogArticle[]>(articlesResult ?? []),
    categories: toCamelCase<BlogCategory[]>(categoriesResult ?? []),
    pagination: {
      page: safePage,
      pageSize: BLOG_PAGE_SIZE,
      totalItems,
      totalPages,
      hasPreviousPage: safePage > 1,
      hasNextPage: safePage < totalPages,
    },
    activeCategory: safeCategory,
    error: null,
  };
}

export async function getProjectsIndexData() {
  "use cache";
  applyPublicContentCacheTags(CACHE_TAGS.projects);

  const projects = await queryPooler<any>(
    `SELECT id,nama,slug,deskripsi,kategori,status,featured,thumbnail_url,thumbnail_aspect_ratio,github_url,live_url,tech_stack,urutan,created_at,updated_at FROM projects ORDER BY urutan LIMIT 48`
  );

  return { projects: toCamelCase<Project[]>(projects), error: null };
}

export async function getProjectsIndexPageData({ category, status, tech, page = 1 }: ProjectsIndexPageParams = {}) {
  "use cache";
  applyPublicContentCacheTags(CACHE_TAGS.projects);

  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
  const safeCategory = category?.trim() || undefined;
  const safeStatus = status?.trim() || undefined;
  const safeTech = tech?.trim() || undefined;
  const from = (safePage - 1) * PROJECT_PAGE_SIZE;

  const conditions: string[] = [];
  const params: unknown[] = [];
  let idx = 1;

  if (safeCategory) { conditions.push(`kategori = $${idx++}`); params.push(safeCategory); }
  if (safeStatus) { conditions.push(`status = $${idx++}`); params.push(safeStatus); }
  if (safeTech) { conditions.push(`tech_stack @> $${idx++}::jsonb`); params.push(JSON.stringify([safeTech])); }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const limitIdx = idx + 1;
  const offsetIdx = idx + 2;

  const [countResult, projectsResult, filterResult] = await Promise.all([
    queryPooler<{ count: number }>(`SELECT COUNT(*)::int AS count FROM projects ${whereClause}`, params),
    queryPooler<any>(`SELECT id,nama,slug,deskripsi,kategori,status,featured,thumbnail_url,thumbnail_aspect_ratio,github_url,live_url,tech_stack,urutan,created_at,updated_at FROM projects ${whereClause} ORDER BY urutan LIMIT $${limitIdx} OFFSET $${offsetIdx}`, [...params, PROJECT_PAGE_SIZE, from]),
    queryPooler<{ kategori: string | null; status: string | null; tech_stack: string[] | null }>(`SELECT DISTINCT kategori, status, tech_stack FROM projects ORDER BY urutan LIMIT 200`),
  ]);

  const totalItems = countResult[0]?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / PROJECT_PAGE_SIZE));

  const categories = Array.from(new Set(filterResult.map((r) => r.kategori).filter(Boolean))).sort() as string[];
  const statuses = Array.from(new Set(filterResult.map((r) => r.status).filter(Boolean))).sort() as string[];
  const techStack = Array.from(new Set(filterResult.flatMap((r) => r.tech_stack ?? []).filter(Boolean))).sort() as string[];

  return {
    projects: toCamelCase<Project[]>(projectsResult ?? []),
    filters: { categories, statuses, techStack },
    activeFilters: { category: safeCategory, status: safeStatus, tech: safeTech },
    pagination: {
      page: safePage, pageSize: PROJECT_PAGE_SIZE, totalItems, totalPages,
      hasPreviousPage: safePage > 1, hasNextPage: safePage < totalPages,
    },
    error: null,
  };
}

export async function getServicesIndexData() {
  "use cache";
  applyPublicContentCacheTags(CACHE_TAGS.services);

  const services = await queryPooler<any>(
    `SELECT id,nama,slug,deskripsi_pendek,deskripsi_panjang,icon,harga_mulai,fitur,aktif,urutan,created_at,updated_at FROM services WHERE aktif=true ORDER BY urutan LIMIT 24`
  );

  return { services: toCamelCase<Service[]>(services), error: null };
}

export async function getGalleryIndexData() {
  "use cache";
  applyPublicContentCacheTags(CACHE_TAGS.gallery);

  const items = await queryPooler<any>(
    `SELECT id,judul,deskripsi,file_url,thumbnail_url,tipe,kategori,aspect_ratio,urutan,created_at FROM gallery ORDER BY urutan LIMIT 48`
  );

  return { items: toCamelCase<GalleryItem[]>(items), error: null };
}
