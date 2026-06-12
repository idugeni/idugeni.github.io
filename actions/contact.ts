"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { queryPooler } from "@/lib/db/pooler";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/rbac";
import { rateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/security/server-action";
import { sendContactAutoReply, sendContactNotification, type EmailDeliveryStatus } from "@/lib/email/resend";
import type { Database } from "@/lib/supabase/types";

type ContactMessageRow = Database["public"]["Tables"]["contact_messages"]["Row"];
type ContactMessageUpdate = Database["public"]["Tables"]["contact_messages"]["Update"];

const contactSchema = z.object({
  nama: z.string().min(2).max(100).trim(),
  email: z.string().email().max(255),
  subjek: z.string().min(3).max(200).trim(),
  pesan: z.string().min(10).max(5000).trim(),
  noWa: z.string().max(20).optional(),
  layanan: z.string().max(100).optional(),
});

const uuidSchema = z.string().uuid();
const uuidArraySchema = z.array(uuidSchema).min(1).max(50);
const deliveryStatusSchema = z.enum(["pending", "sent", "skipped", "failed"]);

const adminMessagesFilterSchema = z.object({
  q: z.string().trim().max(100).optional(),
  read: z.enum(["read", "unread"]).optional(),
  replied: z.enum(["replied", "unreplied"]).optional(),
  resend: deliveryStatusSchema.optional(),
  service: z.string().trim().max(100).optional(),
  sort: z.enum(["date", "sender", "subject", "resend"]).optional().default("date"),
  order: z.enum(["asc", "desc"]).optional().default("desc"),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(5).max(50).optional().default(10),
});

const bulkPatchSchema = z.object({
  dibaca: z.boolean().optional(),
  dibalas: z.boolean().optional(),
}).refine((value) => value.dibaca !== undefined || value.dibalas !== undefined, {
  message: "At least one field must be updated",
});

function truncateReason(reason?: string) {
  if (!reason) return null;
  return reason.slice(0, 500);
}

function toResendUpdate(
  adminNotification: { status: EmailDeliveryStatus; id?: string; reason?: string },
  autoReply: { status: EmailDeliveryStatus; id?: string; reason?: string },
): ContactMessageUpdate {
  const sentAt = adminNotification.status === "sent" || autoReply.status === "sent" ? new Date().toISOString() : null;

  return {
    resend_admin_status: adminNotification.status,
    resend_admin_email_id: adminNotification.id ?? null,
    resend_admin_error: truncateReason(adminNotification.reason),
    resend_auto_reply_status: autoReply.status,
    resend_auto_reply_email_id: autoReply.id ?? null,
    resend_auto_reply_error: truncateReason(autoReply.reason),
    resend_sent_at: sentAt,
  };
}

function getSortColumn(sort: z.infer<typeof adminMessagesFilterSchema>["sort"]) {
  if (sort === "sender") return "nama";
  if (sort === "subject") return "subjek";
  if (sort === "resend") return "resend_admin_status";
  return "created_at";
}

export async function submitContactMessage(data: { nama: string; email: string; subjek: string; pesan: string; noWa?: string; layanan?: string }) {
  const ip = await getClientIp();
  await rateLimit(ip, "contact", { max: 5, window: 15 * 60 * 1000 });

  const parsed = contactSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error("Data tidak valid: " + parsed.error.issues[0].message);
  }

  const supabase = await createClient();
  const messagePayload = {
    nama: parsed.data.nama,
    email: parsed.data.email,
    subjek: parsed.data.subjek,
    pesan: parsed.data.pesan,
    noWa: parsed.data.noWa || undefined,
    layanan: parsed.data.layanan || undefined,
  };

  const { data: insertedMessage, error } = await supabase.from("contact_messages").insert({
    nama: messagePayload.nama,
    email: messagePayload.email,
    subjek: messagePayload.subjek,
    pesan: messagePayload.pesan,
    no_wa: messagePayload.noWa || null,
    layanan: messagePayload.layanan || null,
    resend_admin_status: "pending",
    resend_auto_reply_status: process.env.CONTACT_AUTO_REPLY_ENABLED === "true" ? "pending" : "skipped",
  }).select("id").single();
  if (error) throw error;

  const [adminNotification, autoReply] = await Promise.all([
    sendContactNotification(messagePayload),
    sendContactAutoReply(messagePayload),
  ]);

  const deliveryUpdate = toResendUpdate(adminNotification, autoReply);
  const { error: deliveryError } = await supabase
    .from("contact_messages")
    .update(deliveryUpdate)
    .eq("id", insertedMessage.id);

  if (deliveryError) {
    console.error("Failed to persist contact Resend delivery status", deliveryError);
  }

  return {
    success: true,
    message: "Pesan berhasil dikirim! Kami akan menghubungi Anda segera.",
    email: {
      adminNotification: adminNotification.status,
      autoReply: autoReply.status,
    },
  };
}

