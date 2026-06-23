"use server";

import { revalidatePath } from "next/cache";
import { createLogger } from "@/lib/logger";
import { createAdminClient } from "@/lib/supabase/admin";
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

function applyFilters(
  query: any,
  level: string,
  module: string | undefined,
) {
  if (level !== "all") {
    query = query.eq("level", level);
  }
  if (module) {
    query = query.eq("module", module);
  }
  return query;
}

export async function getErrorLogs(
  params: z.input<typeof paginationSchema>,
): Promise<{ data: ErrorLogEntry[]; total: number }> {
  await requireAdmin();
  const parsedResult = paginationSchema.safeParse(params);
  if (!parsedResult.success) throw new Error("Invalid input");
  const parsed = parsedResult.data;
  const offset = (parsed.page - 1) * parsed.limit;
  const supabase = createAdminClient();

  const countQuery = applyFilters(
    supabase.from("error_logs").select("*", { count: "exact", head: true }),
    parsed.level,
    parsed.module,
  );
  const { count } = await countQuery;

  let dataQuery = applyFilters(
    supabase.from("error_logs").select("id, level, module, message, stack, url, user_agent, ip_address, metadata, created_at"),
    parsed.level,
    parsed.module,
  );
  const { data, error } = await dataQuery
    .order("created_at", { ascending: false })
    .range(offset, offset + parsed.limit - 1);
  if (error) throw error;

  return {
    data: (data || []) as ErrorLogEntry[],
    total: count || 0,
  };
}

export async function getErrorLogStats(): Promise<{
  total: number;
  today: number;
  thisWeek: number;
  byLevel: Record<string, number>;
  topModules: Array<{ module: string; count: number }>;
}> {
  await requireAdmin();
  const supabase = createAdminClient();

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const c = (r: { count: number | null }) => r.count || 0;

  const [totalResult, todayResult, weekResult] = await Promise.all([
    supabase.from("error_logs").select("*", { count: "exact", head: true }),
    supabase.from("error_logs").select("*", { count: "exact", head: true }).gte("created_at", todayStart),
    supabase.from("error_logs").select("*", { count: "exact", head: true }).gte("created_at", weekStart),
  ]);

  const { data: weekLogs } = await supabase
    .from("error_logs")
    .select("level, module")
    .gte("created_at", weekStart);

  const byLevel: Record<string, number> = {};
  const moduleCounts = new Map<string, number>();
  for (const row of weekLogs || []) {
    byLevel[row.level] = (byLevel[row.level] || 0) + 1;
    moduleCounts.set(row.module, (moduleCounts.get(row.module) || 0) + 1);
  }

  const totalLevelResult = await supabase.from("error_logs").select("level");

  const fullByLevel: Record<string, number> = {};
  for (const row of totalLevelResult.data || []) {
    fullByLevel[row.level] = (fullByLevel[row.level] || 0) + 1;
  }

  const topModules = [...moduleCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([module, count]) => ({ module, count }));

  return {
    total: c(totalResult),
    today: c(todayResult),
    thisWeek: c(weekResult),
    byLevel: fullByLevel,
    topModules,
  };
}

export async function cleanupErrorLogs(): Promise<{ deleted: number }> {
  await requireAdmin();
  const supabase = createAdminClient();
  try {
    const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const { count } = await supabase
      .from("error_logs")
      .select("*", { count: "exact", head: true })
      .lt("created_at", cutoff);

    await supabase.from("error_logs").delete().lt("created_at", cutoff);

    const deleted = count || 0;
    log.info("Error logs cleanup completed", { deleted });

    revalidatePath("/admin/monitoring");
    return { deleted };
  } catch (err) {
    log.error("Failed to cleanup error logs", { error: err as Error });
    throw new Error("Failed to cleanup error logs");
  }
}
