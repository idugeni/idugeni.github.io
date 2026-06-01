"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "@/lib/icons";
import {
  bulkDeleteTestimonials,
  bulkUpdateTestimonials,
  createTestimonial,
  deleteTestimonial,
  duplicateTestimonial,
  updateTestimonial,
} from "@/actions/testimonials";
import { TestimonialBulkActionsBar } from "./TestimonialBulkActionsBar";
import { TestimonialFilters, type TestimonialFiltersState } from "./TestimonialFilters";
import { TestimonialFormDialog } from "./TestimonialFormDialog";
import { TestimonialPreviewModal } from "./TestimonialPreviewModal";
import { TestimonialStatCards } from "./TestimonialStatCards";
import { TestimonialTable, type AdminTestimonial } from "./TestimonialTable";

interface Props {
  initialTestimonials: AdminTestimonial[];
  stats: { total: number; visible: number; featured: number; averageRating: number };
  filters: TestimonialFiltersState;
  pagination: { page: number; pageSize: number; totalItems: number; totalPages: number };
}

function pageHref(page: number, filters: TestimonialFiltersState) {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.visibility) params.set("visibility", filters.visibility);
  if (filters.featured) params.set("featured", filters.featured);
  if (filters.rating) params.set("rating", String(filters.rating));
  if (filters.sort) params.set("sort", filters.sort);
  if (filters.order) params.set("order", filters.order);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `/admin/testimonials?${query}` : "/admin/testimonials";
}

export function TestimonialListClient({ initialTestimonials, stats, filters, pagination }: Props) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [preview, setPreview] = useState<AdminTestimonial | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [editing, setEditing] = useState<AdminTestimonial | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const run = async (message: string, action: () => Promise<unknown>) => {
    try {
      await action();
      toast.success(message);
      setSelectedIds([]);
      setFormOpen(false);
      setEditing(null);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Action failed");
    }
  };

  const canGoPrevious = pagination.page > 1;
  const canGoNext = pagination.page < pagination.totalPages;

  return (
    <div className="space-y-6">
      <TestimonialStatCards stats={stats} />
      <TestimonialFilters filters={filters} />
      <div className="flex justify-end">
        <Button className="rounded-none font-mono" onClick={() => { setEditing(null); setFormOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" /> NEW_TESTIMONIAL
        </Button>
      </div>
      <TestimonialBulkActionsBar
        selectedCount={selectedIds.length}
        onShow={() => run("Testimonials shown", () => bulkUpdateTestimonials(selectedIds, { tampil: true }))}
        onHide={() => run("Testimonials hidden", () => bulkUpdateTestimonials(selectedIds, { tampil: false }))}
        onFeature={() => run("Testimonials featured", () => bulkUpdateTestimonials(selectedIds, { featured: true }))}
        onUnfeature={() => run("Testimonials unfeatured", () => bulkUpdateTestimonials(selectedIds, { featured: false }))}
        onDelete={() => run("Testimonials deleted", () => bulkDeleteTestimonials(selectedIds))}
        onClearSelection={() => setSelectedIds([])}
      />

      <Card className="rounded-none border-border/50 bg-card/80">
        <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <CardTitle className="font-orbitron">CLIENT_FEEDBACK ({pagination.totalItems})</CardTitle>
          <p className="font-mono text-xs text-muted-foreground">
            PAGE {pagination.page}/{pagination.totalPages} · SHOWING {initialTestimonials.length} OF {pagination.totalItems}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <TestimonialTable
            testimonials={initialTestimonials}
            selectedIds={selectedIds}
            onSelectAll={(checked) => setSelectedIds(checked ? initialTestimonials.map((item) => item.id) : [])}
            onSelectOne={(id, checked) => setSelectedIds((current) => checked ? [...current, id] : current.filter((selectedId) => selectedId !== id))}
            onPreview={(item) => { setPreview(item); setPreviewOpen(true); }}
            onEdit={(item) => { setEditing(item); setFormOpen(true); }}
            onDuplicate={(id) => run("Testimonial duplicated", () => duplicateTestimonial(id))}
            onDelete={(id) => run("Testimonial deleted", () => deleteTestimonial(id))}
          />
          <div className="flex items-center justify-between gap-3 border-t border-border/50 pt-4">
            <Button asChild variant="outline" className="rounded-none font-mono" disabled={!canGoPrevious}>
              <Link href={canGoPrevious ? pageHref(pagination.page - 1, filters) : pageHref(1, filters)}>PREVIOUS</Link>
            </Button>
            <span className="font-mono text-xs text-muted-foreground">Page {pagination.page} of {pagination.totalPages}</span>
            <Button asChild variant="outline" className="rounded-none font-mono" disabled={!canGoNext}>
              <Link href={canGoNext ? pageHref(pagination.page + 1, filters) : pageHref(pagination.totalPages, filters)}>NEXT</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <TestimonialPreviewModal testimonial={preview} open={previewOpen} onOpenChange={setPreviewOpen} />
      <TestimonialFormDialog
        testimonial={editing}
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={(data, id) => run(id ? "Testimonial updated" : "Testimonial created", () => id ? updateTestimonial(id, data) : createTestimonial(data))}
      />
    </div>
  );
}
