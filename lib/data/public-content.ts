"use cache";

import { cacheLife, cacheTag } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import { toCamelCase } from "@/lib/utils/case";
import { CACHE_TAGS } from "@/lib/cache/tags";
import type { BlogArticle, BlogCategory, GalleryItem, Project, Service, Testimonial } from "@/types/pages";

const BLOG_PAGE_SIZE = 9;
const PROJECT_PAGE_SIZE = 9;

export interface BlogIndexPageParams {
  category?: string;
  q?: string;
  page?: number;
}

export interface ProjectsIndexPageParams {
  category?: string;
  status?: string;
  tech?: string;
  page?: number;
}

export async function getHomeData() {
  cacheLife("hours");
  cacheTag(CACHE_TAGS.home, CACHE_TAGS.projects, CACHE_TAGS.services, CACHE_TAGS.testimonials, CACHE_TAGS.blog, CACHE_TAGS.gallery);

  const supabase = createPublicClient();
  const [projectsResult, servicesResult, testimonialsResult, articlesResult, galleryResult] = await Promise.allSettled([
    supabase
      .from("projects")
      .select("id,nama,slug,deskripsi,kategori,status,featured,thumbnail_url,github_url,live_url,tech_stack,urutan,created_at,updated_at")
      .eq("featured", true)
      .order("urutan", { ascending: true })
      .limit(6),
    supabase
      .from("services")
      .select("id,nama,slug,deskripsi_pendek,deskripsi_panjang,icon,harga_mulai,fitur,aktif,urutan,created_at,updated_at")
      .eq("aktif", true)
      .order("urutan", { ascending: true })
      .limit(9),
    supabase
      .from("testimonials")
      .select("id,nama,jabatan,perusahaan,isi,rating,avatar_url,featured,tampil,created_at")
      .eq("tampil", true)
      .eq("featured", true)
      .order("created_at", { ascending: false })
      .limit(6),
    supabase
      .from("blog_artikel")
      .select("id,judul,slug,ringkasan,thumbnail_url,kategori_id,status,featured,published_at,jumlah_like,jumlah_view,waktu_baca,created_at,updated_at")
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(3),
    supabase
      .from("gallery")
      .select("id,judul,deskripsi,file_url,thumbnail_url,tipe,kategori,urutan,created_at")
      .order("urutan", { ascending: true })
      .limit(8),
  ]);

  const projects = projectsResult.status === "fulfilled" ? projectsResult.value.data ?? [] : [];
  const services = servicesResult.status === "fulfilled" ? servicesResult.value.data ?? [] : [];
  const testimonials = testimonialsResult.status === "fulfilled" ? testimonialsResult.value.data ?? [] : [];
  const articles = articlesResult.status === "fulfilled" ? articlesResult.value.data ?? [] : [];
  const galleryItems = galleryResult.status === "fulfilled" ? galleryResult.value.data ?? [] : [];

  return {
    projects: toCamelCase<Project[]>(projects),
    services: toCamelCase<Service[]>(services),
    testimonials: toCamelCase<Testimonial[]>(testimonials),
    articles: toCamelCase<BlogArticle[]>(articles),
    galleryItems: toCamelCase<GalleryItem[]>(galleryItems),
    error: null,
  };
}

export async function getBlogIndexPageData({ category, q, page = 1 }: BlogIndexPageParams = {}) {
  cacheLife("hours");
  cacheTag(CACHE_TAGS.blog);

  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
  const safeCategory = category?.trim() || undefined;
  const safeQuery = q?.trim() || undefined;
  const from = (safePage - 1) * BLOG_PAGE_SIZE;

  const supabase = createPublicClient();

  let baseQuery = supabase
    .from("blog_artikel")
    .select("id,judul,slug,ringkasan,thumbnail_url,kategori_id,status,featured,published_at,jumlah_like,jumlah_view,waktu_baca,created_at,updated_at", { count: "exact" })
    .eq("status", "published");

  if (safeCategory) {
    baseQuery = baseQuery.eq("kategori_id", safeCategory);
  }

  if (safeQuery) {
    const pattern = `%${safeQuery.replace(/[%_]/g, "\\$&")}%`;
    baseQuery = baseQuery.or(`judul.ilike.${pattern},ringkasan.ilike.${pattern}`);
  }

  baseQuery = baseQuery
    .order("created_at", { ascending: false })
    .range(from, from + BLOG_PAGE_SIZE - 1);

  const [articlesResult, categoriesResult] = await Promise.all([
    baseQuery,
    supabase
      .from("kategori")
      .select("id,nama,slug,created_at")
      .order("nama", { ascending: true }),
  ]);

  const countData = articlesResult.data ?? [];
  const totalItems = articlesResult.count ?? 0;

  const commentCounts = await supabase
    .from("blog_komentar")
    .select("artikel_id")
    .eq("approved", true)
    .then((res) => {
      const counts = new Map<string, number>();
      (res.data ?? []).forEach((row) => {
        counts.set(row.artikel_id, (counts.get(row.artikel_id) ?? 0) + 1);
      });
      return counts;
    });

  const articlesWithCounts = countData.map((article) => ({
    ...article,
    comment_count: commentCounts.get(article.id) ?? 0,
  }));

  const totalPages = Math.max(1, Math.ceil(totalItems / BLOG_PAGE_SIZE));

  return {
    articles: toCamelCase<BlogArticle[]>(articlesWithCounts ?? []),
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
    activeQuery: safeQuery,
    error: null,
  };
}

