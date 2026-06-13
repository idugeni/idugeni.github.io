"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProjectStatCards } from "./ProjectStatCards";
import { ProjectFilters } from "./ProjectFilters";
import { ProjectTable } from "./ProjectTable";
import { ProjectBulkActionsBar } from "./ProjectBulkActionsBar";
import { ProjectPreviewModal } from "./ProjectPreviewModal";
import { bulkUpdateProjects, bulkDeleteProjects, duplicateProject } from "@/actions/projects";

interface Project {
  id: string;
  nama: string;
  slug: string;
  deskripsi: string;
  kategori: string | null;
  status: "ongoing" | "completed" | "archived";
  tech_stack: string[] | null;
  thumbnail_url: string | null;
  klien: string | null;
  tanggal_mulai: string | null;
  tanggal_selesai: string | null;
  github_url: string | null;
  live_url: string | null;
  featured: boolean;
  created_at: string;
}

interface ProjectListClientProps {
  initialProjects: Project[];
  categories: string[];
  stats: {
    total: number;
    ongoing: number;
    completed: number;
    featured: number;
  };
  filters: {
    q?: string;
    status?: "ongoing" | "completed" | "archived";
    category?: string;
    featured?: "true";
    sort?: "date" | "name" | "status";
    order?: "asc" | "desc";
  };
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

function pageHref(page: number, filters: ProjectListClientProps["filters"]) {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.status) params.set("status", filters.status);
  if (filters.category) params.set("category", filters.category);
  if (filters.featured) params.set("featured", filters.featured);
  if (filters.sort) params.set("sort", filters.sort);
  if (filters.order) params.set("order", filters.order);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `/admin/projects?${query}` : "/admin/projects";
}

export function ProjectListClient({ initialProjects, categories, stats, filters, pagination }: ProjectListClientProps) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [previewProject, setPreviewProject] = useState<Project | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const handleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? initialProjects.map((project) => project.id) : []);
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    setSelectedIds((current) => checked ? [...current, id] : current.filter((selectedId) => selectedId !== id));
  };

  const handleBulkDelete = async () => {
    try {
      await bulkDeleteProjects(selectedIds);
      toast.success(`Deleted ${selectedIds.length} project(s)`);
      setSelectedIds([]);
      router.refresh();
    } catch {
      toast.error("Failed to delete projects");
    }
  };

  const handleBulkChangeStatus = async (status: "ongoing" | "completed" | "archived") => {
    try {
      await bulkUpdateProjects(selectedIds, { status });
      toast.success(`Updated ${selectedIds.length} project(s) to ${status}`);
      setSelectedIds([]);
      router.refresh();
    } catch {
      toast.error("Failed to update projects");
    }
  };

  const handleBulkSetFeatured = async () => {
    try {
      await bulkUpdateProjects(selectedIds, { featured: true });
      toast.success(`Set ${selectedIds.length} project(s) as featured`);
      setSelectedIds([]);
      router.refresh();
    } catch {
      toast.error("Failed to set featured");
    }
  };

  const handleBulkUnsetFeatured = async () => {
    try {
      await bulkUpdateProjects(selectedIds, { featured: false });
      toast.success(`Unset ${selectedIds.length} project(s) as featured`);
      setSelectedIds([]);
      router.refresh();
    } catch {
      toast.error("Failed to unset featured");
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      await duplicateProject(id);
      toast.success("Project duplicated successfully");
      router.refresh();
    } catch {
      toast.error("Failed to duplicate project");
    }
  };

  const canGoPrevious = pagination.page > 1;
  const canGoNext = pagination.page < pagination.totalPages;

  return (
    <div className="space-y-6">
      <ProjectStatCards stats={stats} />

      <ProjectFilters filters={filters} categories={categories} />

      <ProjectBulkActionsBar
        selectedCount={selectedIds.length}
        onBulkDelete={handleBulkDelete}
        onBulkChangeStatus={handleBulkChangeStatus}
        onBulkSetFeatured={handleBulkSetFeatured}
        onBulkUnsetFeatured={handleBulkUnsetFeatured}
        onClearSelection={() => setSelectedIds([])}
      />

      <Card className="bg-card border-border/50 rounded-none">
        <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <CardTitle className="font-orbitron">
            PROJECT_ARCHIVES ({pagination.totalItems})
          </CardTitle>
          <p className="font-mono text-xs text-muted-foreground">
            PAGE {pagination.page}/{pagination.totalPages} · SHOWING {initialProjects.length} OF {pagination.totalItems}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <ProjectTable
            projects={initialProjects}
            selectedIds={selectedIds}
            onSelectAll={handleSelectAll}
            onSelectOne={handleSelectOne}
            onPreview={(project) => {
              setPreviewProject(project);
              setPreviewOpen(true);
            }}
            onDuplicate={handleDuplicate}
          />

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/50 pt-4">
            <Button asChild variant="outline" className="rounded-none font-mono" disabled={!canGoPrevious}>
              <Link href={canGoPrevious ? pageHref(pagination.page - 1, filters) : pageHref(1, filters)}>PREVIOUS</Link>
            </Button>
            <span className="font-mono text-xs text-muted-foreground">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <Button asChild variant="outline" className="rounded-none font-mono" disabled={!canGoNext}>
              <Link href={canGoNext ? pageHref(pagination.page + 1, filters) : pageHref(pagination.totalPages, filters)}>NEXT</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <ProjectPreviewModal project={previewProject} open={previewOpen} onOpenChange={setPreviewOpen} />
    </div>
  );
}
