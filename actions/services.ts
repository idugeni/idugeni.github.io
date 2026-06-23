"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { updatePublicContent, CACHE_TAGS } from "@/lib/cache/tags";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/rbac";
import { slugSchema, uuidArraySchema } from "@/lib/security/server-action";
import { getTotalPages, parsePositiveInt } from "@/lib/utils/pagination";
import { sanitizeRichHtml } from "@/lib/security/sanitize-html";
import { slugify } from "@/lib/utils/slug";

const servicePayloadSchema = z.object({
  nama: z.string().min(1).max(200).trim(),
  slug: z.string().min(1).max(220).trim().optional(),
  deskripsiPendek: z.string().min(10).max(500).trim().optional(),
  deskripsi_pendek: z.string().min(10).max(500).trim().optional(),
  deskripsiPanjang: z.string().optional(),
  deskripsi_panjang: z.string().optional(),
  icon: z.string().max(100).optional(),
  hargaMulai: z.string().max(100).optional(),
  harga_mulai: z.string().max(100).optional(),
  fitur: z.array(z.string().max(160)).optional(),
  aktif: z.boolean().optional(),
  urutan: z.number().int().min(0).optional(),
});

const createServiceSchema = servicePayloadSchema.refine(
  (value) => Boolean(value.deskripsiPendek || value.deskripsi_pendek),
  "Short description is required",
);
const updateServiceSchema = servicePayloadSchema.partial();
const bulkServiceUpdateSchema = z.object({
  aktif: z.boolean().optional(),
}).refine((value) => Object.keys(value).length > 0, "At least one update field is required");
const adminServiceFiltersSchema = z.object({
  page: z.unknown().optional(),
  q: z.string().max(100).optional(),
  status: z.enum(["active", "inactive"]).optional(),
  sort: z.enum(["date", "name", "order", "status"]).optional(),
  order: z.enum(["asc", "desc"]).optional(),
});
const uuidSchema = z.string().uuid();
const ADMIN_SERVICE_PAGE_SIZE = 20;

function normalizeServicePayload(data: z.infer<typeof updateServiceSchema>) {
  const deskripsiPendek = data.deskripsiPendek ?? data.deskripsi_pendek;
  const deskripsiPanjang = data.deskripsiPanjang ?? data.deskripsi_panjang;
  const hargaMulai = data.hargaMulai ?? data.harga_mulai;

  return {
    ...(typeof data.nama === "string" ? { nama: data.nama } : {}),
    slug: data.slug ? slugify(data.slug) : data.nama ? slugify(data.nama) : undefined,
    ...(deskripsiPendek ? { deskripsiPendek } : {}),
    ...(typeof deskripsiPanjang === "string" ? { deskripsiPanjang: sanitizeRichHtml(deskripsiPanjang) } : {}),
    ...(typeof data.icon === "string" ? { icon: data.icon } : {}),
    ...(typeof hargaMulai === "string" ? { hargaMulai } : {}),
    ...(Array.isArray(data.fitur) ? { fitur: data.fitur.map((item) => item.trim()).filter(Boolean) } : {}),
    ...(typeof data.aktif === "boolean" ? { aktif: data.aktif } : {}),
    ...(typeof data.urutan === "number" ? { urutan: data.urutan } : {}),
  };
}

function buildServiceInsertObj(safeData: ReturnType<typeof normalizeServicePayload>) {
  const obj: Record<string, unknown> = {
    nama: safeData.nama ?? null,
    slug: safeData.slug ?? null,
    deskripsi_pendek: safeData.deskripsiPendek ?? null,
    deskripsi_panjang: safeData.deskripsiPanjang ?? null,
    icon: safeData.icon ?? null,
    harga_mulai: safeData.hargaMulai ?? null,
    fitur: Array.isArray(safeData.fitur) ? safeData.fitur : null,
    aktif: safeData.aktif ?? true,
    urutan: safeData.urutan ?? 0,
  };
  return obj;
}

export async function getServices() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("aktif", true)
    .order("urutan");
  if (error) throw error;
  return data ?? [];
}

export async function getAllServices() {
  await requireAdmin();
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("services").select("*").order("urutan");
  if (error) throw error;
  return data ?? [];
}

