"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/rbac";
import { createClient } from "@/lib/supabase/server";
import { queryPooler, queryPoolerSingle } from "@/lib/db/pooler";

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
  const parsed = createAnnouncementSchema.parse(data);

  const startsAt = parsed.starts_at ? new Date(parsed.starts_at).toISOString() : new Date().toISOString();
  const endsAt = parsed.ends_at ? new Date(parsed.ends_at).toISOString() : null;

  const result = await queryPoolerSingle<Announcement>(
    `INSERT INTO announcements (
      title, content, type, placement, is_active, starts_at, ends_at,
      target_page, dismissible, cta_label, cta_url, created_by
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    RETURNING *`,
    [
      parsed.title,
      parsed.content,
      parsed.type,
      parsed.placement,
      parsed.is_active,
      startsAt,
      endsAt,
      parsed.target_page,
      parsed.dismissible,
      parsed.cta_label || null,
      parsed.cta_url || null,
      admin.id,
    ]
  );

  if (!result) throw new Error("Failed to create announcement.");

  revalidatePath("/");
  revalidatePath("/admin/announcements");
  return result;
}

export async function updateAnnouncement(id: string, data: unknown): Promise<Announcement> {
  await requireAdmin();
  const parsedId = z.string().uuid().parse(id);
  const parsed = updateAnnouncementSchema.parse(data);

  const current = await queryPoolerSingle<Announcement>(
    "SELECT * FROM announcements WHERE id = $1",
    [parsedId]
  );
  if (!current) throw new Error("Announcement not found.");

  const setClauses: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  const simpleFields: (keyof z.infer<typeof createAnnouncementSchema>)[] = [
    "title", "content", "type", "placement", "is_active",
    "target_page", "dismissible", "cta_label", "cta_url"
  ];

  for (const key of simpleFields) {
    const val = parsed[key];
    if (val !== undefined) {
      setClauses.push(`${key} = $${paramIndex}`);
      values.push(val === "" ? null : val);
      paramIndex++;
    }
  }

  if (parsed.starts_at !== undefined) {
    setClauses.push(`starts_at = $${paramIndex}`);
    values.push(parsed.starts_at ? new Date(parsed.starts_at).toISOString() : null);
    paramIndex++;
  }

  if (parsed.ends_at !== undefined) {
    setClauses.push(`ends_at = $${paramIndex}`);
    values.push(parsed.ends_at ? new Date(parsed.ends_at).toISOString() : null);
    paramIndex++;
  }

  if (setClauses.length === 0) {
    throw new Error("No updates provided.");
  }

  values.push(parsedId);
  const result = await queryPoolerSingle<Announcement>(
    `UPDATE announcements
     SET ${setClauses.join(", ")}, updated_at = now()
     WHERE id = $${paramIndex}
     RETURNING *`,
    values
  );

  if (!result) throw new Error("Failed to update announcement.");

  revalidatePath("/");
  revalidatePath("/admin/announcements");
  revalidatePath(`/admin/announcements/${id}/edit`);
  return result;
}

export async function deleteAnnouncement(id: string): Promise<{ success: boolean }> {
  await requireAdmin();
  const parsedId = z.string().uuid().parse(id);

  await queryPooler("DELETE FROM announcements WHERE id = $1", [parsedId]);

  revalidatePath("/");
  revalidatePath("/admin/announcements");
  return { success: true };
}

export async function getAdminAnnouncements(): Promise<Announcement[]> {
  await requireAdmin();
  return await queryPooler<Announcement>(
    "SELECT * FROM announcements ORDER BY created_at DESC"
  );
}

export async function getAnnouncementById(id: string): Promise<Announcement | null> {
  await requireAdmin();
  const parsedId = z.string().uuid().parse(id);
  return await queryPoolerSingle<Announcement>(
    "SELECT * FROM announcements WHERE id = $1",
    [parsedId]
  );
}

// ─── Public Actions ──────────────────────────────────────────────────────────

export async function getPublicAnnouncements(): Promise<Announcement[]> {
  // Public select allows fetching active & currently scheduled announcements
  return await queryPooler<Announcement>(
    `SELECT * FROM announcements
     WHERE is_active = true
       AND (starts_at IS NULL OR starts_at <= now())
       AND (ends_at IS NULL OR ends_at > now())
     ORDER BY starts_at DESC`
  );
}
