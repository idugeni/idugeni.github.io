"use server";

import { queryPooler, queryPoolerSingle } from "@/lib/db/pooler";
import { updatePublicContent, CACHE_TAGS } from "@/lib/cache/tags";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/rbac";
import { slugSchema, uuidArraySchema } from "@/lib/security/server-action";
import { getTotalPages, parsePositiveInt } from "@/lib/utils/pagination";
import { sanitizeRichHtml } from "@/lib/security/sanitize-html";

// Validation schemas
const createProjectSchema = z.object({
  nama: z.string().min(1).max(200).trim(),
  deskripsi: z.string().min(10).max(5000).trim(),
  kategori: z.string().max(100),
  status: z.enum(["ongoing", "completed", "archived"]),
  teknologi: z.array(z.string()).optional(),
  techStack: z.array(z.string()).optional(),
  imageUrl: z.string().url().max(500).optional().or(z.literal("")),
  thumbnailUrl: z.string().url().max(500).optional().or(z.literal("")),
  projectUrl: z.string().url().max(500).optional().or(z.literal("")),
  liveUrl: z.string().url().max(500).optional().or(z.literal("")),
  githubUrl: z.string().url().max(500).optional().or(z.literal("")),
  featured: z.boolean().optional(),
  urutan: z.number().int().min(0).optional(),
  tanggalMulai: z.string().optional(),
  tanggalSelesai: z.string().optional(),
  klien: z.string().max(255).optional(),
  timSize: z.string().max(50).optional(),
  peran: z.string().max(255).optional(),
});

const updateProjectSchema = createProjectSchema.partial();
const bulkProjectUpdateSchema = z.object({
  status: z.enum(["ongoing", "completed", "archived"]).optional(),
  featured: z.boolean().optional(),
}).refine((value) => Object.keys(value).length > 0, "At least one update field is required");
const uuidSchema = z.string().uuid();
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

export async function getProjects(filters?: { kategori?: string; featured?: boolean; search?: string }) {
  const conditions: string[] = [];
  const params: unknown[] = [];
  let idx = 1;

  if (filters?.kategori) {
    conditions.push(`kategori = $${idx}`);
    params.push(filters.kategori);
    idx++;
  }
  if (filters?.featured) {
    conditions.push(`featured = $${idx}`);
    params.push(true);
    idx++;
  }
  if (filters?.search) {
    const escaped = filters.search.replace(/[%_]/g, '\\$&');
    conditions.push(`nama ILIKE '%' || $${idx} || '%' ESCAPE '\\'`);
    params.push(escaped);
    idx++;
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  return queryPooler(`SELECT * FROM projects ${where} ORDER BY urutan LIMIT 200`, params);
}

export async function getAdminProjectsPage(filters: Record<string, unknown> = {}) {
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
    const escaped = parsed.data.q.replace(/[%_]/g, '\\$&');
    conditions.push(`nama ILIKE '%' || $${idx} || '%' ESCAPE '\\'`);
    params.push(escaped);
    idx++;
  }
  if (parsed.data.status) { conditions.push(`status = $${idx}`); params.push(parsed.data.status); idx++; }
  if (parsed.data.category) { conditions.push(`kategori = $${idx}`); params.push(parsed.data.category); idx++; }
  if (parsed.data.featured === "true") { conditions.push(`featured = $${idx}`); params.push(true); idx++; }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const offset = (page - 1) * ADMIN_PROJECT_PAGE_SIZE;

  const [countResult, data] = await Promise.all([
    queryPooler<{ count: number }>(`SELECT COUNT(*)::int AS count FROM projects ${where}`, params),
    queryPooler(`SELECT * FROM projects ${where} ORDER BY ${sortColumn} ${sortDir} LIMIT $${idx} OFFSET $${idx + 1}`, [...params, ADMIN_PROJECT_PAGE_SIZE, offset]),
  ]);

  const totalItems = countResult[0]?.count ?? 0;
  return {
    projects: data ?? [],
    filters: parsed.data,
    pagination: {
      page,
      pageSize: ADMIN_PROJECT_PAGE_SIZE,
      totalItems,
      totalPages: getTotalPages(totalItems, ADMIN_PROJECT_PAGE_SIZE),
    },
  };
}

export async function getProject(id: string) {
  const project = await queryPoolerSingle(`SELECT * FROM projects WHERE id = $1`, [id]);
  if (!project) throw new Error("Project not found");
  return project;
}

