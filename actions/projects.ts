"use server";

import { createAdminClient } from "@/lib/supabase/admin";
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
  const supabase = createAdminClient();

  let query = supabase.from("projects").select("*");
  if (filters?.kategori) {
    query = query.eq("kategori", filters.kategori);
  }
  if (filters?.featured) {
    query = query.eq("featured", true);
  }
  if (filters?.search) {
    query = query.ilike("nama", `%${filters.search}%`);
  }

  const { data, error } = await query.order("urutan").limit(200);
  if (error) throw error;
  return data ?? [];
}

export async function getAdminProjectsPage(filters: Record<string, unknown> = {}) {
  await requireAdmin();

  const parsed = adminProjectFiltersSchema.safeParse(filters);
  if (!parsed.success) {
    throw new Error("Invalid admin project filters: " + parsed.error.issues[0].message);
  }
  const data = parsed.data;

  const page = parsePositiveInt(data.page, 1);
  const sortColumn = ({
    date: "created_at",
    name: "nama",
    status: "status",
  } as const)[data.sort ?? "date"] ?? "created_at";
  const sortAscending = (data.order ?? "desc") === "asc";

  const supabase = createAdminClient();

  function applyFilters(q: any) {
    if (data.q) {
      q = q.ilike("nama", `%${data.q}%`);
    }
    if (data.status) {
      q = q.eq("status", data.status);
    }
    if (data.category) {
      q = q.eq("kategori", data.category);
    }
    if (data.featured === "true") {
      q = q.eq("featured", true);
    }
    return q;
  }

  const [countResult, dataResult] = await Promise.all([
    applyFilters(supabase.from("projects").select("*", { count: "exact", head: true })),
    applyFilters(supabase.from("projects").select("*"))
      .order(sortColumn, { ascending: sortAscending })
      .range((page - 1) * ADMIN_PROJECT_PAGE_SIZE, page * ADMIN_PROJECT_PAGE_SIZE - 1),
  ]);

  const totalItems = countResult.count ?? 0;
  return {
    projects: dataResult.data ?? [],
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
  const supabase = createAdminClient();
  const { data: project, error } = await supabase.from("projects").select("*").eq("id", id).single();
  if (error || !project) throw new Error("Project not found");
  return project;
}

export async function getProjectBySlug(slug: string) {
  await requireAdmin();

  const parsed = slugSchema.safeParse(slug);
  if (!parsed.success) {
    throw new Error("Invalid project slug");
  }

  const supabase = createAdminClient();
  const { data: project, error } = await supabase.from("projects").select("*").eq("slug", parsed.data).single();
  if (error || !project) throw new Error("Project not found");
  return project;
}

export async function getProjectStats() {
  await requireAdmin();
  const supabase = createAdminClient();

  const [totalRes, completedRes, ongoingRes, featuredRes] = await Promise.all([
    supabase.from("projects").select("*", { count: "exact", head: true }),
    supabase.from("projects").select("*", { count: "exact", head: true }).eq("status", "completed"),
    supabase.from("projects").select("*", { count: "exact", head: true }).eq("status", "ongoing"),
    supabase.from("projects").select("*", { count: "exact", head: true }).eq("featured", true),
  ]);

  return {
    total: totalRes.count ?? 0,
    completed: completedRes.count ?? 0,
    ongoing: ongoingRes.count ?? 0,
    featured: featuredRes.count ?? 0,
  };
}

export async function createProject(data: Record<string, unknown>) {
  await requireAdmin();

  const parsed = createProjectSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error("Invalid project data: " + parsed.error.issues[0].message);
  }

  const { teknologi, techStack, imageUrl, thumbnailUrl, projectUrl, liveUrl } = parsed.data;

  const insertObj: Record<string, unknown> = {
    nama: parsed.data.nama,
    deskripsi: sanitizeRichHtml(parsed.data.deskripsi),
    kategori: parsed.data.kategori,
    status: parsed.data.status,
    tech_stack: techStack ?? teknologi ?? [],
    thumbnail_url: thumbnailUrl || imageUrl || null,
    live_url: liveUrl || projectUrl || null,
    github_url: parsed.data.githubUrl || null,
    tanggal_mulai: parsed.data.tanggalMulai || null,
    tanggal_selesai: parsed.data.tanggalSelesai || null,
    klien: parsed.data.klien || null,
    tim_size: parsed.data.timSize || null,
    peran: parsed.data.peran || null,
    featured: parsed.data.featured ?? false,
    urutan: parsed.data.urutan ?? 0,
  };

  const supabase = createAdminClient();
  const { data: project, error } = await supabase
    .from("projects")
    .insert(insertObj)
    .select()
    .single();

  if (error || !project) throw new Error("Failed to create project");
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

  const updateObj: Record<string, unknown> = {};

  if (typeof parsed.data.nama === "string") updateObj.nama = parsed.data.nama;
  if (typeof parsed.data.kategori === "string") updateObj.kategori = parsed.data.kategori;
  if (typeof parsed.data.status === "string") updateObj.status = parsed.data.status;
  if (typeof parsed.data.featured === "boolean") updateObj.featured = parsed.data.featured;
  if (typeof parsed.data.urutan === "number") updateObj.urutan = parsed.data.urutan;
  if (typeof parsed.data.klien === "string") updateObj.klien = parsed.data.klien;
  if (typeof parsed.data.timSize === "string") updateObj.tim_size = parsed.data.timSize;
  if (typeof parsed.data.peran === "string") updateObj.peran = parsed.data.peran;
  if (typeof parsed.data.deskripsi === "string") updateObj.deskripsi = sanitizeRichHtml(parsed.data.deskripsi);
  if (techStack || teknologi) updateObj.tech_stack = techStack ?? teknologi;
  if (typeof thumbnailUrl === "string" || typeof imageUrl === "string") updateObj.thumbnail_url = thumbnailUrl || imageUrl || null;
  if (typeof liveUrl === "string" || typeof projectUrl === "string") updateObj.live_url = liveUrl || projectUrl || null;
  if (typeof parsed.data.githubUrl === "string") updateObj.github_url = parsed.data.githubUrl || null;
  if (typeof parsed.data.tanggalMulai === "string") updateObj.tanggal_mulai = parsed.data.tanggalMulai || null;
  if (typeof parsed.data.tanggalSelesai === "string") updateObj.tanggal_selesai = parsed.data.tanggalSelesai || null;

  if (Object.keys(updateObj).length === 0) {
    throw new Error("No updates provided");
  }

  const supabase = createAdminClient();
  const { data: project, error } = await supabase
    .from("projects")
    .update(updateObj)
    .eq("id", parsedId.data)
    .select()
    .single();

  if (error || !project) throw new Error("Project not found");
  updatePublicContent([CACHE_TAGS.projects]);
  return project;
}

