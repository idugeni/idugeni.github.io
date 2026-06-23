"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/rbac";
import { rateLimit } from "@/lib/rate-limit";
import { createAdminClient } from "@/lib/supabase/admin";

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
  const supabase = createAdminClient();

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const weekStart = (() => {
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(now.getFullYear(), now.getMonth(), diff).toISOString();
  })();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();

  const c = (r: { count: number | null }) => r.count || 0;

  const [
    blogTotal, blogPublished, blogDraft,
    projectTotal, projectCompleted, projectOngoing,
    msgTotal, msgUnread,
    subActive,
    totalViews, viewsToday, viewsThisWeek, viewsThisMonth, viewsPrevMonth,
    newsletterTotal, newsletterActive,
    testimonialTotal, testimonialVisible, testimonialFeatured, testimonialRatings,
    serviceTotal, serviceActive,
    galleryTotal,
    latestMessages, latestArticles, latestProjects,
    recentHalaman,
  ] = await Promise.all([
    supabase.from("blog_artikel").select("*", { count: "exact", head: true }),
    supabase.from("blog_artikel").select("*", { count: "exact", head: true }).eq("status", "published"),
    supabase.from("blog_artikel").select("*", { count: "exact", head: true }).eq("status", "draft"),
    supabase.from("projects").select("*", { count: "exact", head: true }),
    supabase.from("projects").select("*", { count: "exact", head: true }).eq("status", "completed"),
    supabase.from("projects").select("*", { count: "exact", head: true }).eq("status", "ongoing"),
    supabase.from("contact_messages").select("*", { count: "exact", head: true }),
    supabase.from("contact_messages").select("*", { count: "exact", head: true }).eq("dibaca", false),
    supabase.from("newsletter_subscribers").select("*", { count: "exact", head: true }).eq("aktif", true),
    supabase.from("page_views").select("*", { count: "exact", head: true }),
    supabase.from("page_views").select("*", { count: "exact", head: true }).gte("created_at", todayStart),
    supabase.from("page_views").select("*", { count: "exact", head: true }).gte("created_at", weekStart),
    supabase.from("page_views").select("*", { count: "exact", head: true }).gte("created_at", monthStart),
    supabase.from("page_views").select("*", { count: "exact", head: true }).gte("created_at", prevMonthStart).lt("created_at", monthStart),
    supabase.from("newsletter_subscribers").select("*", { count: "exact", head: true }),
    supabase.from("newsletter_subscribers").select("*", { count: "exact", head: true }).eq("aktif", true),
    supabase.from("testimonials").select("*", { count: "exact", head: true }),
    supabase.from("testimonials").select("*", { count: "exact", head: true }).eq("tampil", true),
    supabase.from("testimonials").select("*", { count: "exact", head: true }).eq("featured", true),
    supabase.from("testimonials").select("rating"),
    supabase.from("services").select("*", { count: "exact", head: true }),
    supabase.from("services").select("*", { count: "exact", head: true }).eq("aktif", true),
    supabase.from("gallery").select("*", { count: "exact", head: true }),
    supabase.from("contact_messages").select("id, nama, subjek, dibaca, created_at").order("created_at", { ascending: false }).limit(5),
    supabase.from("blog_artikel").select("id, judul, slug, status, jumlah_view, created_at").order("created_at", { ascending: false }).limit(5),
    supabase.from("projects").select("id, nama, slug, status, created_at").order("created_at", { ascending: false }).limit(5),
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

  const totalRecentViews = recentHalaman.data?.length || 0;
  const topPages = [...halamanCounts.entries()]
    .map(([halaman, views]) => ({
      halaman,
      views,
      share: totalRecentViews > 0 ? Number(((views / totalRecentViews) * 100).toFixed(1)) : 0,
    }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 5);

  const ratings = testimonialRatings.data || [];
  const avgRating = ratings.length > 0
    ? Number((ratings.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) / ratings.length).toFixed(1))
    : 0;

  const currentMonth = c(viewsThisMonth);
  const previousMonth = c(viewsPrevMonth);
  const growthPercent = previousMonth > 0
    ? Number((((currentMonth - previousMonth) / previousMonth) * 100).toFixed(1))
    : currentMonth > 0 ? 100 : 0;

  return {
    stats: {
      blog: { total: c(blogTotal), published: c(blogPublished), draft: c(blogDraft) },
      projects: { total: c(projectTotal), completed: c(projectCompleted), ongoing: c(projectOngoing) },
      messages: { total: c(msgTotal), unread: c(msgUnread) },
      subscribers: c(subActive),
    },
    analytics: {
      totalViews: c(totalViews),
      viewsToday: c(viewsToday),
      viewsPreviousMonth: previousMonth,
      viewsThisWeek: c(viewsThisWeek),
      viewsThisMonth: currentMonth,
      growthPercent,
      avgPerDay: now.getDate() > 0 ? Number((currentMonth / now.getDate()).toFixed(1)) : 0,
      mostVisitedPage,
      mostVisitedPageViews,
    },
    topPages,
    latestMessages: latestMessages.data || [],
    latestArticles: latestArticles.data || [],
    latestProjects: latestProjects.data || [],
    newsletter: { total: c(newsletterTotal), active: c(newsletterActive), inactive: c(newsletterTotal) - c(newsletterActive) },
    testimonials: { total: c(testimonialTotal), visible: c(testimonialVisible), featured: c(testimonialFeatured), averageRating: avgRating },
    services: { total: c(serviceTotal), active: c(serviceActive), inactive: c(serviceTotal) - c(serviceActive) },
    gallery: { total: c(galleryTotal) },
  };
}

export async function getUnapprovedComments() {
  await requireAdmin();
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("blog_komentar")
    .select("*")
    .eq("approved", false)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function approveComment(id: string) {
  await requireAdmin();
  const parsed = uuidSchema.safeParse(id);
  if (!parsed.success) throw new Error("Invalid comment ID: must be a valid UUID");
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("blog_komentar")
    .update({ approved: true })
    .eq("id", parsed.data);
  if (error) throw error;
  return { success: true };
}

export async function deleteComment(id: string) {
  await requireAdmin();
  const parsed = uuidSchema.safeParse(id);
  if (!parsed.success) throw new Error("Invalid comment ID: must be a valid UUID");
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("blog_komentar")
    .delete()
    .eq("id", parsed.data);
  if (error) throw error;
  return { success: true };
}
