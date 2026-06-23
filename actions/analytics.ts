"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/rbac";
import { cookies } from "next/headers";

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

function aggregateByKey(items: Array<{ key: string }>, limit?: number) {
  const counts = new Map<string, number>();
  let total = 0;
  for (const item of items) {
    counts.set(item.key, (counts.get(item.key) || 0) + 1);
    total++;
  }
  return [...counts.entries()]
    .map(([key, views]) => ({
      [key.includes("@") ? "referrer" : key.startsWith("/") ? "halaman" : "segment"]: key,
      views,
      share: total > 0 ? Number(((views / total) * 100).toFixed(1)) : 0,
    }))
    .sort((a: any, b: any) => b.views - a.views)
    .slice(0, limit ?? Infinity);
}

export async function trackPageView(data: { halaman: string; referrer?: string | null }) {
  try {
    if (!data.halaman) return { success: true };
    const supabase = createAdminClient();
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
  await cookies();

  const now = new Date();
  const today = startOfDay(now).toISOString();
  const week = startOfWeek(now).toISOString();
  const month = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
  const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const supabase = createAdminClient();
  const c = (r: { count: number | null }) => r.count || 0;

  const [
    totalViewsResult, viewsThisMonthResult, viewsPrevMonthResult,
    viewsThisWeekResult, viewsTodayResult,
    recentHalaman,
  ] = await Promise.all([
    supabase.from("page_views").select("*", { count: "exact", head: true }),
    supabase.from("page_views").select("*", { count: "exact", head: true }).gte("created_at", month),
    supabase.from("page_views").select("*", { count: "exact", head: true }).gte("created_at", previousMonthStart).lt("created_at", previousMonthEnd),
    supabase.from("page_views").select("*", { count: "exact", head: true }).gte("created_at", week),
    supabase.from("page_views").select("*", { count: "exact", head: true }).gte("created_at", today),
    supabase.from("page_views").select("halaman").order("created_at", { ascending: false }).limit(3000),
  ]);

  const halamanCounts = new Map<string, number>();
  for (const row of recentHalaman.data || []) {
    halamanCounts.set(row.halaman, (halamanCounts.get(row.halaman) || 0) + 1);
  }
  let mostVisitedPage = "/";
  let mostVisitedPageViews = 0;
  for (const [page, count] of halamanCounts) {
    if (count > mostVisitedPageViews) {
      mostVisitedPage = page;
      mostVisitedPageViews = count;
    }
  }

  const currentMonth = c(viewsThisMonthResult);
  const previous = c(viewsPrevMonthResult);
  const growth = previous > 0 ? ((currentMonth - previous) / previous) * 100 : currentMonth > 0 ? 100 : 0;

  return {
    totalViews: c(totalViewsResult),
    viewsThisMonth: currentMonth,
    viewsPreviousMonth: previous,
    viewsThisWeek: c(viewsThisWeekResult),
    viewsToday: c(viewsTodayResult),
    growthPercent: Number(growth.toFixed(1)),
    avgPerDay: now.getDate() > 0 ? currentMonth / now.getDate() : 0,
    mostVisitedPage,
    mostVisitedPageViews,
  };
}

export async function getPageViewsChart() {
  await requireAdmin();
  const supabase = createAdminClient();

  const thirtyDaysAgo = new Date(Date.now() - 29 * 24 * 60 * 60 * 1000);
  const { data: rows } = await supabase
    .from("page_views")
    .select("created_at")
    .gte("created_at", thirtyDaysAgo.toISOString());

  const chartData: Record<string, number> = {};
  for (let i = 0; i < 30; i++) {
    const date = new Date(thirtyDaysAgo.getTime() + i * 24 * 60 * 60 * 1000);
    chartData[date.toISOString().split("T")[0]] = 0;
  }

  for (const row of rows || []) {
    const d = typeof row.created_at === "string" ? row.created_at.split("T")[0] : String(row.created_at).split("T")[0];
    chartData[d] = (chartData[d] || 0) + 1;
  }

  return Object.entries(chartData)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, views]) => ({ date, views }));
}

export async function getTopPages(limit = 10) {
  await requireAdmin();
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("page_views")
    .select("halaman")
    .order("created_at", { ascending: false })
    .limit(3000);

  const total = data?.length || 0;
  const counts = new Map<string, number>();
  for (const row of data || []) {
    counts.set(row.halaman, (counts.get(row.halaman) || 0) + 1);
  }

  return [...counts.entries()]
    .map(([halaman, views]) => ({
      halaman,
      views,
      share: total > 0 ? Number(((views / total) * 100).toFixed(1)) : 0,
    }))
    .sort((a, b) => b.views - a.views)
    .slice(0, limit);
}

export async function getTopReferrers(limit = 8) {
  await requireAdmin();
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("page_views")
    .select("referrer")
    .order("created_at", { ascending: false })
    .limit(3000);

  const total = data?.length || 0;
  const normalizedReferrers = (data || []).map(row => normalizeReferrer(row.referrer));
  const counts = new Map<string, number>();
  for (const ref of normalizedReferrers) {
    counts.set(ref, (counts.get(ref) || 0) + 1);
  }

  return [...counts.entries()]
    .map(([referrer, views]) => ({
      referrer,
      views,
      share: total > 0 ? Number(((views / total) * 100).toFixed(1)) : 0,
    }))
    .sort((a, b) => b.views - a.views)
    .slice(0, limit);
}

