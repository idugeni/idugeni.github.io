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

function noStoreJson(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const parsed = blogViewParamsSchema.safeParse(await params);
    if (!parsed.success) {
      return noStoreJson({ jumlahView: 0, jumlahLike: 0 }, 200);
    }

    const serviceClient = createServiceClient();
    const { data, error } = await serviceClient
      .from("blog_artikel")
      .select("jumlah_view, jumlah_like")
      .eq("id", parsed.data.id)
      .eq("status", "published")
      .maybeSingle();

    if (error || !data) {
      return noStoreJson({ jumlahView: 0, jumlahLike: 0 }, 200);
    }

    return noStoreJson({
      jumlahView: data.jumlah_view ?? 0,
      jumlahLike: data.jumlah_like ?? 0,
    });
  } catch {
    return noStoreJson({ jumlahView: 0, jumlahLike: 0 }, 200);
  }
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
