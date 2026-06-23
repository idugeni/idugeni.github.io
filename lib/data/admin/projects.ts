import "server-only";

import { z } from "zod";
import { requireAdmin } from "@/lib/auth/rbac";
import { createAdminClient } from "@/lib/supabase/admin";
import { getTotalPages, parsePositiveInt } from "@/lib/utils/pagination";
import { slugSchema } from "@/lib/security/server-action";

const adminProjectFiltersSchema = z.object({
  page: z.unknown().optional(),
  q: z.string().max(100).optional(),
  status: z.enum(["ongoing", "completed", "archived"]).optional(),
  category: z.string().max(100).optional(),
  featured: z.enum(["true"]).optional(),
  sort: z.enum(["date", "name", "status"]).optional(),
  order: z.enum(["asc", "desc"]).optional(),
});

const ADMIN_PROJECT_PAGE_SIZE = 20;

type AdminProjectRow = {
  id: string;
  nama: string;
  slug: string;
  deskripsi: string;
  kategori: string | null;
  status: "ongoing" | "completed" | "archived";
  tech_stack: string[] | null;
  thumbnail_url: string | null;
  klien: string | null;
  tanggal_mulai: Date | string | null;
  tanggal_selesai: Date | string | null;
  github_url: string | null;
  live_url: string | null;
  featured: boolean;
  created_at: Date | string;
  updated_at?: Date | string | null;
};

function serializeProject(project: AdminProjectRow) {
  return {
    ...project,
    tanggal_mulai: project.tanggal_mulai instanceof Date ? project.tanggal_mulai.toISOString() : project.tanggal_mulai,
    tanggal_selesai: project.tanggal_selesai instanceof Date ? project.tanggal_selesai.toISOString() : project.tanggal_selesai,
    created_at: project.created_at instanceof Date ? project.created_at.toISOString() : project.created_at,
    updated_at: project.updated_at instanceof Date ? project.updated_at.toISOString() : project.updated_at,
    featured: Boolean(project.featured),
  };
}

export async function getAdminProjectsReadModel(filters: Record<string, unknown> = {}) {
  await requireAdmin();

  const parsed = adminProjectFiltersSchema.safeParse(filters);
  if (!parsed.success) {
    throw new Error("Invalid admin project filters: " + parsed.error.issues[0].message);
  }

  const page = parsePositiveInt(parsed.data.page, 1);
  const sortColumn = ({
    date: "created_at",
    name: "nama",
    status: "status",
  } as const)[parsed.data.sort ?? "date"] ?? "created_at";
  const ascending = (parsed.data.order ?? "desc") === "asc";

  const offset = (page - 1) * ADMIN_PROJECT_PAGE_SIZE;

  const supabase = createAdminClient();

  let baseQuery = supabase
    .from("projects")
    .select("*", { count: "exact" });

  if (parsed.data.q) {
    const pattern = `%${parsed.data.q.replace(/[%_]/g, "\\$&")}%`;
    baseQuery = baseQuery.ilike("nama", pattern);
  }
  if (parsed.data.status) {
    baseQuery = baseQuery.eq("status", parsed.data.status);
  }
  if (parsed.data.category) {
    baseQuery = baseQuery.eq("kategori", parsed.data.category);
  }
  if (parsed.data.featured === "true") {
    baseQuery = baseQuery.eq("featured", true);
  }

  const { data, count } = await baseQuery
    .order(sortColumn, { ascending })
    .range(offset, offset + ADMIN_PROJECT_PAGE_SIZE - 1);

  const totalItems = count ?? 0;
  return {
    projects: (data ?? []).map(serializeProject as (row: Record<string, unknown>) => ReturnType<typeof serializeProject>),
    filters: parsed.data,
    pagination: {
      page,
      pageSize: ADMIN_PROJECT_PAGE_SIZE,
      totalItems,
      totalPages: getTotalPages(totalItems, ADMIN_PROJECT_PAGE_SIZE),
    },
  };
}

export async function getProjectStatsReadModel() {
  await requireAdmin();

  const supabase = createAdminClient();

  const [totalResult, completedResult, ongoingResult, featuredResult] = await Promise.all([
    supabase.from("projects").select("*", { count: "exact", head: true }),
    supabase.from("projects").select("*", { count: "exact", head: true }).eq("status", "completed"),
    supabase.from("projects").select("*", { count: "exact", head: true }).eq("status", "ongoing"),
    supabase.from("projects").select("*", { count: "exact", head: true }).eq("featured", true),
  ]);

  return {
    total: totalResult.count ?? 0,
    completed: completedResult.count ?? 0,
    ongoing: ongoingResult.count ?? 0,
    featured: featuredResult.count ?? 0,
  };
}

export async function getProjectCategoriesReadModel() {
  await requireAdmin();

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("projects")
    .select("kategori")
    .not("kategori", "is", null)
    .order("kategori", { ascending: true });

  const unique = Array.from(new Set((data ?? []).map((r) => r.kategori).filter(Boolean)));
  return unique as string[];
}

export async function getProjectBySlugReadModel(slug: string) {
  await requireAdmin();

  const parsed = slugSchema.safeParse(slug);
  if (!parsed.success) {
    throw new Error("Invalid project slug");
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("slug", parsed.data)
    .maybeSingle();

  if (error || !data) throw new Error("Project not found");
  return serializeProject(data);
}
