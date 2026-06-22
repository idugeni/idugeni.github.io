"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { z } from "zod";
import { Resend } from "resend";
import { queryPooler, queryPoolerSingle } from "@/lib/db/pooler";
import { requireAdmin } from "@/lib/auth/rbac";
import { rateLimit } from "@/lib/rate-limit";
import { getClientIp, uuidSchema } from "@/lib/security/server-action";
import { validateCSRFToken } from "@/lib/security/csrf";
import { sanitizeRichHtml } from "@/lib/security/sanitize-html";

function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
import type { Database } from "@/lib/supabase/types";
import { sendConfirmationEmail } from "@/lib/email/newsletter";

function generateConfirmationToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

type NewsletterRow = Database["public"]["Tables"]["newsletter_subscribers"]["Row"];

const subscribeSchema = z.object({
  email: z.string().email().max(255).trim().toLowerCase(),
  nama: z.string().max(100).trim().optional(),
});

const uuidArraySchema = z.array(uuidSchema).min(1).max(50);
const adminNewsletterFilterSchema = z.object({
  q: z.string().trim().max(100).optional(),
  status: z.enum(["active", "inactive"]).optional(),
  sort: z.enum(["date", "email", "name", "status"]).optional().default("date"),
  order: z.enum(["asc", "desc"]).optional().default("desc"),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(5).max(50).optional().default(10),
});

const newsletterPatchSchema = z.object({ aktif: z.boolean() });

function getNewsletterSortColumn(sort: z.infer<typeof adminNewsletterFilterSchema>["sort"]) {
  if (sort === "email") return "email";
  if (sort === "name") return "nama";
  if (sort === "status") return "aktif";
  return "subscribed_at";
}

export async function subscribeNewsletter(data: { email: string; nama?: string; csrf_token?: string }) {
  const ip = await getClientIp();
  await rateLimit(ip, "newsletter", { max: 3, window: 60 * 60 * 1000 });

  // Validate CSRF token
  const csrfToken = data.csrf_token;
  if (typeof csrfToken !== "string" || !validateCSRFToken(csrfToken)) {
    return { success: false, message: "Token keamanan tidak valid. Silakan refresh halaman dan coba lagi." };
  }

  const parsed = subscribeSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, message: "Email tidak valid" };
  }

  const existing = await queryPoolerSingle<{ id: string; aktif: boolean; confirmed: boolean; confirmation_token: string | null }>(
    `SELECT id, aktif, confirmed, confirmation_token FROM newsletter_subscribers WHERE email = $1`,
    [parsed.data.email]
  );

  // Case 1: Email already exists and is confirmed + active
  if (existing && existing.confirmed && existing.aktif) {
    return { success: false, message: "Email sudah terdaftar dan aktif." };
  }

  // Case 2: Email exists but not confirmed yet (resend confirmation email)
  if (existing && !existing.confirmed) {
    const newToken = generateConfirmationToken();
    await queryPooler(
      `UPDATE newsletter_subscribers SET confirmation_token = $1 WHERE id = $2`,
      [newToken, existing.id]
    );
    
    try {
      await sendConfirmationEmail({
        email: parsed.data.email,
        nama: parsed.data.nama,
        token: newToken,
      });
      return { success: true, message: "Email konfirmasi telah dikirim ulang. Silakan cek inbox Anda." };
    } catch (error) {
      console.error("Failed to send confirmation email:", error);
      return { success: false, message: "Gagal mengirim email konfirmasi. Silakan coba lagi." };
    }
  }

  // Case 3: Email exists but inactive (resubscribe)
  if (existing && !existing.aktif) {
    const newToken = generateConfirmationToken();
    await queryPooler(
      `UPDATE newsletter_subscribers SET aktif = $1, confirmed = $2, confirmation_token = $3, unsubscribed_at = NULL, updated_at = NOW() WHERE id = $4`,
      [true, false, newToken, existing.id]
    );
    
    try {
      await sendConfirmationEmail({
        email: parsed.data.email,
        nama: parsed.data.nama,
        token: newToken,
      });
      return { success: true, message: "Email konfirmasi telah dikirim. Silakan cek inbox Anda untuk mengaktifkan langganan." };
    } catch (error) {
      console.error("Failed to send confirmation email:", error);
      return { success: false, message: "Gagal mengirim email konfirmasi. Silakan coba lagi." };
    }
  }

  // Case 4: New subscriber
  const confirmationToken = generateConfirmationToken();
  const unsubscribeToken = randomUUID();
  
  await queryPooler(
    `INSERT INTO newsletter_subscribers (email, nama, aktif, confirmed, confirmation_token, token_unsubscribe) VALUES ($1, $2, $3, $4, $5, $6)`,
    [parsed.data.email, parsed.data.nama || null, true, false, confirmationToken, unsubscribeToken]
  );

  try {
    await sendConfirmationEmail({
      email: parsed.data.email,
      nama: parsed.data.nama,
      token: confirmationToken,
    });
    return { success: true, message: "Terima kasih! Email konfirmasi telah dikirim. Silakan cek inbox Anda untuk mengaktifkan langganan." };
  } catch (error) {
    console.error("Failed to send confirmation email:", error);
    return { success: false, message: "Gagal mengirim email konfirmasi. Silakan coba lagi." };
  }
}

