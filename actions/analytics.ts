"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin, withTimeout } from "@/lib/auth/rbac";
import { queryPooler } from "@/lib/db/pooler";
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
  await cookies(); // Explicitly register dynamic request context before accessing current time

  const now = new Date();
  const today = startOfDay(now).toISOString();
  const week = startOfWeek(now).toISOString();
  const month = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
  const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  // Run all counts and aggregations in a single highly-optimized query using connection pooler
  const results = await withTimeout(
    queryPooler(`
      SELECT
        (SELECT COUNT(*)::integer FROM page_views) as total_views,
        (SELECT COUNT(*)::integer FROM page_views WHERE created_at >= $1) as views_this_month,
        (SELECT COUNT(*)::integer FROM page_views WHERE created_at >= $2 AND created_at < $3) as views_prev_month,
        (SELECT COUNT(*)::integer FROM page_views WHERE created_at >= $4) as views_this_week,
        (SELECT COUNT(*)::integer FROM page_views WHERE created_at >= $5) as views_today,
        (SELECT halaman FROM page_views GROUP BY halaman ORDER BY COUNT(*) DESC LIMIT 1) as most_visited_page,
        (SELECT COUNT(*)::integer FROM page_views WHERE halaman = (SELECT halaman FROM page_views GROUP BY halaman ORDER BY COUNT(*) DESC LIMIT 1)) as most_visited_page_views
    `, [
      month,
      previousMonthStart,
      previousMonthEnd,
      week,
      today
    ]),
    6000,
    "Analytics summary timeout: Failed to load analytics within 6 seconds"
  );

  const summary = results[0] || {
    total_views: 0,
    views_this_month: 0,
    views_prev_month: 0,
    views_this_week: 0,
    views_today: 0,
    most_visited_page: "/",
    most_visited_page_views: 0
  };

  const currentMonth = summary.views_this_month;
  const previous = summary.views_prev_month;
  const growth = previous > 0 ? ((currentMonth - previous) / previous) * 100 : currentMonth > 0 ? 100 : 0;

  return {
    totalViews: summary.total_views,
    viewsThisMonth: currentMonth,
    viewsPreviousMonth: previous,
    viewsThisWeek: summary.views_this_week,
    viewsToday: summary.views_today,
    growthPercent: Number(growth.toFixed(1)),
    avgPerDay: now.getDate() > 0 ? currentMonth / now.getDate() : 0,
    mostVisitedPage: summary.most_visited_page ?? "/",
    mostVisitedPageViews: summary.most_visited_page_views ?? 0,
  };
}

export async function getPageViewsChart() {
  await requireAdmin();

  const thirtyDaysAgo = new Date(Date.now() - 29 * 24 * 60 * 60 * 1000);
  const rows = await queryPooler<{ date: string; count: number }>(`
    SELECT DATE(created_at) AS date, COUNT(*)::int AS count
    FROM page_views
    WHERE created_at >= $1
    GROUP BY DATE(created_at)
    ORDER BY date
  `, [thirtyDaysAgo.toISOString()]);

  const chartData: Record<string, number> = {};
  for (let i = 0; i < 30; i++) {
    const date = new Date(thirtyDaysAgo.getTime() + i * 24 * 60 * 60 * 1000);
    chartData[date.toISOString().split("T")[0]] = 0;
  }

  for (const row of rows) {
    const d = typeof row.date === "string" ? row.date.split("T")[0] : String(row.date).split("T")[0];
    chartData[d] = (chartData[d] || 0) + row.count;
  }

  return Object.entries(chartData)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, views]) => ({ date, views }));
}

export async function getTopPages(limit = 10) {
  await requireAdmin();

  // Run aggregated count in database using connection pooler for speed
  const rows = await withTimeout(
    queryPooler(`
      WITH recent_views AS (
        SELECT halaman
        FROM page_views
        ORDER BY created_at DESC
        LIMIT 3000
      ),
      aggregated_views AS (
        SELECT halaman, COUNT(*)::integer as views
        FROM recent_views
        GROUP BY halaman
      ),
      total_count AS (
        SELECT COUNT(*)::integer as total FROM recent_views
      )
      SELECT 
        halaman, 
        views,
        ROUND((views::numeric / NULLIF(total, 0) * 100), 1)::float as share
      FROM aggregated_views, total_count
      ORDER BY views DESC
      LIMIT $1
    `, [limit]),
    6000,
    "Top pages query timeout: Failed to load top pages"
  );

  return rows;
}

export async function getTopReferrers(limit = 8) {
  await requireAdmin();

  // Normalize referrer in SQL: if empty or null -> Direct, else extract host
  const rows = await withTimeout(
    queryPooler(`
      WITH recent_views AS (
        SELECT referrer
        FROM page_views
        ORDER BY created_at DESC
        LIMIT 3000
      ),
      normalized_views AS (
        SELECT 
          CASE 
            WHEN referrer IS NULL OR referrer = '' THEN 'Direct'
            ELSE 
              substring(regexp_replace(referrer, '^https?://(www\\.)?', '') from '^([^/]+)')
          END as normalized_referrer
        FROM recent_views
      ),
      aggregated_referrers AS (
        SELECT normalized_referrer as referrer, COUNT(*)::integer as views
        FROM normalized_views
        GROUP BY normalized_referrer
      ),
      total_count AS (
        SELECT COUNT(*)::integer as total FROM recent_views
      )
      SELECT 
        referrer, 
        views,
        ROUND((views::numeric / NULLIF(total, 0) * 100), 1)::float as share
      FROM aggregated_referrers, total_count
      ORDER BY views DESC
      LIMIT $1
    `, [limit]),
    6000,
    "Top referrers query timeout: Failed to load top referrers"
  );

  return rows;
}

export async function getRouteSegments() {
  await requireAdmin();

  // Extract first route segment in SQL
  const rows = await withTimeout(
    queryPooler(`
      WITH recent_views AS (
        SELECT halaman
        FROM page_views
        ORDER BY created_at DESC
        LIMIT 3000
      ),
      normalized_segments AS (
        SELECT 
          CASE 
            WHEN halaman = '/' THEN 'Home'
            ELSE 
              -- Extract first segment
              concat('/', split_part(ltrim(split_part(halaman, '?', 1), '/'), '/', 1))
          END as segment
        FROM recent_views
      ),
      aggregated_segments AS (
        SELECT segment, COUNT(*)::integer as views
        FROM normalized_segments
        GROUP BY segment
      ),
      total_count AS (
        SELECT COUNT(*)::integer as total FROM recent_views
      )
      SELECT 
        segment, 
        views,
        ROUND((views::numeric / NULLIF(total, 0) * 100), 1)::float as share
      FROM aggregated_segments, total_count
      ORDER BY views DESC
      LIMIT 8
    `),
    6000,
    "Route segments query timeout: Failed to load route segments"
  );

  return rows;
}

export async function getRecentPageViews(limit = 8) {
  await requireAdmin();

  const safeLimit = Math.min(Math.max(limit, 1), 20);
  return await queryPooler<PageViewRow>(
    `SELECT halaman, referrer, created_at FROM page_views ORDER BY created_at DESC LIMIT $1`,
    [safeLimit]
  );
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
