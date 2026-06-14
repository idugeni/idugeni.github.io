import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/service";
import { rateLimit } from "@/lib/rate-limit";

const pageViewSchema = z.object({
  halaman: z.string().min(1).max(500).startsWith("/"),
  referrer: z.string().max(1000).nullable().optional(),
});

function getClientIp(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip") || "unknown";
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    await rateLimit(ip, "page-view", { max: 120, window: 60 * 1000 });

    const contentType = request.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return NextResponse.json({ error: "Unsupported content type" }, { status: 415 });
    }

    const parsed = pageViewSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid page view payload" }, { status: 400 });
    }

    const userAgent = request.headers.get("user-agent") || null;

    const supabase = createServiceClient();
    const { error } = await supabase.from("page_views").insert({
      halaman: parsed.data.halaman,
      referrer: parsed.data.referrer || null,
      ip_address: ip !== "unknown" ? ip : null,
      user_agent: userAgent,
    });

    if (error) {
      console.error("Failed to record page view", error);
      return NextResponse.json({ error: "Failed to record page view" }, { status: 500 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Rate limit exceeded")) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    console.error("Unexpected page view error", error);
    return NextResponse.json({ error: "Unexpected page view error" }, { status: 500 });
  }
}
