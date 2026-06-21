"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Edit, Eye, Download } from "@/lib/icons";
import Image from "next/image";
import { DeleteGalleryItemButton } from "./DeleteGalleryItemButton";
import { getAspectRatioClass } from "@/lib/utils/aspect-ratio";
import { getSafeImageSource } from "@/lib/utils/image-source";
import { AdminTableActionButton } from "@/components/admin/AdminTableActionButton";
import type { AspectRatio } from "@/types/pages";

interface GalleryItem {
  id: string;
  slug: string;
  judul: string;
  deskripsi: string | null;
  fileUrl: string;
  thumbnailUrl: string | null;
  fileType: string;
  fileSize: number;
  aspectRatio: string;
  width: number | null;
  height: number | null;
  created_at: string;
}

interface GalleryGridProps {
  items: GalleryItem[];
  selectedIds: string[];
  onSelectAll: (checked: boolean) => void;
  onSelectOne: (id: string, checked: boolean) => void;
  onPreview: (item: GalleryItem) => void;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

export function GalleryGrid({
  items,
  selectedIds,
  onSelectAll,
  onSelectOne,
  onPreview,
}: GalleryGridProps) {
  const allSelected = items.length > 0 && selectedIds.length === items.length;

  return (
    <div className="space-y-4">
      {/* Select All */}
      <div className="flex items-center gap-2">
        <Checkbox
          checked={allSelected}
          onCheckedChange={onSelectAll}
          aria-label="Select all"
          className="rounded-none"
        />
        <span className="font-mono text-sm text-muted-foreground">
          SELECT_ALL ({items.length} items)
        </span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.length === 0 ? (
          <div className="col-span-full py-8 text-center font-mono text-muted-foreground">
            NO_MEDIA_FOUND
          </div>
        ) : (
          items.map((item, index) => {
            const imageSource = getSafeImageSource(item.thumbnailUrl, item.fileUrl);

            return (
              <div
                key={item.id}
                className={`relative group border border-border/50 bg-secondary/50 overflow-hidden ${getAspectRatioClass(item.aspectRatio as AspectRatio)}`}
              >
                {/* Checkbox */}
                <div className="absolute top-2 left-2 z-10">
                  <Checkbox
                    checked={selectedIds.includes(item.id)}
                    onCheckedChange={(checked) => onSelectOne(item.id, checked as boolean)}
                    aria-label={`Select ${item.judul}`}
                    className="rounded-none bg-background/80 backdrop-blur-sm"
                  />
                </div>

                {/* Image/Video */}
                {imageSource ? (
                  <Image
                    src={imageSource}
                    alt={item.judul}
                    fill
                    className="object-cover opacity-80 mix-blend-screen group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    loading={index < 4 ? "eager" : "lazy"}
                  />
                ) : (
                  <div className="w-full h-full bg-secondary/30 flex items-center justify-center">
                    <span className="font-mono text-xs text-muted-foreground">NO_IMAGE</span>
                  </div>
                )}

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center items-center p-4">
                  <p className="font-mono text-xs text-primary mb-1 text-center truncate w-full">
                    {item.judul}
                  </p>
                  <p className="font-mono text-[10px] text-muted-foreground mb-2">
                    {item.aspectRatio}
                  </p>
                  <p className="font-mono text-[10px] text-muted-foreground mb-3">
                    {formatFileSize(item.fileSize)}
                  </p>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <AdminTableActionButton label={`Preview ${item.judul}`} icon={Eye} intent="view" onClick={() => onPreview(item)} />
                    <AdminTableActionButton label={`Download ${item.judul}`} icon={Download} intent="download" href={item.fileUrl} target="_blank" rel="noopener noreferrer" download />
                    <AdminTableActionButton label={`Edit ${item.judul}`} icon={Edit} intent="edit" href={`/admin/gallery/${item.slug}/edit`} />
                    <DeleteGalleryItemButton itemId={item.id} itemTitle={item.judul} />
                  </div>
                </div>

                {/* Aspect Ratio Badge */}
                <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/60 backdrop-blur-sm font-mono text-[9px] text-muted-foreground">
                  {item.aspectRatio}
                </div>

                {/* File Type Badge */}
                <div className="absolute top-1 right-1 px-1.5 py-0.5 bg-black/60 backdrop-blur-sm font-mono text-[9px] text-muted-foreground">
                  {item.fileType?.split("/")[0]?.toUpperCase() || "FILE"}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
