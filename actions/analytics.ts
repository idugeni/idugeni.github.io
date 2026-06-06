"use server";

import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { requireAdmin, withTimeout } from "@/lib/auth/rbac";
import { queryPooler } from "@/lib/db/pooler";

type PageViewRow = { halaman: string; referrer: string | null; created_at: string };

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function startOfWeek(date: Date) {
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(date.getFullYear(), date.getMonth(), diff);
}

function normalizeReferrer(referrer: string | null) {
  if (!referrer) return "Direct";
  try {
    return new URL(referrer).hostname.replace(/^www\./, "");
  } catch {
    return referrer.slice(0, 80);
  }
}

function routeSegment(path: string) {
  if (path === "/") return "Home";
  const first = path.split("?")[0].split("/").filter(Boolean)[0];
  return first ? `/${first}` : "Other";
}

function aggregateCounts<T extends string>(items: T[]) {
  const counts = new Map<T, number>();
  for (const item of items) counts.set(item, (counts.get(item) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1]);
}

export async function trackPageView(data: { halaman: string; referrer?: string | null }) {
  try {
    if (!data.halaman) return { success: true };
    const supabase = createServiceClient();
    await supabase.from("page_views").insert({
      halaman: data.halaman,
      referrer: data.referrer || null,
    });
    return { success: true };
  } catch {
    return { success: false };
  }
}

export async function getAnalyticsSummary() {
  await requireAdmin();

  const supabase = await createClient();
  const now = new Date();
  const today = startOfDay(now).toISOString();
  const week = startOfWeek(now).toISOString();
  const month = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
  const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const [total, monthCount, previousMonth, weekCount, todayCount, topRows] = await withTimeout(
    Promise.all([
      supabase.from("page_views").select("*", { count: "exact", head: true }),
      supabase.from("page_views").select("*", { count: "exact", head: true }).gte("created_at", month),
      supabase.from("page_views").select("*", { count: "exact", head: true }).gte("created_at", previousMonthStart).lt("created_at", previousMonthEnd),
      supabase.from("page_views").select("*", { count: "exact", head: true }).gte("created_at", week),
      supabase.from("page_views").select("*", { count: "exact", head: true }).gte("created_at", today),
      supabase.from("page_views").select("halaman").order("created_at", { ascending: false }).limit(2000),
    ]),
    20000,
    "Analytics summary timeout: Failed to load analytics within 20 seconds"
  );

  const topPage = aggregateCounts((topRows.data ?? []).map((row) => row.halaman))[0];
  const currentMonth = monthCount.count ?? 0;
  const previous = previousMonth.count ?? 0;
  const growth = previous > 0 ? ((currentMonth - previous) / previous) * 100 : currentMonth > 0 ? 100 : 0;

  return {
    totalViews: total.count ?? 0,
    viewsThisMonth: currentMonth,
    viewsPreviousMonth: previous,
    viewsThisWeek: weekCount.count ?? 0,
    viewsToday: todayCount.count ?? 0,
    growthPercent: Number(growth.toFixed(1)),
    avgPerDay: now.getDate() > 0 ? currentMonth / now.getDate() : 0,
    mostVisitedPage: topPage?.[0] ?? "/",
    mostVisitedPageViews: topPage?.[1] ?? 0,
  };
}

export async function getPageViewsChart() {
  await requireAdmin();

  const supabase = await createClient();
  const thirtyDaysAgo = new Date(Date.now() - 29 * 24 * 60 * 60 * 1000);
  const { data, error } = await supabase
    .from("page_views")
    .select("created_at")
    .gte("created_at", thirtyDaysAgo.toISOString())
    .order("created_at");

  if (error) throw error;

  const chartData: Record<string, number> = {};
  for (let i = 0; i < 30; i++) {
    const date = new Date(thirtyDaysAgo.getTime() + i * 24 * 60 * 60 * 1000);
    chartData[date.toISOString().split("T")[0]] = 0;
  }

  data?.forEach((row) => {
    const date = new Date(row.created_at).toISOString().split("T")[0];
    chartData[date] = (chartData[date] || 0) + 1;
  });

  return Object.entries(chartData)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, views]) => ({ date, views }));
}

export async function getTopPages(limit = 10) {
  await requireAdmin();

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("page_views")
    .select("halaman")
    .order("created_at", { ascending: false })
    .limit(3000);
  if (error) throw error;

  const rows = data ?? [];
  const total = rows.length || 1;
  return aggregateCounts(rows.map((row) => row.halaman))
    .slice(0, limit)
    .map(([halaman, views]) => ({ halaman, views, share: Number(((views / total) * 100).toFixed(1)) }));
}

export async function getTopReferrers(limit = 8) {
  await requireAdmin();

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("page_views")
    .select("referrer")
    .order("created_at", { ascending: false })
    .limit(3000);
  if (error) throw error;

  const rows = data ?? [];
  const total = rows.length || 1;
  return aggregateCounts(rows.map((row) => normalizeReferrer(row.referrer)))
    .slice(0, limit)
    .map(([referrer, views]) => ({ referrer, views, share: Number(((views / total) * 100).toFixed(1)) }));
}