export async function unsubscribeNewsletter(token: string) {
  const parsed = uuidSchema.safeParse(token);
  if (!parsed.success) return { success: false, message: "Token unsubscribe tidak valid" };

  // Check if subscriber exists and is confirmed
  const subscriber = await queryPoolerSingle<{ id: string; email: string; confirmed: boolean; aktif: boolean }>(
    `SELECT id, email, confirmed, aktif FROM newsletter_subscribers WHERE token_unsubscribe = $1`,
    [parsed.data]
  );

  if (!subscriber) {
    return { success: false, message: "Token unsubscribe tidak ditemukan. Silakan periksa kembali link yang Anda klik." };
  }

  if (!subscriber.aktif) {
    return { success: true, message: "Anda sudah tidak berlangganan newsletter kami." };
  }

  await queryPooler(
    `UPDATE newsletter_subscribers SET aktif = $1, unsubscribed_at = $2 WHERE token_unsubscribe = $3`,
    [false, new Date().toISOString(), parsed.data]
  );
  return { success: true, message: "Berhasil berhenti berlangganan newsletter IRNK Codes." };
}

export async function getNewsletterSubscribers() {
  await requireAdmin();

  return queryPooler(
    `SELECT * FROM newsletter_subscribers ORDER BY subscribed_at DESC LIMIT 100`
  );
}

export async function getAdminNewsletterSubscribersPage(rawFilters: unknown) {
  await requireAdmin();

  const filtersParsed = adminNewsletterFilterSchema.safeParse(rawFilters ?? {});
  if (!filtersParsed.success) throw new Error("Invalid input");
  const filters = filtersParsed.data;

  const conditions: string[] = [];
  const params: unknown[] = [];
  let idx = 1;

  if (filters.q) {
    const escaped = filters.q.replace(/[%_]/g, '\\$&');
    conditions.push(`(email ILIKE '%' || $${idx} || '%' ESCAPE '\\' OR nama ILIKE '%' || $${idx} || '%' ESCAPE '\\')`);
    params.push(escaped);
    idx++;
  }
  if (filters.status === "active") { conditions.push(`aktif = $${idx}`); params.push(true); idx++; }
  if (filters.status === "inactive") { conditions.push(`aktif = $${idx}`); params.push(false); idx++; }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const sortCol = getNewsletterSortColumn(filters.sort);
  const sortDir = filters.order === "asc" ? "ASC" : "DESC";
  const limit = filters.pageSize;
  const offset = (filters.page - 1) * filters.pageSize;

  const [countResult, data] = await Promise.all([
    queryPooler<{ count: number }>(`SELECT COUNT(*)::int AS count FROM newsletter_subscribers ${where}`, params),
    queryPooler<NewsletterRow>(`SELECT * FROM newsletter_subscribers ${where} ORDER BY ${sortCol} ${sortDir} LIMIT $${idx} OFFSET $${idx + 1}`, [...params, limit, offset]),
  ]);

  const totalItems = countResult[0]?.count ?? 0;
  return {
    subscribers: data,
    filters,
    pagination: {
      page: filters.page,
      pageSize: filters.pageSize,
      totalItems,
      totalPages: Math.max(1, Math.ceil(totalItems / filters.pageSize)),
    },
  };
}

