"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, UserCheck, XCircle, Clock } from "@/lib/icons";

interface NewsletterStatCardsProps { stats: { total: number; active: number; inactive: number; recent: number } }
const cards = [
  ["TOTAL", "total", Mail, "text-primary"],
  ["ACTIVE", "active", UserCheck, "text-emerald-400"],
  ["UNSUBSCRIBED", "inactive", XCircle, "text-red-400"],
  ["RECENT_7D", "recent", Clock, "text-amber-400"],
] as const;
export function NewsletterStatCards({ stats }: NewsletterStatCardsProps) {
  return <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{cards.map(([label, key, Icon, tone]) => <Card key={key} className="rounded-none border-border/50 bg-card/80"><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="font-mono text-xs tracking-wider text-muted-foreground">{label}</CardTitle><Icon className={`h-4 w-4 ${tone}`} /></CardHeader><CardContent><div className="font-orbitron text-3xl font-bold">{stats[key]}</div></CardContent></Card>)}</div>;
}
