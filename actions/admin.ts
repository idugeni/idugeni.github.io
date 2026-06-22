"use server";

import { createClient } from "@/lib/supabase/server";
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
  if (!parsed.success) throw new Error("Invalid input");

  await rateLimit(parsed.data.email, "login", { max: 5, window: 15 * 60 * 1000 });

  const supabase = await createClient();
  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });
  if (error) {
    console.error("Admin login failed:", error.message);
    throw new Error("Invalid email or password");
  }
  return { user: { email: authData.user?.email, id: authData.user?.id } };
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

export async function getAdminDashboardOverview() {
  await requireAdmin();

  const [rows, topPages, latestMessages, latestArticles, latestProjects] = await Promise.all([
    withTimeout(
      queryPooler<any>(`
        SELECT
          (SELECT COUNT(*)::int FROM blog_artikel) AS blog_total,
          (SELECT COUNT(*)::int FROM blog_artikel WHERE status='published') AS blog_published,
          (SELECT COUNT(*)::int FROM blog_artikel WHERE status='draft') AS blog_draft,
          (SELECT COUNT(*)::int FROM projects) AS project_total,
          (SELECT COUNT(*)::int FROM projects WHERE status='completed') AS project_completed,
          (SELECT COUNT(*)::int FROM projects WHERE status='ongoing') AS project_ongoing,
          (SELECT COUNT(*)::int FROM contact_messages) AS msg_total,
          (SELECT COUNT(*)::int FROM contact_messages WHERE dibaca=false) AS msg_unread,
          (SELECT COUNT(*)::int FROM newsletter_subscribers WHERE aktif=true) AS sub_active,
          (SELECT COUNT(*)::int FROM page_views) AS total_views,
          (SELECT COUNT(*)::int FROM page_views WHERE created_at >= CURRENT_DATE) AS views_today,
          (SELECT COUNT(*)::int FROM page_views WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') AS views_this_week,
          (SELECT COUNT(*)::int FROM page_views WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)) AS views_this_month,
          (SELECT COUNT(*)::int FROM page_views WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month' AND created_at < DATE_TRUNC('month', CURRENT_DATE)) AS views_prev_month,
          (SELECT COALESCE(halaman,'/') FROM page_views GROUP BY halaman ORDER BY COUNT(*) DESC LIMIT 1) AS most_visited_page,
          (SELECT COUNT(*)::int FROM page_views WHERE halaman = (SELECT halaman FROM page_views GROUP BY halaman ORDER BY COUNT(*) DESC LIMIT 1)) AS most_visited_page_views,
          (SELECT COUNT(*)::int FROM newsletter_subscribers) AS newsletter_total,
          (SELECT COUNT(*)::int FROM newsletter_subscribers WHERE aktif=true) AS newsletter_active,
          (SELECT COUNT(*)::int FROM testimonials) AS testimonial_total,
          (SELECT COUNT(*)::int FROM testimonials WHERE tampil=true) AS testimonial_visible,
          (SELECT COUNT(*)::int FROM testimonials WHERE featured=true) AS testimonial_featured,
          COALESCE((SELECT ROUND(AVG(rating)::numeric,1) FROM testimonials),0)::float AS testimonial_avg_rating,
          (SELECT COUNT(*)::int FROM services) AS service_total,
          (SELECT COUNT(*)::int FROM services WHERE aktif=true) AS service_active,
          (SELECT COUNT(*)::int FROM gallery) AS gallery_total
      `),
      6000,
      "Dashboard overview timeout"
    ),
    withTimeout(
      queryPooler<{ halaman: string; views: number; share: number }>(`
        WITH recent AS (SELECT halaman FROM page_views ORDER BY created_at DESC LIMIT 3000),
             agg AS (SELECT halaman, COUNT(*)::int AS views FROM recent GROUP BY halaman),
             total AS (SELECT COUNT(*)::int AS t FROM recent)
        SELECT halaman, views, ROUND((views::numeric / NULLIF(t,0) * 100),1)::float AS share
        FROM agg, total ORDER BY views DESC LIMIT 5
      `),
      4000,
      "Top pages timeout"
    ),
    withTimeout(
      queryPooler<any>(`SELECT id,nama,subjek,dibaca,created_at FROM contact_messages ORDER BY created_at DESC LIMIT 5`),
      3000,
      "Latest messages timeout"
    ),
    withTimeout(
      queryPooler<any>(`SELECT id,judul,slug,status,jumlah_view,created_at FROM blog_artikel ORDER BY created_at DESC LIMIT 5`),
      3000,
      "Latest articles timeout"
    ),
    withTimeout(
      queryPooler<any>(`SELECT id,nama,slug,status,created_at FROM projects ORDER BY created_at DESC LIMIT 5`),
      3000,
      "Latest projects timeout"
    ),
  ]);

  const r = rows[0] || {};

  const currentMonth = r.views_this_month ?? 0;
  const previousMonth = r.views_prev_month ?? 0;
  const growthPercent = previousMonth > 0 ? Number((((currentMonth - previousMonth) / previousMonth) * 100).toFixed(1)) : currentMonth > 0 ? 100 : 0;

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
      avgPerDay: new Date().getDate() > 0 ? Number((currentMonth / new Date().getDate()).toFixed(1)) : 0,
      mostVisitedPage: r.most_visited_page ?? "/",
      mostVisitedPageViews: r.most_visited_page_views ?? 0,
    },
    topPages,
    latestMessages,
    latestArticles,
    latestProjects,
    newsletter: { total: r.newsletter_total ?? 0, active: r.newsletter_active ?? 0, inactive: (r.newsletter_total ?? 0) - (r.newsletter_active ?? 0) },
    testimonials: { total: r.testimonial_total ?? 0, visible: r.testimonial_visible ?? 0, featured: r.testimonial_featured ?? 0, averageRating: r.testimonial_avg_rating ?? 0 },
    services: { total: r.service_total ?? 0, active: r.service_active ?? 0, inactive: (r.service_total ?? 0) - (r.service_active ?? 0) },
    gallery: { total: r.gallery_total ?? 0 },
  };
}

export async function getUnapprovedComments() {
  await requireAdmin();
  return await queryPooler<any>(`SELECT * FROM blog_komentar WHERE approved=false ORDER BY created_at DESC`);
}

export async function approveComment(id: string) {
  await requireAdmin();
  const parsed = uuidSchema.safeParse(id);
  if (!parsed.success) throw new Error("Invalid comment ID: must be a valid UUID");
  await queryPooler(`UPDATE blog_komentar SET approved=true WHERE id=$1`, [parsed.data]);
  return { success: true };
}

export async function deleteComment(id: string) {
  await requireAdmin();
  const parsed = uuidSchema.safeParse(id);
  if (!parsed.success) throw new Error("Invalid comment ID: must be a valid UUID");
  await queryPooler(`DELETE FROM blog_komentar WHERE id=$1`, [parsed.data]);
  return { success: true };
}