export async function getAdminServicesPage(filters: Record<string, unknown> = {}) {
  await requireAdmin();

  const parsed = adminServiceFiltersSchema.safeParse(filters);
  if (!parsed.success) {
    throw new Error("Invalid admin service filters: " + parsed.error.issues[0].message);
  }
  const data = parsed.data;

  const page = parsePositiveInt(data.page, 1);
  const sortColumn = ({
    date: "created_at",
    name: "nama",
    order: "urutan",
    status: "aktif",
  } as const)[data.sort ?? "order"] ?? "urutan";
  const sortAscending = (data.order ?? "asc") === "asc";

  const supabase = createAdminClient();

  function applyFilters(q: any) {
    if (data.q) {
      q = q.or(`nama.ilike.%${data.q}%,deskripsi_pendek.ilike.%${data.q}%`);
    }
    if (data.status === "active") {
      q = q.eq("aktif", true);
    }
    if (data.status === "inactive") {
      q = q.eq("aktif", false);
    }
    return q;
  }

  const [countResult, dataResult] = await Promise.all([
    applyFilters(supabase.from("services").select("*", { count: "exact", head: true })),
    applyFilters(supabase.from("services").select("*"))
      .order(sortColumn, { ascending: sortAscending })
      .range((page - 1) * ADMIN_SERVICE_PAGE_SIZE, page * ADMIN_SERVICE_PAGE_SIZE - 1),
  ]);

  const totalItems = countResult.count ?? 0;
  return {
    services: dataResult.data ?? [],
    filters: parsed.data,
    pagination: {
      page,
      pageSize: ADMIN_SERVICE_PAGE_SIZE,
      totalItems,
      totalPages: getTotalPages(totalItems, ADMIN_SERVICE_PAGE_SIZE),
    },
  };
}

export async function getServiceStats() {
  await requireAdmin();
  const supabase = createAdminClient();

  const [totalRes, activeRes, inactiveRes] = await Promise.all([
    supabase.from("services").select("*", { count: "exact", head: true }),
    supabase.from("services").select("*", { count: "exact", head: true }).eq("aktif", true),
    supabase.from("services").select("*", { count: "exact", head: true }).eq("aktif", false),
  ]);

  const { data: allServices } = await supabase.from("services").select("harga_mulai");
  const priced = (allServices ?? []).filter((s) => s.harga_mulai !== null && s.harga_mulai !== "").length;

  return {
    total: totalRes.count ?? 0,
    active: activeRes.count ?? 0,
    inactive: inactiveRes.count ?? 0,
    priced,
  };
}

export async function getService(id: string) {
  await requireAdmin();

  const parsed = uuidSchema.safeParse(id);
  if (!parsed.success) {
    throw new Error("Invalid service ID: must be a valid UUID");
  }

  const supabase = createAdminClient();
  const { data: service, error } = await supabase.from("services").select("*").eq("id", parsed.data).single();
  if (error || !service) throw new Error("Service not found");
  return service;
}

export async function getServiceBySlug(slug: string) {
  await requireAdmin();

  const parsed = slugSchema.safeParse(slug);
  if (!parsed.success) {
    throw new Error("Invalid service slug");
  }

  const supabase = createAdminClient();
  const { data: service, error } = await supabase.from("services").select("*").eq("slug", parsed.data).single();
  if (error || !service) throw new Error("Service not found");
  return service;
}

export async function createService(data: Record<string, unknown>) {
  await requireAdmin();

  const parsed = createServiceSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error("Invalid service data: " + parsed.error.issues[0].message);
  }

  const safeData = normalizeServicePayload(parsed.data);
  const insertObj = buildServiceInsertObj(safeData);

  const supabase = createAdminClient();
  const { data: service, error } = await supabase
    .from("services")
    .insert(insertObj)
    .select()
    .single();

  if (error || !service) throw new Error("Failed to create service");
  updatePublicContent([CACHE_TAGS.services]);
  return service;
}

