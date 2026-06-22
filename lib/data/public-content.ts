import { sql } from "kysely";
import { db } from "@/lib/db/kysely";
import { toCamelCase } from "@/lib/utils/case";
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
  const [projectsResult, servicesResult, testimonialsResult, articlesResult, galleryResult] = await Promise.allSettled([
    db
      .selectFrom("projects")
      .select(["id","nama","slug","deskripsi","kategori","status","featured","thumbnail_url","github_url","live_url","tech_stack","urutan","created_at","updated_at"])
      .where("featured", "=", true)
      .orderBy("urutan", "asc")
      .limit(6)
      .execute(),
    db
      .selectFrom("services")
      .select(["id","nama","slug","deskripsi_pendek","deskripsi_panjang","icon","harga_mulai","fitur","aktif","urutan","created_at","updated_at"])
      .where("aktif", "=", true)
      .orderBy("urutan", "asc")
      .limit(9)
      .execute(),
    db
      .selectFrom("testimonials")
      .select(["id","nama","jabatan","perusahaan","isi","rating","avatar_url","featured","tampil","created_at"])
      .where("tampil", "=", true)
      .where("featured", "=", true)
      .orderBy("created_at", "desc")
      .limit(6)
      .execute(),
    db
      .selectFrom("blog_artikel")
      .select(["id","judul","slug","ringkasan","thumbnail_url","kategori_id","status","featured","published_at","jumlah_like","jumlah_view","waktu_baca","created_at","updated_at"])
      .where("status", "=", "published")
      .orderBy("created_at", "desc")
      .limit(3)
      .execute(),
    db
      .selectFrom("gallery")
      .select(["id","judul","deskripsi","file_url","thumbnail_url","tipe","kategori","urutan","created_at"])
      .orderBy("urutan", "asc")
      .limit(8)
      .execute(),
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
  const [articles, categories] = await Promise.all([
    db
      .selectFrom("blog_artikel")
      .select(["id","judul","slug","ringkasan","thumbnail_url","kategori_id","status","featured","published_at","jumlah_like","jumlah_view","waktu_baca","created_at","updated_at"])
      .where("status", "=", "published")
      .orderBy("created_at", "desc")
      .limit(24)
      .execute(),
    db
      .selectFrom("kategori")
      .select(["id","nama","slug","created_at"])
      .orderBy("nama", "asc")
      .execute(),
  ]);

  return {
    articles: toCamelCase<BlogArticle[]>(articles),
    categories: toCamelCase<BlogCategory[]>(categories),
    error: null,
  };
}

export async function getBlogIndexPageData({ category, q, page = 1 }: BlogIndexPageParams = {}) {
  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
  const safeCategory = category?.trim() || undefined;
  const safeQuery = q?.trim() || undefined;
  const from = (safePage - 1) * BLOG_PAGE_SIZE;

  let query = db
    .selectFrom("blog_artikel")
    .where("status", "=", "published");

  let countQuery = db
    .selectFrom("blog_artikel")
    .where("status", "=", "published");

  if (safeCategory) {
    query = query.where("kategori_id", "=", safeCategory);
    countQuery = countQuery.where("kategori_id", "=", safeCategory);
  }

  if (safeQuery) {
    const pattern = `%${safeQuery.replace(/[%_]/g, "\\$&")}%`;
    query = query.where((eb) =>
      eb.or([
        eb("judul", "ilike", pattern),
        eb("ringkasan", "ilike", pattern),
      ])
    );
    countQuery = countQuery.where((eb) =>
      eb.or([
        eb("judul", "ilike", pattern),
        eb("ringkasan", "ilike", pattern),
      ])
    );
  }

  const [countResult, articlesResult, categoriesResult] = await Promise.all([
    countQuery
      .select((eb) => eb.fn.countAll().as("count"))
      .executeTakeFirstOrThrow(),
    db
      .selectFrom("blog_artikel as ba")
      .leftJoin("blog_komentar as bk", (join) =>
        join
          .onRef("ba.id", "=", "bk.artikel_id")
          .on("bk.approved", "=", true)
      )
      .where("ba.status", "=", "published")
      .$if(!!safeCategory, (qb) => qb.where("ba.kategori_id", "=", safeCategory!))
      .$if(!!safeQuery, (qb) => {
        const pattern = `%${safeQuery!.replace(/[%_]/g, "\\$&")}%`;
        return qb.where((eb) =>
          eb.or([
            eb("ba.judul", "ilike", pattern),
            eb("ba.ringkasan", "ilike", pattern),
          ])
        );
      })
      .select([
        "ba.id","ba.judul","ba.slug","ba.ringkasan","ba.thumbnail_url","ba.kategori_id","ba.status","ba.featured","ba.published_at","ba.jumlah_like","ba.jumlah_view","ba.waktu_baca","ba.created_at","ba.updated_at",
        (eb) => eb.fn.count("bk.id").as("comment_count"),
      ])
      .groupBy(["ba.id","ba.judul","ba.slug","ba.ringkasan","ba.thumbnail_url","ba.kategori_id","ba.status","ba.featured","ba.published_at","ba.jumlah_like","ba.jumlah_view","ba.waktu_baca","ba.created_at","ba.updated_at"])
      .orderBy("ba.created_at", "desc")
      .limit(BLOG_PAGE_SIZE)
      .offset(from)
      .execute(),
    db
      .selectFrom("kategori")
      .select(["id","nama","slug","created_at"])
      .orderBy("nama", "asc")
      .execute(),
  ]);

  const totalItems = Number(countResult.count ?? 0);
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
    activeQuery: safeQuery,
    error: null,
  };
}

