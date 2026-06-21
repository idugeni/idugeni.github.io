import "server-only";

import { z } from "zod";
import { requireAdmin } from "@/lib/auth/rbac";
import { queryPooler } from "@/lib/db/pooler";

const adminNewsletterFilterSchema = z.object({
  q: z.string().trim().max(100).optional(),
  status: z.enum(["active", "inactive"]).optional(),
  sort: z.enum(["date", "email", "name", "status"]).optional().default("date"),
  order: z.enum(["asc", "desc"]).optional().default("desc"),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(5).max(50).optional().default(10),
});

type NewsletterRow = {
  id: string;
  email: string;
  nama: string | null;
  aktif: boolean;
  token_unsubscribe: string;
  subscribed_at: Date | string;
  unsubscribed_at: Date | string | null;
  confirmation_token: string | null;
  confirmed: boolean;
  confirmed_at: Date | string | null;
};

function getNewsletterSortColumn(sort: z.infer<typeof adminNewsletterFilterSchema>["sort"]) {
  if (sort === "email") return "email";
  if (sort === "name") return "nama";
  if (sort === "status") return "aktif";
  return "subscribed_at";
}

function serializeSubscriber(row: NewsletterRow) {
  return {
    ...row,
    subscribed_at: row.subscribed_at instanceof Date ? row.subscribed_at.toISOString() : row.subscribed_at,
    unsubscribed_at: row.unsubscribed_at instanceof Date ? row.unsubscribed_at.toISOString() : row.unsubscribed_at,
    confirmed_at: row.confirmed_at instanceof Date ? row.confirmed_at.toISOString() : row.confirmed_at,
  };
}

export async function getAdminNewsletterSubscribersReadModel(rawFilters: unknown) {
  await requireAdmin();

  const filters = adminNewsletterFilterSchema.parse(rawFilters ?? {});
  const conditions: string[] = [];
  const params: unknown[] = [];
  let idx = 1;

  if (filters.q) {
    const escaped = filters.q.replace(/[%_]/g, "\\$&");
    conditions.push(`(email ILIKE '%' || $${idx} || '%' ESCAPE '\\' OR nama ILIKE '%' || $${idx} || '%' ESCAPE '\\')`);
    params.push(escaped);
    idx++;
  }
  if (filters.status === "active") {
    conditions.push(`aktif = $${idx}`);
    params.push(true);
    idx++;
  }
  if (filters.status === "inactive") {
    conditions.push(`aktif = $${idx}`);
    params.push(false);
    idx++;
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const sortCol = getNewsletterSortColumn(filters.sort);
  const sortDir = filters.order === "asc" ? "ASC" : "DESC";
  const offset = (filters.page - 1) * filters.pageSize;

  const [countResult, rows] = await Promise.all([
    queryPooler<{ count: number }>(`SELECT COUNT(*)::int AS count FROM newsletter_subscribers ${where}`, params),
    queryPooler<NewsletterRow>(`SELECT * FROM newsletter_subscribers ${where} ORDER BY ${sortCol} ${sortDir} LIMIT $${idx} OFFSET $${idx + 1}`, [
      ...params,
      filters.pageSize,
      offset,
    ]),
  ]);

  const totalItems = countResult[0]?.count ?? 0;
  return {
    subscribers: rows.map(serializeSubscriber),
    filters,
    pagination: {
      page: filters.page,
      pageSize: filters.pageSize,
      totalItems,
      totalPages: Math.max(1, Math.ceil(totalItems / filters.pageSize)),
    },
  };
}

export async function getNewsletterStatsReadModel() {
  await requireAdmin();

  const [row] = await queryPooler<{
    total: number;
    active: number;
    inactive: number;
    recent: number;
    confirmed: number;
    unconfirmed: number;
    confirmation_rate: number;
  }>(`
    SELECT
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE aktif = true)::int AS active,
      COUNT(*) FILTER (WHERE aktif = false)::int AS inactive,
      COUNT(*) FILTER (WHERE subscribed_at >= NOW() - INTERVAL '7 days')::int AS recent,
      COUNT(*) FILTER (WHERE confirmed = true)::int AS confirmed,
      COUNT(*) FILTER (WHERE confirmed = false)::int AS unconfirmed,
      CASE
        WHEN COUNT(*) = 0 THEN 0
        ELSE ROUND((COUNT(*) FILTER (WHERE confirmed = true)::numeric / COUNT(*)::numeric) * 100, 2)
      END AS confirmation_rate
    FROM newsletter_subscribers
  `);

  return {
    total: row?.total ?? 0,
    active: row?.active ?? 0,
    inactive: row?.inactive ?? 0,
    recent: row?.recent ?? 0,
    confirmed: row?.confirmed ?? 0,
    unconfirmed: row?.unconfirmed ?? 0,
    confirmationRate: Number(row?.confirmation_rate) || 0,
  };
}