export async function getRouteSegments() {
  await requireAdmin();

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("page_views")
    .select("halaman")
    .order("created_at", { ascending: false })
    .limit(3000);
  if (error) throw error;

  const rows = data ?? [];
  const total = rows.length || 1;
  return aggregateCounts(rows.map((row) => routeSegment(row.halaman)))
    .slice(0, 8)
    .map(([segment, views]) => ({ segment, views, share: Number(((views / total) * 100).toFixed(1)) }));
}

export async function getRecentPageViews(limit = 8) {
  await requireAdmin();

  const safeLimit = Math.min(Math.max(limit, 1), 20);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("page_views")
    .select("halaman,referrer,created_at")
    .order("created_at", { ascending: false })
    .limit(safeLimit);
  if (error) throw error;
  return (data ?? []) as PageViewRow[];
}

export interface SecurityAuditSummary {
  auditLogs: {
    id: string;
    shortlink_id: string;
    action: string;
    changed_fields: Record<string, any> | null;
    performed_at: string;
    shortlink_code: string | null;
    shortlink_title: string | null;
    user_email: string | null;
  }[];
  actionCounts: {
    action: string;
    count: number;
  }[];
  dailyAudits: {
    date: string;
    count: number;
  }[];
}

export async function getSecurityAuditSummary(): Promise<SecurityAuditSummary> {
  await requireAdmin();

  // 1. Fetch latest 50 security audit logs joined with shortlink and user info
  const logs = await queryPooler(`
    SELECT a.id, a.shortlink_id, a.action, a.changed_fields, a.performed_at::text as performed_at,
           s.code as shortlink_code, s.title as shortlink_title,
           u.email as user_email
    FROM shortlink_audit a
    LEFT JOIN shortlinks s ON a.shortlink_id = s.id
    LEFT JOIN auth.users u ON a.performed_by = u.id
    ORDER BY a.performed_at DESC LIMIT 50
  `);

  // 2. Aggregate actions count
  const actionCountsRaw = await queryPooler(`
    SELECT action, COUNT(*)::text as count
    FROM shortlink_audit
    GROUP BY action
    ORDER BY count DESC
  `);
  const actionCounts = actionCountsRaw.map(row => ({
    action: row.action as string,
    count: parseInt(row.count) || 0
  }));

  // 3. Aggregate daily audit frequency in last 30 days
  const dailyAuditsRaw = await queryPooler(`
    SELECT DATE(performed_at)::text as date, COUNT(*)::text as count
    FROM shortlink_audit
    WHERE performed_at >= now() - INTERVAL '30 days'
    GROUP BY DATE(performed_at)
    ORDER BY date ASC
  `);

  const dailyAuditsMap = new Map<string, number>();
  // Pre-fill 30 days
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dailyAuditsMap.set(d.toISOString().split("T")[0], 0);
  }

  dailyAuditsRaw.forEach(row => {
    if (dailyAuditsMap.has(row.date)) {
      dailyAuditsMap.set(row.date, parseInt(row.count) || 0);
    }
  });

  const dailyAudits = Array.from(dailyAuditsMap.entries()).map(([date, count]) => ({
    date,
    count
  }));

  return {
    auditLogs: logs || [],
    actionCounts,
    dailyAudits
  };
}

export interface AccessAnomaly {
  ip_address: string;
  click_count: number;
  first_click: string;
  last_click: string;
}

export interface SecurityAnomaliesReport {
  highFrequency5Min: AccessAnomaly[];
  highVolume24Hours: AccessAnomaly[];
}

export async function detectAccessAnomalies(): Promise<SecurityAnomaliesReport> {
  await requireAdmin();

  // 1. IPs with >50 clicks in the last 5 minutes (severe real-time scraping / abuse)
  const realTimeRaw = await queryPooler(`
    SELECT ip_address, COUNT(*)::text as click_count,
           MIN(clicked_at)::text as first_click, MAX(clicked_at)::text as last_click
    FROM shortlink_clicks
    WHERE clicked_at >= now() - INTERVAL '5 minutes'
      AND ip_address IS NOT NULL
    GROUP BY ip_address
    HAVING COUNT(*) > 50
    ORDER BY COUNT(*) DESC
  `);

  // 2. IPs with >300 clicks in the last 24 hours (high volume scraping / crawlers)
  const highVolumeRaw = await queryPooler(`
    SELECT ip_address, COUNT(*)::text as click_count,
           MIN(clicked_at)::text as first_click, MAX(clicked_at)::text as last_click
    FROM shortlink_clicks
    WHERE clicked_at >= now() - INTERVAL '24 hours'
      AND ip_address IS NOT NULL
    GROUP BY ip_address
    HAVING COUNT(*) > 300
    ORDER BY COUNT(*) DESC
  `);

  return {
    highFrequency5Min: (realTimeRaw || []).map(row => ({
      ip_address: row.ip_address,
      click_count: parseInt(row.click_count) || 0,
      first_click: row.first_click,
      last_click: row.last_click
    })),
    highVolume24Hours: (highVolumeRaw || []).map(row => ({
      ip_address: row.ip_address,
      click_count: parseInt(row.click_count) || 0,
      first_click: row.first_click,
      last_click: row.last_click
    }))
  };
}
