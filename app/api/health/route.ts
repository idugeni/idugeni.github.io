import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createLogger } from "@/lib/logger";

const log = createLogger("health-api");

export async function GET() {
  const startTime = Date.now();

  // Database connectivity check
  let dbStatus = "disconnected";
  let dbLatency: string | null = null;
  let serverTime: string | null = null;

  try {
    const dbStart = Date.now();
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("page_views")
      .select("id", { count: "exact", head: true });
    if (error) throw error;
    dbLatency = `${Date.now() - dbStart}ms`;
    serverTime = new Date().toISOString();
    dbStatus = "connected";
  } catch (error) {
    log.error("DB check failed", { error: error as Error });
  }

  // Supabase connectivity check
  let supabaseStatus = "not_configured";
  let supabaseLatency: string | null = null;

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (supabaseUrl) {
      const sbStart = Date.now();
      const response = await fetch(`${supabaseUrl}/rest/v1/`, {
        method: "HEAD",
        headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "" },
      });
      supabaseLatency = `${Date.now() - sbStart}ms`;
      supabaseStatus = response.ok ? "connected" : "degraded";
    }
  } catch (error) {
    supabaseStatus = "disconnected";
    log.warn("Supabase check failed", { error: error as Error });
  }

  // Resend API check
  let resendStatus = "not_configured";
  let resendLatency: string | null = null;

  try {
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      const rsStart = Date.now();
      const response = await fetch("https://api.resend.com/domains", {
        method: "GET",
        headers: { Authorization: `Bearer ${resendKey}` },
      });
      resendLatency = `${Date.now() - rsStart}ms`;
      resendStatus = response.ok || response.status === 401 ? "connected" : "degraded";
    }
  } catch (error) {
    resendStatus = "disconnected";
    log.warn("Resend check failed", { error: error as Error });
  }

  const responseTime = Date.now() - startTime;
  const mem = process.memoryUsage();

  const hasCritical = dbStatus === "disconnected";
  const overallStatus = hasCritical ? "unhealthy" : dbStatus === "connected" ? "healthy" : "degraded";

  const response = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || "1.0.0",
    environment: process.env.NODE_ENV || "development",
    responseTime: `${responseTime}ms`,
    services: {
      database: {
        status: dbStatus,
        latency: dbLatency,
        serverTime,
      },
      supabase: {
        status: supabaseStatus,
        latency: supabaseLatency,
      },
      resend: {
        status: resendStatus,
        latency: resendLatency,
      },
    },
    runtime: {
      uptime: Math.floor(process.uptime()),
      node: process.version,
      platform: process.platform,
    },
    memory: {
      rss: `${Math.round(mem.rss / 1024 / 1024)} MB`,
      heapUsed: `${Math.round(mem.heapUsed / 1024 / 1024)} MB`,
      heapTotal: `${Math.round(mem.heapTotal / 1024 / 1024)} MB`,
      external: `${Math.round(mem.external / 1024 / 1024)} MB`,
    },
  };

  if (overallStatus !== "healthy") {
    log.warn("Health check detected issues", { status: overallStatus });
  }

  return NextResponse.json(response, { status: overallStatus === "unhealthy" ? 503 : 200 });
}
