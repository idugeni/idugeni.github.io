import "server-only";

import { z } from "zod";
import { requireAdmin } from "@/lib/auth/rbac";
import { queryPooler, queryPoolerSingle } from "@/lib/db/pooler";
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
  const sortDir = (parsed.data.order ?? "desc") === "asc" ? "ASC" : "DESC";

  const conditions: string[] = [];
  const params: unknown[] = [];
  let idx = 1;

  if (parsed.data.q) {
    const escaped = parsed.data.q.replace(/[%_]/g, "\\$&");
    conditions.push(`nama ILIKE '%' || $${idx} || '%' ESCAPE '\\'`);
    params.push(escaped);
    idx++;
  }
  if (parsed.data.status) {
    conditions.push(`status = $${idx}`);
    params.push(parsed.data.status);
    idx++;
  }
  if (parsed.data.category) {
    conditions.push(`kategori = $${idx}`);
    params.push(parsed.data.category);
    idx++;
  }
  if (parsed.data.featured === "true") {
    conditions.push(`featured = $${idx}`);
    params.push(true);
    idx++;
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const offset = (page - 1) * ADMIN_PROJECT_PAGE_SIZE;

  const [countResult, projects] = await Promise.all([
    queryPooler<{ count: number }>(`SELECT COUNT(*)::int AS count FROM projects ${where}`, params),
    queryPooler<AdminProjectRow>(`SELECT * FROM projects ${where} ORDER BY ${sortColumn} ${sortDir} LIMIT $${idx} OFFSET $${idx + 1}`, [
      ...params,
      ADMIN_PROJECT_PAGE_SIZE,
      offset,
    ]),
  ]);

  const totalItems = countResult[0]?.count ?? 0;
  return {
    projects: projects.map(serializeProject),
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

  const [row] = await queryPooler<{
    total: number;
    completed: number;
    ongoing: number;
    featured: number;
  }>(`
    SELECT
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE status = 'completed')::int AS completed,
      COUNT(*) FILTER (WHERE status = 'ongoing')::int AS ongoing,
      COUNT(*) FILTER (WHERE featured = true)::int AS featured
    FROM projects
  `);

  return {
    total: row?.total ?? 0,
    completed: row?.completed ?? 0,
    ongoing: row?.ongoing ?? 0,
    featured: row?.featured ?? 0,
  };
}

export async function getProjectCategoriesReadModel() {
  await requireAdmin();

  const rows = await queryPooler<{ kategori: string | null }>(
    `SELECT DISTINCT kategori FROM projects WHERE kategori IS NOT NULL ORDER BY kategori`,
  );
  return rows.map((row) => row.kategori).filter((value): value is string => Boolean(value));
}

export async function getProjectBySlugReadModel(slug: string) {
  await requireAdmin();

  const parsed = slugSchema.safeParse(slug);
  if (!parsed.success) {
    throw new Error("Invalid project slug");
  }

  const project = await queryPoolerSingle<AdminProjectRow>(`SELECT * FROM projects WHERE slug = $1`, [parsed.data]);
  if (!project) throw new Error("Project not found");
  return serializeProject(project);
}
