"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Eye, CheckCircle, XCircle } from "@/lib/icons";

interface MessageStatCardsProps {
  stats: {
    total: number;
    unread: number;
    unreplied: number;
    resendFailed: number;
  };
}

const cards = [
  { key: "total", label: "TOTAL", icon: Mail, tone: "text-primary" },
  { key: "unread", label: "UNREAD", icon: Eye, tone: "text-primary" },
  { key: "unreplied", label: "UNREPLIED", icon: CheckCircle, tone: "text-amber-400" },
  { key: "resendFailed", label: "RESEND_FAILED", icon: XCircle, tone: "text-red-400" },
] as const;

export function MessageStatCards({ stats }: MessageStatCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.key} className="overflow-hidden rounded-none border-border/50 bg-card/80">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="font-mono text-xs tracking-wider text-muted-foreground">{card.label}</CardTitle>
              <Icon className={`h-4 w-4 ${card.tone}`} />
            </CardHeader>
            <CardContent>
              <div className="font-orbitron text-3xl font-bold text-foreground">{stats[card.key]}</div>
              <div className="mt-2 h-1 w-full bg-secondary">
                <div className="h-full w-2/3 bg-primary/70" />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
