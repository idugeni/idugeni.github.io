import "server-only";

import { z } from "zod";
import { requireAdmin } from "@/lib/auth/rbac";
import { createAdminClient } from "@/lib/supabase/admin";

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

  const sortColumn = getNewsletterSortColumn(filters.sort);
  const ascending = filters.order === "asc";
  const offset = (filters.page - 1) * filters.pageSize;

  const supabase = createAdminClient();

  let baseQuery = supabase
    .from("newsletter_subscribers")
    .select("*", { count: "exact" });

  if (filters.q) {
    const pattern = `%${filters.q.replace(/[%_]/g, "\\$&")}%`;
    baseQuery = baseQuery.or(`email.ilike.${pattern},nama.ilike.${pattern}`);
  }
  if (filters.status === "active") {
    baseQuery = baseQuery.eq("aktif", true);
  }
  if (filters.status === "inactive") {
    baseQuery = baseQuery.eq("aktif", false);
  }

  const { data, count } = await baseQuery
    .order(sortColumn, { ascending })
    .range(offset, offset + filters.pageSize - 1);

  const totalItems = count ?? 0;
  return {
    subscribers: (data ?? []).map(serializeSubscriber as (row: Record<string, unknown>) => ReturnType<typeof serializeSubscriber>),
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

  const supabase = createAdminClient();

  const [totalResult, activeResult, inactiveResult, confirmedResult, unconfirmedResult] = await Promise.all([
    supabase.from("newsletter_subscribers").select("*", { count: "exact", head: true }),
    supabase.from("newsletter_subscribers").select("*", { count: "exact", head: true }).eq("aktif", true),
    supabase.from("newsletter_subscribers").select("*", { count: "exact", head: true }).eq("aktif", false),
    supabase.from("newsletter_subscribers").select("*", { count: "exact", head: true }).eq("confirmed", true),
    supabase.from("newsletter_subscribers").select("*", { count: "exact", head: true }).eq("confirmed", false),
  ]);

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { count: recentCount } = await supabase
    .from("newsletter_subscribers")
    .select("*", { count: "exact", head: true })
    .gte("subscribed_at", sevenDaysAgo);

  const total = totalResult.count ?? 0;
  const confirmed = confirmedResult.count ?? 0;
  const confirmationRate = total > 0 ? Math.round((confirmed / total) * 10000) / 100 : 0;

  return {
    total,
    active: activeResult.count ?? 0,
    inactive: inactiveResult.count ?? 0,
    recent: recentCount ?? 0,
    confirmed,
    unconfirmed: unconfirmedResult.count ?? 0,
    confirmationRate,
  };
}
