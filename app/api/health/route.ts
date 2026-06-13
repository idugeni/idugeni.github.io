import { NextResponse } from "next/server";
import { queryPoolerSingle } from "@/lib/db/pooler";

export async function GET() {
  const startTime = Date.now();

  // Database connectivity check
  let dbStatus = "disconnected";
  let dbLatency: string | null = null;
  let serverTime: string | null = null;

  try {
    const dbStart = Date.now();
    const result = await queryPoolerSingle<{ now: string }>("SELECT NOW() as now");
    dbLatency = `${Date.now() - dbStart}ms`;
    serverTime = result?.now || null;
    dbStatus = "connected";
  } catch (error) {
    console.error("[health] DB check failed:", error instanceof Error ? error.message : error);
  }

  const responseTime = Date.now() - startTime;
  const mem = process.memoryUsage();

  return NextResponse.json({
    status: dbStatus === "connected" ? "healthy" : "degraded",
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || "1.0.0",
    environment: process.env.NODE_ENV || "development",
    responseTime: `${responseTime}ms`,
    database: {
      status: dbStatus,
      latency: dbLatency,
      serverTime,
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
  });
}
