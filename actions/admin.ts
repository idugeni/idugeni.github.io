"use server";

import { createClient } from "@/lib/supabase/server";
import { getBlogStats } from "./blog";
import { getProjectStats } from "./projects";
import { getAnalyticsSummary, getTopPages } from "./analytics";
import { z } from "zod";
import { requireAdmin, withTimeout } from "@/lib/auth/rbac";
import { rateLimit } from "@/lib/rate-limit";
import { queryPooler } from "@/lib/db/pooler";

const adminLoginSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(6).max(100),
});

const uuidSchema = z.string().uuid();

export async function adminLogin(data: { email: string; password: string }) {
  const parsed = adminLoginSchema.safeParse(data);
  if (!parsed.success) throw new Error("Invalid login credentials: " + parsed.error.issues[0].message);

  await rateLimit(parsed.data.email, "login", { max: 5, window: 15 * 60 * 1000 });

  const supabase = await createClient();
  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });
  if (error) throw error;
  return { token: authData.session?.access_token, user: authData.user };
}

export async function adminLogout() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
  return { success: true };
}

export async function getAdminUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}

export async function getDashboardStats() {
  await requireAdmin();

  const supabase = await createClient();

  const [blogStats, projectStats, messages, subscribers] = await withTimeout(
    Promise.all([
      getBlogStats(),
      getProjectStats(),
      supabase.from("contact_messages").select("dibaca"),
      supabase.from("newsletter_subscribers").select("*", { count: "exact", head: true }).eq("aktif", true),
    ]),
    4000,
    "Dashboard stats timeout: Failed to load stats within 4 seconds"
  );

  const messagesCount = messages.data?.length ?? 0;
  const unreadMessages = messages.data?.filter((m) => !m.dibaca).length ?? 0;

  return {
    blog: blogStats,
    projects: projectStats,
    messages: { total: messagesCount, unread: unreadMessages },
    subscribers: subscribers.count ?? 0,
  };
}

