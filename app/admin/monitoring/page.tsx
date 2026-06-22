import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { getErrorLogStats, getErrorLogs } from "@/actions/monitoring";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Database, Globe, Info, Loader2Icon, Mail, Server, Shield } from "@/lib/icons";
import { ErrorLogsTable } from "./error-logs-table";

export const metadata: Metadata = { title: "Monitoring" };

function SectionFallback() {
  return <div className="h-24 animate-pulse rounded border border-border/50 bg-primary/5" />;
}

function getHealthStatusColor(status: string) {
  if (status === "connected" || status === "healthy") return "text-emerald-400";
  if (status === "degraded") return "text-amber-400";
  if (status === "disconnected" || status === "unhealthy") return "text-red-400";
  return "text-muted-foreground";
}

async function MonitoringContent() {
  let errorStats = null;
  let recentLogs: Array<{
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
  }> = [];
  let loadError: string | null = null;

  try {
    const [stats, logs] = await Promise.all([
      getErrorLogStats(),
      getErrorLogs({ page: 1, limit: 25, level: "all" }),
    ]);
    errorStats = stats;
    recentLogs = logs.data;
  } catch (err) {
    loadError = err instanceof Error ? err.message : "Failed to load monitoring data";
  }

  if (loadError) {
    return (
      <div className="rounded-none border border-red-500/30 bg-red-500/10 p-6">
        <p className="font-mono text-sm text-red-400">{loadError}</p>
      </div>
    );
  }

  const levelColors: Record<string, string> = {
    info: "text-blue-400",
    warn: "text-amber-400",
    error: "text-orange-400",
    fatal: "text-red-500",
  };

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="SYSTEM_HEALTH_MONITOR"
        title="Monitoring"
        subtitle="Real-time error tracking, system health, and performance telemetry from production."
      />

      {/* Error Statistics Cards */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="rounded-none border-border/50 bg-card/80">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="font-mono text-xs tracking-wider text-muted-foreground">TOTAL_ERRORS</CardTitle>
            <Shield className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="font-orbitron text-3xl font-bold">{errorStats?.total || 0}</div>
          </CardContent>
        </Card>
        <Card className="rounded-none border-border/50 bg-card/80">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="font-mono text-xs tracking-wider text-muted-foreground">TODAY</CardTitle>
            <Activity className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="font-orbitron text-3xl font-bold text-emerald-400">{errorStats?.today || 0}</div>
          </CardContent>
        </Card>
        <Card className="rounded-none border-border/50 bg-card/80">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="font-mono text-xs tracking-wider text-muted-foreground">THIS_WEEK</CardTitle>
            <Globe className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="font-orbitron text-3xl font-bold text-blue-400">{errorStats?.thisWeek || 0}</div>
          </CardContent>
        </Card>
        <Card className="rounded-none border-border/50 bg-card/80">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="font-mono text-xs tracking-wider text-muted-foreground">FATAL</CardTitle>
            <Shield className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="font-orbitron text-3xl font-bold text-red-500">{errorStats?.byLevel?.fatal || 0}</div>
          </CardContent>
        </Card>
      </section>

      {/* Level Breakdown & Top Modules */}
      <section className="grid gap-6 xl:grid-cols-2">
        <Card className="rounded-none border-border/50 bg-card/80">
          <CardHeader>
            <CardTitle className="font-orbitron text-sm text-primary">ERROR_LEVEL_BREAKDOWN</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 font-mono text-sm">
            {errorStats && Object.entries(errorStats.byLevel).length === 0 ? (
              <p className="text-muted-foreground">NO_ERRORS_RECORDED</p>
            ) : (
              Object.entries(errorStats?.byLevel || {}).map(([level, count]) => (
                <div key={level} className="flex items-center justify-between gap-4">
                  <span className={`${levelColors[level] || "text-foreground"} uppercase`}>{level}</span>
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${levelColors[level] || "bg-primary"}`}
                        style={{ width: `${Math.min((count as number) / Math.max(errorStats?.total || 1, 1) * 100, 100)}%` }}
                      />
                    </div>
                    <span className="font-orbitron text-xs tabular-nums">{count as number}</span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="rounded-none border-border/50 bg-card/80">
          <CardHeader>
            <CardTitle className="font-orbitron text-sm text-primary">TOP_MODULES_7D</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 font-mono text-sm">
            {!errorStats?.topModules.length ? (
              <p className="text-muted-foreground">NO_MODULES_WITH_ERRORS</p>
            ) : (
              errorStats.topModules.map((mod) => (
                <div key={mod.module} className="flex items-center justify-between gap-4">
                  <span className="break-all text-foreground">{mod.module}</span>
                  <div className="flex items-center gap-3 flex-1 max-w-[200px]">
                    <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${Math.min(mod.count / Math.max(errorStats?.thisWeek || 1, 1) * 100, 100)}%` }}
                      />
                    </div>
                    <span className="font-orbitron text-xs tabular-nums">{mod.count}</span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </section>

      {/* Recent Error Logs */}
      <Card className="rounded-none border-border/50 bg-card/80">
        <CardHeader>
          <CardTitle className="font-orbitron text-primary">RECENT_ERROR_LOGS</CardTitle>
        </CardHeader>
        <CardContent>
          <ErrorLogsTable logs={recentLogs} />
        </CardContent>
      </Card>

      {/* System Health Info */}
      <section className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-none border-border/50 bg-card/80">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="font-orbitron text-sm text-primary">HEALTH_ENDPOINT</CardTitle>
            <Server className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent className="font-mono text-xs text-muted-foreground">
            <code className="text-primary">/api/health</code>
            <p className="mt-1">Public endpoint for uptime monitoring services</p>
          </CardContent>
        </Card>
        <Card className="rounded-none border-border/50 bg-card/80">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="font-orbitron text-sm text-primary">ERROR_REPORTING</CardTitle>
            <Mail className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent className="font-mono text-xs text-muted-foreground">
            <code className="text-primary">/api/report-error</code>
            <p className="mt-1">Receives client-side error reports to database</p>
          </CardContent>
        </Card>
        <Card className="rounded-none border-border/50 bg-card/80">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="font-orbitron text-sm text-primary">AUTO_CLEANUP</CardTitle>
            <Database className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent className="font-mono text-xs text-muted-foreground">
            30-day retention policy
            <p className="mt-1">Old logs automatically purged via SQL function</p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function MonitoringLoading() {
  return (
    <div className="flex flex-col items-center justify-center py-20 space-y-4">
      <Loader2Icon className="h-8 w-8 animate-spin text-primary" />
      <p className="font-mono text-xs text-muted-foreground">Loading monitoring data...</p>
    </div>
  );
}

export default async function AdminMonitoring() {
  await connection();
  return (
    <Suspense fallback={<MonitoringLoading />}>
      <MonitoringContent />
    </Suspense>
  );
}