export async function getContactMessages(filters?: { dibaca?: boolean }) {
  await requireAdmin();

  const supabase = await createClient();
  let query = supabase.from("contact_messages").select("*").order("created_at", { ascending: false });
  if (filters?.dibaca === false) query = query.eq("dibaca", false);
  if (filters?.dibaca === true) query = query.eq("dibaca", true);
  const { data, error } = await query.limit(100);
  if (error) throw error;
  return data;
}

export async function getAdminContactMessagesPage(rawFilters: unknown) {
  await requireAdmin();

  const filters = adminMessagesFilterSchema.parse(rawFilters ?? {});
  const from = (filters.page - 1) * filters.pageSize;

  const conditions: string[] = [];
  const params: unknown[] = [];
  let idx = 1;

  if (filters.q) {
    const escaped = filters.q.replace(/[%_]/g, "\\$&");
    const ilikePattern = `%${escaped}%`;
    conditions.push(`(
      cm.nama ILIKE $${idx} ESCAPE '\\'
      OR cm.email ILIKE $${idx} ESCAPE '\\'
      OR cm.subjek ILIKE $${idx} ESCAPE '\\'
      OR cm.pesan ILIKE $${idx} ESCAPE '\\'
    )`);
    params.push(ilikePattern);
    idx++;
  }
  if (filters.read === "read") {
    conditions.push(`cm.dibaca = true`);
  }
  if (filters.read === "unread") {
    conditions.push(`cm.dibaca = false`);
  }
  if (filters.replied === "replied") {
    conditions.push(`cm.dibalas = true`);
  }
  if (filters.replied === "unreplied") {
    conditions.push(`cm.dibalas = false`);
  }
  if (filters.resend) {
    conditions.push(`cm.resend_admin_status = $${idx++}`);
    params.push(filters.resend);
  }
  if (filters.service) {
    conditions.push(`cm.layanan = $${idx++}`);
    params.push(filters.service);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const sortColumn = getSortColumn(filters.sort);
  const sortDirection = filters.order === "asc" ? "ASC" : "DESC";

  const countResult = await queryPooler<{ count: number }>(
    `SELECT COUNT(*)::int AS count FROM contact_messages cm ${whereClause}`,
    params,
  );
  const totalItems = countResult[0]?.count ?? 0;

  const limitIdx = idx++;
  const offsetIdx = idx++;
  const dataParams = [...params, filters.pageSize, from];

  const data = await queryPooler<ContactMessageRow>(
    `SELECT * FROM contact_messages cm ${whereClause} ORDER BY cm.${sortColumn} ${sortDirection} LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
    dataParams,
  );

  return {
    messages: (data ?? []) as ContactMessageRow[],
    pagination: {
      page: filters.page,
      pageSize: filters.pageSize,
      totalItems,
      totalPages: Math.max(1, Math.ceil(totalItems / filters.pageSize)),
    },
    filters,
  };
}

export async function getContactMessageStats() {
  await requireAdmin();

  const [row] = await queryPooler<{
    total: number;
    unread: number;
    unreplied: number;
    replied: number;
    resend_sent: number;
    resend_failed: number;
    resend_skipped: number;
  }>(
    `SELECT
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE NOT dibaca)::int AS unread,
      COUNT(*) FILTER (WHERE NOT dibalas)::int AS unreplied,
      COUNT(*) FILTER (WHERE dibalas)::int AS replied,
      COUNT(*) FILTER (WHERE resend_admin_status = 'sent')::int AS resend_sent,
      COUNT(*) FILTER (WHERE resend_admin_status = 'failed')::int AS resend_failed,
      COUNT(*) FILTER (WHERE resend_admin_status = 'skipped')::int AS resend_skipped
    FROM contact_messages`,
  );

  return {
    total: row?.total ?? 0,
    unread: row?.unread ?? 0,
    unreplied: row?.unreplied ?? 0,
    replied: row?.replied ?? 0,
    resendSent: row?.resend_sent ?? 0,
    resendFailed: row?.resend_failed ?? 0,
    resendSkipped: row?.resend_skipped ?? 0,
  };
}

export async function getContactMessageServices() {
  await requireAdmin();

  const rows = await queryPooler<{ layanan: string }>(
    `SELECT DISTINCT layanan FROM contact_messages WHERE layanan IS NOT NULL ORDER BY layanan ASC`,
  );
  return rows.map((row) => row.layanan) as string[];
}

export async function markMessageRead(id: string) {
  await requireAdmin();

  const parsed = uuidSchema.safeParse(id);
  if (!parsed.success) {
    throw new Error("Invalid message ID: must be a valid UUID");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("contact_messages").update({ dibaca: true }).eq("id", parsed.data);
  if (error) throw error;
  revalidatePath("/admin/messages");
  return { success: true };
}

export async function markMessageReplied(id: string) {
  await requireAdmin();

  const parsed = uuidSchema.safeParse(id);
  if (!parsed.success) {
    throw new Error("Invalid message ID: must be a valid UUID");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("contact_messages")
    .update({ dibaca: true, dibalas: true, replied_at: new Date().toISOString() })
    .eq("id", parsed.data);
  if (error) throw error;
  revalidatePath("/admin/messages");
  return { success: true };
}

export async function bulkUpdateContactMessages(ids: string[], patch: { dibaca?: boolean; dibalas?: boolean }) {
  await requireAdmin();

  const parsedIds = uuidArraySchema.parse(ids);
  const parsedPatch = bulkPatchSchema.parse(patch);
  const updatePatch: ContactMessageUpdate = { ...parsedPatch };

  if (parsedPatch.dibalas === true) {
    updatePatch.dibaca = true;
    updatePatch.replied_at = new Date().toISOString();
  }
  if (parsedPatch.dibalas === false) {
    updatePatch.replied_at = null;
  }

  const supabase = await createClient();
  const { error } = await supabase.from("contact_messages").update(updatePatch).in("id", parsedIds);
  if (error) throw error;
  revalidatePath("/admin/messages");
  return { success: true };
}

export async function bulkDeleteContactMessages(ids: string[]) {
  await requireAdmin();

  const parsedIds = uuidArraySchema.parse(ids);
  const supabase = await createClient();
  const { error } = await supabase.from("contact_messages").delete().in("id", parsedIds);
  if (error) throw error;
  revalidatePath("/admin/messages");
  return { success: true };
}

export async function retryContactMessageNotification(id: string) {
  await requireAdmin();

  const parsed = uuidSchema.safeParse(id);
  if (!parsed.success) {
    throw new Error("Invalid message ID: must be a valid UUID");
  }

  const supabase = await createClient();
  const { data: message, error } = await supabase
    .from("contact_messages")
    .select("*")
    .eq("id", parsed.data)
    .single();
  if (error) throw error;

  const adminNotification = await sendContactNotification({
    nama: message.nama,
    email: message.email,
    subjek: message.subjek,
    pesan: message.pesan,
    noWa: message.no_wa ?? undefined,
    layanan: message.layanan ?? undefined,
  });

  const { error: updateError } = await supabase
    .from("contact_messages")
    .update({
      resend_admin_status: adminNotification.status,
      resend_admin_email_id: adminNotification.id ?? null,
      resend_admin_error: truncateReason(adminNotification.reason),
      resend_sent_at: adminNotification.status === "sent" ? new Date().toISOString() : message.resend_sent_at,
    })
    .eq("id", parsed.data);

  if (updateError) throw updateError;
  revalidatePath("/admin/messages");
  return { success: true, email: adminNotification };
}
