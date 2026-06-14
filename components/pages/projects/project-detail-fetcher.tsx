"use client";

import { useEffect, useState } from "react";
import { ProjectDetailClient } from "./project-detail-client";
import type { Project } from "@/types/pages";

interface ProjectDetailFetcherProps {
  slug: string;
}

interface ProjectDetailData {
  project: Project;
  relatedProjects: Project[];
  processedDescription: string;
}

export function ProjectDetailFetcher({ slug }: ProjectDetailFetcherProps) {
  const [data, setData] = useState<ProjectDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchProjectDetail() {
      try {
        const response = await fetch(`/api/projects/${slug}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          if (errorData.error === "not_found") {
            throw new Error("Project not found");
          }
          throw new Error("Failed to fetch project");
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        console.error("[ProjectDetailFetcher] Error:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchProjectDetail();
  }, [slug]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4 p-8 max-w-4xl mx-auto">
        <div className="h-8 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="h-64 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-red-500/30 bg-red-500/10">
            <svg className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="mb-2 text-2xl font-bold text-foreground">Gagal Memuat Proyek</h2>
          <p className="mb-6 text-sm text-muted-foreground">
            Proyek tidak ditemukan atau server sedang mengalami gangguan.
          </p>
          <a href="/projects" className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary">
            Kembali ke Proyek
          </a>
        </div>
      </div>
    );
  }

  return (
    <ProjectDetailClient
      project={data.project}
      relatedProjects={data.relatedProjects}
      processedDescription={data.processedDescription}
    />
  );
}
