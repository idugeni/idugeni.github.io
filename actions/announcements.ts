"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/rbac";
import { createAdminClient } from "@/lib/supabase/admin";

// ─── Types & Schemas ──────────────────────────────────────────────────────────

export type AnnouncementType = "info" | "warning" | "success" | "danger" | "primary";
export type AnnouncementPlacement = "banner" | "modal" | "card";

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: AnnouncementType;
  placement: AnnouncementPlacement;
  is_active: boolean;
  starts_at: string | null;
  ends_at: string | null;
  target_page: string;
  dismissible: boolean;
  cta_label: string | null;
  cta_url: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

const announcementTypeSchema = z.enum(["info", "warning", "success", "danger", "primary"]);
const announcementPlacementSchema = z.enum(["banner", "modal", "card"]);

const createAnnouncementSchema = z.object({
  title: z.string().min(1).max(200).trim(),
  content: z.string().min(1),
  type: announcementTypeSchema.default("info"),
  placement: announcementPlacementSchema.default("banner"),
  is_active: z.boolean().default(true),
  starts_at: z.string().optional().or(z.literal("")),
  ends_at: z.string().optional().or(z.literal("")),
  target_page: z.string().max(100).trim().default("*"),
  dismissible: z.boolean().default(true),
  cta_label: z.string().max(50).trim().optional().or(z.literal("")),
  cta_url: z.string().max(500).trim().optional().or(z.literal("")),
});

const updateAnnouncementSchema = createAnnouncementSchema.partial();

// ─── Admin Actions ───────────────────────────────────────────────────────────

export async function createAnnouncement(data: unknown): Promise<Announcement> {
  const admin = await requireAdmin();
  const parsedResult = createAnnouncementSchema.safeParse(data);
  if (!parsedResult.success) throw new Error("Invalid input");
  const parsed = parsedResult.data;

  const startsAt = parsed.starts_at ? new Date(parsed.starts_at).toISOString() : new Date().toISOString();
  const endsAt = parsed.ends_at ? new Date(parsed.ends_at).toISOString() : null;

  const supabase = createAdminClient();
  const { data: result, error } = await supabase
    .from("announcements")
    .insert({
      title: parsed.title,
      content: parsed.content,
      type: parsed.type,
      placement: parsed.placement,
      is_active: parsed.is_active,
      starts_at: startsAt,
      ends_at: endsAt,
      target_page: parsed.target_page,
      dismissible: parsed.dismissible,
      cta_label: parsed.cta_label || null,
      cta_url: parsed.cta_url || null,
      created_by: admin.id,
    })
    .select()
    .single();

  if (error || !result) throw new Error("Failed to create announcement.");

  revalidatePath("/");
  revalidatePath("/admin/announcements");
  return result;
}

export async function updateAnnouncement(id: string, data: unknown): Promise<Announcement> {
  await requireAdmin();
  const parsedIdResult = z.string().uuid().safeParse(id);
  if (!parsedIdResult.success) throw new Error("Invalid input");
  const parsedId = parsedIdResult.data;
  const parsedResult = updateAnnouncementSchema.safeParse(data);
  if (!parsedResult.success) throw new Error("Invalid input");
  const parsed = parsedResult.data;

  const supabase = createAdminClient();

  const { data: current, error: lookupError } = await supabase
    .from("announcements")
    .select("*")
    .eq("id", parsedId)
    .single();
  if (lookupError || !current) throw new Error("Announcement not found.");

  const updateData: Record<string, unknown> = {};

  const simpleFields: (keyof z.infer<typeof createAnnouncementSchema>)[] = [
    "title", "content", "type", "placement", "is_active",
    "target_page", "dismissible", "cta_label", "cta_url"
  ];

  for (const key of simpleFields) {
    const val = parsed[key];
    if (val !== undefined) {
      updateData[key] = val === "" ? null : val;
    }
  }

  if (parsed.starts_at !== undefined) {
    updateData.starts_at = parsed.starts_at ? new Date(parsed.starts_at).toISOString() : null;
  }

  if (parsed.ends_at !== undefined) {
    updateData.ends_at = parsed.ends_at ? new Date(parsed.ends_at).toISOString() : null;
  }

  if (Object.keys(updateData).length === 0) {
    throw new Error("No updates provided.");
  }

  const { data: result, error } = await supabase
    .from("announcements")
    .update({ ...updateData, updated_at: new Date().toISOString() })
    .eq("id", parsedId)
    .select()
    .single();

  if (error || !result) throw new Error("Failed to update announcement.");

  revalidatePath("/");
  revalidatePath("/admin/announcements");
  revalidatePath(`/admin/announcements/${id}/edit`);
  return result;
}

export async function deleteAnnouncement(id: string): Promise<{ success: boolean }> {
  await requireAdmin();
  const parsedIdResult = z.string().uuid().safeParse(id);
  if (!parsedIdResult.success) throw new Error("Invalid input");
  const parsedId = parsedIdResult.data;

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("announcements")
    .delete()
    .eq("id", parsedId);
  if (error) throw new Error(error.message);

  revalidatePath("/");
  revalidatePath("/admin/announcements");
  return { success: true };
}

export async function getAdminAnnouncements(): Promise<Announcement[]> {
  await requireAdmin();
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("announcements")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data || [];
}

export async function getAnnouncementById(id: string): Promise<Announcement | null> {
  await requireAdmin();
  const parsedIdResult = z.string().uuid().safeParse(id);
  if (!parsedIdResult.success) throw new Error("Invalid input");
  const parsedId = parsedIdResult.data;

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("announcements")
    .select("*")
    .eq("id", parsedId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

// ─── Public Actions ──────────────────────────────────────────────────────────

export async function getPublicAnnouncements(): Promise<Announcement[]> {
  const supabase = createAdminClient();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("announcements")
    .select("*")
    .eq("is_active", true)
    .or(`starts_at.is.null,starts_at.lte.${now}`)
    .or(`ends_at.is.null,ends_at.gt.${now}`)
    .order("starts_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
}