export async function getNewsletterStats() {
  await requireAdmin();

  const [row] = await queryPooler<{
    total: number;
    active: number;
    inactive: number;
    recent: number;
    confirmed: number;
    unconfirmed: number;
    confirmation_rate: number;
  }>(`
    SELECT
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE aktif = true)::int AS active,
      COUNT(*) FILTER (WHERE aktif = false)::int AS inactive,
      COUNT(*) FILTER (WHERE subscribed_at >= NOW() - INTERVAL '7 days')::int AS recent,
      COUNT(*) FILTER (WHERE confirmed = true)::int AS confirmed,
      COUNT(*) FILTER (WHERE confirmed = false)::int AS unconfirmed,
      CASE
        WHEN COUNT(*) = 0 THEN 0
        ELSE ROUND((COUNT(*) FILTER (WHERE confirmed = true)::numeric / COUNT(*)::numeric) * 100, 2)
      END AS confirmation_rate
    FROM newsletter_subscribers
  `);

  return {
    total: row.total,
    active: row.active,
    inactive: row.inactive,
    recent: row.recent,
    confirmed: row.confirmed,
    unconfirmed: row.unconfirmed,
    confirmationRate: Number(row.confirmation_rate) || 0,
  };
}

export async function updateNewsletterSubscriberStatus(id: string, aktif: boolean) {
  await requireAdmin();
  const parsedIdResult = uuidSchema.safeParse(id);
  if (!parsedIdResult.success) throw new Error("Invalid input");
  const parsedId = parsedIdResult.data;
  const parsedPatchResult = newsletterPatchSchema.safeParse({ aktif });
  if (!parsedPatchResult.success) throw new Error("Invalid input");
  const parsedPatch = parsedPatchResult.data;

  const unsubscribedAt = parsedPatch.aktif ? null : new Date().toISOString();
  await queryPooler(
    `UPDATE newsletter_subscribers SET aktif = $1, unsubscribed_at = $2 WHERE id = $3`,
    [parsedPatch.aktif, unsubscribedAt, parsedId]
  );
  revalidatePath("/admin/newsletter");
  return { success: true };
}

export async function bulkUpdateNewsletterSubscribers(ids: string[], patch: { aktif: boolean }) {
  await requireAdmin();
  const parsedIdsResult = uuidArraySchema.safeParse(ids);
  if (!parsedIdsResult.success) throw new Error("Invalid input");
  const parsedIds = parsedIdsResult.data;
  const parsedPatchResult = newsletterPatchSchema.safeParse(patch);
  if (!parsedPatchResult.success) throw new Error("Invalid input");
  const parsedPatch = parsedPatchResult.data;

  const unsubscribedAt = parsedPatch.aktif ? null : new Date().toISOString();
  const placeholders = parsedIds.map((_, i) => `$${i + 2}`).join(", ");
  await queryPooler(
    `UPDATE newsletter_subscribers SET aktif = $1, unsubscribed_at = $2 WHERE id IN (${placeholders})`,
    [parsedPatch.aktif, unsubscribedAt, ...parsedIds]
  );
  revalidatePath("/admin/newsletter");
  return { success: true };
}

