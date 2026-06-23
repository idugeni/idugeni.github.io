import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/rbac";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Performance Metrics Endpoint
 * Admin-only endpoint providing comprehensive system metrics for monitoring
 */
export async function GET() {
  try {
    // Require admin authentication
    await requireAdmin();
  } catch {
    return NextResponse.json(
      { error: "Unauthorized: Admin access required" },
      { status: 403 }
    );
  }

  const startTime = Date.now();
  const mem = process.memoryUsage();
  const cpu = process.cpuUsage();

  // Database metrics
  let dbMetrics = {
    status: "disconnected",
    latency: null as string | null,
  };

  try {
    const dbStart = Date.now();
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("page_views")
      .select("id", { count: "exact", head: true });
    if (error) throw error;
    dbMetrics.status = "connected";
    dbMetrics.latency = `${Date.now() - dbStart}ms`;
  } catch (error) {
    console.error("[metrics] DB metrics failed:", error instanceof Error ? error.message : error);
  }

  const responseTime = Date.now() - startTime;

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    responseTime: `${responseTime}ms`,
    runtime: {
      uptime: Math.floor(process.uptime()),
      node: process.version,
      platform: process.platform,
      arch: process.arch,
      pid: process.pid,
    },
    memory: {
      rss: {
        value: mem.rss,
        formatted: `${Math.round(mem.rss / 1024 / 1024)} MB`,
      },
      heapUsed: {
        value: mem.heapUsed,
        formatted: `${Math.round(mem.heapUsed / 1024 / 1024)} MB`,
      },
      heapTotal: {
        value: mem.heapTotal,
        formatted: `${Math.round(mem.heapTotal / 1024 / 1024)} MB`,
      },
      external: {
        value: mem.external,
        formatted: `${Math.round(mem.external / 1024 / 1024)} MB`,
      },
      arrayBuffers: {
        value: mem.arrayBuffers,
        formatted: `${Math.round(mem.arrayBuffers / 1024 / 1024)} MB`,
      },
    },
    cpu: {
      user: `${Math.round(cpu.user / 1000)} ms`,
      system: `${Math.round(cpu.system / 1000)} ms`,
    },
    database: dbMetrics,
    environment: {
      nodeEnv: process.env.NODE_ENV || "development",
      vercel: process.env.VERCEL === "1" ? "enabled" : "disabled",
    },
  });
}