export async function getProjectsIndexPageData({ category, status, tech, page = 1 }: ProjectsIndexPageParams = {}) {
  cacheLife("hours");
  cacheTag(CACHE_TAGS.projects);

  try {
    const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
    const safeCategory = category?.trim() || undefined;
    const safeStatus = status?.trim() || undefined;
    const safeTech = tech?.trim() || undefined;
    const from = (safePage - 1) * PROJECT_PAGE_SIZE;

    const supabase = createPublicClient();

    let baseQuery = supabase
      .from("projects")
      .select("*", { count: "exact" });

    if (safeCategory) {
      baseQuery = baseQuery.eq("kategori", safeCategory);
    }
    if (safeStatus) {
      baseQuery = baseQuery.eq("status", safeStatus);
    }
    if (safeTech) {
      baseQuery = baseQuery.contains("tech_stack", [safeTech]);
    }

    const [projectsResult, filterResult] = await Promise.all([
      baseQuery
        .order("urutan", { ascending: true })
        .range(from, from + PROJECT_PAGE_SIZE - 1),
      supabase
        .from("projects")
        .select("kategori,status")
        .then((res) => res.data ?? []),
    ]);

    const totalItems = projectsResult.count ?? 0;
    const totalPages = Math.max(1, Math.ceil(totalItems / PROJECT_PAGE_SIZE));

    const categories = Array.from(new Set(filterResult.map((r) => r.kategori).filter(Boolean))).sort() as string[];
    const statuses = Array.from(new Set(filterResult.map((r) => r.status).filter(Boolean))).sort() as string[];
    const techStack = Array.from(new Set((projectsResult.data ?? []).flatMap((r: any) => r.tech_stack ?? []).filter(Boolean))).sort() as string[];

    return {
      projects: toCamelCase<Project[]>(projectsResult.data ?? []),
      filters: { categories, statuses, techStack },
      activeFilters: { category: safeCategory, status: safeStatus, tech: safeTech },
      pagination: {
        page: safePage, pageSize: PROJECT_PAGE_SIZE, totalItems, totalPages,
        hasPreviousPage: safePage > 1, hasNextPage: safePage < totalPages,
      },
      error: null,
    };
  } catch (err) {
    console.error("[getProjectsIndexPageData] Error:", err);
    return {
      projects: [],
      filters: { categories: [], statuses: [], techStack: [] },
      activeFilters: { category: undefined, status: undefined, tech: undefined },
      pagination: { page: 1, pageSize: PROJECT_PAGE_SIZE, totalItems: 0, totalPages: 1, hasPreviousPage: false, hasNextPage: false },
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

export async function getServicesIndexData() {
  cacheLife("hours");
  cacheTag(CACHE_TAGS.services);

  const supabase = createPublicClient();
  const { data: services } = await supabase
    .from("services")
    .select("id,nama,slug,deskripsi_pendek,deskripsi_panjang,icon,harga_mulai,fitur,aktif,urutan,created_at,updated_at")
    .eq("aktif", true)
    .order("urutan", { ascending: true })
    .limit(24);

  return { services: toCamelCase<Service[]>(services ?? []), error: null };
}

export async function getGalleryIndexData() {
  cacheLife("hours");
  cacheTag(CACHE_TAGS.gallery);

  const supabase = createPublicClient();
  const { data: items } = await supabase
    .from("gallery")
    .select("id,judul,deskripsi,file_url,thumbnail_url,tipe,kategori,urutan,created_at")
    .order("urutan", { ascending: true })
    .limit(48);

  return { items: toCamelCase<GalleryItem[]>(items ?? []), error: null };
}