export async function getProjectsIndexData() {
  const projects = await db
    .selectFrom("projects")
    .select(["id","nama","slug","deskripsi","kategori","status","featured","thumbnail_url","github_url","live_url","tech_stack","urutan","created_at","updated_at"])
    .orderBy("urutan", "asc")
    .limit(48)
    .execute();

  return { projects: toCamelCase<Project[]>(projects), error: null };
}

export async function getProjectsIndexPageData({ category, status, tech, page = 1 }: ProjectsIndexPageParams = {}) {
  try {
    const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
    const safeCategory = category?.trim() || undefined;
    const safeStatus = status?.trim() || undefined;
    const safeTech = tech?.trim() || undefined;
    const from = (safePage - 1) * PROJECT_PAGE_SIZE;

    let baseQuery = db.selectFrom("projects").selectAll();
    let countQuery = db.selectFrom("projects");

    if (safeCategory) {
      baseQuery = baseQuery.where("kategori", "=", safeCategory);
      countQuery = countQuery.where("kategori", "=", safeCategory);
    }
    if (safeStatus) {
      baseQuery = baseQuery.where("status", "=", safeStatus as any);
      countQuery = countQuery.where("status", "=", safeStatus as any);
    }
    if (safeTech) {
      baseQuery = baseQuery.where(sql<boolean>`${safeTech} = ANY(tech_stack)`);
      countQuery = countQuery.where(sql<boolean>`${safeTech} = ANY(tech_stack)`);
    }

    const [countResult, projectsResult, filterResult] = await Promise.all([
      countQuery
        .select((eb) => eb.fn.countAll().as("count"))
        .executeTakeFirstOrThrow(),
      baseQuery
        .orderBy("urutan", "asc")
        .limit(PROJECT_PAGE_SIZE)
        .offset(from)
        .execute(),
      db
        .selectFrom("projects")
        .select(["kategori","status"])
        .distinct()
        .execute(),
    ]);

    const totalItems = Number(countResult.count ?? 0);
    const totalPages = Math.max(1, Math.ceil(totalItems / PROJECT_PAGE_SIZE));

    const categories = Array.from(new Set(filterResult.map((r) => r.kategori).filter(Boolean))).sort() as string[];
    const statuses = Array.from(new Set(filterResult.map((r) => r.status).filter(Boolean))).sort() as string[];
    const techStack = Array.from(new Set((projectsResult ?? []).flatMap((r: any) => r.tech_stack ?? []).filter(Boolean))).sort() as string[];

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
  const services = await db
    .selectFrom("services")
    .select(["id","nama","slug","deskripsi_pendek","deskripsi_panjang","icon","harga_mulai","fitur","aktif","urutan","created_at","updated_at"])
    .where("aktif", "=", true)
    .orderBy("urutan", "asc")
    .limit(24)
    .execute();

  return { services: toCamelCase<Service[]>(services), error: null };
}

export async function getGalleryIndexData() {
  const items = await db
    .selectFrom("gallery")
    .select(["id","judul","deskripsi","file_url","thumbnail_url","tipe","kategori","urutan","created_at"])
    .orderBy("urutan", "asc")
    .limit(48)
    .execute();

  return { items: toCamelCase<GalleryItem[]>(items), error: null };
}
