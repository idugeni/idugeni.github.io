"use server";

import { createClient } from "@/lib/supabase/server";
import { getBlogStats } from "./blog";
import { getProjectStats } from "./projects";
import { getAnalyticsSummary, getTopPages } from "./analytics";
import { z } from "zod";
import { requireAdmin, withTimeout } from "@/lib/auth/rbac";
import { rateLimit } from "@/lib/rate-limit";

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
  
  // Wrap with 6-second timeout for nested queries
  const [blogStats, projectStats, messages, subscribers] = await withTimeout(
    Promise.all([
      getBlogStats(),
      getProjectStats(),
      supabase.from("contact_messages").select("dibaca"),
      supabase.from("newsletter_subscribers").select("*", { count: "exact", head: true }).eq("aktif", true),
    ]),
    6000,
    "Dashboard stats timeout: Failed to load stats within 6 seconds"
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

  const supabase = await createClient();
  
  // Wrap all queries with 8-second timeout to prevent hanging
  const [stats, analytics, topPages, latestMessages, latestArticles, latestProjects, newsletter, testimonials, services, gallery] = await withTimeout(
    Promise.all([
      getDashboardStats(),
      getAnalyticsSummary(),
      getTopPages(5),
      supabase.from("contact_messages").select("id,nama,email,subjek,dibaca,dibalas,created_at").order("created_at", { ascending: false }).limit(5),
      supabase.from("blog_artikel").select("id,judul,slug,status,featured,created_at,published_at,jumlah_view").order("created_at", { ascending: false }).limit(5),
      supabase.from("projects").select("id,nama,slug,status,featured,created_at,thumbnail_url").order("created_at", { ascending: false }).limit(5),
      supabase.from("newsletter_subscribers").select("aktif,subscribed_at"),
      supabase.from("testimonials").select("tampil,featured,rating"),
      supabase.from("services").select("aktif"),
      supabase.from("gallery").select("id"),
    ]),
    8000,
    "Dashboard queries timeout: Failed to load admin dashboard data within 8 seconds"
  );

  const newsletterRows = newsletter.data ?? [];
  const testimonialRows = testimonials.data ?? [];
  const serviceRows = services.data ?? [];

  return {
    stats,
    analytics,
    topPages,
    latestMessages: latestMessages.data ?? [],
    latestArticles: latestArticles.data ?? [],
    latestProjects: latestProjects.data ?? [],
    newsletter: {
      total: newsletterRows.length,
      active: newsletterRows.filter((row) => row.aktif).length,
      inactive: newsletterRows.filter((row) => !row.aktif).length,
    },
    testimonials: {
      total: testimonialRows.length,
      visible: testimonialRows.filter((row) => row.tampil).length,
      featured: testimonialRows.filter((row) => row.featured).length,
      averageRating: testimonialRows.length ? Number((testimonialRows.reduce((sum, row) => sum + row.rating, 0) / testimonialRows.length).toFixed(1)) : 0,
    },
    services: {
      total: serviceRows.length,
      active: serviceRows.filter((row) => row.aktif).length,
      inactive: serviceRows.filter((row) => !row.aktif).length,
    },
    gallery: {
      total: gallery.data?.length ?? 0,
    },
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
