"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { z } from "zod";
import { Resend } from "resend";
import { createClient } from "@/lib/supabase/server";
import { queryPooler } from "@/lib/db/pooler";
import { requireAdmin } from "@/lib/auth/rbac";
import { rateLimit } from "@/lib/rate-limit";
import { getClientIp, uuidSchema } from "@/lib/security/server-action";
import type { Database } from "@/lib/supabase/types";

type NewsletterRow = Database["public"]["Tables"]["newsletter_subscribers"]["Row"];
type NewsletterUpdate = Database["public"]["Tables"]["newsletter_subscribers"]["Update"];

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

function statusPatch(aktif: boolean): NewsletterUpdate {
  return {
    aktif,
    unsubscribed_at: aktif ? null : new Date().toISOString(),
  };
}

export async function subscribeNewsletter(data: { email: string; nama?: string }) {
  const ip = await getClientIp();
  await rateLimit(ip, "newsletter", { max: 3, window: 60 * 60 * 1000 });

  const parsed = subscribeSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, message: "Email tidak valid" };
  }

  const supabase = await createClient();
  const { data: existing } = await supabase.from("newsletter_subscribers").select("id,aktif").eq("email", parsed.data.email).single();

  if (existing) {
    if (existing.aktif) return { success: false, message: "Email sudah terdaftar" };
    await supabase.from("newsletter_subscribers").update(statusPatch(true)).eq("email", parsed.data.email);
    return { success: true, message: "Berhasil berlangganan newsletter!" };
  }

  const { error } = await supabase.from("newsletter_subscribers").insert({
    email: parsed.data.email,
    nama: parsed.data.nama || null,
    aktif: true,
    token_unsubscribe: randomUUID(),
  });
  if (error) throw error;
  return { success: true, message: "Berhasil berlangganan newsletter!" };
}

export async function unsubscribeNewsletter(token: string) {
  const parsed = uuidSchema.safeParse(token);
  if (!parsed.success) return { success: false, message: "Token unsubscribe tidak valid" };

  const supabase = await createClient();
  const { error } = await supabase.from("newsletter_subscribers").update(statusPatch(false)).eq("token_unsubscribe", parsed.data);
  if (error) throw error;
  return { success: true, message: "Berhasil berhenti berlangganan" };
}

export async function getNewsletterSubscribers() {
  await requireAdmin();

  const supabase = await createClient();
  const { data, error } = await supabase.from("newsletter_subscribers").select("*").order("subscribed_at", { ascending: false }).limit(100);
  if (error) throw error;
  return data;
}

export async function getAdminNewsletterSubscribersPage(rawFilters: unknown) {
  await requireAdmin();

  const filters = adminNewsletterFilterSchema.parse(rawFilters ?? {});

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
  }>(`
    SELECT
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE aktif = true)::int AS active,
      COUNT(*) FILTER (WHERE aktif = false)::int AS inactive,
      COUNT(*) FILTER (WHERE subscribed_at >= NOW() - INTERVAL '7 days')::int AS recent
    FROM newsletter_subscribers
  `);

  return {
    total: row.total,
    active: row.active,
    inactive: row.inactive,
    recent: row.recent,
  };
}

export async function updateNewsletterSubscriberStatus(id: string, aktif: boolean) {
  await requireAdmin();
  const parsedId = uuidSchema.parse(id);
  const parsedPatch = newsletterPatchSchema.parse({ aktif });

  const supabase = await createClient();
  const { error } = await supabase.from("newsletter_subscribers").update(statusPatch(parsedPatch.aktif)).eq("id", parsedId);
  if (error) throw error;
  revalidatePath("/admin/newsletter");
  return { success: true };
}

export async function bulkUpdateNewsletterSubscribers(ids: string[], patch: { aktif: boolean }) {
  await requireAdmin();
  const parsedIds = uuidArraySchema.parse(ids);
  const parsedPatch = newsletterPatchSchema.parse(patch);

  const supabase = await createClient();
  const { error } = await supabase.from("newsletter_subscribers").update(statusPatch(parsedPatch.aktif)).in("id", parsedIds);
  if (error) throw error;
  revalidatePath("/admin/newsletter");
  return { success: true };
}

export async function bulkDeleteNewsletterSubscribers(ids: string[]) {
  await requireAdmin();
  const parsedIds = uuidArraySchema.parse(ids);

  const supabase = await createClient();
  const { error } = await supabase.from("newsletter_subscribers").delete().in("id", parsedIds);
  if (error) throw error;
  revalidatePath("/admin/newsletter");
  return { success: true };
}

const campaignSchema = z.object({
  subject: z.string().min(1).max(200).trim(),
  contentHtml: z.string().min(10),
});

export async function dispatchNewsletterCampaign(data: { subject: string; contentHtml: string }) {
  await requireAdmin();
  const parsed = campaignSchema.parse(data);

  const supabase = await createClient();
  const { data: subscribers, error } = await supabase
    .from("newsletter_subscribers")
    .select("email, nama, token_unsubscribe")
    .eq("aktif", true);

  if (error) throw error;
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
      const nameGreeting = sub.nama ? `Halo ${sub.nama},` : "Halo,";

      const wrappedHtml = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0b0f19; color: #f3f4f6; padding: 40px 20px; text-align: left;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #111827; border: 1px solid #1f2937; padding: 30px; border-radius: 8px;">
            <div style="text-align: center; margin-bottom: 25px;">
              <span style="font-size: 20px; font-weight: bold; color: #06b6d4; font-family: 'Orbitron', monospace; letter-spacing: 2px;">IRNK_CODES</span>
            </div>
            <div style="font-size: 15px; line-height: 1.6; color: #d1d5db; margin-bottom: 30px;">
              <p style="margin-bottom: 20px; font-weight: 500;">${nameGreeting}</p>
              ${parsed.contentHtml}
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
