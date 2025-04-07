import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { z } from 'zod';
import { EmailTemplate } from '@/components/email/EmailTemplate';

// Load environment variables
const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  TO_EMAIL
} = process.env;

// Schema validasi untuk data form
const contactFormSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter').max(50, 'Nama maksimal 50 karakter'),
  email: z.string().email('Format email tidak valid'),
  message: z.string().min(10, 'Pesan minimal 10 karakter').max(1000, 'Pesan maksimal 1000 karakter')
});

// Konfigurasi transporter nodemailer
const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: Number(SMTP_PORT),
  secure: true, // menggunakan SSL/TLS
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS
  }
});

/**
 * Handler untuk mengirim email
 * @param {NextRequest} request - Request dari client
 * @returns {NextResponse} Response dengan status dan pesan
 */
export async function POST(request: NextRequest) {
  try {
    // Parse body request
    const body = await request.json();

    // Validasi input menggunakan Zod
    const result = contactFormSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validasi gagal', details: result.error.errors },
        { status: 400 }
      );
    }

    const { name, email, message } = result.data;

    // Konfigurasi email menggunakan SMTP_USER sebagai pengirim
    const mailOptions = {
      from: SMTP_USER, // Menggunakan email SMTP yang terverifikasi
      to: TO_EMAIL,
      replyTo: email, // Email pengirim diset sebagai reply-to
      subject: `Pesan Baru dari ${name}`,
      text: `Nama: ${name}\nEmail: ${email}\n\nPesan:\n${message}`,
      html: EmailTemplate({ name, email, message }) // EmailTemplate returns a string template literal
    };

    // Kirim email
    await transporter.sendMail({
      ...mailOptions,
      html: await Promise.resolve(mailOptions.html).then(html => String(html))
    });

    return NextResponse.json(
      { message: 'Email berhasil dikirim' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Gagal mengirim email', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}