export async function bulkDeleteNewsletterSubscribers(ids: string[]) {
  await requireAdmin();
  const parsedIdsResult = uuidArraySchema.safeParse(ids);
  if (!parsedIdsResult.success) throw new Error("Invalid input");
  const parsedIds = parsedIdsResult.data;

  const placeholders = parsedIds.map((_, i) => `$${i + 1}`).join(", ");
  await queryPooler(
    `DELETE FROM newsletter_subscribers WHERE id IN (${placeholders})`,
    parsedIds
  );
  revalidatePath("/admin/newsletter");
  return { success: true };
}

const campaignSchema = z.object({
  subject: z.string().min(1).max(200).trim(),
  contentHtml: z.string().min(10),
});

export async function dispatchNewsletterCampaign(data: { subject: string; contentHtml: string }) {
  await requireAdmin();
  const parsedResult = campaignSchema.safeParse(data);
  if (!parsedResult.success) throw new Error("Invalid input");
  const parsed = parsedResult.data;

  const subscribers = await queryPooler<{ email: string; nama: string | null; token_unsubscribe: string }>(
    `SELECT email, nama, token_unsubscribe FROM newsletter_subscribers WHERE aktif = $1 AND confirmed = $2`,
    [true, true]
  );

  if (!subscribers || subscribers.length === 0) {
    return { success: true, message: "No active subscribers found.", sentCount: 0, failedCount: 0 };
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured on the server.");
  }

  const resend = new Resend(apiKey);
  const fromEmail = process.env.RESEND_FROM_EMAIL || "IRNK Codes <onboarding@resend.dev>";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  let successCount = 0;
  let failureCount = 0;

  // Resend batch API limit is 100 emails per request
  for (let i = 0; i < subscribers.length; i += 100) {
    const chunk = subscribers.slice(i, i + 100);
    const emailsPayload = chunk.map((sub) => {
      const token = sub.token_unsubscribe;
      const unsubscribeUrl = `${siteUrl}/newsletter/unsubscribe?token=${token}`;
      const nameGreeting = sub.nama ? `Halo ${escapeHtml(sub.nama)},` : "Halo,";

      const wrappedHtml = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0b0f19; color: #f3f4f6; padding: 40px 20px; text-align: left;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #111827; border: 1px solid #1f2937; padding: 30px; border-radius: 8px;">
            <div style="text-align: center; margin-bottom: 25px;">
              <span style="font-size: 20px; font-weight: bold; color: #06b6d4; font-family: 'Orbitron', monospace; letter-spacing: 2px;">IRNK_CODES</span>
            </div>
            <div style="font-size: 15px; line-height: 1.6; color: #d1d5db; margin-bottom: 30px;">
              <p style="margin-bottom: 20px; font-weight: 500;">${nameGreeting}</p>
              ${sanitizeRichHtml(parsed.contentHtml)}
            </div>
            <hr style="border: 0; border-top: 1px solid #374151; margin: 30px 0;">
            <p style="font-size: 11px; color: #9ca3af; text-align: center; line-height: 1.5;">
              Anda menerima email ini karena Anda berlangganan buletin IRNK Codes.
              <br>
              <a href="${unsubscribeUrl}" style="color: #06b6d4; text-decoration: underline; font-weight: bold; margin-top: 8px; display: inline-block;">Berhenti Berlangganan (Unsubscribe)</a>
            </p>
          </div>
        </div>
      `;

      return {
        from: fromEmail,
        to: sub.email,
        subject: parsed.subject,
        html: wrappedHtml,
      };
    });

    const { data: batchResult, error: batchError } = await resend.batch.send(emailsPayload);
    if (batchError) {
      console.error("Resend batch delivery failed:", batchError);
      failureCount += chunk.length;
    } else {
      successCount += batchResult?.data?.length || chunk.length;
    }
  }

  return {
    success: true,
    message: `Campaign dispatched successfully. Sent: ${successCount}, Failed: ${failureCount}`,
    sentCount: successCount,
    failedCount: failureCount,
  };
}
