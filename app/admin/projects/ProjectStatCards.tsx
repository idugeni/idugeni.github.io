"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, CheckCircle, Clock, Star } from "@/lib/icons";

interface ProjectStatCardsProps {
  stats: {
    total: number;
    ongoing: number;
    completed: number;
    featured: number;
  };
}

export function ProjectStatCards({ stats }: ProjectStatCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="bg-card border-border/50 rounded-none">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-mono text-muted-foreground font-normal">
            TOTAL_PROJECTS
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
            ONGOING
          </CardTitle>
          <Clock className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-orbitron font-bold truncate text-blue-500">
            {stats.ongoing}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border/50 rounded-none">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-mono text-muted-foreground font-normal">
            COMPLETED
          </CardTitle>
          <CheckCircle className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-orbitron font-bold truncate text-green-500">
            {stats.completed}
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
