"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, CheckCircle, XCircle, Tag } from "@/lib/icons";

interface ServiceStatCardsProps {
  stats: {
    total: number;
    active: number;
    inactive: number;
    priced: number;
  };
}

export function ServiceStatCards({ stats }: ServiceStatCardsProps) {
  const cards = [
    { label: "TOTAL_SERVICES", value: stats.total, icon: Activity, tone: "text-primary" },
    { label: "ACTIVE", value: stats.active, icon: CheckCircle, tone: "text-emerald-400" },
    { label: "INACTIVE", value: stats.inactive, icon: XCircle, tone: "text-muted-foreground" },
    { label: "PRICED", value: stats.priced, icon: Tag, tone: "text-amber-400" },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.label} className="bg-card border-border/50 rounded-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="font-mono text-xs text-muted-foreground">{card.label}</CardTitle>
              <Icon className={`h-4 w-4 ${card.tone}`} />
            </CardHeader>
            <CardContent>
              <div className="font-orbitron text-2xl font-bold text-foreground">{card.value}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
