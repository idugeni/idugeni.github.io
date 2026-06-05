import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/service";
import { rateLimit } from "@/lib/rate-limit";

const blogViewParamsSchema = z.object({
  id: z.string().uuid(),
});

function getRequestIp(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0]?.trim() || "unknown";

  return request.headers.get("x-real-ip") || "unknown";
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const parsed = blogViewParamsSchema.safeParse(await params);
    if (!parsed.success) {
      return new NextResponse(null, { status: 204 });
    }

    const ip = getRequestIp(request);
    await rateLimit(`${ip}:${parsed.data.id}`, "blog-view", { max: 10, window: 60 * 60 * 1000 });

    const serviceClient = createServiceClient();
    await serviceClient.rpc("increment_view", { article_id: parsed.data.id });
  } catch {
    // Public telemetry must never break page UX or create visible browser console errors.
  }

  return new NextResponse(null, {
    status: 204,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