export async function getAdminDashboardOverview() {
  await requireAdmin();

  const results = await withTimeout(
    queryPooler<{
      blog_total: number;
      blog_published: number;
      blog_draft: number;
      project_total: number;
      project_completed: number;
      project_ongoing: number;
      msg_total: number;
      msg_unread: number;
      sub_active: number;
      total_views: number;
      views_today: number;
      views_this_week: number;
      views_this_month: number;
      views_prev_month: number;
      most_visited_page: string;
      most_visited_page_views: number;
      recent_messages: string;
      recent_articles: string;
      recent_projects: string;
      newsletter_total: number;
      newsletter_active: number;
      testimonial_total: number;
      testimonial_visible: number;
      testimonial_featured: number;
      testimonial_avg_rating: number;
      service_total: number;
      service_active: number;
      gallery_total: number;
    }>(`
      WITH 
      blog_stats AS (
        SELECT COUNT(*)::int AS total, COUNT(*) FILTER (WHERE status='published')::int AS published, COUNT(*) FILTER (WHERE status='draft')::int AS draft FROM blog_artikel
      ),
      project_stats AS (
        SELECT COUNT(*)::int AS total, COUNT(*) FILTER (WHERE status='completed')::int AS completed, COUNT(*) FILTER (WHERE status='ongoing')::int AS ongoing FROM projects
      ),
      msg_stats AS (
        SELECT COUNT(*)::int AS total, COUNT(*) FILTER (WHERE dibaca=false)::int AS unread FROM contact_messages
      ),
      sub_stats AS (
        SELECT COUNT(*)::int AS active FROM newsletter_subscribers WHERE aktif=true
      ),
      analytics AS (
        SELECT
          (SELECT COUNT(*)::int FROM page_views) AS total_views,
          (SELECT COUNT(*)::int FROM page_views WHERE created_at >= CURRENT_DATE) AS views_today,
          (SELECT COUNT(*)::int FROM page_views WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') AS views_this_week,
          (SELECT COUNT(*)::int FROM page_views WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)) AS views_this_month,
          (SELECT COUNT(*)::int FROM page_views WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month' AND created_at < DATE_TRUNC('month', CURRENT_DATE)) AS views_prev_month
      ),
      top_page AS (
        SELECT COALESCE(halaman, '/') AS page, COUNT(*)::int AS views
        FROM page_views GROUP BY halaman ORDER BY COUNT(*) DESC LIMIT 1
      ),
      recent_msg AS (
        SELECT json_agg(json_build_object('id',id,'nama',nama,'subjek',subjek,'dibaca',dibaca,'created_at',created_at) ORDER BY created_at DESC) AS items FROM (SELECT id,nama,subjek,dibaca,created_at FROM contact_messages ORDER BY created_at DESC LIMIT 5) sub
      ),
      recent_art AS (
        SELECT json_agg(json_build_object('id',id,'judul',judul,'slug',slug,'status',status,'jumlah_view',jumlah_view,'created_at',created_at) ORDER BY created_at DESC) AS items FROM (SELECT id,judul,slug,status,jumlah_view,created_at FROM blog_artikel ORDER BY created_at DESC LIMIT 5) sub
      ),
      recent_proj AS (
        SELECT json_agg(json_build_object('id',id,'nama',nama,'slug',slug,'status',status,'created_at',created_at) ORDER BY created_at DESC) AS items FROM (SELECT id,nama,slug,status,created_at FROM projects ORDER BY created_at DESC LIMIT 5) sub
      ),
      nl_stats AS (
        SELECT COUNT(*)::int AS total, COUNT(*) FILTER (WHERE aktif=true)::int AS active FROM newsletter_subscribers
      ),
      test_stats AS (
        SELECT COUNT(*)::int AS total, COUNT(*) FILTER (WHERE tampil=true)::int AS visible, COUNT(*) FILTER (WHERE featured=true)::int AS featured, COALESCE(ROUND(AVG(rating)::numeric,1),0)::float AS avg_rating FROM testimonials
      ),
      svc_stats AS (
        SELECT COUNT(*)::int AS total, COUNT(*) FILTER (WHERE aktif=true)::int AS active FROM services
      ),
      gal_stats AS (
        SELECT COUNT(*)::int AS total FROM gallery
      )
      SELECT
        b.blog_total, b.blog_published, b.blog_draft,
        p.project_total, p.project_completed, p.project_ongoing,
        m.msg_total, m.msg_unread,
        s.sub_active,
        a.total_views, a.views_today, a.views_this_week, a.views_this_month, a.views_prev_month,
        tp.page AS most_visited_page, tp.views AS most_visited_page_views,
        rm.items AS recent_messages,
        ra.items AS recent_articles,
        rp.items AS recent_projects,
        nl.total AS newsletter_total, nl.active AS newsletter_active,
        t.testimonial_total, t.testimonial_visible, t.testimonial_featured, t.avg_rating AS testimonial_avg_rating,
        sv.service_total, sv.service_active,
        g.gallery_total
      FROM blog_stats b, project_stats p, msg_stats m, sub_stats s, analytics a, top_page tp,
           recent_msg rm, recent_art ra, recent_proj rp,
           nl_stats nl, test_stats t, svc_stats sv, gal_stats g
    `),
    8000,
    "Dashboard queries timeout"
  );

  const r = results[0] || ({} as any);

  const topPagesQuery = await withTimeout(
    queryPooler<{ halaman: string; views: number; share: number }>(`
      WITH recent AS (SELECT halaman FROM page_views ORDER BY created_at DESC LIMIT 3000),
           agg AS (SELECT halaman, COUNT(*)::int AS views FROM recent GROUP BY halaman),
           total AS (SELECT COUNT(*)::int AS t FROM recent)
      SELECT halaman, views, ROUND((views::numeric / NULLIF(t,0) * 100),1)::float AS share
      FROM agg, total ORDER BY views DESC LIMIT 5
    `),
    4000,
    "Top pages timeout"
  );

  const recentMessages = typeof r.recent_messages === "string" ? JSON.parse(r.recent_messages) : (r.recent_messages ?? []);
  const recentArticles = typeof r.recent_articles === "string" ? JSON.parse(r.recent_articles) : (r.recent_articles ?? []);
  const recentProjects = typeof r.recent_projects === "string" ? JSON.parse(r.recent_projects) : (r.recent_projects ?? []);

  const currentMonth = r.views_this_month ?? 0;
  const previousMonth = r.views_prev_month ?? 0;
  const growthPercent = previousMonth > 0 ? Number((((currentMonth - previousMonth) / previousMonth) * 100).toFixed(1)) : currentMonth > 0 ? 100 : 0;
  const avgPerDay = new Date().getDate() > 0 ? currentMonth / new Date().getDate() : 0;

  return {
    stats: {
      blog: { total: r.blog_total ?? 0, published: r.blog_published ?? 0, draft: r.blog_draft ?? 0 },
      projects: { total: r.project_total ?? 0, completed: r.project_completed ?? 0, ongoing: r.project_ongoing ?? 0 },
      messages: { total: r.msg_total ?? 0, unread: r.msg_unread ?? 0 },
      subscribers: r.sub_active ?? 0,
    },
    analytics: {
      totalViews: r.total_views ?? 0,
      viewsToday: r.views_today ?? 0,
      viewsPreviousMonth: previousMonth,
      viewsThisWeek: r.views_this_week ?? 0,
      viewsThisMonth: currentMonth,
      growthPercent,
      avgPerDay: Number(avgPerDay.toFixed(1)),
      mostVisitedPage: r.most_visited_page ?? "/",
      mostVisitedPageViews: r.most_visited_page_views ?? 0,
    },
    topPages: topPagesQuery,
    latestMessages: recentMessages,
    latestArticles: recentArticles,
    latestProjects: recentProjects,
    newsletter: { total: r.newsletter_total ?? 0, active: r.newsletter_active ?? 0, inactive: (r.newsletter_total ?? 0) - (r.newsletter_active ?? 0) },
    testimonials: { total: r.testimonial_total ?? 0, visible: r.testimonial_visible ?? 0, featured: r.testimonial_featured ?? 0, averageRating: r.testimonial_avg_rating ?? 0 },
    services: { total: r.service_total ?? 0, active: r.service_active ?? 0, inactive: (r.service_total ?? 0) - (r.service_active ?? 0) },
    gallery: { total: r.gallery_total ?? 0 },
  };
}

export async function getUnapprovedComments() {
  await requireAdmin();

  const supabase = await createClient();
  const { data, error } = await supabase.from("blog_komentar").select("*").eq("approved", false).order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function approveComment(id: string) {
  await requireAdmin();

  const parsed = uuidSchema.safeParse(id);
  if (!parsed.success) throw new Error("Invalid comment ID: must be a valid UUID");

  const supabase = await createClient();
  const { error } = await supabase.from("blog_komentar").update({ approved: true }).eq("id", parsed.data);
  if (error) throw error;
  return { success: true };
}

export async function deleteComment(id: string) {
  await requireAdmin();

  const parsed = uuidSchema.safeParse(id);
  if (!parsed.success) throw new Error("Invalid comment ID: must be a valid UUID");

  const supabase = await createClient();
  const { error } = await supabase.from("blog_komentar").delete().eq("id", parsed.data);
  if (error) throw error;
  return { success: true };
}
