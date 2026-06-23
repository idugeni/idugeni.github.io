import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createLogger } from "@/lib/logger";

const log = createLogger("report-error-api");

/**
 * POST /api/report-error
 *
 * Receives structured error reports from the client-side logger
 * and error boundaries. Persists to error_logs table.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { level, module, message, error, stack, metadata } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Missing required field: message" },
        { status: 400 },
      );
    }

    const validLevels = ["info", "warn", "error", "fatal"];
    const logLevel = validLevels.includes(level) ? level : "error";

    const userAgent = request.headers.get("user-agent") || null;
    const url = request.headers.get("referer") || request.headers.get("origin") || null;
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null;

    const supabase = createAdminClient();
    const { error: insertError } = await supabase.from("error_logs").insert({
      level: logLevel,
      module: module || "client",
      message: message.slice(0, 2000),
      stack: (stack || error || null)?.toString().slice(0, 5000) || null,
      url: url?.slice(0, 500) || null,
      user_agent: userAgent?.slice(0, 500) || null,
      ip_address: ip,
      metadata: metadata ? JSON.stringify(metadata) : "{}",
    });

    if (insertError) {
      throw insertError;
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    log.error("Failed to persist error report", { error: err as Error });
    return NextResponse.json(
      { error: "Failed to report error" },
      { status: 500 },
    );
  }
}
