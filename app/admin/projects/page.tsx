import { getAdminProjectsPage, getProjectStats } from "@/actions/projects";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { Plus } from "@/lib/icons";
import Link from "next/link";
import { ProjectListClient } from "./ProjectListClient";

type AdminProjectsSearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function AdminProjects({ searchParams }: { searchParams: AdminProjectsSearchParams }) {
  const params = await searchParams;
  const [pageData, stats] = await Promise.all([
    getAdminProjectsPage(params),
    getProjectStats(),
  ]);

  const supabase = await createClient();
  const { data: categoryRows } = await supabase
    .from("projects")
    .select("kategori")
    .not("kategori", "is", null)
    .order("kategori");
  const categories = Array.from(new Set((categoryRows ?? []).map((row) => row.kategori).filter(Boolean) as string[]));

  const transformedProjects = pageData.projects.map((project) => ({
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
            <Link href="/admin/projects/new">
              <Plus className="mr-2 h-4 w-4" /> NEW_PROJECT
            </Link>
          </Button>
        }
      />

      <ProjectListClient
        initialProjects={transformedProjects}
        categories={categories}
        stats={stats}
        filters={pageData.filters}
        pagination={pageData.pagination}
      />
    </div>
  );
}
