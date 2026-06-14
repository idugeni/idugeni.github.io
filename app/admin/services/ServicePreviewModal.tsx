"use client";

import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { AdminService } from "./ServiceTable";

interface ServicePreviewModalProps {
  service: AdminService | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ServicePreviewModal({ service, open, onOpenChange }: ServicePreviewModalProps) {
  if (!service) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto rounded-none border-border/50">
        <DialogHeader>
          <DialogTitle className="font-orbitron text-primary">SERVICE_PREVIEW</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-orbitron text-2xl font-bold">{service.nama}</h2>
              <Badge variant="outline" className="rounded-none font-mono">/{service.slug}</Badge>
              <Badge className="rounded-none font-mono" variant={service.aktif ? "default" : "secondary"}>
                {service.aktif ? "ACTIVE" : "INACTIVE"}
              </Badge>
            </div>
            <p className="text-muted-foreground">{service.deskripsi_pendek}</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-none border border-border/50 bg-secondary/30 p-3">
              <div className="font-mono text-xs text-muted-foreground">PRICE</div>
              <div className="font-mono text-sm">{service.harga_mulai || "-"}</div>
            </div>
            <div className="rounded-none border border-border/50 bg-secondary/30 p-3">
              <div className="font-mono text-xs text-muted-foreground">ICON_KEY</div>
              <div className="font-mono text-sm">{service.icon || "-"}</div>
            </div>
            <div className="rounded-none border border-border/50 bg-secondary/30 p-3">
              <div className="font-mono text-xs text-muted-foreground">ORDER</div>
              <div className="font-mono text-sm">{service.urutan}</div>
            </div>
          </div>

          {service.fitur && service.fitur.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-mono text-sm font-semibold text-primary">FEATURES</h3>
              <div className="flex flex-wrap gap-2">
                {service.fitur.map((feature) => (
                  <span key={feature} className="rounded-none border border-primary/20 bg-primary/10 px-2 py-1 font-mono text-xs text-primary">
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          )}

          {service.deskripsi_panjang && (
            <div className="space-y-2">
              <h3 className="font-mono text-sm font-semibold text-primary">LONG_DESCRIPTION</h3>
              <div className="irnk-prose" dangerouslySetInnerHTML={{ __html: service.deskripsi_panjang }} />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
