"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Image as ImageIcon, Database } from "@/lib/icons";

interface GalleryStatCardsProps {
  stats: {
    total: number;
    totalSize: number;
    images: number;
    videos: number;
  };
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

export function GalleryStatCards({ stats }: GalleryStatCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="bg-card border-border/50 rounded-none">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-mono text-muted-foreground font-normal">
            TOTAL_ITEMS
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
            TOTAL_SIZE
          </CardTitle>
          <Database className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-orbitron font-bold truncate text-blue-500">
            {formatFileSize(stats.totalSize)}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border/50 rounded-none">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-mono text-muted-foreground font-normal">
            IMAGES
          </CardTitle>
          <ImageIcon className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-orbitron font-bold truncate text-green-500">
            {stats.images}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border/50 rounded-none">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-mono text-muted-foreground font-normal">
            VIDEOS
          </CardTitle>
          <ImageIcon className="h-4 w-4 text-purple-500" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-orbitron font-bold truncate text-purple-500">
            {stats.videos}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
