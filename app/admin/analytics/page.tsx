import type { Metadata } from "next";
import { Suspense } from "react";
import { getAnalyticsSummary, getPageViewsChart, getRouteSegments, getTopPages, getTopReferrers, getRecentPageViews } from "@/actions/analytics";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, BarChart, Eye, Target, ExternalLink, GitBranch, Loader2Icon } from "@/lib/icons";
import { AnalyticsChart } from "./AnalyticsChart";

export const metadata: Metadata = { title: "Analytics" };

function compact(value: number) {
  return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

function percent(value: number) {
  return `${value.toFixed(1)}%`;
}

function Progress({ value, label }: { value: number; label?: string }) {
  return (
    <div
      className="h-1.5 bg-secondary"
      role="progressbar"
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <div
        className="h-full bg-primary"
        style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
      />
    </div>
  );
}

async function AnalyticsContent() {
  let summary, chartData, topPages, referrers, segments, recent;
  let error: string | null = null;

  try {
    [summary, chartData, topPages, referrers, segments, recent] = await Promise.all([
      getAnalyticsSummary(),
      getPageViewsChart(),
      getTopPages(12),
      getTopReferrers(8),
      getRouteSegments(),
      getRecentPageViews(8),
    ]);
  } catch (err) {
    error = err instanceof Error ? err.message : "Failed to load analytics data";
  }

  if (error || !summary || !chartData || !topPages || !referrers || !segments || !recent) {
    return (
      <div className="space-y-6">
        <AdminPageHeader
          eyebrow="LIVE_TRAFFIC_INTELLIGENCE"
          title="Analytics"
          subtitle="Dynamic traffic telemetry from Supabase page views."
        />
        <div className="rounded-none border border-red-500/30 bg-red-500/10 p-6">
          <p className="font-mono text-sm text-red-400">{error || "Failed to load analytics"}</p>
        </div>
      </div>
    );
  }

  const total30d = chartData.reduce((total, item) => total + item.views, 0);
  const avg30d = chartData.length ? total30d / chartData.length : 0;
  const peak = chartData.reduce(
    (max, item) => (item.views > max.views ? item : max),
    { date: "-", views: 0 }
  );
  const lowest = chartData.reduce(
    (min, item) => (item.views < min.views ? item : min),
    chartData[0] ?? { date: "-", views: 0 }
  );

  const statCards = [
    ["TOTAL_VIEWS", compact(summary.totalViews), Eye, "text-primary"],
    ["TODAY", compact(summary.viewsToday), Activity, "text-emerald-400"],
    ["THIS_WEEK", compact(summary.viewsThisWeek), BarChart, "text-primary"],
    ["THIS_MONTH", compact(summary.viewsThisMonth), Target, "text-violet-400"],
    ["GROWTH", percent(summary.growthPercent), Activity, summary.growthPercent >= 0 ? "text-emerald-400" : "text-red-400"],
    ["TOP_ROUTE", compact(summary.mostVisitedPageViews), GitBranch, "text-amber-400"],
  ] as const;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="LIVE_TRAFFIC_INTELLIGENCE"
        title="Analytics"
        subtitle="Dynamic traffic telemetry from Supabase page views with top routes, referrers, route segments, and recent access logs."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        {statCards.map(([label, value, Icon, tone]) => (
          <Card key={label} className="rounded-none border-border/50 bg-card/80">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="font-mono text-xs text-muted-foreground">{label}</CardTitle>
              <Icon className={`h-4 w-4 ${tone}`} aria-hidden="true" />
            </CardHeader>
            <CardContent>
              <div className="break-words font-orbitron text-2xl font-bold">{value}</div>
              {label === "TOP_ROUTE" && (
                <p className="mt-1 truncate font-mono text-[10px] text-muted-foreground">
                  {summary.mostVisitedPage}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <AnalyticsChart
        data={chartData}
        total30d={total30d}
        avg30d={avg30d}
        peakDay={peak.date}
        peakViews={peak.views}
        lowestDay={lowest.date}
        lowestViews={lowest.views}
      />

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="rounded-none border-border/50 bg-card/80 xl:col-span-2">
          <CardHeader>
            <CardTitle className="font-orbitron text-lg text-primary">TOP_TARGETS</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topPages.length === 0 ? (
              <p className="font-mono text-sm text-muted-foreground">NO_ACCESS_LOGS</p>
            ) : (
              topPages.map((page) => (
                <div key={page.halaman} className="rounded-none border border-border/50 p-3">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <span className="break-all font-mono text-sm font-medium">{page.halaman}</span>
                    <span className="font-mono text-xs text-muted-foreground">
                      {page.views} views · {page.share}%
                    </span>
                  </div>
                  <Progress value={page.share} label={`${page.halaman} ${page.share}%`} />
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="rounded-none border-border/50 bg-card/80">
          <CardHeader>
            <CardTitle className="font-orbitron text-lg text-primary">ROUTE_SEGMENTS</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {segments.length === 0 ? (
              <p className="font-mono text-sm text-muted-foreground">NO_SEGMENT_DATA</p>
            ) : (
              segments.map((segment) => (
                <div key={segment.segment} className="space-y-1">
                  <div className="flex justify-between gap-3 font-mono text-xs">
                    <span className="break-all">{segment.segment}</span>
                    <span className="text-muted-foreground">{segment.share}%</span>
                  </div>
                  <Progress value={segment.share} label={`${segment.segment} ${segment.share}%`} />
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="rounded-none border-border/50 bg-card/80">
          <CardHeader>
            <CardTitle className="font-orbitron text-lg text-primary">TOP_REFERRERS</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {referrers.length === 0 ? (
              <p className="font-mono text-sm text-muted-foreground">NO_REFERRER_DATA</p>
            ) : (
              referrers.map((ref) => (
                <div key={ref.referrer} className="rounded-none border border-border/50 p-3">
                  <div className="flex items-start justify-between gap-3 font-mono text-xs">
                    <span className="break-all">{ref.referrer}</span>
                    <span className="shrink-0 text-muted-foreground">
                      {ref.views} · {ref.share}%
                    </span>
                  </div>
                  <Progress value={ref.share} label={`${ref.referrer} ${ref.share}%`} />
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="rounded-none border-border/50 bg-card/80">
          <CardHeader>
            <CardTitle className="font-orbitron text-lg text-primary">RECENT_ACCESS</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recent.length === 0 ? (
              <p className="font-mono text-sm text-muted-foreground">NO_RECENT_ACCESS</p>
            ) : (
              recent.map((row) => (
                <div
                  key={`${row.created_at}-${row.halaman}`}
                  className="rounded-none border border-border/50 p-3 font-mono text-xs"
                >
                  <div className="flex items-start gap-2">
                    <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
                    <span className="break-all font-medium">{row.halaman}</span>
                  </div>
                  <p className="mt-1 break-all text-muted-foreground">
                    {row.referrer || "Direct"}
                  </p>
                  <p className="mt-1 text-muted-foreground">
                    {new Date(row.created_at).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function AnalyticsLoading() {
  return (
    <div className="flex flex-col items-center justify-center py-20 space-y-4">
      <Loader2Icon className="h-8 w-8 animate-spin text-primary" />
      <p className="font-mono text-xs text-muted-foreground">Loading analytics data...</p>
    </div>
  );
}

export default function AdminAnalytics() {
  return (
    <Suspense fallback={<AnalyticsLoading />}>
      <AnalyticsContent />
    </Suspense>
  );
}
