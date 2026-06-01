import "server-only";

import { Resend } from "resend";

interface ContactMessagePayload {
  nama: string;
  email: string;
  subjek: string;
  pesan: string;
  noWa?: string;
  layanan?: string;
}

export type EmailDeliveryStatus = "sent" | "skipped" | "failed";

export interface EmailDeliveryResult {
  status: EmailDeliveryStatus;
  id?: string;
  reason?: string;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  return apiKey ? new Resend(apiKey) : null;
}

function getFromEmail() {
  return process.env.RESEND_FROM_EMAIL || "IRNK Codes <onboarding@resend.dev>";
}

function getContactRecipient() {
  const explicitRecipient = process.env.CONTACT_TO_EMAIL?.trim();
  if (explicitRecipient) return explicitRecipient;
  return process.env.ADMIN_EMAILS?.split(",").map((email) => email.trim()).filter(Boolean)[0];
}

function buildAdminHtml(message: ContactMessagePayload) {
  const rows = [
    ["Nama", message.nama],
    ["Email", message.email],
    ["WhatsApp", message.noWa || "-"],
    ["Layanan", message.layanan || "-"],
    ["Subjek", message.subjek],
  ];

  return `
    <div style="font-family:Inter,Arial,sans-serif;line-height:1.6;color:#111827">
      <h1 style="margin:0 0 16px;color:#0891b2">New Contact Transmission</h1>
      <p style="margin:0 0 20px;color:#4b5563">A new message was submitted from the IRNK Codes contact page.</p>
      <table style="border-collapse:collapse;width:100%;margin-bottom:20px">
        <tbody>
          ${rows.map(([label, value]) => `
            <tr>
              <td style="border:1px solid #e5e7eb;padding:8px 10px;font-weight:700;width:140px">${escapeHtml(label)}</td>
              <td style="border:1px solid #e5e7eb;padding:8px 10px">${escapeHtml(value)}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
      <div style="border:1px solid #e5e7eb;padding:16px;background:#f9fafb">
        <h2 style="font-size:16px;margin:0 0 8px">Message</h2>
        <p style="white-space:pre-wrap;margin:0">${escapeHtml(message.pesan)}</p>
      </div>
    </div>
  `;
}

function buildAdminText(message: ContactMessagePayload) {
  return [
    "New Contact Transmission",
    "",
    `Nama: ${message.nama}`,
    `Email: ${message.email}`,
    `WhatsApp: ${message.noWa || "-"}`,
    `Layanan: ${message.layanan || "-"}`,
    `Subjek: ${message.subjek}`,
    "",
    "Message:",
    message.pesan,
  ].join("\n");
}

function buildAutoReplyHtml(message: ContactMessagePayload) {
  return `
    <div style="font-family:Inter,Arial,sans-serif;line-height:1.6;color:#111827">
      <h1 style="margin:0 0 16px;color:#0891b2">Transmission Received</h1>
      <p>Halo ${escapeHtml(message.nama)},</p>
      <p>Terima kasih sudah menghubungi IRNK Codes. Pesan Anda sudah diterima dan akan saya respons secepatnya.</p>
      <div style="border-left:4px solid #0891b2;padding:12px 16px;background:#f0fdfa;margin:20px 0">
        <strong>Subjek:</strong> ${escapeHtml(message.subjek)}
      </div>
      <p style="color:#4b5563">Email ini dikirim otomatis sebagai konfirmasi penerimaan pesan.</p>
    </div>
  `;
}

export async function sendContactNotification(message: ContactMessagePayload): Promise<EmailDeliveryResult> {
  const resend = getResendClient();
  if (!resend) return { status: "skipped", reason: "RESEND_API_KEY is not configured" };

  const recipient = getContactRecipient();
  if (!recipient) return { status: "skipped", reason: "CONTACT_TO_EMAIL or ADMIN_EMAILS is not configured" };

  try {
    const { data, error } = await resend.emails.send({
      from: getFromEmail(),
      to: recipient,
      subject: `[IRNK Contact] ${message.subjek}`,
      replyTo: message.email,
      text: buildAdminText(message),
      html: buildAdminHtml(message),
    });

    if (error) {
      console.error("Failed to send contact notification email", error);
      return { status: "failed", reason: error.message };
    }

    return { status: "sent", id: data?.id };
  } catch (error) {
    console.error("Unexpected contact notification email error", error);
    return { status: "failed", reason: error instanceof Error ? error.message : "Unknown email error" };
  }
}

export async function sendContactAutoReply(message: ContactMessagePayload): Promise<EmailDeliveryResult> {
  if (process.env.CONTACT_AUTO_REPLY_ENABLED !== "true") {
    return { status: "skipped", reason: "CONTACT_AUTO_REPLY_ENABLED is not true" };
  }

  const resend = getResendClient();
  if (!resend) return { status: "skipped", reason: "RESEND_API_KEY is not configured" };

  try {
    const { data, error } = await resend.emails.send({
      from: getFromEmail(),
      to: message.email,
      subject: "IRNK Codes — Pesan Anda sudah diterima",
      text: `Halo ${message.nama},\n\nTerima kasih sudah menghubungi IRNK Codes. Pesan Anda sudah diterima dan akan saya respons secepatnya.\n\nSubjek: ${message.subjek}`,
      html: buildAutoReplyHtml(message),
    });

    if (error) {
      console.error("Failed to send contact auto-reply email", error);
      return { status: "failed", reason: error.message };
    }

    return { status: "sent", id: data?.id };
  } catch (error) {
    console.error("Unexpected contact auto-reply email error", error);
    return { status: "failed", reason: error instanceof Error ? error.message : "Unknown email error" };
  }
}
