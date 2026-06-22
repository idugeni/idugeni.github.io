"use server";

import { revalidatePath } from "next/cache";
import { createLogger } from "@/lib/logger";
import { queryPooler } from "@/lib/db/pooler";
import { requireAdmin } from "@/lib/auth/rbac";
import { z } from "zod";

const log = createLogger("monitoring-actions");

export interface ErrorLogEntry {
  id: string;
  level: string;
  module: string;
  message: string;
  stack: string | null;
  url: string | null;
  user_agent: string | null;
  ip_address: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(25),
  level: z.enum(["all", "info", "warn", "error", "fatal"]).default("all"),
  module: z.string().optional(),
});

/**
 * Fetch paginated error logs for admin monitoring dashboard.
 */
export async function getErrorLogs(
  params: z.input<typeof paginationSchema>,
): Promise<{ data: ErrorLogEntry[]; total: number }> {
  await requireAdmin();
  const parsed = paginationSchema.parse(params);
  const offset = (parsed.page - 1) * parsed.limit;

  let whereClauses: string[] = [];
  let queryParams: unknown[] = [];
  let paramIndex = 1;

  if (parsed.level !== "all") {
    whereClauses.push(`level = $${paramIndex}`);
    queryParams.push(parsed.level);
    paramIndex++;
  }

  if (parsed.module) {
    whereClauses.push(`module = $${paramIndex}`);
    queryParams.push(parsed.module);
    paramIndex++;
  }

  const whereSQL = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

  // Get total count
  const [countResult] = await queryPooler<{ count: string }>(
    `SELECT COUNT(*) as count FROM error_logs ${whereSQL}`,
    queryParams,
  );

  // Get paginated data
  const data = await queryPooler<ErrorLogEntry>(
    `SELECT id, level, module, message, stack, url, user_agent, ip_address, metadata, created_at
     FROM error_logs
     ${whereSQL}
     ORDER BY created_at DESC
     LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
    [...queryParams, parsed.limit, offset],
  );

  return {
    data,
    total: parseInt(countResult?.count || "0", 10),
  };
}

/**
 * Get error log statistics for the monitoring dashboard.
 */
export async function getErrorLogStats(): Promise<{
  total: number;
  today: number;
  thisWeek: number;
  byLevel: Record<string, number>;
  topModules: Array<{ module: string; count: number }>;
}> {
  await requireAdmin();
  const [totalResult, todayResult, weekResult] = await Promise.all([
    queryPooler<{ count: string }>(`SELECT COUNT(*) as count FROM error_logs`),
    queryPooler<{ count: string }>(
      `SELECT COUNT(*) as count FROM error_logs WHERE created_at >= now() - INTERVAL '1 day'`,
    ),
    queryPooler<{ count: string }>(
      `SELECT COUNT(*) as count FROM error_logs WHERE created_at >= now() - INTERVAL '7 days'`,
    ),
  ]);

  const byLevelRows = await queryPooler<{ level: string; count: string }>(
    `SELECT level, COUNT(*) as count FROM error_logs GROUP BY level`,
  );

  const topModules = await queryPooler<{ module: string; count: string }>(
    `SELECT module, COUNT(*) as count FROM error_logs
     WHERE created_at >= now() - INTERVAL '7 days'
     GROUP BY module ORDER BY count DESC LIMIT 5`,
  );

  const byLevel: Record<string, number> = {};
  for (const row of byLevelRows) {
    byLevel[row.level] = parseInt(row.count, 10);
  }

  return {
    total: parseInt(totalResult[0]?.count || "0", 10),
    today: parseInt(todayResult[0]?.count || "0", 10),
    thisWeek: parseInt(weekResult[0]?.count || "0", 10),
    byLevel,
    topModules: topModules.map((r) => ({ module: r.module, count: parseInt(r.count, 10) })),
  };
}

/**
 * Clean up old error logs (older than 30 days).
 * Can be called from a cron job or manually from admin.
 */
export async function cleanupErrorLogs(): Promise<{ deleted: number }> {
  await requireAdmin();
  try {
    const [before] = await queryPooler<{ count: string }>(
      `SELECT COUNT(*) as count FROM error_logs WHERE created_at < now() - INTERVAL '30 days'`,
    );

    await queryPooler(
      `DELETE FROM error_logs WHERE created_at < now() - INTERVAL '30 days'`,
    );

    const deleted = parseInt(before?.count || "0", 10);
    log.info("Error logs cleanup completed", { deleted });

    revalidatePath("/admin/monitoring");
    return { deleted };
  } catch (err) {
    log.error("Failed to cleanup error logs", { error: err as Error });
    throw new Error("Failed to cleanup error logs");
  }
}
