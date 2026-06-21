"use client";

import { useState, useEffect, useRef } from "react";
import {
  getSecurityAuditSummary,
  detectAccessAnomalies,
  type SecurityAuditSummary,
  type SecurityAnomaliesReport,
} from "@/actions/analytics";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { AlertTriangle, Clock, Database, Loader2Icon, Lock, Shield } from "@/lib/icons";

const COLORS = ["#06b6d4", "#eab308", "#ef4444", "#10b981", "#8b5cf6", "#3b82f6"];

function useMeasuredChartSize(height: number) {
  const frameRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ width: 0, height });

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;

    const updateSize = () => {
      const width = Math.floor(frame.getBoundingClientRect().width);
      if (width > 0) setSize({ width, height });
    };

    updateSize();
    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(frame);
    return () => resizeObserver.disconnect();
  }, [height]);

  return { frameRef, size };
}

export default function SecurityAnalyticsDashboard() {
  const dailyChart = useMeasuredChartSize(280);
  const actionChart = useMeasuredChartSize(180);
  const [isScanning, setIsScanning] = useState(false);
  const [auditData, setAuditData] = useState<SecurityAuditSummary | null>(null);
  const [anomaliesData, setAnomaliesData] = useState<SecurityAnomaliesReport | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const handleFetchData = async () => {
    setIsScanning(true);
    try {
      setLoadError(null);
      const [audit, anomalies] = await Promise.all([
        getSecurityAuditSummary(),
        detectAccessAnomalies(),
      ]);
      setAuditData(audit);
      setAnomaliesData(anomalies);
    } catch {
      setLoadError("Security analytics could not be refreshed. Verify your admin session and try again.");
    } finally {
      setIsScanning(false);
    }
  };

  useEffect(() => {
    handleFetchData();
  }, []);

  const totalActionsCount = auditData?.auditLogs.length || 0;
  const anomaliesCount = (anomaliesData?.highFrequency5Min.length || 0) + (anomaliesData?.highVolume24Hours.length || 0);

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case "created":
        return "border-emerald-500/20 bg-emerald-500/10 text-emerald-400";
      case "updated":
        return "border-amber-500/20 bg-amber-500/10 text-amber-400";
      case "deleted":
        return "border-red-500/20 bg-red-500/10 text-red-400";
      case "restored":
        return "border-indigo-500/20 bg-indigo-500/10 text-indigo-400";
      case "password_set":
      case "password_removed":
        return "border-violet-500/20 bg-violet-500/10 text-violet-400";
      default:
        return "border-border/40 bg-secondary/30 text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-orbitron text-2xl font-bold uppercase tracking-wider text-primary">
            SECOPS_COMMAND
          </h1>
          <p className="text-sm text-muted-foreground font-mono">
            Graphical security command, RLS audit, and traffic anomaly tracking panel
          </p>
        </div>
        <div>
          <Button
            type="button"
            onClick={handleFetchData}
            disabled={isScanning}
            className="rounded-none font-mono text-xs"
          >
            {isScanning ? (
              <>
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin text-primary" />
                REFRESHING_COMMAND...
              </>
            ) : (
              "REFRESH_STATS"
            )}
          </Button>
        </div>
      </div>

      {loadError && (
        <Card className="rounded-none border-amber-500/30 bg-amber-500/10">
          <CardContent className="flex items-center gap-3 pt-6 font-mono text-xs text-amber-200">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            <span>{loadError}</span>
          </CardContent>
        </Card>
      )}

      {isScanning && !auditData ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <Loader2Icon className="h-10 w-10 animate-spin text-primary" />
          <p className="font-mono text-xs text-muted-foreground">Initializing security systems command dashboard...</p>
        </div>
      ) : (
        <>
          {/* Threat Metrics row */}
          <div className="grid gap-6 sm:grid-cols-3 font-mono text-xs">
            <Card className="rounded-none border-primary/25 bg-card/75">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-semibold">SECURITY_LEVEL</p>
                    <h3 className="text-2xl font-bold font-orbitron text-emerald-400 mt-1">SECURE</h3>
                  </div>
                  <Shield className="h-8 w-8 text-emerald-400 animate-pulse" />
                </div>
                <p className="text-[9px] text-muted-foreground mt-2">Row-Level Security (RLS) is fully active</p>
              </CardContent>
            </Card>

            <Card className="rounded-none border-primary/25 bg-card/75">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-semibold">AUDITED_EVENTS</p>
                    <h3 className="text-2xl font-bold font-orbitron text-primary mt-1">{totalActionsCount}</h3>
                  </div>
                  <Database className="h-8 w-8 text-primary" />
                </div>
                <p className="text-[9px] text-muted-foreground mt-2">Latest administrative actions tracked</p>
              </CardContent>
            </Card>

            <Card className={`rounded-none ${anomaliesCount > 0 ? "border-red-500/40 bg-red-950/10" : "border-primary/25 bg-card/75"}`}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-semibold">ACCESS_ANOMALIES</p>
                    <h3 className={`text-2xl font-bold font-orbitron mt-1 ${anomaliesCount > 0 ? "text-red-400" : "text-foreground"}`}>
                      {anomaliesCount}
                    </h3>
                  </div>
                  <AlertTriangle className={`h-8 w-8 ${anomaliesCount > 0 ? "text-red-400 animate-bounce" : "text-muted-foreground"}`} />
                </div>
                <p className="text-[9px] text-muted-foreground mt-2">High click counts / scraper activities detected</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid gap-6 xl:grid-cols-[1fr_400px]">
            {/* Daily area frequency chart */}
            <Card className="rounded-none border-primary/25 bg-card/90">
              <CardHeader>
                <CardTitle className="font-orbitron text-sm uppercase tracking-wider text-primary">
                  DAILY_SECOPS_EVENTS
                </CardTitle>
                <CardDescription className="font-mono text-[10px] text-muted-foreground">
                  Frequency of administrative audit logs in the last 30 days
                </CardDescription>
              </CardHeader>
              <CardContent ref={dailyChart.frameRef} className="h-[280px]">
                {dailyChart.size.width > 0 ? (
                  <AreaChart width={dailyChart.size.width} height={dailyChart.size.height} data={auditData?.dailyAudits || []} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorAudits" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="date" stroke="#9ca3af" fontSize={10} tickLine={false} />
                    <YAxis stroke="#9ca3af" fontSize={10} tickLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#111827", borderColor: "#1f2937", color: "#f3f4f6" }}
                      itemStyle={{ color: "#06b6d4" }}
                    />
                    <Area type="monotone" dataKey="count" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#colorAudits)" />
                  </AreaChart>
                ) : (
                  <div className="h-full animate-pulse bg-primary/5" aria-hidden="true" />
                )}
              </CardContent>
            </Card>

            {/* Action Pie Distribution */}
            <Card className="rounded-none border-primary/25 bg-card/90">
              <CardHeader>
                <CardTitle className="font-orbitron text-sm uppercase tracking-wider text-primary">
                  ACTION_DISTRIBUTION
                </CardTitle>
                <CardDescription className="font-mono text-[10px] text-muted-foreground">
                  Proportion of RLS security operations by action type
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[280px] flex flex-col justify-center items-center">
                {auditData?.actionCounts && auditData.actionCounts.length > 0 ? (
                  <div className="w-full h-full flex flex-col justify-center items-center">
                    <div ref={actionChart.frameRef} className="w-full h-[180px]">
                      {actionChart.size.width > 0 ? (
                        <PieChart width={actionChart.size.width} height={actionChart.size.height}>
                          <Pie
                            data={auditData.actionCounts}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={4}
                            dataKey="count"
                            nameKey="action"
                          >
                            {auditData.actionCounts.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{ backgroundColor: "#111827", borderColor: "#1f2937", color: "#f3f4f6" }}
                          />
                        </PieChart>
                      ) : (
                        <div className="h-full animate-pulse bg-primary/5" aria-hidden="true" />
                      )}
                    </div>
                    {/* Legend */}
                    <div className="flex flex-wrap justify-center gap-3 pt-3 font-mono text-[9px] uppercase">
                      {auditData.actionCounts.map((entry, index) => (
                        <div key={entry.action} className="flex items-center gap-1.5 text-muted-foreground">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span>
                            {entry.action} ({entry.count})
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center font-mono text-xs text-muted-foreground py-12">
                    No actions recorded.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Real-time Anomalies Detection (IPs blacklist review) */}
          <div className="grid gap-6 xl:grid-cols-2">
            {/* Realtime 5 min bots */}
            <Card className="rounded-none border-primary/25 bg-card/90">
              <CardHeader>
                <CardTitle className="font-orbitron text-sm uppercase tracking-wider text-danger flex items-center">
                  <AlertTriangle className="mr-2 h-4 w-4 animate-pulse" />
                  REALTIME_BOTS_5MIN
                </CardTitle>
                <CardDescription className="font-mono text-[10px] text-muted-foreground">
                  IPs executing more than 50 click transmissions inside a 5-minute sliding window (high-risk bot)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {anomaliesData?.highFrequency5Min && anomaliesData.highFrequency5Min.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left font-mono text-xs">
                      <thead>
                        <tr className="border-b border-border/40 text-muted-foreground uppercase text-[10px]">
                          <th className="pb-2 font-semibold">IP_ADDRESS</th>
                          <th className="pb-2 font-semibold">CLICKS</th>
                          <th className="pb-2 font-semibold">FIRST_CLICK</th>
                          <th className="pb-2 font-semibold">LAST_CLICK</th>
                        </tr>
                      </thead>
                      <tbody>
                        {anomaliesData.highFrequency5Min.map((item) => (
                          <tr key={item.ip_address} className="border-b border-border/20 hover:bg-red-500/5">
                            <td className="py-2.5 text-danger font-semibold">{item.ip_address}</td>
                            <td className="py-2.5 text-foreground font-bold">{item.click_count}</td>
                            <td className="py-2.5 text-[10px] text-muted-foreground">
                              {new Date(item.first_click).toLocaleTimeString()}
                            </td>
                            <td className="py-2.5 text-[10px] text-muted-foreground">
                              {new Date(item.last_click).toLocaleTimeString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center font-mono text-xs text-muted-foreground py-10">
                    No real-time bot scraping anomalies detected.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* High volume 24 hours */}
            <Card className="rounded-none border-primary/25 bg-card/90">
              <CardHeader>
                <CardTitle className="font-orbitron text-sm uppercase tracking-wider text-amber-500 flex items-center">
                  <Clock className="mr-2 h-4 w-4" />
                  HIGH_VOLUME_24HOURS
                </CardTitle>
                <CardDescription className="font-mono text-[10px] text-muted-foreground">
                  IPs exceeding 300 click events in 24 hours (suspicious general scraping and indexing bots)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {anomaliesData?.highVolume24Hours && anomaliesData.highVolume24Hours.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left font-mono text-xs">
                      <thead>
                        <tr className="border-b border-border/40 text-muted-foreground uppercase text-[10px]">
                          <th className="pb-2 font-semibold">IP_ADDRESS</th>
                          <th className="pb-2 font-semibold">CLICKS</th>
                          <th className="pb-2 font-semibold">FIRST_SEEN</th>
                          <th className="pb-2 font-semibold">LAST_SEEN</th>
                        </tr>
                      </thead>
                      <tbody>
                        {anomaliesData.highVolume24Hours.map((item) => (
                          <tr key={item.ip_address} className="border-b border-border/20 hover:bg-secondary/30">
                            <td className="py-2.5 text-amber-400 font-semibold">{item.ip_address}</td>
                            <td className="py-2.5 text-foreground font-bold">{item.click_count}</td>
                            <td className="py-2.5 text-[10px] text-muted-foreground">
                              {new Date(item.first_click).toLocaleTimeString()}
                            </td>
                            <td className="py-2.5 text-[10px] text-muted-foreground">
                              {new Date(item.last_click).toLocaleTimeString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center font-mono text-xs text-muted-foreground py-10">
                    No suspicious crawler/scraping volumes detected in past 24 hours.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* RLS Audit logs table */}
          <Card className="rounded-none border-primary/25 bg-card/90">
            <CardHeader className="border-b border-border/40">
              <CardTitle className="font-orbitron text-sm uppercase tracking-wider text-primary">
                DATABASE_RLS_AUDIT_TRAIL
              </CardTitle>
              <CardDescription className="font-mono text-[10px] text-muted-foreground">
                Row-Level Security events tracking modifications to shortlinks schema
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {auditData?.auditLogs && auditData.auditLogs.length > 0 ? (
                <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
                  <table className="w-full text-left font-mono text-xs">
                    <thead>
                      <tr className="border-b border-border/40 text-muted-foreground uppercase text-[10px]">
                        <th className="pb-3 pl-3">ACTION</th>
                        <th className="pb-3">SLUG</th>
                        <th className="pb-3">TITLE</th>
                        <th className="pb-3">PERFORMED_BY</th>
                        <th className="pb-3">TIMESTAMP</th>
                        <th className="pb-3">CHANGED_FIELDS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditData.auditLogs.map((row) => (
                        <tr key={row.id} className="border-b border-border/20 hover:bg-secondary/20">
                          <td className="py-3 pl-3">
                            <span className={`inline-block px-1.5 py-0.5 border text-[9px] uppercase font-bold ${getActionBadgeColor(row.action)}`}>
                              {row.action}
                            </span>
                          </td>
                          <td className="py-3 font-semibold text-foreground">
                            {row.shortlink_code ? (
                              <code className="text-primary">/s/{row.shortlink_code}</code>
                            ) : (
                              <span className="text-muted-foreground font-normal italic">Deleted</span>
                            )}
                          </td>
                          <td className="py-3 text-muted-foreground max-w-xs truncate">{row.shortlink_title || "-"}</td>
                          <td className="py-3 text-foreground font-medium truncate max-w-xs">{row.user_email || "System"}</td>
                          <td className="py-3 text-muted-foreground text-[10px]">
                            {new Date(row.performed_at).toLocaleString()}
                          </td>
                          <td className="py-3 font-mono text-[10px] text-muted-foreground max-w-xs">
                            {row.changed_fields ? (
                              <div className="max-h-[50px] overflow-y-auto max-w-[250px] break-all leading-normal bg-black/40 border border-border/30 p-1.5">
                                {JSON.stringify(row.changed_fields)}
                              </div>
                            ) : (
                              "-"
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center font-mono text-xs text-muted-foreground py-12">
                  No database RLS Audit Trails recorded.
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
