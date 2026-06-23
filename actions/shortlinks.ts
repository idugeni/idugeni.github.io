"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/rbac";
import { isPrivateOrBlockedUrl } from "@/lib/security/url-validation";
import { nanoid } from "nanoid";
import QRCode from "qrcode";

// ─── Types ───────────────────────────────────────────────────────────────────

export type DisplayMode = "direct" | "safelink" | "splash" | "warning";

export interface Shortlink {
  id: string;
  code: string;
  destination_url: string;
  title: string | null;
  description: string | null;
  display_mode: DisplayMode;
  mode_config: Record<string, any>;
  qr_code_url: string | null;
  click_count: number;
  last_clicked_at: string | null;
  is_active: boolean;
  expires_at: string | null;
  activates_at: string | null;
  click_limit: number | null;
  password_hash: string | null;
  deleted_at: string | null;
  previous_codes: string[];
  created_by: string | null;
  created_at: string;
  updated_at: string;
  qr_fg_color: string;
  qr_bg_color: string;
  qr_logo_text: string | null;
  splash_title: string | null;
  splash_timer: number;
  splash_social_links: Record<string, string>;
}

export interface ShortlinkClick {
  id: string;
  shortlink_id: string;
  clicked_at: string;
  ip_address: string | null;
  user_agent: string | null;
  referrer: string | null;
  country_code: string | null;
  device_type: string | null;
  browser: string | null;
  country: string | null;
}

export interface ShortlinkAudit {
  id: string;
  shortlink_id: string;
  action: string;
  changed_fields: Record<string, any> | null;
  performed_by: string | null;
  performed_at: string;
}

export interface CreateShortlinkInput {
  code?: string;
  destination_url: string;
  title?: string;
  description?: string;
  display_mode: DisplayMode;
  mode_config?: Record<string, any>;
  expires_at?: string;
  activates_at?: string;
  click_limit?: number;
  password?: string;
  qr_fg_color?: string;
  qr_bg_color?: string;
  qr_logo_text?: string;
  splash_title?: string;
  splash_timer?: number;
  splash_social_links?: Record<string, string>;
}

export interface UpdateShortlinkInput {
  destination_url?: string;
  title?: string;
  description?: string;
  display_mode?: DisplayMode;
  mode_config?: Record<string, any>;
  is_active?: boolean;
  expires_at?: string;
  activates_at?: string;
  click_limit?: number;
  password?: string;
  remove_password?: boolean;
  qr_fg_color?: string;
  qr_bg_color?: string;
  qr_logo_text?: string;
  splash_title?: string;
  splash_timer?: number;
  splash_social_links?: Record<string, string>;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parseUserAgent(ua: string | null): { device_type: string; browser: string } {
  if (!ua) return { device_type: "unknown", browser: "unknown" };

  let device_type = "desktop";
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobile))/i.test(ua)) {
    device_type = "tablet";
  } else if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(ua)) {
    device_type = "mobile";
  }

  const lower = ua.toLowerCase();
  let browser = "other";
  if (lower.includes("edg/")) browser = "Edge";
  else if (lower.includes("opr/") || lower.includes("opera/")) browser = "Opera";
  else if (lower.includes("chrome/") && !lower.includes("edg/") && !lower.includes("opr/")) browser = "Chrome";
  else if (lower.includes("safari/") && !lower.includes("chrome/") && !lower.includes("chromium/")) browser = "Safari";
  else if (lower.includes("firefox/")) browser = "Firefox";

  return { device_type, browser };
}

async function requireAuth() {
  const user = await requireAdmin();
  return { user };
}

async function logAudit(
  shortlinkId: string,
  action: string,
  userId: string,
  changedFields?: Record<string, any>
) {
  const supabase = createAdminClient();
  await supabase.from("shortlink_audit").insert({
    shortlink_id: shortlinkId,
    action,
    changed_fields: changedFields ? JSON.stringify(changedFields) : null,
    performed_by: userId,
  });
}

// ─── Code Generation ─────────────────────────────────────────────────────────

async function generateUniqueCode(): Promise<string> {
  const supabase = createAdminClient();
  const MAX_ATTEMPTS = 5;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const code = nanoid(6);
    const { data: existing } = await supabase
      .from("shortlinks")
      .select("code")
      .eq("code", code)
      .maybeSingle();
    if (!existing) return code;
  }
  return nanoid(10);
}

// ─── QR Code Generation ─────────────────────────────────────────────────────