export async function getProjectBySlug(slug: string) {
  await requireAdmin();

  const parsed = slugSchema.safeParse(slug);
  if (!parsed.success) {
    throw new Error("Invalid project slug");
  }

  const project = await queryPoolerSingle(`SELECT * FROM projects WHERE slug = $1`, [parsed.data]);
  if (!project) throw new Error("Project not found");
  return project;
}

export async function getProjectStats() {
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
    total: row.total,
    completed: row.completed,
    ongoing: row.ongoing,
    featured: row.featured,
  };
}

export async function createProject(data: Record<string, unknown>) {
  await requireAdmin();

  const parsed = createProjectSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error("Invalid project data: " + parsed.error.issues[0].message);
  }

  const { teknologi, techStack, imageUrl, thumbnailUrl, projectUrl, liveUrl } = parsed.data;

  const columns = [
    "nama", "deskripsi", "kategori", "status", "tech_stack", "thumbnail_url",
    "live_url", "github_url", "tanggal_mulai", "tanggal_selesai",
    "klien", "tim_size", "peran", "featured", "urutan",
  ];

  const values: unknown[] = [
    parsed.data.nama,
    sanitizeRichHtml(parsed.data.deskripsi),
    parsed.data.kategori,
    parsed.data.status,
    JSON.stringify(techStack ?? teknologi ?? []),
    thumbnailUrl || imageUrl || null,
    liveUrl || projectUrl || null,
    parsed.data.githubUrl || null,
    parsed.data.tanggalMulai || null,
    parsed.data.tanggalSelesai || null,
    parsed.data.klien || null,
    parsed.data.timSize || null,
    parsed.data.peran || null,
    parsed.data.featured ?? false,
    parsed.data.urutan ?? 0,
  ];

  const placeholders = columns.map((_, i) => `$${i + 1}`);
  const project = await queryPoolerSingle(
    `INSERT INTO projects (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`,
    values
  );

  if (!project) throw new Error("Failed to create project");
  updatePublicContent([CACHE_TAGS.projects]);
  return project;
}

export async function updateProject(id: string, data: Record<string, unknown>) {
  await requireAdmin();

  const parsedId = uuidSchema.safeParse(id);
  if (!parsedId.success) {
    throw new Error("Invalid project ID: must be a valid UUID");
  }

  const parsed = updateProjectSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error("Invalid project data: " + parsed.error.issues[0].message);
  }

  const { teknologi, techStack, imageUrl, thumbnailUrl, projectUrl, liveUrl } = parsed.data;

  const setClauses: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  const simpleUpdates: [string, unknown][] = [
    ["nama", parsed.data.nama],
    ["kategori", parsed.data.kategori],
    ["status", parsed.data.status],
    ["featured", parsed.data.featured],
    ["urutan", parsed.data.urutan],
    ["klien", parsed.data.klien],
    ["tim_size", parsed.data.timSize],
    ["peran", parsed.data.peran],
  ];

  for (const [col, val] of simpleUpdates) {
    if (val !== undefined) {
      setClauses.push(`${col} = $${paramIndex}`);
      values.push(val);
      paramIndex++;
    }
  }

  if (typeof parsed.data.deskripsi === "string") {
    setClauses.push(`deskripsi = $${paramIndex}`);
    values.push(sanitizeRichHtml(parsed.data.deskripsi));
    paramIndex++;
  }
  if (techStack || teknologi) {
    setClauses.push(`tech_stack = $${paramIndex}`);
    values.push(JSON.stringify(techStack ?? teknologi));
    paramIndex++;
  }
  if (typeof thumbnailUrl === "string" || typeof imageUrl === "string") {
    setClauses.push(`thumbnail_url = $${paramIndex}`);
    values.push(thumbnailUrl || imageUrl || null);
    paramIndex++;
  }
  if (typeof liveUrl === "string" || typeof projectUrl === "string") {
    setClauses.push(`live_url = $${paramIndex}`);
    values.push(liveUrl || projectUrl || null);
    paramIndex++;
  }
  if (typeof parsed.data.githubUrl === "string") {
    setClauses.push(`github_url = $${paramIndex}`);
    values.push(parsed.data.githubUrl || null);
    paramIndex++;
  }
  if (typeof parsed.data.tanggalMulai === "string") {
    setClauses.push(`tanggal_mulai = $${paramIndex}`);
    values.push(parsed.data.tanggalMulai || null);
    paramIndex++;
  }
  if (typeof parsed.data.tanggalSelesai === "string") {
    setClauses.push(`tanggal_selesai = $${paramIndex}`);
    values.push(parsed.data.tanggalSelesai || null);
    paramIndex++;
  }

  if (setClauses.length === 0) {
    throw new Error("No updates provided");
  }

  values.push(parsedId.data);
  const project = await queryPoolerSingle(
    `UPDATE projects SET ${setClauses.join(", ")}, updated_at = now() WHERE id = $${paramIndex} RETURNING *`,
    values
  );

  if (!project) throw new Error("Project not found");
  updatePublicContent([CACHE_TAGS.projects]);
  return project;
}

