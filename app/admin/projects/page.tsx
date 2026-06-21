import type { Metadata } from "next";
import { Suspense } from "react";
import { getAdminProjectsReadModel, getProjectCategoriesReadModel, getProjectStatsReadModel } from "@/lib/data/admin/projects";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Plus, Loader2Icon } from "@/lib/icons";
import Link from "next/link";
import { ProjectListClient } from "./ProjectListClient";

export const metadata: Metadata = { title: "Projects" };

type AdminProjectsSearchParams = Promise<Record<string, string | string[] | undefined>>;

async function ProjectsContent({ searchParams }: { searchParams: AdminProjectsSearchParams }) {
  let pageData = null;
  let stats = null;
  let categories: string[] = [];
  let error: string | null = null;

  try {
    const params = await searchParams;
    const [pd, st, cats] = await Promise.all([
      getAdminProjectsReadModel(params),
      getProjectStatsReadModel(),
      getProjectCategoriesReadModel(),
    ]);
    pageData = pd;
    stats = st;
    categories = cats;
  } catch (err) {
    error = err instanceof Error ? err.message : "Failed to load projects data";
  }

  if (error) {
    return (
      <div className="rounded-none border border-red-500/30 bg-red-500/10 p-6">
        <p className="font-mono text-sm text-red-400">{error}</p>
      </div>
    );
  }

  const transformedProjects = pageData!.projects.map((project) => ({
    id: project.id,
    nama: project.nama,
    slug: project.slug,
    deskripsi: project.deskripsi,
    kategori: project.kategori,
    status: project.status,
    tech_stack: project.tech_stack,
    thumbnail_url: project.thumbnail_url,
    klien: project.klien,
    tanggal_mulai: project.tanggal_mulai,
    tanggal_selesai: project.tanggal_selesai,
    github_url: project.github_url,
    live_url: project.live_url,
    featured: project.featured,
    created_at: project.created_at,
  }));

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="PORTFOLIO_CONTROL_CENTER"
        title="Projects"
        subtitle="Manage portfolio archive, status pipeline, featured placement, tech stack tags, and client deliverables."
        actions={
          <Button asChild className="rounded-none bg-primary font-mono text-primary-foreground hover:bg-primary/90">
            <Link href="/admin/projects/new" prefetch={false}>
              <Plus className="mr-2 h-4 w-4" /> NEW_PROJECT
            </Link>
          </Button>
        }
      />

      <ProjectListClient
        initialProjects={transformedProjects}
        categories={categories}
        stats={stats!}
        filters={pageData!.filters}
        pagination={pageData!.pagination}
      />
    </div>
  );
}

function ProjectsLoading() {
  return (
    <div className="flex flex-col items-center justify-center py-20 space-y-4">
      <Loader2Icon className="h-8 w-8 animate-spin text-primary" />
      <p className="font-mono text-xs text-muted-foreground">Loading projects...</p>
    </div>
  );
}

export default function AdminProjects({ searchParams }: { searchParams: AdminProjectsSearchParams }) {
  return (
    <Suspense fallback={<ProjectsLoading />}>
      <ProjectsContent searchParams={searchParams} />
    </Suspense>
  );
}
