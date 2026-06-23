"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
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

  const csrfToken = data.csrf_token;
  if (!csrfToken || !validateCSRFToken(csrfToken)) {
    throw new Error("Invalid security token. Please refresh the page and try again.");
  }

  const parsed = contactSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error("Invalid input");
  }

  const supabase = createAdminClient();

  const messagePayload = {
    nama: parsed.data.nama,
    email: parsed.data.email,
    subjek: parsed.data.subjek,
    pesan: parsed.data.pesan,
    noWa: parsed.data.noWa || undefined,
    layanan: parsed.data.layanan || undefined,
    attachments: parsed.data.attachments || [],
  };

  const { data: insertedMessage, error: insertError } = await supabase
    .from("contact_messages")
    .insert({
      nama: messagePayload.nama,
      email: messagePayload.email,
      subjek: messagePayload.subjek,
      pesan: messagePayload.pesan,
      no_wa: messagePayload.noWa || null,
      layanan: messagePayload.layanan || null,
      attachments: messagePayload.attachments,
      resend_admin_status: "pending",
      resend_auto_reply_status: process.env.CONTACT_AUTO_REPLY_ENABLED === "true" ? "pending" : "skipped",
    })
    .select("id")
    .single();

  if (insertError || !insertedMessage) {
    throw new Error(insertError?.message || "Failed to insert contact message");
  }

  const [adminNotification, autoReply] = await Promise.all([
    sendContactNotification(messagePayload),
    sendContactAutoReply(messagePayload),
  ]);

  const deliveryUpdate = toResendUpdate(adminNotification, autoReply);

  try {
    await supabase
      .from("contact_messages")
      .update({
        resend_admin_status: deliveryUpdate.resend_admin_status,
        resend_admin_email_id: deliveryUpdate.resend_admin_email_id,
        resend_admin_error: deliveryUpdate.resend_admin_error,
        resend_auto_reply_status: deliveryUpdate.resend_auto_reply_status,
        resend_auto_reply_email_id: deliveryUpdate.resend_auto_reply_email_id,
        resend_auto_reply_error: deliveryUpdate.resend_auto_reply_error,
        resend_sent_at: deliveryUpdate.resend_sent_at,
      })
      .eq("id", insertedMessage.id);
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
  const supabase = createAdminClient();

  let query = supabase
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  if (filters?.dibaca === false) {
    query = query.eq("dibaca", false);
  }
  if (filters?.dibaca === true) {
    query = query.eq("dibaca", true);
  }

  const { data } = await query;
  return (data ?? []) as ContactMessageRow[];
}

export async function getAdminContactMessagesPage(rawFilters: unknown) {
  await requireAdmin();

  const filtersParsed = adminMessagesFilterSchema.safeParse(rawFilters ?? {});
  if (!filtersParsed.success) throw new Error("Invalid input");
  const filters = filtersParsed.data;

  const supabase = createAdminClient();
  const from = (filters.page - 1) * filters.pageSize;

  let query = supabase
    .from("contact_messages")
    .select("*", { count: "exact" });

  if (filters.q) {
    const escaped = filters.q.replace(/[%_]/g, "\\$&");
    const pattern = `%${escaped}%`;
    query = query.or(
      `nama.ilike.${pattern},email.ilike.${pattern},subjek.ilike.${pattern},pesan.ilike.${pattern}`
    );
  }
  if (filters.read === "read") {
    query = query.eq("dibaca", true);
  }
  if (filters.read === "unread") {
    query = query.eq("dibaca", false);
  }
  if (filters.replied === "replied") {
    query = query.eq("dibalas", true);
  }
  if (filters.replied === "unreplied") {
    query = query.eq("dibalas", false);
  }
  if (filters.resend) {
    query = query.eq("resend_admin_status", filters.resend);
  }
  if (filters.service) {
    query = query.eq("layanan", filters.service);
  }

  const sortColumn = getSortColumn(filters.sort);

  const { data, count } = await query
    .order(sortColumn, { ascending: filters.order === "asc" })
    .range(from, from + filters.pageSize - 1);

  const totalItems = count ?? 0;

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
  const supabase = createAdminClient();

  async function countWithFilter(filters?: { [key: string]: any }) {
    let query = supabase
      .from("contact_messages")
      .select("*", { count: "exact", head: true });

    if (filters) {
      for (const [key, value] of Object.entries(filters)) {
        if (value === null) {
          query = query.is(key, null);
        } else {
          query = query.eq(key, value);
        }
      }
    }

    const { count } = await query;
    return count ?? 0;
  }

  const [total, unread, unreplied, replied, resendSent, resendFailed, resendSkipped] = await Promise.all([
    countWithFilter(),
    countWithFilter({ dibaca: false }),
    countWithFilter({ dibalas: false }),
    countWithFilter({ dibalas: true }),
    countWithFilter({ resend_admin_status: "sent" }),
    countWithFilter({ resend_admin_status: "failed" }),
    countWithFilter({ resend_admin_status: "skipped" }),
  ]);

  return {
    total,
    unread,
    unreplied,
    replied,
    resendSent,
    resendFailed,
    resendSkipped,
  };
}

