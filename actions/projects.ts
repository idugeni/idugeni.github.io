"use server";

import { createClient } from "@/lib/supabase/server";
import { queryPooler, queryPoolerSingle } from "@/lib/db/pooler";
import { updatePublicContent, CACHE_TAGS } from "@/lib/cache/tags";
import { toSnakeCase } from "@/lib/utils/case";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/rbac";
import { uuidArraySchema } from "@/lib/security/server-action";
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
const slugSchema = z.string().min(1).max(220).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
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
  const supabase = await createClient();
  let query = supabase.from("projects").select("*").order("urutan");

  if (filters?.kategori) query = query.eq("kategori", filters.kategori);
  if (filters?.featured) query = query.eq("featured", true);
  if (filters?.search) query = query.textSearch("nama", filters.search);

  const { data, error } = await query;
  if (error) throw error;
  return data;
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
  const supabase = await createClient();
  const { data, error } = await supabase.from("projects").select("*").eq("id", id).single();
  if (error) throw error;
  return data;
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

  const { teknologi, techStack, imageUrl, thumbnailUrl, projectUrl, liveUrl, ...projectData } = parsed.data;
  const payload = {
    ...projectData,
    techStack: techStack ?? teknologi ?? [],
    thumbnailUrl: thumbnailUrl || imageUrl || null,
    liveUrl: liveUrl || projectUrl || null,
    githubUrl: parsed.data.githubUrl || null,
    tanggalMulai: parsed.data.tanggalMulai || null,
    tanggalSelesai: parsed.data.tanggalSelesai || null,
    deskripsi: sanitizeRichHtml(parsed.data.deskripsi),
  };
  const supabase = await createClient();
  const { data: project, error } = await supabase.from("projects").insert(toSnakeCase(payload)).select().single();
  if (error) throw error;
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

  const { teknologi, techStack, imageUrl, thumbnailUrl, projectUrl, liveUrl, ...projectData } = parsed.data;
  const payload = {
    ...projectData,
    ...(techStack || teknologi ? { techStack: techStack ?? teknologi } : {}),
    ...(typeof thumbnailUrl === "string" || typeof imageUrl === "string" ? { thumbnailUrl: thumbnailUrl || imageUrl || null } : {}),
    ...(typeof liveUrl === "string" || typeof projectUrl === "string" ? { liveUrl: liveUrl || projectUrl || null } : {}),
    ...(typeof parsed.data.githubUrl === "string" ? { githubUrl: parsed.data.githubUrl || null } : {}),
    ...(typeof parsed.data.tanggalMulai === "string" ? { tanggalMulai: parsed.data.tanggalMulai || null } : {}),
    ...(typeof parsed.data.tanggalSelesai === "string" ? { tanggalSelesai: parsed.data.tanggalSelesai || null } : {}),
    ...(typeof parsed.data.deskripsi === "string" ? { deskripsi: sanitizeRichHtml(parsed.data.deskripsi) } : {}),
  };
  const supabase = await createClient();
  const { data: project, error } = await supabase.from("projects").update(toSnakeCase(payload)).eq("id", parsedId.data).select().single();
  if (error) throw error;
  updatePublicContent([CACHE_TAGS.projects]);
  return project;
}

export async function deleteProject(id: string) {
  await requireAdmin();

  const parsed = uuidSchema.safeParse(id);
  if (!parsed.success) {
    throw new Error("Invalid project ID: must be a valid UUID");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("projects").delete().eq("id", parsed.data);
  if (error) throw error;
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

  const supabase = await createClient();
  const { error } = await supabase.from("projects").update(toSnakeCase(parsedUpdates.data)).in("id", parsedIds.data);
  if (error) throw error;
  updatePublicContent([CACHE_TAGS.projects]);
  return { success: true };
}

export async function bulkDeleteProjects(ids: string[]) {
  await requireAdmin();

  const parsedIds = uuidArraySchema.safeParse(ids);
  if (!parsedIds.success) {
    throw new Error("Invalid project IDs: " + parsedIds.error.issues[0].message);
  }

  const supabase = await createClient();
  const { error } = await supabase.from("projects").delete().in("id", parsedIds.data);
  if (error) throw error;
  updatePublicContent([CACHE_TAGS.projects]);
  return { success: true };
}

export async function duplicateProject(id: string) {
  await requireAdmin();
  
  const parsed = uuidSchema.safeParse(id);
  if (!parsed.success) {
    throw new Error("Invalid project ID: must be a valid UUID");
  }
  
  const supabase = await createClient();
  
  // Get original project
  const { data: original, error: fetchError } = await supabase
    .from("projects")
    .select("*")
    .eq("id", parsed.data)
    .single();
  
  if (fetchError || !original) throw new Error("Project not found");
  
  // Create duplicate with modified fields
  const timestamp = Date.now();
  const duplicate = {
    nama: `${original.nama} (Copy)`,
    slug: `${original.slug}-copy-${timestamp}`,
    deskripsi: original.deskripsi,
    kategori: original.kategori,
    status: "ongoing" as const,
    tech_stack: original.tech_stack,
    thumbnail_url: original.thumbnail_url,
    klien: original.klien,
    tanggal_mulai: original.tanggal_mulai,
    tanggal_selesai: original.tanggal_selesai,
    github_url: original.github_url,
    live_url: original.live_url,
    featured: false,
    urutan: original.urutan,
  };
  
  const { error: insertError } = await supabase.from("projects").insert(toSnakeCase(duplicate));
  if (insertError) throw insertError;
  
  updatePublicContent([CACHE_TAGS.projects]);
  return { success: true, slug: duplicate.slug };
}
