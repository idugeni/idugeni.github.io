import "server-only";

import { z } from "zod";
import { requireAdmin } from "@/lib/auth/rbac";
import { queryPooler, queryPoolerSingle } from "@/lib/db/pooler";
import { slugSchema } from "@/lib/security/server-action";
import { getTotalPages, parsePositiveInt } from "@/lib/utils/pagination";

const adminServiceFiltersSchema = z.object({
  page: z.unknown().optional(),
  q: z.string().max(100).optional(),
  status: z.enum(["active", "inactive"]).optional(),
  sort: z.enum(["date", "name", "order", "status"]).optional(),
  order: z.enum(["asc", "desc"]).optional(),
});

const ADMIN_SERVICE_PAGE_SIZE = 20;
const SERVICE_COLUMNS = "id,nama,slug,deskripsi_pendek,deskripsi_panjang,icon,harga_mulai,fitur,urutan,aktif,created_at,updated_at";

type AdminServiceRow = {
  id: string;
  nama: string;
  slug: string;
  deskripsi_pendek: string;
  deskripsi_panjang: string | null;
  icon: string | null;
  harga_mulai: string | null;
  fitur: string[] | null;
  urutan: number;
  aktif: boolean;
  created_at: Date | string;
  updated_at: Date | string;
};

function serializeService(service: AdminServiceRow) {
  return {
    ...service,
    urutan: Number(service.urutan ?? 0),
    aktif: Boolean(service.aktif),
    created_at: service.created_at instanceof Date ? service.created_at.toISOString() : service.created_at,
    updated_at: service.updated_at instanceof Date ? service.updated_at.toISOString() : service.updated_at,
  };
}

export async function getAdminServicesReadModel(filters: Record<string, unknown> = {}) {
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
    const escaped = parsed.data.q.replace(/[%_]/g, "\\$&");
    conditions.push(`(nama ILIKE '%' || $${idx} || '%' ESCAPE '\\' OR deskripsi_pendek ILIKE '%' || $${idx} || '%' ESCAPE '\\')`);
    params.push(escaped);
    idx++;
  }
  if (parsed.data.status === "active") {
    conditions.push(`aktif = $${idx}`);
    params.push(true);
    idx++;
  }
  if (parsed.data.status === "inactive") {
    conditions.push(`aktif = $${idx}`);
    params.push(false);
    idx++;
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const offset = (page - 1) * ADMIN_SERVICE_PAGE_SIZE;

  const [countResult, services] = await Promise.all([
    queryPooler<{ count: number }>(`SELECT COUNT(*)::int AS count FROM services ${where}`, params),
    queryPooler<AdminServiceRow>(`SELECT ${SERVICE_COLUMNS} FROM services ${where} ORDER BY ${sortColumn} ${sortDir} LIMIT $${idx} OFFSET $${idx + 1}`, [
      ...params,
      ADMIN_SERVICE_PAGE_SIZE,
      offset,
    ]),
  ]);

  const totalItems = countResult[0]?.count ?? 0;
  return {
    services: services.map(serializeService),
    filters: parsed.data,
    pagination: {
      page,
      pageSize: ADMIN_SERVICE_PAGE_SIZE,
      totalItems,
      totalPages: getTotalPages(totalItems, ADMIN_SERVICE_PAGE_SIZE),
    },
  };
}

export async function getServiceStatsReadModel() {
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
    total: row?.total ?? 0,
    active: row?.active ?? 0,
    inactive: row?.inactive ?? 0,
    priced: row?.priced ?? 0,
  };
}

export async function getServiceBySlugReadModel(slug: string) {
  await requireAdmin();

  const parsed = slugSchema.safeParse(slug);
  if (!parsed.success) {
    throw new Error("Invalid service slug");
  }

  const service = await queryPoolerSingle<AdminServiceRow>(
    `SELECT ${SERVICE_COLUMNS} FROM services WHERE slug = $1`,
    [parsed.data],
  );
  if (!service) throw new Error("Service not found");
  return serializeService(service);
}