export async function deleteProject(id: string) {
  await requireAdmin();

  const parsed = uuidSchema.safeParse(id);
  if (!parsed.success) {
    throw new Error("Invalid project ID: must be a valid UUID");
  }

  await queryPooler(`DELETE FROM projects WHERE id = $1`, [parsed.data]);
  updatePublicContent([CACHE_TAGS.projects]);
  return { success: true };
}

export async function bulkUpdateProjects(ids: string[], updates: Partial<{ status: "ongoing" | "completed" | "archived"; featured: boolean }>) {
  await requireAdmin();

  const parsedIds = uuidArraySchema.safeParse(ids);
  if (!parsedIds.success) {
    throw new Error("Invalid project IDs: " + parsedIds.error.issues[0].message);
  }

  const parsedUpdates = bulkProjectUpdateSchema.safeParse(updates);
  if (!parsedUpdates.success) {
    throw new Error("Invalid project updates: " + parsedUpdates.error.issues[0].message);
  }

  const setClauses: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  if (parsedUpdates.data.status !== undefined) {
    setClauses.push(`status = $${paramIndex}`);
    values.push(parsedUpdates.data.status);
    paramIndex++;
  }
  if (parsedUpdates.data.featured !== undefined) {
    setClauses.push(`featured = $${paramIndex}`);
    values.push(parsedUpdates.data.featured);
    paramIndex++;
  }

  if (setClauses.length === 0) {
    throw new Error("No updates provided");
  }

  values.push(parsedIds.data);
  await queryPooler(
    `UPDATE projects SET ${setClauses.join(", ")}, updated_at = now() WHERE id = ANY($${paramIndex}::uuid[])`,
    values
  );

  updatePublicContent([CACHE_TAGS.projects]);
  return { success: true };
}

export async function bulkDeleteProjects(ids: string[]) {
  await requireAdmin();

  const parsedIds = uuidArraySchema.safeParse(ids);
  if (!parsedIds.success) {
    throw new Error("Invalid project IDs: " + parsedIds.error.issues[0].message);
  }

  await queryPooler(`DELETE FROM projects WHERE id = ANY($1::uuid[])`, [parsedIds.data]);
  updatePublicContent([CACHE_TAGS.projects]);
  return { success: true };
}

export async function duplicateProject(id: string) {
  await requireAdmin();

  const parsed = uuidSchema.safeParse(id);
  if (!parsed.success) {
    throw new Error("Invalid project ID: must be a valid UUID");
  }

  const original = await queryPoolerSingle(`SELECT * FROM projects WHERE id = $1`, [parsed.data]);
  if (!original) throw new Error("Project not found");

  const timestamp = Date.now();
  const columns = [
    "nama", "slug", "deskripsi", "kategori", "status", "tech_stack",
    "thumbnail_url", "klien", "tanggal_mulai", "tanggal_selesai",
    "github_url", "live_url", "featured", "urutan",
  ];

  const values: unknown[] = [
    `${original.nama} (Copy)`,
    `${original.slug}-copy-${timestamp}`,
    original.deskripsi,
    original.kategori,
    "ongoing",
    Array.isArray(original.tech_stack) ? JSON.stringify(original.tech_stack) : null,
    original.thumbnail_url,
    original.klien,
    original.tanggal_mulai,
    original.tanggal_selesai,
    original.github_url,
    original.live_url,
    false,
    original.urutan,
  ];

  const placeholders = columns.map((_, i) => `$${i + 1}`);
  await queryPooler(
    `INSERT INTO projects (${columns.join(", ")}) VALUES (${placeholders.join(", ")})`,
    values
  );

  updatePublicContent([CACHE_TAGS.projects]);
  return { success: true, slug: `${original.slug}-copy-${timestamp}` };
}
