"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { bulkDeleteServices, bulkUpdateServices, duplicateService } from "@/actions/services";
import { ServiceBulkActionsBar } from "./ServiceBulkActionsBar";
import { ServiceFilters } from "./ServiceFilters";
import { ServicePreviewModal } from "./ServicePreviewModal";
import { ServiceStatCards } from "./ServiceStatCards";
import { ServiceTable, type AdminService } from "./ServiceTable";

interface ServiceListClientProps {
  initialServices: AdminService[];
  stats: {
    total: number;
    active: number;
    inactive: number;
    priced: number;
  };
  filters: {
    q?: string;
    status?: "active" | "inactive";
    sort?: "date" | "name" | "order" | "status";
    order?: "asc" | "desc";
  };
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

function pageHref(page: number, filters: ServiceListClientProps["filters"]) {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.status) params.set("status", filters.status);
  if (filters.sort) params.set("sort", filters.sort);
  if (filters.order) params.set("order", filters.order);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `/admin/services?${query}` : "/admin/services";
}

export function ServiceListClient({ initialServices, stats, filters, pagination }: ServiceListClientProps) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [previewService, setPreviewService] = useState<AdminService | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const handleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? initialServices.map((service) => service.id) : []);
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    setSelectedIds((current) => checked ? [...current, id] : current.filter((selectedId) => selectedId !== id));
  };

  const handleBulkDelete = async () => {
    try {
      await bulkDeleteServices(selectedIds);
      toast.success(`Deleted ${selectedIds.length} service(s)`);
      setSelectedIds([]);
      router.refresh();
    } catch {
      toast.error("Failed to delete services");
    }
  };

  const handleBulkSetActive = async () => {
    try {
      await bulkUpdateServices(selectedIds, { aktif: true });
      toast.success(`Activated ${selectedIds.length} service(s)`);
      setSelectedIds([]);
      router.refresh();
    } catch {
      toast.error("Failed to activate services");
    }
  };

  const handleBulkSetInactive = async () => {
    try {
      await bulkUpdateServices(selectedIds, { aktif: false });
      toast.success(`Deactivated ${selectedIds.length} service(s)`);
      setSelectedIds([]);
      router.refresh();
    } catch {
      toast.error("Failed to deactivate services");
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      await duplicateService(id);
      toast.success("Service duplicated successfully");
      router.refresh();
    } catch {
      toast.error("Failed to duplicate service");
    }
  };

  const canGoPrevious = pagination.page > 1;
  const canGoNext = pagination.page < pagination.totalPages;

  return (
    <div className="space-y-6">
      <ServiceStatCards stats={stats} />
      <ServiceFilters filters={filters} />
      <ServiceBulkActionsBar
        selectedCount={selectedIds.length}
        onBulkDelete={handleBulkDelete}
        onBulkSetActive={handleBulkSetActive}
        onBulkSetInactive={handleBulkSetInactive}
        onClearSelection={() => setSelectedIds([])}
      />

      <Card className="rounded-none border-border/50 bg-card">
        <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <CardTitle className="font-orbitron">SERVICE_CATALOG ({pagination.totalItems})</CardTitle>
          <p className="font-mono text-xs text-muted-foreground">
            PAGE {pagination.page}/{pagination.totalPages} · SHOWING {initialServices.length} OF {pagination.totalItems}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <ServiceTable
            services={initialServices}
            selectedIds={selectedIds}
            onSelectAll={handleSelectAll}
            onSelectOne={handleSelectOne}
            onPreview={(service) => {
              setPreviewService(service);
              setPreviewOpen(true);
            }}
            onDuplicate={handleDuplicate}
          />

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/50 pt-4">
            <Button asChild variant="outline" className="rounded-none font-mono" disabled={!canGoPrevious}>
              <Link href={canGoPrevious ? pageHref(pagination.page - 1, filters) : pageHref(1, filters)}>PREVIOUS</Link>
            </Button>
            <span className="font-mono text-xs text-muted-foreground">Page {pagination.page} of {pagination.totalPages}</span>
            <Button asChild variant="outline" className="rounded-none font-mono" disabled={!canGoNext}>
              <Link href={canGoNext ? pageHref(pagination.page + 1, filters) : pageHref(pagination.totalPages || 1, filters)}>NEXT</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <ServicePreviewModal service={previewService} open={previewOpen} onOpenChange={setPreviewOpen} />
    </div>
  );
}
