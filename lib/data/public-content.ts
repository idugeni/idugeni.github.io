import { cacheLife, cacheTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache/tags";
import { createPublicClient } from "@/lib/supabase/public";
import { toCamelCase } from "@/lib/utils/case";
import type { BlogArticle, BlogCategory, GalleryItem, Project, Service, Testimonial } from "@/types/pages";

const HOME_PROJECT_COLUMNS = "id,nama,slug,deskripsi,kategori,status,featured,thumbnail_url,thumbnail_aspect_ratio,github_url,live_url,tech_stack,urutan,created_at,updated_at";
const HOME_SERVICE_COLUMNS = "id,nama,slug,deskripsi_pendek,deskripsi_panjang,icon,harga_mulai,fitur,aktif,urutan,created_at,updated_at";
const HOME_TESTIMONIAL_COLUMNS = "id,nama,jabatan,perusahaan,isi,rating,avatar_url,avatar_aspect_ratio,featured,tampil,created_at";
const BLOG_CARD_COLUMNS = "id,judul,slug,ringkasan,thumbnail_url,thumbnail_aspect_ratio,kategori_id,status,featured,published_at,jumlah_like,jumlah_view,waktu_baca,created_at,updated_at";
const BLOG_CATEGORY_COLUMNS = "id,nama,slug,created_at";
const GALLERY_CARD_COLUMNS = "id,judul,deskripsi,file_url,thumbnail_url,tipe,kategori,aspect_ratio,urutan,created_at";
const PUBLIC_CONTENT_CACHE_LIFE = {
  stale: 300,
  revalidate: 300,
  expire: 3_600,
} as const;
const BLOG_PAGE_SIZE = 9;

export interface BlogIndexPageParams {
  category?: string;
  page?: number;
}

const PROJECT_PAGE_SIZE = 9;

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

  const supabase = createPublicClient();

  const [projectsResult, servicesResult, testimonialsResult, articlesResult, galleryResult] =
    await Promise.all([
      supabase
        .from("projects")
        .select(HOME_PROJECT_COLUMNS)
        .eq("featured", true)
        .order("urutan")
        .limit(6),
      supabase
        .from("services")
        .select(HOME_SERVICE_COLUMNS)
        .eq("aktif", true)
        .order("urutan")
        .limit(9),
      supabase
        .from("testimonials")
        .select(HOME_TESTIMONIAL_COLUMNS)
        .eq("tampil", true)
        .eq("featured", true)
        .order("created_at", { ascending: false })
        .limit(6),
      supabase
        .from("blog_artikel")
        .select(BLOG_CARD_COLUMNS)
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .limit(3),
      supabase
        .from("gallery")
        .select(GALLERY_CARD_COLUMNS)
        .order("urutan")
        .limit(8),
    ]);

  return {
    projects: toCamelCase<Project[]>(projectsResult.data ?? []),
    services: toCamelCase<Service[]>(servicesResult.data ?? []),
    testimonials: toCamelCase<Testimonial[]>(testimonialsResult.data ?? []),
    articles: toCamelCase<BlogArticle[]>(articlesResult.data ?? []),
    galleryItems: toCamelCase<GalleryItem[]>(galleryResult.data ?? []),
    error: projectsResult.error || servicesResult.error || testimonialsResult.error || articlesResult.error || galleryResult.error,
  };
}

export async function getBlogIndexData() {
  "use cache";
  applyPublicContentCacheTags(CACHE_TAGS.blog);

  const supabase = createPublicClient();

  const [articlesResult, categoriesResult] = await Promise.all([
    supabase
      .from("blog_artikel")
      .select(BLOG_CARD_COLUMNS)
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(24),
    supabase
      .from("kategori")
      .select(BLOG_CATEGORY_COLUMNS)
      .order("nama"),
  ]);

  return {
    articles: toCamelCase<BlogArticle[]>(articlesResult.data ?? []),
    categories: toCamelCase<BlogCategory[]>(categoriesResult.data ?? []),
    error: articlesResult.error || categoriesResult.error,
  };
}

