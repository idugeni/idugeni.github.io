"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Download } from "@/lib/icons";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
  getSafeImageSource,
  shouldBypassImageOptimization,
} from "@/lib/utils/image-source";

interface GalleryPreviewModalProps {
  item: {
    judul: string;
    deskripsi: string | null;
    fileUrl: string;
    thumbnailUrl: string | null;
    fileType: string;
    fileSize: number;
    aspectRatio: string;
    width: number | null;
    height: number | null;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

export function GalleryPreviewModal({ item, open, onOpenChange }: GalleryPreviewModalProps) {
  if (!item) return null;

  const isVideo = item.fileType?.startsWith("video/") ?? false;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-none border-border/50">
        <DialogHeader>
          <DialogTitle className="font-orbitron text-xl">
            MEDIA_PREVIEW
          </DialogTitle>
          <DialogDescription className="font-mono text-sm text-muted-foreground">
            Preview of media file and metadata
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Media Preview */}
          <div className="relative w-full bg-secondary rounded-none overflow-hidden">
            {isVideo ? (
              <video
                src={item.fileUrl}
                controls
                className="w-full h-auto max-h-[60vh]"
              >
                Your browser does not support the video tag.
              </video>
            ) : (
              getSafeImageSource(item.thumbnailUrl, item.fileUrl) ? (
                <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                  <Image
                    src={getSafeImageSource(item.thumbnailUrl, item.fileUrl)!}
                    alt={item.judul}
                    fill
                    className="object-contain"
                    unoptimized={shouldBypassImageOptimization(getSafeImageSource(item.thumbnailUrl, item.fileUrl))}
                  />
                </div>
              ) : (
                <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                  <div className="absolute inset-0 flex items-center justify-center bg-secondary/50 font-mono text-xs text-muted-foreground">
                    [NO_PREVIEW]
                  </div>
                </div>
              )
            )}
          </div>

          {/* Title */}
          <div>
            <h2 className="text-2xl font-bold font-orbitron">{item.judul}</h2>
          </div>

          {/* Description */}
          {item.deskripsi && (
            <div>
              <h3 className="font-mono text-sm font-semibold mb-2 text-primary">
                DESCRIPTION:
              </h3>
              <p className="text-muted-foreground">{item.deskripsi}</p>
            </div>
          )}

          {/* Metadata */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <h3 className="font-mono text-xs font-semibold mb-1 text-muted-foreground">
                FILE_TYPE:
              </h3>
              <p className="font-mono text-sm">{item.fileType || "Unknown"}</p>
            </div>

            <div>
              <h3 className="font-mono text-xs font-semibold mb-1 text-muted-foreground">
                FILE_SIZE:
              </h3>
              <p className="font-mono text-sm">{formatFileSize(item.fileSize)}</p>
            </div>

            <div>
              <h3 className="font-mono text-xs font-semibold mb-1 text-muted-foreground">
                ASPECT_RATIO:
              </h3>
              <p className="font-mono text-sm">{item.aspectRatio}</p>
            </div>

            {item.width && item.height && (
              <div>
                <h3 className="font-mono text-xs font-semibold mb-1 text-muted-foreground">
                  DIMENSIONS:
                </h3>
                <p className="font-mono text-sm">
                  {item.width} × {item.height}
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <a href={item.fileUrl} download target="_blank" rel="noopener noreferrer">
              <Button className="font-mono rounded-none">
                <Download className="w-4 h-4 mr-2" />
                DOWNLOAD
              </Button>
            </a>

            <a href={item.fileUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="font-mono rounded-none">
                OPEN_IN_NEW_TAB
              </Button>
            </a>
          </div>

          {/* File URL */}
          <div>
            <h3 className="font-mono text-sm font-semibold mb-2 text-primary">
              FILE_URL:
            </h3>
            <code className="text-xs bg-secondary px-2 py-1 rounded font-mono break-all">
              {item.fileUrl}
            </code>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
