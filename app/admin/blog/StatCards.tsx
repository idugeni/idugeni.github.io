"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, CheckCircle, FileEdit, Star } from "@/lib/icons";

interface StatCardsProps {
  stats: {
    total: number;
    published: number;
    draft: number;
    featured: number;
  };
}

export function StatCards({ stats }: StatCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="bg-card border-border/50 rounded-none">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-mono text-muted-foreground font-normal">
            TOTAL_ARTICLES
          </CardTitle>
          <FileText className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-orbitron font-bold truncate">
            {stats.total}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border/50 rounded-none">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-mono text-muted-foreground font-normal">
            PUBLISHED
          </CardTitle>
          <CheckCircle className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-orbitron font-bold truncate text-green-500">
            {stats.published}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border/50 rounded-none">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-mono text-muted-foreground font-normal">
            DRAFTS
          </CardTitle>
          <FileEdit className="h-4 w-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-orbitron font-bold truncate text-yellow-500">
            {stats.draft}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border/50 rounded-none">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-mono text-muted-foreground font-normal">
            FEATURED
          </CardTitle>
          <Star className="h-4 w-4 text-purple-500" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-orbitron font-bold truncate text-purple-500">
            {stats.featured}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
