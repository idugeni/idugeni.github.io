import { z } from "zod";

const serverSchema = z.object({
  DATABASE_URL: z.string().url(),
  DATABASE_SECRET_KEY: z.string().min(1),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
  ADMIN_EMAILS: z.string().min(1),
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
  RESEND_API_KEY: z.string().optional(),
  RESEND_FROM_EMAIL: z.string().optional(),
  CONTACT_TO_EMAIL: z.string().optional(),
  CONTACT_AUTO_REPLY_ENABLED: z.string().optional(),
  GOOGLE_GEMINI_API_KEY: z.string().optional(),
  GOOGLE_GEMINI_MODEL: z.string().optional(),
  NEXT_PUBLIC_GOOGLE_VERIFICATION: z.string().optional(),
  NEXT_PUBLIC_BING_VERIFICATION: z.string().optional(),
  NEXT_PUBLIC_YANDEX_VERIFICATION: z.string().optional(),
});

function validateEnv() {
  const parsed = serverSchema.safeParse(process.env);

  if (!parsed.success) {
    const missing = parsed.error.issues.map((i) => `  ${i.path.join(".")}: ${i.message}`).join("\n");
    console.error(`[env] Missing or invalid environment variables:\n${missing}`);
    // Don't crash in development — only validate in production
    if (process.env.NODE_ENV === "production") {
      throw new Error(`Environment validation failed:\n${missing}`);
    }
    return {} as z.infer<typeof serverSchema>;
  }

  return parsed.data;
}

export const env = validateEnv();
