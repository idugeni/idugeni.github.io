"use server";

import { revalidatePath } from "next/cache";
import { sql } from "kysely";
import { queryPooler } from "@/lib/db/pooler";
import { db } from "@/lib/db/kysely";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/rbac";
import { rateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/security/server-action";
import { validateCSRFToken } from "@/lib/security/csrf";
import { sendContactAutoReply, sendContactNotification, type EmailDeliveryStatus } from "@/lib/email/resend";
import type { Database } from "@/lib/supabase/types";
import { deleteAttachments, extractStoragePath } from "@/lib/supabase/storage";

type ContactMessageRow = Database["public"]["Tables"]["contact_messages"]["Row"];
type ContactMessageUpdate = Database["public"]["Tables"]["contact_messages"]["Update"];

const attachmentSchema = z.object({
  url: z.string().url(),
  filename: z.string().max(255),
  size: z.number().int().positive(),
  type: z.string().max(50),
});

const contactSchema = z.object({
  nama: z.string().min(2).max(100).trim(),
  email: z.string().email().max(255),
  subjek: z.string().min(3).max(200).trim(),
  pesan: z.string().min(10).max(5000).trim(),
  noWa: z.string().max(20).optional(),
  layanan: z.string().max(100).optional(),
  attachments: z.array(attachmentSchema).max(5).optional(),
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

export async function submitContactMessage(data: { nama: string; email: string; subjek: string; pesan: string; noWa?: string; layanan?: string; csrf_token?: string; attachments?: Array<{url: string; filename: string; size: number; type: string}> }) {
  const ip = await getClientIp();
  await rateLimit(ip, "contact", { max: 5, window: 15 * 60 * 1000 });

  // Validate CSRF token
  const csrfToken = data.csrf_token;
  if (!csrfToken || !validateCSRFToken(csrfToken)) {
    throw new Error("Invalid security token. Please refresh the page and try again.");
  }

  const parsed = contactSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error("Invalid input");
  }

  const messagePayload = {
    nama: parsed.data.nama,
    email: parsed.data.email,
    subjek: parsed.data.subjek,
    pesan: parsed.data.pesan,
    noWa: parsed.data.noWa || undefined,
    layanan: parsed.data.layanan || undefined,
    attachments: parsed.data.attachments || [],
  };

  const [insertedMessage] = await db
    .insertInto("contact_messages")
    .values({
      nama: messagePayload.nama,
      email: messagePayload.email,
      subjek: messagePayload.subjek,
      pesan: messagePayload.pesan,
      no_wa: messagePayload.noWa || null,
      layanan: messagePayload.layanan || null,
      attachments: sql<string[]>`${JSON.stringify(messagePayload.attachments)}::jsonb`,
      resend_admin_status: "pending",
      resend_auto_reply_status: process.env.CONTACT_AUTO_REPLY_ENABLED === "true" ? "pending" : "skipped",
    })
    .returning("id")
    .execute();

  const [adminNotification, autoReply] = await Promise.all([
    sendContactNotification(messagePayload),
    sendContactAutoReply(messagePayload),
  ]);

  const deliveryUpdate = toResendUpdate(adminNotification, autoReply);

  try {
    await db
      .updateTable("contact_messages")
      .set({
        resend_admin_status: deliveryUpdate.resend_admin_status,
        resend_admin_email_id: deliveryUpdate.resend_admin_email_id,
        resend_admin_error: deliveryUpdate.resend_admin_error,
        resend_auto_reply_status: deliveryUpdate.resend_auto_reply_status,
        resend_auto_reply_email_id: deliveryUpdate.resend_auto_reply_email_id,
        resend_auto_reply_error: deliveryUpdate.resend_auto_reply_error,
        resend_sent_at: deliveryUpdate.resend_sent_at,
      })
      .where("id", "=", insertedMessage.id)
      .execute();
  } catch (deliveryError) {
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

  const conditions: string[] = [];
  const params: unknown[] = [];
  let idx = 1;
  if (filters?.dibaca === false) {
    conditions.push(`dibaca = $${idx}`);
    params.push(false);
    idx++;
  }
  if (filters?.dibaca === true) {
    conditions.push(`dibaca = $${idx}`);
    params.push(true);
    idx++;
  }
  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  return await queryPooler(`SELECT * FROM contact_messages ${where} ORDER BY created_at DESC LIMIT 100`, params);
}

export async function getAdminContactMessagesPage(rawFilters: unknown) {
  await requireAdmin();

  const filtersParsed = adminMessagesFilterSchema.safeParse(rawFilters ?? {});
  if (!filtersParsed.success) throw new Error("Invalid input");
  const filters = filtersParsed.data;
  const from = (filters.page - 1) * filters.pageSize;

  const conditions: string[] = [];
  const params: unknown[] = [];
  let idx = 1;

  if (filters.q) {
    const escaped = filters.q.replace(/[%_]/g, "\\$&");
    const ilikePattern = `%${escaped}%`;
    conditions.push(`(
      cm.nama ILIKE $${idx} ESCAPE '\\\\'
      OR cm.email ILIKE $${idx + 1} ESCAPE '\\\\'
      OR cm.subjek ILIKE $${idx + 2} ESCAPE '\\\\'
      OR cm.pesan ILIKE $${idx + 3} ESCAPE '\\\\'
    )`);
    params.push(ilikePattern, ilikePattern, ilikePattern, ilikePattern);
    idx += 4;
  }
  if (filters.read === "read") {
    conditions.push("cm.dibaca = true");
  }
  if (filters.read === "unread") {
    conditions.push("cm.dibaca = false");
  }
  if (filters.replied === "replied") {
    conditions.push("cm.dibalas = true");
  }
  if (filters.replied === "unreplied") {
    conditions.push("cm.dibalas = false");
  }
  if (filters.resend) {
    conditions.push(`cm.resend_admin_status = $${idx}`);
    params.push(filters.resend);
    idx++;
  }
  if (filters.service) {
    conditions.push(`cm.layanan = $${idx}`);
    params.push(filters.service);
    idx++;
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

  const rows = await db
    .selectFrom("contact_messages")
    .select("layanan")
    .where("layanan", "is not", null)
    .distinct()
    .orderBy("layanan", "asc")
    .execute();
  return rows.map((row) => row.layanan as string);
}

export async function markMessageRead(id: string) {
  await requireAdmin();

  const parsed = uuidSchema.safeParse(id);
  if (!parsed.success) {
    throw new Error("Invalid message ID: must be a valid UUID");
  }

  await db
    .updateTable("contact_messages")
    .set({ dibaca: true })
    .where("id", "=", parsed.data)
    .execute();
  revalidatePath("/admin/messages");
  return { success: true };
}

export async function markMessageReplied(id: string) {
  await requireAdmin();

  const parsed = uuidSchema.safeParse(id);
  if (!parsed.success) {
    throw new Error("Invalid message ID: must be a valid UUID");
  }

  await db
    .updateTable("contact_messages")
    .set({ dibaca: true, dibalas: true, replied_at: new Date().toISOString() })
    .where("id", "=", parsed.data)
    .execute();
  revalidatePath("/admin/messages");
  return { success: true };
}

export async function bulkUpdateContactMessages(ids: string[], patch: { dibaca?: boolean; dibalas?: boolean }) {
  await requireAdmin();

  const parsedIdsResult = uuidArraySchema.safeParse(ids);
  if (!parsedIdsResult.success) throw new Error("Invalid input");
  const parsedIds = parsedIdsResult.data;
  const parsedPatchResult = bulkPatchSchema.safeParse(patch);
  if (!parsedPatchResult.success) throw new Error("Invalid input");
  const parsedPatch = parsedPatchResult.data;
  const updatePatch: ContactMessageUpdate = { ...parsedPatch };

  if (parsedPatch.dibalas === true) {
    updatePatch.dibaca = true;
    updatePatch.replied_at = new Date().toISOString();
  }
  if (parsedPatch.dibalas === false) {
    updatePatch.replied_at = null;
  }

  const columns = Object.keys(updatePatch);
  const values = Object.values(updatePatch);
  const setClauses = columns.map((col, i) => `${col} = $${i + 1}`).join(", ");
  const placeholders = parsedIds.map((_, i) => `$${i + columns.length + 1}`).join(", ");
  await queryPooler(
    `UPDATE contact_messages SET ${setClauses} WHERE id IN (${placeholders})`,
    [...values, ...parsedIds],
  );
  revalidatePath("/admin/messages");
  return { success: true };
}

export async function bulkDeleteContactMessages(ids: string[]) {
  await requireAdmin();

  const parsedIdsResult = uuidArraySchema.safeParse(ids);
  if (!parsedIdsResult.success) throw new Error("Invalid input");
  const parsedIds = parsedIdsResult.data;
  const placeholders = parsedIds.map((_, i) => `$${i + 1}`).join(", ");

  // Fetch attachments for the messages to be deleted
  const messages = await queryPooler<{ id: string; attachments: Array<{ url: string }> }>(
    `SELECT id, attachments FROM contact_messages WHERE id IN (${placeholders})`,
    parsedIds
  );

  // Extract storage paths and delete from Supabase Storage
  const storagePaths: string[] = [];
  for (const msg of messages) {
    if (msg.attachments && Array.isArray(msg.attachments)) {
      for (const att of msg.attachments) {
        const path = extractStoragePath(att.url);
        if (path) storagePaths.push(path);
      }
    }
  }

  if (storagePaths.length > 0) {
    await deleteAttachments(storagePaths);
  }

  // Delete from database
  await queryPooler(`DELETE FROM contact_messages WHERE id IN (${placeholders})`, parsedIds);
  revalidatePath("/admin/messages");
  return { success: true };
}

export async function retryContactMessageNotification(id: string) {
  await requireAdmin();

  const parsed = uuidSchema.safeParse(id);
  if (!parsed.success) {
    throw new Error("Invalid message ID: must be a valid UUID");
  }

  const message = await db
    .selectFrom("contact_messages")
    .selectAll()
    .where("id", "=", parsed.data)
    .executeTakeFirst();
  if (!message) throw new Error("Contact message not found");

  const adminNotification = await sendContactNotification({
    nama: message.nama,
    email: message.email,
    subjek: message.subjek,
    pesan: message.pesan,
    noWa: message.no_wa ?? undefined,
    layanan: message.layanan ?? undefined,
  });

  await db
    .updateTable("contact_messages")
    .set({
      resend_admin_status: adminNotification.status,
      resend_admin_email_id: adminNotification.id ?? null,
      resend_admin_error: truncateReason(adminNotification.reason),
      resend_sent_at: adminNotification.status === "sent" ? new Date().toISOString() : (message.resend_sent_at ?? null),
    })
    .where("id", "=", parsed.data)
    .execute();
  revalidatePath("/admin/messages");
  return { success: true, email: adminNotification };
}
