"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, Eye, XCircle, CheckCircle } from "@/lib/icons";

export function TestimonialStatCards({ stats }: { stats: { total: number; visible: number; featured: number; averageRating: number } }) {
  const cards = [
    ["TOTAL", stats.total, CheckCircle, "text-primary"],
    ["VISIBLE", stats.visible, Eye, "text-emerald-400"],
    ["FEATURED", stats.featured, Star, "text-amber-400"],
    ["AVG_RATING", stats.averageRating, XCircle, "text-primary"],
  ] as const;
  return <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{cards.map(([label, value, Icon, tone]) => <Card key={label} className="rounded-none border-border/50 bg-card/80"><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="font-mono text-xs tracking-wider text-muted-foreground">{label}</CardTitle><Icon className={`h-4 w-4 ${tone}`} /></CardHeader><CardContent><div className="font-orbitron text-3xl font-bold">{value}</div></CardContent></Card>)}</div>;
}