async function generateQRCode(shortUrl: string, fgColor = "#000000", bgColor = "#ffffff"): Promise<string> {
  const qrDataUrl = await QRCode.toDataURL(shortUrl, {
    width: 512,
    margin: 2,
    color: { dark: fgColor || "#000000", light: bgColor || "#ffffff" },
  });

  const base64Data = qrDataUrl.replace(/^data:image\/png;base64,/, "");
  const buffer = Buffer.from(base64Data, "base64");

  const supabase = createAdminClient();
  const fileName = `qr-${Date.now()}-${nanoid(6)}.png`;
  const { error } = await supabase.storage
    .from("shortlinks")
    .upload(fileName, buffer, {
      contentType: "image/png",
      cacheControl: "3600",
      upsert: false,
    });

  if (error) throw error;

  const { data: publicUrl } = supabase.storage
    .from("shortlinks")
    .getPublicUrl(fileName);

  return publicUrl.publicUrl;
}

// ─── Public Actions ──────────────────────────────────────────────────────────

export type ShortlinkAccessResult =
  | { status: "ok"; shortlink: Shortlink }
  | { status: "password_required"; shortlink: Pick<Shortlink, "id" | "code" | "title"> }
  | { status: "not_found" }
  | { status: "not_yet_active"; activates_at: string }
  | { status: "click_limit_reached" };

/**
 * Get shortlink by code (public). Checks:
 * - is_active, deleted_at, expires_at, activates_at, click_limit
 * - Also checks previous_codes for slug history redirect
 */
export async function getShortlinkByCode(code: string): Promise<ShortlinkAccessResult> {
  const supabase = createAdminClient();

  let { data: shortlink } = await supabase
    .from("shortlinks")
    .select("*")
    .eq("code", code)
    .is("deleted_at", null)
    .maybeSingle();

  if (!shortlink) {
    const { data: prev } = await supabase
      .from("shortlinks")
      .select("*")
      .contains("previous_codes", [code])
      .is("deleted_at", null)
      .maybeSingle();
    shortlink = prev as Shortlink | null;
  }

  if (!shortlink) {
    return { status: "not_found" };
  }

  if (!shortlink.is_active) {
    return { status: "not_found" };
  }

  if (shortlink.expires_at && new Date(shortlink.expires_at) < new Date()) {
    return { status: "not_found" };
  }

  if (shortlink.activates_at && new Date(shortlink.activates_at) > new Date()) {
    return { status: "not_yet_active", activates_at: shortlink.activates_at };
  }

  if (shortlink.click_limit !== null && shortlink.click_count >= shortlink.click_limit) {
    return { status: "click_limit_reached" };
  }

  if (shortlink.password_hash) {
    return {
      status: "password_required",
      shortlink: { id: shortlink.id, code: shortlink.code, title: shortlink.title },
    };
  }

  return { status: "ok", shortlink };
}

/**
 * Verify password for a protected shortlink.
 *
 * TODO: Create the required Supabase RPC function:
 * CREATE OR REPLACE FUNCTION verify_shortlink_password(p_id uuid, p_password text)
 * RETURNS boolean AS $$
 *   SELECT (password_hash = crypt(p_password, password_hash))
 *   FROM shortlinks
 *   WHERE id = p_id AND deleted_at IS NULL AND is_active = true;
 * $$ LANGUAGE sql SECURITY DEFINER;
 */
export async function verifyShortlinkPassword(
  shortlinkId: string,
  password: string
): Promise<Shortlink | null> {
  const supabase = createAdminClient();

  const { data: pwMatch } = await supabase.rpc("verify_shortlink_password", {
    p_id: shortlinkId,
    p_password: password,
  });

  if (!pwMatch) {
    return null;
  }

  const { data: shortlink } = await supabase
    .from("shortlinks")
    .select("*")
    .eq("id", shortlinkId)
    .is("deleted_at", null)
    .eq("is_active", true)
    .maybeSingle();

  return (shortlink as Shortlink) ?? null;
}

/**
 * Increment click count with enriched analytics.
 *
 * TODO: Create the required Supabase RPC function:
 * CREATE OR REPLACE FUNCTION increment_shortlink_click(p_shortlink_id uuid) RETURNS void AS $$
 *   UPDATE shortlinks
 *   SET click_count = click_count + 1, last_clicked_at = now()
 *   WHERE id = p_shortlink_id;
 * $$ LANGUAGE sql;
 */
