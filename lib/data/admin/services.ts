import "server-only";

import { z } from "zod";
import { requireAdmin } from "@/lib/auth/rbac";
import { createAdminClient } from "@/lib/supabase/admin";
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
  const ascending = (parsed.data.order ?? "asc") === "asc";

  const offset = (page - 1) * ADMIN_SERVICE_PAGE_SIZE;

  const supabase = createAdminClient();

  let baseQuery = supabase
    .from("services")
    .select("id,nama,slug,deskripsi_pendek,deskripsi_panjang,icon,harga_mulai,fitur,urutan,aktif,created_at,updated_at", { count: "exact" });

  if (parsed.data.q) {
    const pattern = `%${parsed.data.q.replace(/[%_]/g, "\\$&")}%`;
    baseQuery = baseQuery.or(`nama.ilike.${pattern},deskripsi_pendek.ilike.${pattern}`);
  }
  if (parsed.data.status === "active") {
    baseQuery = baseQuery.eq("aktif", true);
  }
  if (parsed.data.status === "inactive") {
    baseQuery = baseQuery.eq("aktif", false);
  }

  const { data, count } = await baseQuery
    .order(sortColumn, { ascending })
    .range(offset, offset + ADMIN_SERVICE_PAGE_SIZE - 1);

  const totalItems = count ?? 0;
  return {
    services: (data ?? []).map(serializeService as (row: Record<string, unknown>) => ReturnType<typeof serializeService>),
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

  const supabase = createAdminClient();

  const [totalResult, activeResult, inactiveResult, pricedResult] = await Promise.all([
    supabase.from("services").select("*", { count: "exact", head: true }),
    supabase.from("services").select("*", { count: "exact", head: true }).eq("aktif", true),
    supabase.from("services").select("*", { count: "exact", head: true }).eq("aktif", false),
    supabase.from("services").select("*", { count: "exact", head: true }).not("harga_mulai", "is", null).neq("harga_mulai", ""),
  ]);

  const total = totalResult.count ?? 0;
  const active = activeResult.count ?? 0;
  const inactive = inactiveResult.count ?? 0;
  const priced = pricedResult.count ?? 0;

  return { total, active, inactive, priced };
}

export async function getServiceBySlugReadModel(slug: string) {
  await requireAdmin();

  const parsed = slugSchema.safeParse(slug);
  if (!parsed.success) {
    throw new Error("Invalid service slug");
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("services")
    .select("id,nama,slug,deskripsi_pendek,deskripsi_panjang,icon,harga_mulai,fitur,urutan,aktif,created_at,updated_at")
    .eq("slug", parsed.data)
    .maybeSingle();

  if (error || !data) throw new Error("Service not found");
  return serializeService(data);
}
