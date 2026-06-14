import { NextResponse } from "next/server";
import { queryPooler } from "@/lib/db/pooler";
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

    // Capture request metadata
    const userAgent = request.headers.get("user-agent") || null;
    const url = request.headers.get("referer") || request.headers.get("origin") || null;
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null;

    await queryPooler(
      `INSERT INTO error_logs (level, module, message, stack, url, user_agent, ip_address, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        logLevel,
        module || "client",
        message.slice(0, 2000), // Cap message length
        (stack || error || null)?.toString().slice(0, 5000) || null,
        url?.slice(0, 500) || null,
        userAgent?.slice(0, 500) || null,
        ip,
        metadata ? JSON.stringify(metadata) : "{}",
      ],
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    log.error("Failed to persist error report", { error: err as Error });
    return NextResponse.json(
      { error: "Failed to report error" },
      { status: 500 },
    );
  }
}
