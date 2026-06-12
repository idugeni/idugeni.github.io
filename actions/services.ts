"use server";

import { queryPooler, queryPoolerSingle } from "@/lib/db/pooler";
import { updatePublicContent, CACHE_TAGS } from "@/lib/cache/tags";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/rbac";
import { uuidArraySchema } from "@/lib/security/server-action";
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
const slugSchema = z.string().min(1).max(220).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const ADMIN_SERVICE_PAGE_SIZE = 20;
const SERVICE_COLUMNS = "id,nama,slug,deskripsi_pendek,deskripsi_panjang,icon,harga_mulai,fitur,urutan,aktif,created_at,updated_at";

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

export async function getServices() {
  return queryPooler(
    `SELECT ${SERVICE_COLUMNS} FROM services WHERE aktif = $1 ORDER BY urutan`,
    [true]
  );
}

export async function getAllServices() {
  await requireAdmin();
  return queryPooler(`SELECT ${SERVICE_COLUMNS} FROM services ORDER BY urutan`);
}

export async function getAdminServicesPage(filters: Record<string, unknown> = {}) {
  await requireAdmin();

  const parsed = adminServiceFiltersSchema.safeParse(filters);
  if (!parsed.success) {
    throw new Error("Invalid admin service filters: " + parsed.error.issues[0].message);
  }

  const page = parsePositiveInt(parsed.data.page, 1);
  const sortColumn = ({
    date: "created_at",
    name: "nama",
    order: "urutan",
    status: "aktif",
  } as const)[parsed.data.sort ?? "order"] ?? "urutan";
  const sortDir = (parsed.data.order ?? "asc") === "asc" ? "ASC" : "DESC";

  const conditions: string[] = [];
  const params: unknown[] = [];
  let idx = 1;

  if (parsed.data.q) {
    const escaped = parsed.data.q.replace(/[%_]/g, '\\$&');
    conditions.push(`(nama ILIKE '%' || $${idx} || '%' ESCAPE '\\' OR deskripsi_pendek ILIKE '%' || $${idx} || '%' ESCAPE '\\')`);
    params.push(escaped);
    idx++;
  }
  if (parsed.data.status === "active") { conditions.push(`aktif = $${idx}`); params.push(true); idx++; }
  if (parsed.data.status === "inactive") { conditions.push(`aktif = $${idx}`); params.push(false); idx++; }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const offset = (page - 1) * ADMIN_SERVICE_PAGE_SIZE;

  const [countResult, data] = await Promise.all([
    queryPooler<{ count: number }>(`SELECT COUNT(*)::int AS count FROM services ${where}`, params),
    queryPooler(`SELECT * FROM services ${where} ORDER BY ${sortColumn} ${sortDir} LIMIT $${idx} OFFSET $${idx + 1}`, [...params, ADMIN_SERVICE_PAGE_SIZE, offset]),
  ]);

  const totalItems = countResult[0]?.count ?? 0;
  return {
    services: data ?? [],
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

  const [row] = await queryPooler<{
    total: number;
    active: number;
    inactive: number;
    priced: number;
  }>(`
    SELECT
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE aktif = true)::int AS active,
      COUNT(*) FILTER (WHERE aktif = false)::int AS inactive,
      COUNT(*) FILTER (WHERE harga_mulai IS NOT NULL AND harga_mulai != '')::int AS priced
    FROM services
  `);

  return {
    total: row.total,
    active: row.active,
    inactive: row.inactive,
    priced: row.priced,
  };
}

export async function getService(id: string) {
  await requireAdmin();

  const parsed = uuidSchema.safeParse(id);
  if (!parsed.success) {
    throw new Error("Invalid service ID: must be a valid UUID");
  }

  const service = await queryPoolerSingle(
    `SELECT ${SERVICE_COLUMNS} FROM services WHERE id = $1`,
    [parsed.data]
  );
  if (!service) throw new Error("Service not found");
  return service;
}

export async function getServiceBySlug(slug: string) {
  await requireAdmin();

  const parsed = slugSchema.safeParse(slug);
  if (!parsed.success) {
    throw new Error("Invalid service slug");
  }

  const service = await queryPoolerSingle(
    `SELECT ${SERVICE_COLUMNS} FROM services WHERE slug = $1`,
    [parsed.data]
  );
  if (!service) throw new Error("Service not found");
  return service;
}

export async function createService(data: Record<string, unknown>) {
  await requireAdmin();

  const parsed = createServiceSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error("Invalid service data: " + parsed.error.issues[0].message);
  }

  const safeData = normalizeServicePayload(parsed.data);

  const columns = [
    "nama", "slug", "deskripsi_pendek", "deskripsi_panjang",
    "icon", "harga_mulai", "fitur", "aktif", "urutan",
  ];

  const values: unknown[] = [
    safeData.nama ?? null,
    safeData.slug ?? null,
    safeData.deskripsiPendek ?? null,
    safeData.deskripsiPanjang ?? null,
    safeData.icon ?? null,
    safeData.hargaMulai ?? null,
    Array.isArray(safeData.fitur) ? JSON.stringify(safeData.fitur) : null,
    safeData.aktif ?? true,
    safeData.urutan ?? 0,
  ];

  const placeholders = columns.map((_, i) => `$${i + 1}`);
  const service = await queryPoolerSingle(
    `INSERT INTO services (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING ${SERVICE_COLUMNS}`,
    values
  );

  if (!service) throw new Error("Failed to create service");
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

  const setClauses: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  const fieldMap: [string, unknown][] = [
    ["nama", safeData.nama],
    ["slug", safeData.slug],
    ["deskripsi_pendek", safeData.deskripsiPendek],
    ["deskripsi_panjang", safeData.deskripsiPanjang],
    ["icon", safeData.icon],
    ["harga_mulai", safeData.hargaMulai],
    ["aktif", safeData.aktif],
    ["urutan", safeData.urutan],
  ];

  for (const [col, val] of fieldMap) {
    if (val !== undefined) {
      setClauses.push(`${col} = $${paramIndex}`);
      values.push(val === "" ? null : val);
      paramIndex++;
    }
  }

  if (Array.isArray(safeData.fitur)) {
    setClauses.push(`fitur = $${paramIndex}`);
    values.push(JSON.stringify(safeData.fitur));
    paramIndex++;
  }

  if (setClauses.length === 0) {
    throw new Error("No updates provided");
  }

  values.push(parsedId.data);
  const service = await queryPoolerSingle(
    `UPDATE services SET ${setClauses.join(", ")}, updated_at = now() WHERE id = $${paramIndex} RETURNING ${SERVICE_COLUMNS}`,
    values
  );

  if (!service) throw new Error("Service not found");
  updatePublicContent([CACHE_TAGS.services]);
  return service;
}

