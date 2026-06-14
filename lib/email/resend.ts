import "server-only";

import { Resend } from "resend";

interface ContactMessagePayload {
  nama: string;
  email: string;
  subjek: string;
  pesan: string;
  noWa?: string;
  layanan?: string;
  attachments?: Array<{ url: string; filename: string; size: number; type: string }>;
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

  const attachmentRows = message.attachments && message.attachments.length > 0
    ? message.attachments.map((att, idx) => `
      <tr>
        <td style="border:1px solid #e5e7eb;padding:8px 10px">${idx + 1}</td>
        <td style="border:1px solid #e5e7eb;padding:8px 10px">${escapeHtml(att.filename)}</td>
        <td style="border:1px solid #e5e7eb;padding:8px 10px">${(att.size / 1024 / 1024).toFixed(2)} MB</td>
        <td style="border:1px solid #e5e7eb;padding:8px 10px"><a href="${escapeHtml(att.url)}" style="color:#0891b2">Download</a></td>
      </tr>
    `).join("")
    : "";

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
      <div style="border:1px solid #e5e7eb;padding:16px;background:#f9fafb;margin-bottom:20px">
        <h2 style="font-size:16px;margin:0 0 8px">Message</h2>
        <p style="white-space:pre-wrap;margin:0">${escapeHtml(message.pesan)}</p>
      </div>
      ${attachmentRows ? `
      <div style="margin-top:20px">
        <h2 style="font-size:16px;margin:0 0 12px;color:#0891b2">Attachments (${message.attachments!.length})</h2>
        <table style="border-collapse:collapse;width:100%">
          <thead>
            <tr style="background:#f9fafb">
              <th style="border:1px solid #e5e7eb;padding:8px 10px;text-align:left">#</th>
              <th style="border:1px solid #e5e7eb;padding:8px 10px;text-align:left">Filename</th>
              <th style="border:1px solid #e5e7eb;padding:8px 10px;text-align:left">Size</th>
              <th style="border:1px solid #e5e7eb;padding:8px 10px;text-align:left">Action</th>
            </tr>
          </thead>
          <tbody>${attachmentRows}</tbody>
        </table>
      </div>
      ` : ""}
    </div>
  `;
}

function buildAdminText(message: ContactMessagePayload) {
  const attachmentText = message.attachments && message.attachments.length > 0
    ? ["", "Attachments:", ...message.attachments.map((att, idx) => `  ${idx + 1}. ${att.filename} (${(att.size / 1024 / 1024).toFixed(2)} MB) - ${att.url}`)]
    : [];

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
    ...attachmentText,
  ].join("\n");
}

function buildAutoReplyHtml(message: ContactMessagePayload) {
  const attachmentList = message.attachments && message.attachments.length > 0
    ? `
    <div style="margin:20px 0;padding:16px;background:#f0fdfa;border:1px solid #a7f3d0;border-radius:4px">
      <h3 style="margin:0 0 12px;font-size:14px;color:#059669">Files You Attached (${message.attachments.length})</h3>
      <ul style="margin:0;padding-left:20px">
        ${message.attachments.map((att) => `
          <li style="margin:4px 0;color:#4b5563;font-size:13px">
            ${escapeHtml(att.filename)} (${(att.size / 1024 / 1024).toFixed(2)} MB)
          </li>
        `).join("")}
      </ul>
    </div>
    `
    : "";

  return `
    <div style="font-family:Inter,Arial,sans-serif;line-height:1.6;color:#111827;max-width:600px;margin:0 auto">
      <div style="border-bottom:3px solid #0891b2;padding-bottom:16px;margin-bottom:24px">
        <h1 style="margin:0;color:#0891b2;font-size:24px">IRNK Codes</h1>
        <p style="margin:4px 0 0;color:#6b7280;font-size:12px">Premium Fullstack Development</p>
      </div>

      <h2 style="margin:0 0 16px;color:#111827;font-size:20px">✅ Pesan Anda Sudah Diterima</h2>
      
      <p style="margin:0 0 16px">Halo <strong>${escapeHtml(message.nama)}</strong>,</p>
      
      <p style="margin:0 0 16px;color:#4b5563">
        Terima kasih sudah menghubungi IRNK Codes. Pesan Anda telah berhasil diterima dan akan saya respons dalam <strong>24 jam</strong>.
      </p>

      <div style="border-left:4px solid #0891b2;padding:12px 16px;background:#f0fdfa;margin:20px 0">
        <p style="margin:0 0 8px"><strong>Subjek:</strong> ${escapeHtml(message.subjek)}</p>
        <p style="margin:0;color:#6b7280;font-size:13px">Diterima pada ${new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })}</p>
      </div>

      ${attachmentList}

      <div style="margin:24px 0;padding:16px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:4px">
        <h3 style="margin:0 0 12px;font-size:14px;color:#374151">Apa yang terjadi selanjutnya?</h3>
        <ul style="margin:0;padding-left:20px;color:#6b7280;font-size:13px;line-height:1.8">
          <li>Saya akan membaca pesan Anda dengan teliti</li>
          <li>Memberikan respons detail via email atau WhatsApp</li>
          <li>Menyediakan solusi atau penawaran sesuai kebutuhan</li>
        </ul>
      </div>

      <p style="margin:24px 0 0;color:#6b7280;font-size:12px;text-align:center;border-top:1px solid #e5e7eb;padding-top:16px">
        Email ini dikirim otomatis sebagai konfirmasi. Jika Anda tidak mengirim pesan ini, silakan abaikan.<br/>
        © ${new Date().getFullYear()} IRNK Codes — All rights reserved.
      </p>
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
