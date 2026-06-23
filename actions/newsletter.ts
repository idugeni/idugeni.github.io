"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { z } from "zod";
import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase/admin";
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

  const supabase = createAdminClient();

  const { data: existing } = await supabase
    .from("newsletter_subscribers")
    .select("id, aktif, confirmed, confirmation_token")
    .eq("email", parsed.data.email)
    .maybeSingle();

  // Case 1: Email already exists and is confirmed + active
  if (existing && existing.confirmed && existing.aktif) {
    return { success: false, message: "Email sudah terdaftar dan aktif." };
  }

  // Case 2: Email exists but not confirmed yet (resend confirmation email)
  if (existing && !existing.confirmed) {
    const newToken = generateConfirmationToken();
    await supabase
      .from("newsletter_subscribers")
      .update({ confirmation_token: newToken })
      .eq("id", existing.id);

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
    await supabase
      .from("newsletter_subscribers")
      .update({
        aktif: true,
        confirmed: false,
        confirmation_token: newToken,
        unsubscribed_at: null,
      })
      .eq("id", existing.id);

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

  await supabase.from("newsletter_subscribers").insert({
    email: parsed.data.email,
    nama: parsed.data.nama || null,
    aktif: true,
    confirmed: false,
    confirmation_token: confirmationToken,
    token_unsubscribe: unsubscribeToken,
  });

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

  const supabase = createAdminClient();

  const { data: subscriber } = await supabase
    .from("newsletter_subscribers")
    .select("id, email, confirmed, aktif")
    .eq("token_unsubscribe", parsed.data)
    .maybeSingle();

  if (!subscriber) {
    return { success: false, message: "Token unsubscribe tidak ditemukan. Silakan periksa kembali link yang Anda klik." };
  }

  if (!subscriber.aktif) {
    return { success: true, message: "Anda sudah tidak berlangganan newsletter kami." };
  }

  await supabase
    .from("newsletter_subscribers")
    .update({ aktif: false, unsubscribed_at: new Date().toISOString() })
    .eq("token_unsubscribe", parsed.data);

  return { success: true, message: "Berhasil berhenti berlangganan newsletter IRNK Codes." };
}

export async function getNewsletterSubscribers() {
  await requireAdmin();

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("newsletter_subscribers")
    .select("*")
    .order("subscribed_at", { ascending: false })
    .limit(100);
  if (error) throw error;
  return data ?? [];
}

export async function getAdminNewsletterSubscribersPage(rawFilters: unknown) {
  await requireAdmin();

  const filtersParsed = adminNewsletterFilterSchema.safeParse(rawFilters ?? {});
  if (!filtersParsed.success) throw new Error("Invalid input");
  const filters = filtersParsed.data;

  const sortCol = getNewsletterSortColumn(filters.sort);
  const sortAscending = filters.order === "asc";
  const limit = filters.pageSize;
  const offset = (filters.page - 1) * filters.pageSize;

  const supabase = createAdminClient();

  function applyFilters(q: any) {
    if (filters.q) {
      q = q.or(`email.ilike.%${filters.q}%,nama.ilike.%${filters.q}%`);
    }
    if (filters.status === "active") {
      q = q.eq("aktif", true);
    }
    if (filters.status === "inactive") {
      q = q.eq("aktif", false);
    }
    return q;
  }

  const [countResult, dataResult] = await Promise.all([
    applyFilters(supabase.from("newsletter_subscribers").select("*", { count: "exact", head: true })),
    applyFilters(supabase.from("newsletter_subscribers").select("*"))
      .order(sortCol, { ascending: sortAscending })
      .range(offset, offset + limit - 1),
  ]);

  const totalItems = countResult.count ?? 0;
  return {
    subscribers: dataResult.data ?? [],
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
  const supabase = createAdminClient();

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [totalRes, activeRes, inactiveRes, recentRes, confirmedRes, unconfirmedRes] = await Promise.all([
    supabase.from("newsletter_subscribers").select("*", { count: "exact", head: true }),
    supabase.from("newsletter_subscribers").select("*", { count: "exact", head: true }).eq("aktif", true),
    supabase.from("newsletter_subscribers").select("*", { count: "exact", head: true }).eq("aktif", false),
    supabase.from("newsletter_subscribers").select("*", { count: "exact", head: true }).gte("subscribed_at", sevenDaysAgo),
    supabase.from("newsletter_subscribers").select("*", { count: "exact", head: true }).eq("confirmed", true),
    supabase.from("newsletter_subscribers").select("*", { count: "exact", head: true }).eq("confirmed", false),
  ]);

  const total = totalRes.count ?? 0;
  const confirmed = confirmedRes.count ?? 0;
  const confirmationRate = total === 0 ? 0 : Math.round((confirmed / total) * 10000) / 100;

  return {
    total,
    active: activeRes.count ?? 0,
    inactive: inactiveRes.count ?? 0,
    recent: recentRes.count ?? 0,
    confirmed,
    unconfirmed: unconfirmedRes.count ?? 0,
    confirmationRate,
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

  const supabase = createAdminClient();
  const unsubscribedAt = parsedPatch.aktif ? null : new Date().toISOString();
  await supabase
    .from("newsletter_subscribers")
    .update({ aktif: parsedPatch.aktif, unsubscribed_at: unsubscribedAt })
    .eq("id", parsedId);

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

  const supabase = createAdminClient();
  const unsubscribedAt = parsedPatch.aktif ? null : new Date().toISOString();
  await supabase
    .from("newsletter_subscribers")
    .update({ aktif: parsedPatch.aktif, unsubscribed_at: unsubscribedAt })
    .in("id", parsedIds);

  revalidatePath("/admin/newsletter");
  return { success: true };
}

export async function bulkDeleteNewsletterSubscribers(ids: string[]) {
  await requireAdmin();
  const parsedIdsResult = uuidArraySchema.safeParse(ids);
  if (!parsedIdsResult.success) throw new Error("Invalid input");
  const parsedIds = parsedIdsResult.data;

  const supabase = createAdminClient();
  await supabase.from("newsletter_subscribers").delete().in("id", parsedIds);

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

  const supabase = createAdminClient();
  const { data: subscribers } = await supabase
    .from("newsletter_subscribers")
    .select("email, nama, token_unsubscribe")
    .eq("aktif", true)
    .eq("confirmed", true);

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
