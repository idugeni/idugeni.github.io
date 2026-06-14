import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface ConfirmationEmailData {
  email: string;
  nama: string | null | undefined;
  token: string;
}

export async function sendConfirmationEmail({ email, nama, token }: ConfirmationEmailData) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const confirmationUrl = `${siteUrl}/newsletter/confirm?token=${token}`;
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'IRNK Codes <onboarding@resend.dev>';
  
  const nameGreeting = nama ? `Halo ${nama},` : 'Halo,';
  
  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0b0f19; color: #f3f4f6; padding: 40px 20px; text-align: left;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #111827; border: 1px solid #1f2937; padding: 30px; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 25px;">
          <span style="font-size: 20px; font-weight: bold; color: #06b6d4; font-family: 'Orbitron', monospace; letter-spacing: 2px;">IRNK_CODES</span>
        </div>
        
        <div style="font-size: 15px; line-height: 1.6; color: #d1d5db; margin-bottom: 30px;">
          <p style="margin-bottom: 20px; font-weight: 500;">${nameGreeting}</p>
          
          <p style="margin-bottom: 15px;">
            Terima kasih telah mendaftar untuk menerima newsletter IRNK Codes!
          </p>
          
          <p style="margin-bottom: 15px;">
            Untuk mengaktifkan langganan Anda dan mulai menerima update terbaru seputar web development, AI, dan teknologi modern, silakan konfirmasi dengan mengklik tombol di bawah ini:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${confirmationUrl}" 
               style="display: inline-block; padding: 12px 32px; background-color: #06b6d4; color: #0b0f19; text-decoration: none; font-weight: bold; border-radius: 6px; font-size: 14px;">
              Konfirmasi Langganan
            </a>
          </div>
          
          <p style="margin-bottom: 15px; font-size: 13px; color: #9ca3af;">
            Atau salin dan tempel link berikut ke browser Anda:
          </p>
          <p style="margin-bottom: 15px; font-size: 12px; color: #06b6d4; word-break: break-all;">
            ${confirmationUrl}
          </p>
          
          <hr style="border: 0; border-top: 1px solid #374151; margin: 30px 0;">
          
          <p style="margin-bottom: 15px; font-size: 12px; color: #6b7280;">
            <strong>Link ini akan expired dalam 24 jam.</strong>
          </p>
          
          <p style="margin-bottom: 15px; font-size: 12px; color: #6b7280;">
            Jika Anda tidak mendaftar untuk newsletter ini, silakan abaikan email ini.
          </p>
          
          <p style="margin-bottom: 0; font-size: 12px; color: #6b7280;">
            Salam,<br>
            <strong>IRNK Codes Team</strong>
          </p>
        </div>
      </div>
    </div>
  `;

  const result = await resend.emails.send({
    from: fromEmail,
    to: email,
    subject: 'Konfirmasi Langganan Newsletter IRNK Codes',
    html,
  });

  if (result.error) {
    console.error('Failed to send confirmation email:', result.error);
    throw new Error('Failed to send confirmation email');
  }

  return result;
}
