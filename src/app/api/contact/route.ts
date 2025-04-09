import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { z } from "zod";
import { EmailTemplate } from "@/components/email/EmailTemplate";
import { env } from "@/lib/env";
import { isRateLimited } from "@/lib/rate-limit";

const contactFormSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  message: z.string().min(1).max(1000),
  "g-recaptcha-response": z.string().nonempty("Verifikasi CAPTCHA wajib dilakukan"),
});

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: Number(env.SMTP_PORT),
  secure: true,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

export async function POST(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const ip = forwardedFor?.split(",")[0]?.trim() || "unknown";

  const userAgent = request.headers.get("user-agent") || "unknown";

  // Ambil data geolokasi IP
  let location = "Tidak tersedia";
  try {
    const geoRes = await fetch(`https://ipapi.co/${ip}/json/`, { next: { revalidate: 3600 } });
    if (geoRes.ok) {
      const geoData = await geoRes.json();
      const { city, region, country_name, org } = geoData;
      const parts = [];
      if (city) parts.push(city);
      if (region) parts.push(region);
      if (country_name) parts.push(country_name);
      if (org) parts.push(org);
      location = parts.join(", ") || "Tidak tersedia";
    }
  } catch {
    location = "Tidak tersedia";
  }

  // Rate limiting
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Terlalu banyak permintaan. Silakan coba lagi nanti." },
      {
        status: 429,
        headers: { "X-Robots-Tag": "noindex" },
      }
    );
  }

  try {
    const body = await request.json();
    const result = contactFormSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validasi gagal", details: result.error.errors },
        {
          status: 400,
          headers: { "X-Robots-Tag": "noindex" },
        }
      );
    }

    const {
      name,
      email,
      message,
      "g-recaptcha-response": recaptchaToken,
    } = result.data;

    // Verifikasi reCAPTCHA dengan timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000); // 5 detik

    // Gunakan RECAPTCHA_SECRET_KEY dari variabel lingkungan
    const secretKey = env.RECAPTCHA_SECRET_KEY;
    
    const verifyResponse = await fetch(
      "https://www.google.com/recaptcha/api/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `secret=${secretKey}&response=${recaptchaToken}`,
        signal: controller.signal,
      }
    ).finally(() => clearTimeout(timeout));

    const verifyResult = await verifyResponse.json();

    if (!verifyResult.success) {
      return NextResponse.json(
        {
          error: "Verifikasi reCAPTCHA gagal",
          details: verifyResult["error-codes"],
        },
        {
          status: 400,
          headers: { "X-Robots-Tag": "noindex" },
        }
      );
    }

    // Kirim email
    const mailOptions = {
      from: env.SMTP_USER,
      to: env.TO_EMAIL,
      replyTo: email,
      subject: `Pesan Baru dari ${name}`,
      text: `Nama: ${name}\nEmail: ${email}\n\nPesan:\n${message}`,
      html: await Promise.resolve(
        EmailTemplate({ name, email, message, ip, userAgent, location })
      ).then((html) => (typeof html === "string" ? html : "")),
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json(
      { message: "Email berhasil dikirim" },
      {
        status: 200,
        headers: { "X-Robots-Tag": "noindex" },
      }
    );
  } catch (error) {
    console.error("Email Error:", {
      message: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      {
        error: "Gagal mengirim email",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      {
        status: 500,
        headers: { "X-Robots-Tag": "noindex" },
      }
    );
  }
}