export async function getRouteSegments() {
  await requireAdmin();
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("page_views")
    .select("halaman")
    .order("created_at", { ascending: false })
    .limit(3000);

  const total = data?.length || 0;
  const segments = (data || []).map(row => routeSegment(row.halaman));
  const counts = new Map<string, number>();
  for (const seg of segments) {
    counts.set(seg, (counts.get(seg) || 0) + 1);
  }

  return [...counts.entries()]
    .map(([segment, views]) => ({
      segment,
      views,
      share: total > 0 ? Number(((views / total) * 100).toFixed(1)) : 0,
    }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 8);
}

export async function getRecentPageViews(limit = 8) {
  await requireAdmin();
  const supabase = createAdminClient();

  const safeLimit = Math.min(Math.max(limit, 1), 20);
  const { data, error } = await supabase
    .from("page_views")
    .select("halaman, referrer, created_at")
    .order("created_at", { ascending: false })
    .limit(safeLimit);
  if (error) throw error;
  return data || [];
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
  const supabase = createAdminClient();

  const { data: logs } = await supabase
    .from("shortlink_audit")
    .select("id, shortlink_id, action, changed_fields, performed_at, performed_by")
    .order("performed_at", { ascending: false })
    .limit(50);

  const shortlinkIds = [...new Set((logs || []).map((l: any) => l.shortlink_id).filter(Boolean))];
  const shortlinkMap = new Map<string, { code: string; title: string }>();
  if (shortlinkIds.length > 0) {
    const { data: shortlinks } = await supabase
      .from("shortlinks")
      .select("id, code, title")
      .in("id", shortlinkIds);
    for (const s of shortlinks || []) {
      shortlinkMap.set(s.id, { code: s.code, title: s.title });
    }
  }

  const userIds = [...new Set((logs || []).map((l: any) => l.performed_by).filter(Boolean))];
  const userMap = new Map<string, string>();
  try {
    if (userIds.length > 0) {
      const { data: authUsers } = await supabase.auth.admin.listUsers({ perPage: 1000 });
      for (const u of authUsers?.users || []) {
        if (userIds.includes(u.id) && u.email) {
          userMap.set(u.id, u.email);
        }
      }
    }
  } catch {}

  const auditLogs = (logs || []).map((log: any) => ({
    id: log.id,
    shortlink_id: log.shortlink_id,
    action: log.action,
    changed_fields: log.changed_fields,
    performed_at: typeof log.performed_at === "string" ? log.performed_at : String(log.performed_at),
    shortlink_code: shortlinkMap.get(log.shortlink_id)?.code ?? null,
    shortlink_title: shortlinkMap.get(log.shortlink_id)?.title ?? null,
    user_email: userMap.get(log.performed_by) ?? null,
  }));

  const { data: allAuditLogs } = await supabase
    .from("shortlink_audit")
    .select("action")
    .order("performed_at", { ascending: false })
    .limit(10000);

  const actionCountMap = new Map<string, number>();
  for (const log of allAuditLogs || []) {
    actionCountMap.set(log.action, (actionCountMap.get(log.action) || 0) + 1);
  }
  const actionCounts = [...actionCountMap.entries()]
    .map(([action, count]) => ({ action, count }))
    .sort((a, b) => b.count - a.count);

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const { data: recentAuditLogs } = await supabase
    .from("shortlink_audit")
    .select("performed_at")
    .gte("performed_at", thirtyDaysAgo);

  const dailyAuditsMap = new Map<string, number>();
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dailyAuditsMap.set(d.toISOString().split("T")[0], 0);
  }
  for (const log of recentAuditLogs || []) {
    const dateStr = typeof log.performed_at === "string" ? log.performed_at.split("T")[0] : String(log.performed_at).split("T")[0];
    if (dailyAuditsMap.has(dateStr)) {
      dailyAuditsMap.set(dateStr, (dailyAuditsMap.get(dateStr) || 0) + 1);
    }
  }
  const dailyAudits = Array.from(dailyAuditsMap.entries()).map(([date, count]) => ({ date, count }));

  return { auditLogs, actionCounts, dailyAudits };
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
  const supabase = createAdminClient();

  const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const [recentClicksResult, dayClicksResult] = await Promise.all([
    supabase
      .from("shortlink_clicks")
      .select("ip_address, clicked_at")
      .gte("clicked_at", fiveMinAgo)
      .not("ip_address", "is", null),
    supabase
      .from("shortlink_clicks")
      .select("ip_address, clicked_at")
      .gte("clicked_at", dayAgo)
      .not("ip_address", "is", null),
  ]);

  function aggregateAnomalies(
    clicks: Array<{ ip_address: string; clicked_at: string }> | null,
    threshold: number,
  ): AccessAnomaly[] {
    const ipStats = new Map<string, { count: number; first: string; last: string }>();
    for (const click of clicks || []) {
      const existing = ipStats.get(click.ip_address);
      if (existing) {
        existing.count++;
        if (click.clicked_at < existing.first) existing.first = click.clicked_at;
        if (click.clicked_at > existing.last) existing.last = click.clicked_at;
      } else {
        ipStats.set(click.ip_address, { count: 1, first: click.clicked_at, last: click.clicked_at });
      }
    }
    return [...ipStats.entries()]
      .filter(([, stats]) => stats.count > threshold)
      .sort((a, b) => b[1].count - a[1].count)
      .map(([ip, stats]) => ({
        ip_address: ip,
        click_count: stats.count,
        first_click: stats.first,
        last_click: stats.last,
      }));
  }

  return {
    highFrequency5Min: aggregateAnomalies(recentClicksResult.data as any, 50),
    highVolume24Hours: aggregateAnomalies(dayClicksResult.data as any, 300),
  };
}
