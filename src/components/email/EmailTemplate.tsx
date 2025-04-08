import QRCode from 'qrcode';

interface EmailTemplateProps {
  name: string;
  email: string;
  message: string;
  ip?: string;
  userAgent?: string;
  timestamp?: string;
  location?: string;
  messageId?: string;
}

export const EmailTemplate = async ({
  name,
  email,
  message,
  ip = 'Tidak tersedia',
  userAgent = 'Tidak tersedia',
  timestamp = new Date().toLocaleString('id-ID', {
    timeZone: 'Asia/Jakarta',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }),
  location = 'Tidak tersedia',
  messageId = 'MSG-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
}: EmailTemplateProps) => {
  const qrDataObj = {
    messageId,
    name,
    email,
    message,
    timestamp,
    ip,
    userAgent,
    location
  };

  const qrDataStr = JSON.stringify(qrDataObj);

  const qrCodeUrl = await QRCode.toDataURL(qrDataStr);

  return `
    <!DOCTYPE html>
    <html lang="id">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Pesan Baru</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 0;
            background: #f1f5f9;
            color: #0f172a;
            font-size: 14px;
          }

          .container {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
          }

          .header {
            background: #2563eb;
            color: white;
            padding: 24px;
            text-align: center;
          }

          .header img {
            width: 40px;
            height: 40px;
            vertical-align: middle;
          }

          .header h1 {
            font-size: 18px;
            margin-top: 8px;
          }

          .badge {
            display: inline-block;
            background: #e0f2fe;
            color: #0369a1;
            padding: 2px 10px;
            font-size: 11px;
            border-radius: 6px;
            margin-top: 4px;
          }

          .content {
            padding: 24px;
          }

          .field {
            margin-bottom: 16px;
          }

          .label {
            font-weight: 600;
            margin-bottom: 4px;
            color: #475569;
            font-size: 12px;
          }

          .value {
            background: #f8fafc;
            padding: 10px;
            border-radius: 6px;
            border: 1px solid #e2e8f0;
            font-size: 13px;
            line-height: 1.6;
          }

          .footer {
            background: #f1f5f9;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #64748b;
          }

          .qr {
            text-align: center;
            margin: 16px 0;
          }

          .cta {
            display: inline-block;
            margin-top: 12px;
            padding: 6px 12px;
            background: #2563eb;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            font-size: 13px;
          }

          @media screen and (max-width: 600px) {
            .content { padding: 16px; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="https://raw.githubusercontent.com/idugeni/idugeni.github.io/main/public/favicon.png" alt="Logo" />
            <h1>Pesan Baru dari ${name}</h1>
            <div class="badge">Penting</div>
          </div>
          <div class="content">
            <div class="field">
              <div class="label">ID Pesan</div>
              <div class="value">${messageId}</div>
            </div>
            <div class="field">
              <div class="label">Nama</div>
              <div class="value">${name}</div>
            </div>
            <div class="field">
              <div class="label">Email</div>
              <div class="value">${email}</div>
            </div>
            <div class="field">
              <div class="label">Pesan</div>
              <div class="value">${message.replace(/\n/g, '<br>')}</div>
            </div>
            <div class="qr">
              <img src="${qrCodeUrl}" alt="QR Code" width="80" height="80" />
            </div>
            <a class="cta" href="mailto:${email}">Balas Sekarang</a>
            <hr style="margin: 24px 0; border: none; border-top: 1px solid #e2e8f0;">
            <div class="field">
              <div class="label">Dikirim pada</div>
              <div class="value">${timestamp}</div>
            </div>
            <div class="field">
              <div class="label">Alamat IP Pengirim</div>
              <div class="value">${ip}</div>
            </div>
            <div class="field">
              <div class="label">User Agent</div>
              <div class="value">${userAgent}</div>
            </div>
            <div class="field">
              <div class="label">Lokasi Perkiraan</div>
              <div class="value">${location}</div>
            </div>
          </div>
          <div class="footer">
            Email ini dikirim otomatis melalui formulir situs Anda. Jika ini bukan Anda, abaikan pesan ini.<br/>
            &copy; ${new Date().getFullYear()} oldsoul.id
          </div>
        </div>
      </body>
    </html>
  `;
};