export async function deleteProject(id: string) {
  await requireAdmin();

  const parsed = uuidSchema.safeParse(id);
  if (!parsed.success) {
    throw new Error("Invalid project ID: must be a valid UUID");
  }

  const supabase = createAdminClient();
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

  const updateObj: Record<string, unknown> = {};
  if (parsedUpdates.data.status !== undefined) {
    updateObj.status = parsedUpdates.data.status;
  }
  if (parsedUpdates.data.featured !== undefined) {
    updateObj.featured = parsedUpdates.data.featured;
  }

  if (Object.keys(updateObj).length === 0) {
    throw new Error("No updates provided");
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("projects")
    .update(updateObj)
    .in("id", parsedIds.data);
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

  const supabase = createAdminClient();
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

  const supabase = createAdminClient();

  const { data: original, error: fetchError } = await supabase.from("projects").select("*").eq("id", parsed.data).single();
  if (fetchError || !original) throw new Error("Project not found");

  const timestamp = Date.now();

  const insertObj: Record<string, unknown> = {
    nama: `${original.nama} (Copy)`,
    slug: `${original.slug}-copy-${timestamp}`,
    deskripsi: original.deskripsi,
    kategori: original.kategori,
    status: "ongoing",
    tech_stack: Array.isArray(original.tech_stack) ? original.tech_stack : null,
    thumbnail_url: original.thumbnail_url,
    klien: original.klien,
    tanggal_mulai: original.tanggal_mulai,
    tanggal_selesai: original.tanggal_selesai,
    github_url: original.github_url,
    live_url: original.live_url,
    featured: false,
    urutan: original.urutan,
  };

  const { error: insertError } = await supabase.from("projects").insert(insertObj);
  if (insertError) throw insertError;

  updatePublicContent([CACHE_TAGS.projects]);
  return { success: true, slug: `${original.slug}-copy-${timestamp}` };
}
