"use client";

import { Area, Bar, CartesianGrid, ComposedChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Activity, BarChart, MonitorUp, Target } from "@/lib/icons";

interface AnalyticsChartProps {
  data: Array<{ date: string; views: number }>;
  total30d: number;
  avg30d: number;
  peakDay: string;
  peakViews: number;
  lowestDay: string;
  lowestViews: number;
}

function compact(value: number) {
  return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

function formatDate(value: string) {
  if (!value || value === "-") return "-";
  return new Date(`${value}T00:00:00`).toLocaleDateString("en", { month: "short", day: "numeric" });
}

type ChartTooltipProps = {
  active?: boolean;
  payload?: Array<{ value?: number | string; dataKey?: string; color?: string }>;
  label?: string | number;
};

function CustomTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  const views = payload.find((item) => item.dataKey === "views")?.value ?? payload[0].value;

  return (
    <div className="rounded-none border border-primary/40 bg-popover/95 px-3 py-2 font-mono shadow-2xl shadow-primary/10 backdrop-blur-xl">
      <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">{formatDate(String(label))}</p>
      <p className="mt-1 text-sm font-bold text-primary">{views} views</p>
      <p className="mt-1 text-[10px] text-muted-foreground">daily traffic pulse</p>
    </div>
  );
}

function ActiveDot(props: { cx?: number; cy?: number }) {
  const { cx = 0, cy = 0 } = props;
  return <circle cx={cx} cy={cy} r={5} fill="hsl(var(--primary))" stroke="hsl(var(--background))" strokeWidth={3} className="drop-shadow-[0_0_14px_hsl(var(--primary))]" />;
}

export function AnalyticsChart({ data, total30d, avg30d, peakDay, peakViews, lowestDay, lowestViews }: AnalyticsChartProps) {
  const kpis = [
    { label: "30D_TOTAL", value: compact(total30d), icon: Activity, tone: "text-primary" },
    { label: "AVG_SIGNAL", value: avg30d.toFixed(1), icon: MonitorUp, tone: "text-amber-400" },
    { label: "PEAK_DAY", value: `${formatDate(peakDay)} · ${compact(peakViews)}`, icon: Target, tone: "text-violet-400" },
  ];
  const signalRail = [
    ["PEAK", formatDate(peakDay), compact(peakViews), "text-violet-400"],
    ["LOWEST", formatDate(lowestDay), compact(lowestViews), "text-primary"],
    ["AVG_LINE", "30D", avg30d.toFixed(1), "text-amber-400"],
  ] as const;

  return (
    <section className="relative overflow-hidden rounded-none border border-primary/25 bg-card/80 shadow-[0_0_50px_hsl(var(--primary)/0.08)] backdrop-blur-xl">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.18),transparent_32%),radial-gradient(circle_at_bottom_right,hsl(var(--accent)/0.12),transparent_30%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent" />

      <div className="relative space-y-5 p-4 md:p-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-orbitron text-xl font-bold text-primary">TRAFFIC_ANALYSIS_30D</h2>
              <span className="border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 font-mono text-[10px] text-emerald-400">COMPOSED_SIGNAL</span>
            </div>
            <p className="mt-2 max-w-2xl font-mono text-xs leading-relaxed text-muted-foreground">Bar pulses show daily volume, the glowing area shows traffic momentum, and the amber reference line marks the 30-day average.</p>
          </div>
          <div className="inline-flex w-fit items-center gap-2 border border-primary/20 bg-background/45 px-3 py-2 font-mono text-xs text-muted-foreground">
            <BarChart className="h-3.5 w-3.5 text-primary" /> BAR_AREA_AVG
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {kpis.map(({ label, value, icon: Icon, tone }) => (
            <div key={label} className="group relative overflow-hidden rounded-none border border-border/50 bg-background/45 p-4 transition-colors hover:border-primary/40 hover:bg-background/65">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="flex items-center justify-between gap-3">
                <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground">{label}</span>
                <Icon className={`h-4 w-4 ${tone}`} />
              </div>
              <div className="mt-3 break-words font-orbitron text-2xl font-bold text-foreground">{value}</div>
            </div>
          ))}
        </div>

        {data.length === 0 ? (
          <div className="flex h-[380px] items-center justify-center rounded-none border border-dashed border-border/60 bg-background/35 font-mono text-sm text-muted-foreground">NO_TRAFFIC_DATA</div>
        ) : (
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_220px]">
            <div className="relative h-[380px] w-full rounded-none border border-border/40 bg-background/35 p-3 md:p-4">
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.12)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.10)_1px,transparent_1px)] bg-[size:42px_42px] opacity-40" />
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={240}>
                <ComposedChart data={data} margin={{ top: 18, right: 18, left: -8, bottom: 4 }} barCategoryGap="28%">
                  <defs>
                    <linearGradient id="trafficViewsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.74} />
                      <stop offset="52%" stopColor="hsl(var(--primary))" stopOpacity={0.16} />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="trafficBarGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.62} />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.08} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="hsl(var(--border) / 0.32)" strokeDasharray="4 8" vertical={false} />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={formatDate} minTickGap={24} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} width={42} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(var(--primary) / 0.06)", stroke: "hsl(var(--primary) / 0.38)", strokeWidth: 1 }} />
                  <ReferenceLine y={avg30d} stroke="hsl(38 92% 55%)" strokeDasharray="6 6" strokeOpacity={0.85} ifOverflow="extendDomain" />
                  <Bar dataKey="views" fill="url(#trafficBarGradient)" radius={[7, 7, 0, 0]} maxBarSize={28} />
                  <Area type="monotone" dataKey="views" stroke="hsl(var(--primary))" strokeWidth={3} fill="url(#trafficViewsGradient)" activeDot={<ActiveDot />} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
              {signalRail.map(([label, date, value, tone]) => (
                <div key={label} className="rounded-none border border-border/50 bg-background/45 p-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground">{label}</p>
                  <p className="mt-2 font-orbitron text-xl font-bold text-foreground">{date}</p>
                  <p className={`mt-1 font-mono text-xs ${tone}`}>{value} views</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