export async function deleteService(id: string) {
  await requireAdmin();

  const parsed = uuidSchema.safeParse(id);
  if (!parsed.success) {
    throw new Error("Invalid service ID: must be a valid UUID");
  }

  await queryPooler(`DELETE FROM services WHERE id = $1`, [parsed.data]);
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

  await queryPooler(
    `UPDATE services SET aktif = $1, updated_at = now() WHERE id = ANY($2::uuid[])`,
    [parsedUpdates.data.aktif, parsedIds.data]
  );

  updatePublicContent([CACHE_TAGS.services]);
  return { success: true };
}

export async function bulkDeleteServices(ids: string[]) {
  await requireAdmin();

  const parsedIds = uuidArraySchema.safeParse(ids);
  if (!parsedIds.success) {
    throw new Error("Invalid service IDs: " + parsedIds.error.issues[0].message);
  }

  await queryPooler(`DELETE FROM services WHERE id = ANY($1::uuid[])`, [parsedIds.data]);
  updatePublicContent([CACHE_TAGS.services]);
  return { success: true };
}

export async function duplicateService(id: string) {
  await requireAdmin();

  const original = await getService(id);
  const timestamp = Date.now();

  const columns = [
    "nama", "slug", "deskripsi_pendek", "deskripsi_panjang",
    "icon", "harga_mulai", "fitur", "urutan", "aktif",
  ];

  const values: unknown[] = [
    `${original.nama} (Copy)`,
    `${original.slug}-copy-${timestamp}`,
    original.deskripsi_pendek,
    original.deskripsi_panjang,
    original.icon,
    original.harga_mulai,
    Array.isArray(original.fitur) ? JSON.stringify(original.fitur) : null,
    original.urutan + 1,
    false,
  ];

  const placeholders = columns.map((_, i) => `$${i + 1}`);
  await queryPooler(
    `INSERT INTO services (${columns.join(", ")}) VALUES (${placeholders.join(", ")})`,
    values
  );

  updatePublicContent([CACHE_TAGS.services]);
  return { success: true, slug: `${original.slug}-copy-${timestamp}` };
}
