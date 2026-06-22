"use server";

import { revalidatePath } from "next/cache";
import { queryPooler, queryPoolerSingle } from "@/lib/db/pooler";
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

  // Device detection
  let device_type = "desktop";
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobile))/i.test(ua)) {
    device_type = "tablet";
  } else if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(ua)) {
    device_type = "mobile";
  }

  // Browser detection
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
  await queryPooler(
    `INSERT INTO shortlink_audit (shortlink_id, action, changed_fields, performed_by)
     VALUES ($1, $2, $3, $4)`,
    [shortlinkId, action, changedFields ? JSON.stringify(changedFields) : null, userId]
  );
}

// ─── Code Generation ─────────────────────────────────────────────────────────

async function generateUniqueCode(): Promise<string> {
  const MAX_ATTEMPTS = 5;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const code = nanoid(6);
    const existing = await queryPoolerSingle<{ code: string }>(
      "SELECT code FROM shortlinks WHERE code = $1",
      [code]
    );
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
  // First try exact code match (including all statuses for proper error messages)
  let shortlink = await queryPoolerSingle<Shortlink>(
    `SELECT * FROM shortlinks
     WHERE code = $1 AND deleted_at IS NULL`,
    [code]
  );

  // If not found, check previous_codes for slug history
  if (!shortlink) {
    shortlink = await queryPoolerSingle<Shortlink>(
      `SELECT * FROM shortlinks
       WHERE $1 = ANY(previous_codes) AND deleted_at IS NULL`,
      [code]
    );
  }

  if (!shortlink) {
    return { status: "not_found" };
  }

  // Check is_active
  if (!shortlink.is_active) {
    return { status: "not_found" };
  }

  // Check expiration
  if (shortlink.expires_at && new Date(shortlink.expires_at) < new Date()) {
    return { status: "not_found" };
  }

  // Check activation time
  if (shortlink.activates_at && new Date(shortlink.activates_at) > new Date()) {
    return { status: "not_yet_active", activates_at: shortlink.activates_at };
  }

  // Check click limit
  if (shortlink.click_limit !== null && shortlink.click_count >= shortlink.click_limit) {
    return { status: "click_limit_reached" };
  }

  // Check password protection
  if (shortlink.password_hash) {
    return {
      status: "password_required",
      shortlink: { id: shortlink.id, code: shortlink.code, title: shortlink.title },
    };
  }

  return { status: "ok", shortlink };
}

/**
 * Verify password for a protected shortlink
 */
export async function verifyShortlinkPassword(
  shortlinkId: string,
  password: string
): Promise<Shortlink | null> {
  const result = await queryPoolerSingle<Shortlink & { pw_match: boolean }>(
    `SELECT *, (password_hash = crypt($2, password_hash)) AS pw_match
     FROM shortlinks
     WHERE id = $1
       AND deleted_at IS NULL
       AND is_active = true`,
    [shortlinkId, password]
  );

  if (!result || !result.pw_match) {
    return null;
  }

  return result;
}

/**
 * Increment click count with enriched analytics
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
  await queryPooler(
    `UPDATE shortlinks
     SET click_count = click_count + 1, last_clicked_at = now()
     WHERE id = $1`,
    [shortlinkId]
  );

  if (metadata) {
    const { device_type, browser } = parseUserAgent(metadata.userAgent || null);

    await queryPooler(
      `INSERT INTO shortlink_clicks (shortlink_id, ip_address, user_agent, referrer, country, device_type, browser)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        shortlinkId,
        metadata.ip || null,
        metadata.userAgent || null,
        metadata.referrer || null,
        metadata.country || null,
        device_type,
        browser,
      ]
    );
  }
}

// ─── Admin Actions ───────────────────────────────────────────────────────────

/**
 * Create shortlink with audit trail
 */