export async function updateService(id: string, data: Record<string, unknown>) {
  await requireAdmin();

  const parsedId = uuidSchema.safeParse(id);
  if (!parsedId.success) {
    throw new Error("Invalid service ID: must be a valid UUID");
  }

  const parsed = updateServiceSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error("Invalid service data: " + parsed.error.issues[0].message);
  }

  const safeData = normalizeServicePayload(parsed.data);

  const updateObj: Record<string, unknown> = {};

  if (typeof safeData.nama === "string") updateObj.nama = safeData.nama;
  if (typeof safeData.slug === "string") updateObj.slug = safeData.slug;
  if (typeof safeData.deskripsiPendek === "string") updateObj.deskripsi_pendek = safeData.deskripsiPendek;
  if (typeof safeData.deskripsiPanjang === "string") updateObj.deskripsi_panjang = safeData.deskripsiPanjang;
  if (typeof safeData.icon === "string") updateObj.icon = safeData.icon;
  if (typeof safeData.hargaMulai === "string") updateObj.harga_mulai = safeData.hargaMulai;
  if (typeof safeData.aktif === "boolean") updateObj.aktif = safeData.aktif;
  if (typeof safeData.urutan === "number") updateObj.urutan = safeData.urutan;
  if (Array.isArray(safeData.fitur)) updateObj.fitur = safeData.fitur;

  if (Object.keys(updateObj).length === 0) {
    throw new Error("No updates provided");
  }

  const supabase = createAdminClient();
  const { data: service, error } = await supabase
    .from("services")
    .update(updateObj)
    .eq("id", parsedId.data)
    .select()
    .single();

  if (error || !service) throw new Error("Service not found");
  updatePublicContent([CACHE_TAGS.services]);
  return service;
}

export async function deleteService(id: string) {
  await requireAdmin();

  const parsed = uuidSchema.safeParse(id);
  if (!parsed.success) {
    throw new Error("Invalid service ID: must be a valid UUID");
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("services").delete().eq("id", parsed.data);
  if (error) throw error;
  updatePublicContent([CACHE_TAGS.services]);
  return { success: true };
}

export async function bulkUpdateServices(ids: string[], updates: Partial<{ aktif: boolean }>) {
  await requireAdmin();

  const parsedIds = uuidArraySchema.safeParse(ids);
  if (!parsedIds.success) {
    throw new Error("Invalid service IDs: " + parsedIds.error.issues[0].message);
  }

  const parsedUpdates = bulkServiceUpdateSchema.safeParse(updates);
  if (!parsedUpdates.success) {
    throw new Error("Invalid service updates: " + parsedUpdates.error.issues[0].message);
  }

  if (parsedUpdates.data.aktif === undefined) {
    throw new Error("No updates provided");
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("services")
    .update({ aktif: parsedUpdates.data.aktif })
    .in("id", parsedIds.data);
  if (error) throw error;

  updatePublicContent([CACHE_TAGS.services]);
  return { success: true };
}

export async function bulkDeleteServices(ids: string[]) {
  await requireAdmin();

  const parsedIds = uuidArraySchema.safeParse(ids);
  if (!parsedIds.success) {
    throw new Error("Invalid service IDs: " + parsedIds.error.issues[0].message);
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("services").delete().in("id", parsedIds.data);
  if (error) throw error;
  updatePublicContent([CACHE_TAGS.services]);
  return { success: true };
}

export async function duplicateService(id: string) {
  await requireAdmin();

  const original = await getService(id);
  const timestamp = Date.now();

  const insertObj: Record<string, unknown> = {
    nama: `${original.nama} (Copy)`,
    slug: `${original.slug}-copy-${timestamp}`,
    deskripsi_pendek: original.deskripsi_pendek,
    deskripsi_panjang: original.deskripsi_panjang,
    icon: original.icon,
    harga_mulai: original.harga_mulai,
    fitur: Array.isArray(original.fitur) ? original.fitur : null,
    urutan: original.urutan + 1,
    aktif: false,
  };

  const supabase = createAdminClient();
  const { error } = await supabase.from("services").insert(insertObj);
  if (error) throw error;

  updatePublicContent([CACHE_TAGS.services]);
  return { success: true, slug: `${original.slug}-copy-${timestamp}` };
}