export async function getContactMessageServices() {
  await requireAdmin();
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("contact_messages")
    .select("layanan")
    .not("layanan", "is", null)
    .order("layanan", { ascending: true });

  const uniqueServices = [...new Set(
    (data ?? []).map((row) => row.layanan).filter(Boolean)
  )] as string[];

  return uniqueServices;
}

export async function markMessageRead(id: string) {
  await requireAdmin();

  const parsed = uuidSchema.safeParse(id);
  if (!parsed.success) {
    throw new Error("Invalid message ID: must be a valid UUID");
  }

  const supabase = createAdminClient();
  await supabase
    .from("contact_messages")
    .update({ dibaca: true })
    .eq("id", parsed.data);

  revalidatePath("/admin/messages");
  return { success: true };
}

export async function markMessageReplied(id: string) {
  await requireAdmin();

  const parsed = uuidSchema.safeParse(id);
  if (!parsed.success) {
    throw new Error("Invalid message ID: must be a valid UUID");
  }

  const supabase = createAdminClient();
  await supabase
    .from("contact_messages")
    .update({ dibaca: true, dibalas: true, replied_at: new Date().toISOString() })
    .eq("id", parsed.data);

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

  const supabase = createAdminClient();
  await supabase
    .from("contact_messages")
    .update(updatePatch)
    .in("id", parsedIds);

  revalidatePath("/admin/messages");
  return { success: true };
}

export async function bulkDeleteContactMessages(ids: string[]) {
  await requireAdmin();

  const parsedIdsResult = uuidArraySchema.safeParse(ids);
  if (!parsedIdsResult.success) throw new Error("Invalid input");
  const parsedIds = parsedIdsResult.data;

  const supabase = createAdminClient();

  const { data: messages } = await supabase
    .from("contact_messages")
    .select("id, attachments")
    .in("id", parsedIds);

  const storagePaths: string[] = [];
  for (const msg of messages ?? []) {
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

  await supabase
    .from("contact_messages")
    .delete()
    .in("id", parsedIds);

  revalidatePath("/admin/messages");
  return { success: true };
}

export async function retryContactMessageNotification(id: string) {
  await requireAdmin();

  const parsed = uuidSchema.safeParse(id);
  if (!parsed.success) {
    throw new Error("Invalid message ID: must be a valid UUID");
  }

  const supabase = createAdminClient();

  const { data: message } = await supabase
    .from("contact_messages")
    .select("*")
    .eq("id", parsed.data)
    .maybeSingle();

  if (!message) throw new Error("Contact message not found");

  const adminNotification = await sendContactNotification({
    nama: message.nama,
    email: message.email,
    subjek: message.subjek,
    pesan: message.pesan,
    noWa: message.no_wa ?? undefined,
    layanan: message.layanan ?? undefined,
  });

  await supabase
    .from("contact_messages")
    .update({
      resend_admin_status: adminNotification.status,
      resend_admin_email_id: adminNotification.id ?? null,
      resend_admin_error: truncateReason(adminNotification.reason),
      resend_sent_at: adminNotification.status === "sent" ? new Date().toISOString() : (message.resend_sent_at ?? null),
    })
    .eq("id", parsed.data);

  revalidatePath("/admin/messages");
  return { success: true, email: adminNotification };
}