export async function createShortlink(input: CreateShortlinkInput) {
  const { user } = await requireAuth();

  if (!input.destination_url.match(/^https?:\/\//)) {
    throw new Error("Destination URL must start with http:// or https://");
  }

  if (isPrivateOrBlockedUrl(input.destination_url)) {
    throw new Error("Destination URL cannot point to internal or private networks");
  }

  let code = input.code;
  if (code) {
    const existing = await queryPoolerSingle<{ code: string }>(
      "SELECT code FROM shortlinks WHERE code = $1",
      [code]
    );
    if (existing) {
      throw new Error(`Code "${code}" is already taken`);
    }
  } else {
    code = await generateUniqueCode();
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const shortUrl = `${siteUrl}/s/${code}`;
  const qrCodeUrl = await generateQRCode(shortUrl, input.qr_fg_color || "#000000", input.qr_bg_color || "#ffffff");

  // Hash password if provided
  let passwordHash = null;
  if (input.password) {
    const hashResult = await queryPoolerSingle<{ hash: string }>(
      `SELECT crypt($1, gen_salt('bf')) AS hash`,
      [input.password]
    );
    passwordHash = hashResult?.hash || null;
  }

  const result = await queryPoolerSingle<Shortlink>(
    `INSERT INTO shortlinks (code, destination_url, title, description, display_mode, mode_config, qr_code_url, expires_at, activates_at, click_limit, password_hash, created_by, qr_fg_color, qr_bg_color, qr_logo_text, splash_title, splash_timer, splash_social_links)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
     RETURNING *`,
    [
      code,
      input.destination_url,
      input.title || null,
      input.description || null,
      input.display_mode,
      JSON.stringify(input.mode_config || {}),
      qrCodeUrl,
      input.expires_at || null,
      input.activates_at || null,
      input.click_limit || null,
      passwordHash,
      user.id,
      input.qr_fg_color || "#000000",
      input.qr_bg_color || "#ffffff",
      input.qr_logo_text || null,
      input.splash_title || null,
      input.splash_timer !== undefined ? input.splash_timer : 5,
      JSON.stringify(input.splash_social_links || {}),
    ]
  );

  // Audit trail
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
  return { shortlink: result, shortUrl, qrCodeUrl };
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

  const page = params?.page || 1;
  const pageSize = params?.pageSize || 20;
  const offset = (page - 1) * pageSize;

  let whereClause = "WHERE deleted_at IS NULL";
  const queryParams: any[] = [];
  let paramIndex = 1;

  if (params?.search) {
    whereClause += ` AND (code ILIKE $${paramIndex} OR destination_url ILIKE $${paramIndex} OR title ILIKE $${paramIndex})`;
    queryParams.push(`%${params.search}%`);
    paramIndex++;
  }

  if (params?.displayMode) {
    whereClause += ` AND display_mode = $${paramIndex}`;
    queryParams.push(params.displayMode);
    paramIndex++;
  }

  const countResult = await queryPoolerSingle<{ count: string }>(
    `SELECT COUNT(*) as count FROM shortlinks ${whereClause}`,
    queryParams
  );
  const total = parseInt(countResult?.count || "0");

  queryParams.push(pageSize, offset);
  const shortlinks = await queryPooler<Shortlink>(
    `SELECT * FROM shortlinks ${whereClause} ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
    queryParams
  );

  return {
    shortlinks,
    pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
  };
}

/**
 * Admin: Get shortlink by ID
 */
export async function getShortlinkById(id: string): Promise<Shortlink | null> {
  await requireAuth();
  return await queryPoolerSingle<Shortlink>(
    `SELECT * FROM shortlinks WHERE id = $1`,
    [id]
  );
}

/**
 * Admin: Update shortlink with slug history and audit trail
 */
export async function updateShortlink(id: string, updates: UpdateShortlinkInput) {
  const { user } = await requireAuth();

  const current = await queryPoolerSingle<Shortlink>(
    `SELECT * FROM shortlinks WHERE id = $1`,
    [id]
  );
  if (!current) throw new Error("Shortlink not found");

  const setClauses: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;
  const changedFields: Record<string, { from: any; to: any }> = {};

  // Handle password changes
  if (updates.remove_password) {
    setClauses.push(`password_hash = $${paramIndex}`);
    values.push(null);
    paramIndex++;
    changedFields.password = { from: "set", to: "removed" };
  } else if (updates.password) {
    const hashResult = await queryPoolerSingle<{ hash: string }>(
      `SELECT crypt($1, gen_salt('bf')) AS hash`,
      [updates.password]
    );
    setClauses.push(`password_hash = $${paramIndex}`);
    values.push(hashResult?.hash || null);
    paramIndex++;
    changedFields.password = { from: current.password_hash ? "set" : "none", to: "set" };
  }

  // Handle other fields
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
      setClauses.push(`${key} = $${paramIndex}`);
      values.push(value);
      paramIndex++;
      changedFields[key] = { from: current[key as keyof Shortlink], to: value };
    }
  }

  if (updates.mode_config !== undefined) {
    setClauses.push(`mode_config = $${paramIndex}`);
    values.push(JSON.stringify(updates.mode_config));
    paramIndex++;
    changedFields.mode_config = { from: current.mode_config, to: updates.mode_config };
  }

  if (updates.splash_social_links !== undefined) {
    setClauses.push(`splash_social_links = $${paramIndex}`);
    values.push(JSON.stringify(updates.splash_social_links));
    paramIndex++;
    changedFields.splash_social_links = { from: current.splash_social_links, to: updates.splash_social_links };
  }

  // Regenerate QR Code if colors are updated
  if (updates.qr_fg_color !== undefined || updates.qr_bg_color !== undefined) {
    const fg = updates.qr_fg_color !== undefined ? updates.qr_fg_color : current.qr_fg_color;
    const bg = updates.qr_bg_color !== undefined ? updates.qr_bg_color : current.qr_bg_color;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const shortUrl = `${siteUrl}/s/${current.code}`;
    const qrCodeUrl = await generateQRCode(shortUrl, fg, bg);

    setClauses.push(`qr_code_url = $${paramIndex}`);
    values.push(qrCodeUrl);
    paramIndex++;
    changedFields.qr_code_url = { from: current.qr_code_url, to: qrCodeUrl };
  }

  if (setClauses.length === 0) {
    throw new Error("No updates provided");
  }

  values.push(id);
  await queryPooler(
    `UPDATE shortlinks SET ${setClauses.join(", ")}, updated_at = now() WHERE id = $${paramIndex}`,
    values
  );

  // Audit trail
  await logAudit(id, "updated", user.id, changedFields);

  revalidatePath("/admin/shortlinks");
  revalidatePath(`/admin/shortlinks/${id}/edit`);
}

/**
 * Admin: Soft delete shortlink
 */
export async function deleteShortlink(id: string) {
  const { user } = await requireAuth();

  await queryPooler(
    `UPDATE shortlinks SET deleted_at = now(), updated_at = now() WHERE id = $1`,
    [id]
  );

  await logAudit(id, "deleted", user.id);
  revalidatePath("/admin/shortlinks");
}

/**
 * Admin: Restore soft-deleted shortlink
 */
export async function restoreShortlink(id: string) {
  const { user } = await requireAuth();

  await queryPooler(
    `UPDATE shortlinks SET deleted_at = NULL, updated_at = now() WHERE id = $1`,
    [id]
  );

  await logAudit(id, "restored", user.id);
  revalidatePath("/admin/shortlinks");
  revalidatePath("/admin/shortlinks/trash");
}

/**
 * Admin: Permanently delete shortlink (from trash)
 */
export async function permanentDeleteShortlink(id: string) {
  await requireAuth();

  const shortlink = await queryPoolerSingle<Shortlink>(
    `SELECT * FROM shortlinks WHERE id = $1`,
    [id]
  );

  if (shortlink?.qr_code_url) {
    const fileName = shortlink.qr_code_url.split("/").pop();
    if (fileName) {
      const supabase = createAdminClient();
      await supabase.storage.from("shortlinks").remove([fileName]);
    }
  }

  await queryPooler(`DELETE FROM shortlinks WHERE id = $1`, [id]);
  revalidatePath("/admin/shortlinks/trash");
}

/**
 * Admin: Get trashed shortlinks
 */
export async function getTrashShortlinks() {
  await requireAuth();

  return await queryPooler<Shortlink>(
    `SELECT * FROM shortlinks WHERE deleted_at IS NOT NULL ORDER BY deleted_at DESC LIMIT 100`
  );
}

/**
 * Admin: Get shortlink stats (exclude trashed)
 */
export async function getShortlinkStats() {
  await requireAuth();

  const stats = await queryPoolerSingle<{
    total: string;
    active: string;
    total_clicks: string;
    password_protected: string;
    trashed: string;
  }>(
    `SELECT 
      COUNT(*) FILTER (WHERE deleted_at IS NULL) as total,
      COUNT(*) FILTER (WHERE is_active = true AND deleted_at IS NULL) as active,
      COALESCE(SUM(click_count) FILTER (WHERE deleted_at IS NULL), 0) as total_clicks,
      COUNT(*) FILTER (WHERE password_hash IS NOT NULL AND deleted_at IS NULL) as password_protected,
      COUNT(*) FILTER (WHERE deleted_at IS NOT NULL) as trashed
     FROM shortlinks`
  );

  return {
    total: parseInt(stats?.total || "0"),
    active: parseInt(stats?.active || "0"),
    totalClicks: parseInt(stats?.total_clicks || "0"),
    passwordProtected: parseInt(stats?.password_protected || "0"),
    trashed: parseInt(stats?.trashed || "0"),
  };
}

/**
 * Admin: Get click analytics for a shortlink
 */
export async function getShortlinkClicks(shortlinkId: string, limit = 100) {
  await requireAuth();

  return await queryPooler<ShortlinkClick>(
    `SELECT * FROM shortlink_clicks WHERE shortlink_id = $1 ORDER BY clicked_at DESC LIMIT $2`,
    [shortlinkId, limit]
  );
}

/**
 * Admin: Get audit trail for a shortlink
 */
export async function getShortlinkAuditTrail(shortlinkId: string) {
  await requireAuth();

  return await queryPooler<ShortlinkAudit>(
    `SELECT * FROM shortlink_audit WHERE shortlink_id = $1 ORDER BY performed_at DESC`,
    [shortlinkId]
  );
}

/**
 * Admin: Get click analytics summary for a shortlink
 */
export async function getShortlinkAnalyticsSummary(shortlinkId: string) {
  await requireAuth();

  const [deviceBreakdown, browserBreakdown, countryBreakdown, recentClicks] = await Promise.all([
    queryPooler<{ device_type: string; count: string }>(
      `SELECT COALESCE(device_type, 'unknown') AS device_type, COUNT(*)::text AS count
       FROM shortlink_clicks WHERE shortlink_id = $1
       GROUP BY device_type ORDER BY count DESC`,
      [shortlinkId]
    ),
    queryPooler<{ browser: string; count: string }>(
      `SELECT COALESCE(browser, 'unknown') AS browser, COUNT(*)::text AS count
       FROM shortlink_clicks WHERE shortlink_id = $1
       GROUP BY browser ORDER BY count DESC`,
      [shortlinkId]
    ),
    queryPooler<{ country: string; count: string }>(
      `SELECT COALESCE(country, 'unknown') AS country, COUNT(*)::text AS count
       FROM shortlink_clicks WHERE shortlink_id = $1
       GROUP BY country ORDER BY count DESC LIMIT 20`,
      [shortlinkId]
    ),
    queryPooler<{ date: string; count: string }>(
      `SELECT DATE(clicked_at)::text AS date, COUNT(*)::text AS count
       FROM shortlink_clicks WHERE shortlink_id = $1
       GROUP BY DATE(clicked_at) ORDER BY date DESC LIMIT 30`,
      [shortlinkId]
    ),
  ]);

  return { deviceBreakdown, browserBreakdown, countryBreakdown, recentClicks };
}