export async function incrementShortlinkClick(
  shortlinkId: string,
  metadata?: {
    ip?: string;
    userAgent?: string;
    referrer?: string;
    country?: string;
  }
) {
  const supabase = createAdminClient();

  await supabase.rpc("increment_shortlink_click", { p_shortlink_id: shortlinkId });

  if (metadata) {
    const { device_type, browser } = parseUserAgent(metadata.userAgent || null);

    await supabase.from("shortlink_clicks").insert({
      shortlink_id: shortlinkId,
      ip_address: metadata.ip || null,
      user_agent: metadata.userAgent || null,
      referrer: metadata.referrer || null,
      country: metadata.country || null,
      device_type,
      browser,
    });
  }
}

// ─── Admin Actions ───────────────────────────────────────────────────────────

/**
 * Create shortlink with audit trail.
 *
 * TODO: Create the required Supabase RPC function for password hashing:
 * CREATE OR REPLACE FUNCTION hash_password(p_password text) RETURNS text AS $$
 *   SELECT crypt(p_password, gen_salt('bf'));
 * $$ LANGUAGE sql;
 */
export async function createShortlink(input: CreateShortlinkInput) {
  const { user } = await requireAuth();
  const supabase = createAdminClient();

  if (!input.destination_url.match(/^https?:\/\//)) {
    throw new Error("Destination URL must start with http:// or https://");
  }

  if (isPrivateOrBlockedUrl(input.destination_url)) {
    throw new Error("Destination URL cannot point to internal or private networks");
  }

  let code = input.code;
  if (code) {
    const { data: existing } = await supabase
      .from("shortlinks")
      .select("code")
      .eq("code", code)
      .maybeSingle();
    if (existing) {
      throw new Error(`Code "${code}" is already taken`);
    }
  } else {
    code = await generateUniqueCode();
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const shortUrl = `${siteUrl}/s/${code}`;
  const qrCodeUrl = await generateQRCode(shortUrl, input.qr_fg_color || "#000000", input.qr_bg_color || "#ffffff");

  let passwordHash = null;
  if (input.password) {
    const { data: hash } = await supabase.rpc("hash_password", { p_password: input.password });
    passwordHash = hash || null;
  }

  const { data: result } = await supabase
    .from("shortlinks")
    .insert({
      code,
      destination_url: input.destination_url,
      title: input.title || null,
      description: input.description || null,
      display_mode: input.display_mode,
      mode_config: input.mode_config || {},
      qr_code_url: qrCodeUrl,
      expires_at: input.expires_at || null,
      activates_at: input.activates_at || null,
      click_limit: input.click_limit || null,
      password_hash: passwordHash,
      created_by: user.id,
      qr_fg_color: input.qr_fg_color || "#000000",
      qr_bg_color: input.qr_bg_color || "#ffffff",
      qr_logo_text: input.qr_logo_text || null,
      splash_title: input.splash_title || null,
      splash_timer: input.splash_timer !== undefined ? input.splash_timer : 5,
      splash_social_links: input.splash_social_links || {},
    })
    .select()
    .single();

  if (result) {
    await logAudit(result.id, "created", user.id, {
      code,
      destination_url: input.destination_url,
      display_mode: input.display_mode,
      has_password: !!input.password,
      click_limit: input.click_limit || null,
      activates_at: input.activates_at || null,
      expires_at: input.expires_at || null,
      qr_fg_color: input.qr_fg_color,
      qr_bg_color: input.qr_bg_color,
    });
  }

  revalidatePath("/admin/shortlinks");
  return { shortlink: result as Shortlink, shortUrl, qrCodeUrl };
}

/**
 * Admin: Get all shortlinks (non-deleted) with pagination
 */
export async function getAdminShortlinks(params?: {
  page?: number;
  pageSize?: number;
  search?: string;
  displayMode?: DisplayMode;
}) {
  await requireAuth();
  const supabase = createAdminClient();

  const page = params?.page || 1;
  const pageSize = params?.pageSize || 20;
  const from = (page - 1) * pageSize;

  let query = supabase
    .from("shortlinks")
    .select("*", { count: "exact" })
    .is("deleted_at", null);

  if (params?.search) {
    const escaped = params.search.replace(/[%_]/g, "\\$&");
    const pattern = `%${escaped}%`;
    query = query.or(`code.ilike.${pattern},destination_url.ilike.${pattern},title.ilike.${pattern}`);
  }

  if (params?.displayMode) {
    query = query.eq("display_mode", params.displayMode);
  }

  const { data: shortlinks, count } = await query
    .order("created_at", { ascending: false })
    .range(from, from + pageSize - 1);

  const total = count ?? 0;

  return {
    shortlinks: (shortlinks ?? []) as Shortlink[],
    pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
  };
}

/**
 * Admin: Get shortlink by ID
 */
export async function getShortlinkById(id: string): Promise<Shortlink | null> {
  await requireAuth();
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("shortlinks")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  return (data as Shortlink) ?? null;
}

/**
 * Admin: Update shortlink with slug history and audit trail
 */
export async function updateShortlink(id: string, updates: UpdateShortlinkInput) {
  const { user } = await requireAuth();
  const supabase = createAdminClient();

  const { data: current } = await supabase
    .from("shortlinks")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!current) throw new Error("Shortlink not found");

  const updateData: Record<string, any> = {};
  const changedFields: Record<string, { from: any; to: any }> = {};

  if (updates.remove_password) {
    updateData.password_hash = null;
    changedFields.password = { from: "set", to: "removed" };
  } else if (updates.password) {
    const { data: hash } = await supabase.rpc("hash_password", { p_password: updates.password });
    updateData.password_hash = hash || null;
    changedFields.password = { from: current.password_hash ? "set" : "none", to: "set" };
  }

  const simpleFields: (keyof UpdateShortlinkInput)[] = [
    "destination_url", "title", "description", "display_mode",
    "is_active", "expires_at", "activates_at", "click_limit",
    "qr_fg_color", "qr_bg_color", "qr_logo_text", "splash_title", "splash_timer",
  ];

  if (updates.destination_url !== undefined) {
    if (!updates.destination_url.match(/^https?:\/\//)) {
      throw new Error("Destination URL must start with http:// or https://");
    }
    if (isPrivateOrBlockedUrl(updates.destination_url)) {
      throw new Error("Destination URL cannot point to internal or private networks");
    }
  }

  for (const key of simpleFields) {
    const value = updates[key];
    if (value !== undefined) {
      updateData[key] = value;
      changedFields[key] = { from: current[key as keyof Shortlink], to: value };
    }
  }

  if (updates.mode_config !== undefined) {
    updateData.mode_config = updates.mode_config;
    changedFields.mode_config = { from: current.mode_config, to: updates.mode_config };
  }

  if (updates.splash_social_links !== undefined) {
    updateData.splash_social_links = updates.splash_social_links;
    changedFields.splash_social_links = { from: current.splash_social_links, to: updates.splash_social_links };
  }

  if (updates.qr_fg_color !== undefined || updates.qr_bg_color !== undefined) {
    const fg = updates.qr_fg_color !== undefined ? updates.qr_fg_color : current.qr_fg_color;
    const bg = updates.qr_bg_color !== undefined ? updates.qr_bg_color : current.qr_bg_color;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const shortUrl = `${siteUrl}/s/${current.code}`;
    const qrCodeUrl = await generateQRCode(shortUrl, fg, bg);

    updateData.qr_code_url = qrCodeUrl;
    changedFields.qr_code_url = { from: current.qr_code_url, to: qrCodeUrl };
  }

  if (Object.keys(updateData).length === 0) {
    throw new Error("No updates provided");
  }

  updateData.updated_at = new Date().toISOString();

  await supabase.from("shortlinks").update(updateData).eq("id", id);

  await logAudit(id, "updated", user.id, changedFields);

  revalidatePath("/admin/shortlinks");
  revalidatePath(`/admin/shortlinks/${id}/edit`);
}

/**
 * Admin: Soft delete shortlink
 */
export async function deleteShortlink(id: string) {
  const { user } = await requireAuth();
  const supabase = createAdminClient();

  await supabase
    .from("shortlinks")
    .update({ deleted_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq("id", id);

  await logAudit(id, "deleted", user.id);
  revalidatePath("/admin/shortlinks");
}

/**
 * Admin: Restore soft-deleted shortlink
 */
export async function restoreShortlink(id: string) {
  const { user } = await requireAuth();
  const supabase = createAdminClient();

  await supabase
    .from("shortlinks")
    .update({ deleted_at: null, updated_at: new Date().toISOString() })
    .eq("id", id);

  await logAudit(id, "restored", user.id);
  revalidatePath("/admin/shortlinks");
  revalidatePath("/admin/shortlinks/trash");
}

/**
 * Admin: Permanently delete shortlink (from trash)
 */
export async function permanentDeleteShortlink(id: string) {
  await requireAuth();
  const supabase = createAdminClient();

  const { data: shortlink } = await supabase
    .from("shortlinks")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (shortlink?.qr_code_url) {
    const fileName = shortlink.qr_code_url.split("/").pop();
    if (fileName) {
      await supabase.storage.from("shortlinks").remove([fileName]);
    }
  }

  await supabase.from("shortlinks").delete().eq("id", id);
  revalidatePath("/admin/shortlinks/trash");
}

/**
 * Admin: Get trashed shortlinks
 */
export async function getTrashShortlinks() {
  await requireAuth();
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("shortlinks")
    .select("*")
    .not("deleted_at", "is", null)
    .order("deleted_at", { ascending: false })
    .limit(100);

  return (data ?? []) as Shortlink[];
}

/**
 * Admin: Get shortlink stats (exclude trashed)
 */
export async function getShortlinkStats() {
  await requireAuth();
  const supabase = createAdminClient();

  const [totalResult, activeResult, protectedResult, trashedResult, clicksResult] = await Promise.all([
    supabase.from("shortlinks").select("*", { count: "exact", head: true }).is("deleted_at", null),
    supabase.from("shortlinks").select("*", { count: "exact", head: true }).eq("is_active", true).is("deleted_at", null),
    supabase.from("shortlinks").select("*", { count: "exact", head: true }).not("password_hash", "is", null).is("deleted_at", null),
    supabase.from("shortlinks").select("*", { count: "exact", head: true }).not("deleted_at", "is", null),
    supabase.from("shortlinks").select("click_count").is("deleted_at", null),
  ]);

  const totalClicks = (clicksResult.data ?? []).reduce(
    (sum, row) => sum + (row.click_count || 0), 0
  );

  return {
    total: totalResult.count ?? 0,
    active: activeResult.count ?? 0,
    totalClicks,
    passwordProtected: protectedResult.count ?? 0,
    trashed: trashedResult.count ?? 0,
  };
}

/**
 * Admin: Get click analytics for a shortlink
 */
export async function getShortlinkClicks(shortlinkId: string, limit = 100) {
  await requireAuth();
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("shortlink_clicks")
    .select("*")
    .eq("shortlink_id", shortlinkId)
    .order("clicked_at", { ascending: false })
    .limit(limit);

  return (data ?? []) as ShortlinkClick[];
}

/**
 * Admin: Get audit trail for a shortlink
 */
export async function getShortlinkAuditTrail(shortlinkId: string) {
  await requireAuth();
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("shortlink_audit")
    .select("*")
    .eq("shortlink_id", shortlinkId)
    .order("performed_at", { ascending: false });

  return (data ?? []) as ShortlinkAudit[];
}

/**
 * Admin: Get click analytics summary for a shortlink.
 *
 * Aggregates are computed in JS since Supabase JS client lacks GROUP BY.
 * For high-traffic shortlinks (>10k clicks), consider creating an RPC function
 * with proper GROUP BY aggregation.
 */
export async function getShortlinkAnalyticsSummary(shortlinkId: string) {
  await requireAuth();
  const supabase = createAdminClient();

  const { data: clicks } = await supabase
    .from("shortlink_clicks")
    .select("device_type, browser, country, clicked_at")
    .eq("shortlink_id", shortlinkId)
    .limit(10000);

  function aggregateByField(items: Record<string, any>[], field: string) {
    const counts: Record<string, number> = {};
    for (const item of items ?? []) {
      const key = item[field] || "unknown";
      counts[key] = (counts[key] || 0) + 1;
    }
    return Object.entries(counts)
      .map(([key, count]) => ({ [field]: key, count: String(count) }))
      .sort((a, b) => Number(b.count) - Number(a.count));
  }

  function aggregateByDate(items: Record<string, any>[]) {
    const counts: Record<string, number> = {};
    for (const item of items ?? []) {
      const date = item.clicked_at?.split("T")[0] || "unknown";
      counts[date] = (counts[date] || 0) + 1;
    }
    return Object.entries(counts)
      .map(([date, count]) => ({ date, count: String(count) }))
      .sort((a, b) => b.date.localeCompare(a.date));
  }

  const deviceBreakdown = aggregateByField(clicks ?? [], "device_type");
  const browserBreakdown = aggregateByField(clicks ?? [], "browser");
  const countryBreakdown = aggregateByField(clicks ?? [], "country").slice(0, 20);
  const recentClicks = aggregateByDate(clicks ?? []).slice(0, 30);

  return { deviceBreakdown, browserBreakdown, countryBreakdown, recentClicks };
}