export async function getBlogIndexPageData({ category, page = 1 }: BlogIndexPageParams = {}) {
  "use cache";
  applyPublicContentCacheTags(CACHE_TAGS.blog);

  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
  const safeCategory = category?.trim() || undefined;
  const from = (safePage - 1) * BLOG_PAGE_SIZE;
  const to = from + BLOG_PAGE_SIZE - 1;
  const supabase = createPublicClient();

  let articlesQuery = supabase
    .from("blog_artikel")
    .select(BLOG_CARD_COLUMNS, { count: "exact" })
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .range(from, to);

  if (safeCategory) {
    articlesQuery = articlesQuery.eq("kategori_id", safeCategory);
  }

  const [articlesResult, categoriesResult] = await Promise.all([
    articlesQuery,
    supabase
      .from("kategori")
      .select(BLOG_CATEGORY_COLUMNS)
      .order("nama"),
  ]);

  const totalItems = articlesResult.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / BLOG_PAGE_SIZE));

  return {
    articles: toCamelCase<BlogArticle[]>(articlesResult.data ?? []),
    categories: toCamelCase<BlogCategory[]>(categoriesResult.data ?? []),
    pagination: {
      page: safePage,
      pageSize: BLOG_PAGE_SIZE,
      totalItems,
      totalPages,
      hasPreviousPage: safePage > 1,
      hasNextPage: safePage < totalPages,
    },
    activeCategory: safeCategory,
    error: articlesResult.error || categoriesResult.error,
  };
}

export async function getProjectsIndexData() {
  "use cache";
  applyPublicContentCacheTags(CACHE_TAGS.projects);

  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("projects")
    .select(HOME_PROJECT_COLUMNS)
    .order("urutan")
    .limit(48);

  return { projects: toCamelCase<Project[]>(data ?? []), error };
}

export async function getProjectsIndexPageData({ category, status, tech, page = 1 }: ProjectsIndexPageParams = {}) {
  "use cache";
  applyPublicContentCacheTags(CACHE_TAGS.projects);

  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
  const safeCategory = category?.trim() || undefined;
  const safeStatus = status?.trim() || undefined;
  const safeTech = tech?.trim() || undefined;
  const from = (safePage - 1) * PROJECT_PAGE_SIZE;
  const to = from + PROJECT_PAGE_SIZE - 1;
  const supabase = createPublicClient();

  let projectsQuery = supabase
    .from("projects")
    .select(HOME_PROJECT_COLUMNS, { count: "exact" })
    .order("urutan")
    .range(from, to);

  if (safeCategory) projectsQuery = projectsQuery.eq("kategori", safeCategory);
  if (safeStatus) projectsQuery = projectsQuery.eq("status", safeStatus);
  if (safeTech) projectsQuery = projectsQuery.contains("tech_stack", [safeTech]);

  const [projectsResult, filterOptionsResult] = await Promise.all([
    projectsQuery,
    supabase
      .from("projects")
      .select("kategori,status,tech_stack")
      .order("urutan")
      .limit(200),
  ]);

  const filterProjects = toCamelCase<Project[]>(filterOptionsResult.data ?? []);
  const categories = Array.from(
    new Set(filterProjects.map((project) => project.kategori).filter((category): category is string => Boolean(category)))
  ).sort();
  const statuses = Array.from(
    new Set(filterProjects.map((project) => project.status).filter(Boolean))
  ).sort();
  const techStack = Array.from(
    new Set(filterProjects.flatMap((project) => project.techStack ?? []).filter((tech): tech is string => Boolean(tech)))
  ).sort();
  const totalItems = projectsResult.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / PROJECT_PAGE_SIZE));

  return {
    projects: toCamelCase<Project[]>(projectsResult.data ?? []),
    filters: { categories, statuses, techStack },
    activeFilters: {
      category: safeCategory,
      status: safeStatus,
      tech: safeTech,
    },
    pagination: {
      page: safePage,
      pageSize: PROJECT_PAGE_SIZE,
      totalItems,
      totalPages,
      hasPreviousPage: safePage > 1,
      hasNextPage: safePage < totalPages,
    },
    error: projectsResult.error || filterOptionsResult.error,
  };
}

export async function getServicesIndexData() {
  "use cache";
  applyPublicContentCacheTags(CACHE_TAGS.services);

  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("services")
    .select(HOME_SERVICE_COLUMNS)
    .eq("aktif", true)
    .order("urutan")
    .limit(24);

  return { services: toCamelCase<Service[]>(data ?? []), error };
}

export async function getGalleryIndexData() {
  "use cache";
  applyPublicContentCacheTags(CACHE_TAGS.gallery);

  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("gallery")
    .select(GALLERY_CARD_COLUMNS)
    .order("urutan")
    .limit(48);

  return { items: toCamelCase<GalleryItem[]>(data ?? []), error };
}
