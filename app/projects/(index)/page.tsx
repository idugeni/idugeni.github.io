import { Suspense } from "react";
import { PublicLayout } from "@/components/layout/public-layout";
import { ProjectsListClient } from "@/components/pages/projects/projects-list-client";
import { getProjectsIndexPageData } from "@/lib/data/public-content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Projects",
  description: "Koleksi proyek yang telah dibangun — dari web apps, mobile apps, hingga AI solutions. Portfolio karya Eliyanto Sarage.",
};

interface ProjectsPageProps {
  searchParams?: Promise<{
    category?: string;
    status?: string;
    tech?: string;
    page?: string;
  }>;
}

async function ProjectsContent({ searchParams }: ProjectsPageProps) {
  const params = await searchParams;
  const page = Number(params?.page ?? "1");
  const { projects, filters, activeFilters, pagination, error } = await getProjectsIndexPageData({
    category: params?.category,
    status: params?.status,
    tech: params?.tech,
    page,
  });

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Failed to load projects.</p>
      </div>
    );
  }

  return (
    <ProjectsListClient
      projects={projects}
      filters={filters}
      activeFilters={activeFilters}
      pagination={pagination}
    />
  );
}

export default function ProjectsPage({ searchParams }: ProjectsPageProps) {
  return (
    <PublicLayout>
      <Suspense
        fallback={
          <div className="sr-only" role="status" aria-live="polite">
            Memuat proyek...
          </div>
        }
      >
        <ProjectsContent searchParams={searchParams} />
      </Suspense>
    </PublicLayout>
  );
}
