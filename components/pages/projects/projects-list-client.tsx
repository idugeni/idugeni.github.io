"use client";

import Link from "next/link";
import Image from "next/image";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { PageHeader } from "@/components/ui/page-header";
import { HiArrowRight } from "react-icons/hi2";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { cn } from "@/lib/utils";
import type { ProjectsListClientProps } from "@/types/pages";
import {
  getSafeImageSource,
  shouldBypassImageOptimization,
} from "@/lib/utils/image-source";

function getProjectsHref(filters: { category?: string; status?: string; tech?: string }, page?: number) {
  const params = new URLSearchParams();
  if (filters.category) params.set("category", filters.category);
  if (filters.status) params.set("status", filters.status);
  if (filters.tech) params.set("tech", filters.tech);
  if (page && page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `/projects?${query}` : "/projects";
}

export function ProjectsListClient({
  projects,
  filters,
  activeFilters,
  pagination,
}: ProjectsListClientProps) {
  const categories = filters?.categories ?? [];
  const statuses = filters?.statuses ?? [];
  const techStack = filters?.techStack ?? [];
  const currentFilters = activeFilters ?? {};
  const currentPage = pagination?.page ?? 1;
  const totalPages = pagination?.totalPages ?? 1;
  const totalItems = pagination?.totalItems ?? projects.length;
  const hasActiveFilters = Boolean(currentFilters.category || currentFilters.status || currentFilters.tech);

  return (
    <div className="pt-4 pb-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PageHeader
          badge="Portfolio"
          title="ARCHIVES // PROJECTS"
          description="Koleksi proyek yang telah dibangun — dari web apps hingga AI solutions."
        />

        <div className="mb-12 space-y-6">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-primary/70 tracking-widest">
              // FILTER_OPTIONS
            </span>
            {hasActiveFilters && (
              <Link
                href="/projects"
                className="font-mono text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                Clear All Filters
              </Link>
            )}
          </div>

          {categories.length > 0 && (
            <div className="space-y-2">
              <label className="font-mono text-xs text-muted-foreground">
                Category:
              </label>
              <div className="flex flex-wrap gap-2">
                <Link
                  href={getProjectsHref({ ...currentFilters, category: undefined })}
                  className={cn(
                    "font-mono text-xs px-3 py-1.5 rounded-full border transition-all duration-200",
                    !currentFilters.category
                      ? "bg-primary/20 border-primary text-primary shadow-[0_0_10px_rgba(6,182,212,0.3)]"
                      : "bg-transparent border-border/30 text-muted-foreground hover:border-primary/40 hover:bg-primary/10"
                  )}
                >
                  All
                </Link>
                {categories.map((category) => (
                  <Link
                    key={category}
                    href={getProjectsHref({ ...currentFilters, category })}
                    className={cn(
                      "font-mono text-xs px-3 py-1.5 rounded-full border transition-all duration-200",
                      currentFilters.category === category
                        ? "bg-primary/20 border-primary text-primary shadow-[0_0_10px_rgba(6,182,212,0.3)]"
                        : "bg-transparent border-border/30 text-muted-foreground hover:border-primary/40 hover:bg-primary/10"
                    )}
                  >
                    {category}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {statuses.length > 0 && (
            <div className="space-y-2">
              <label className="font-mono text-xs text-muted-foreground">
                Status:
              </label>
              <div className="flex flex-wrap gap-2">
                <Link
                  href={getProjectsHref({ ...currentFilters, status: undefined })}
                  className={cn(
                    "font-mono text-xs px-3 py-1.5 rounded-full border transition-all duration-200",
                    !currentFilters.status
                      ? "bg-primary/20 border-primary text-primary shadow-[0_0_10px_rgba(6,182,212,0.3)]"
                      : "bg-transparent border-border/30 text-muted-foreground hover:border-primary/40 hover:bg-primary/10"
                  )}
                >
                  All
                </Link>
                {statuses.map((status) => (
                  <Link
                    key={status}
                    href={getProjectsHref({ ...currentFilters, status })}
                    className={cn(
                      "font-mono text-xs px-3 py-1.5 rounded-full border transition-all duration-200 capitalize",
                      currentFilters.status === status
                        ? "bg-primary/20 border-primary text-primary shadow-[0_0_10px_rgba(6,182,212,0.3)]"
                        : "bg-transparent border-border/30 text-muted-foreground hover:border-primary/40 hover:bg-primary/10"
                    )}
                  >
                    {status}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {techStack.length > 0 && (
            <div className="space-y-2">
              <label className="font-mono text-xs text-muted-foreground">
                Tech Stack:
              </label>
              <div className="flex flex-wrap gap-2">
                <Link
                  href={getProjectsHref({ ...currentFilters, tech: undefined })}
                  className={cn(
                    "font-mono text-xs px-3 py-1.5 rounded-full border transition-all duration-200",
                    !currentFilters.tech
                      ? "bg-primary/20 border-primary text-primary shadow-[0_0_10px_rgba(6,182,212,0.3)]"
                      : "bg-transparent border-border/30 text-muted-foreground hover:border-primary/40 hover:bg-primary/10"
                  )}
                >
                  All
                </Link>
                {techStack.slice(0, 15).map((tech) => (
                  <Link
                    key={tech}
                    href={getProjectsHref({ ...currentFilters, tech })}
                    className={cn(
                      "font-mono text-xs px-3 py-1.5 rounded-full border transition-all duration-200",
                      currentFilters.tech === tech
                        ? "bg-primary/20 border-primary text-primary shadow-[0_0_10px_rgba(6,182,212,0.3)]"
                        : "bg-transparent border-border/30 text-muted-foreground hover:border-primary/40 hover:bg-primary/10"
                    )}
                  >
                    {tech}
                  </Link>
                ))}
                {techStack.length > 15 && (
                  <span className="font-mono text-xs px-3 py-1.5 text-muted-foreground">
                    +{techStack.length - 15} more
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-border/30">
            <span className="font-mono text-xs text-muted-foreground">
              Showing {projects.length} of {totalItems} projects
            </span>
          </div>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-mono text-muted-foreground">
              No projects found matching your filters.
            </p>
            <Link
              href="/projects"
              className="mt-4 inline-block font-mono text-sm text-primary hover:text-primary/80 transition-colors"
            >
              Clear filters to see all projects
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects.map((project, i) => (
                <ScrollReveal key={project.id} delay={i * 50}>
                  <Link href={`/projects/${project.slug}`}>
                    <div className="h-full flex flex-col cursor-pointer bg-card/90 backdrop-blur-sm border border-border/30 rounded-lg overflow-hidden hover:border-primary/40 hover:shadow-[0_0_20px_rgba(6,182,212,0.1)] transition-all duration-300">
                      <div className="relative h-48 bg-secondary/50 flex items-center justify-center overflow-hidden">
                        {getSafeImageSource(project.thumbnailUrl) ? (
                          <Image
                            src={getSafeImageSource(project.thumbnailUrl)!}
                            alt={project.nama}
                            fill
                            className="object-cover opacity-80 hover:opacity-100 transition-opacity"
                            sizes="(max-width: 768px) 100vw, 400px"
                            unoptimized={shouldBypassImageOptimization(project.thumbnailUrl)}
                          />
                        ) : (
                          <span className="font-mono text-muted-foreground/50">
                            [NO_IMAGE]
                          </span>
                        )}
                      </div>
                      <div className="p-6 flex-1 flex flex-col">
                        <div className="text-xs font-mono text-primary mb-2 border border-primary/30 bg-primary/10 inline-block px-2 py-0.5 rounded-full w-fit">
                          {project.kategori || "UNCATEGORIZED"}
                        </div>
                        <h3 className="text-xl font-orbitron font-bold mb-3">
                          {project.nama}
                        </h3>
                        <p className="text-muted-foreground font-mono text-sm line-clamp-2 mb-4 flex-1">
                          {project.deskripsi}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-auto">
                          {project.techStack?.slice(0, 3).map((tech: string) => (
                            <span
                              key={tech}
                              className="text-[10px] font-mono bg-secondary px-2 py-1 border border-border/50"
                            >
                              {tech}
                            </span>
                          ))}
                          {project.techStack?.length > 3 && (
                            <span className="text-[10px] font-mono bg-secondary px-2 py-1 border border-border/50">
                              +{project.techStack.length - 3}
                            </span>
                          )}
                        </div>
                        <div className="mt-4 pt-4 border-t border-border/30">
                          <button className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 font-mono text-xs font-medium rounded bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20 hover:border-primary/50 transition-all duration-200 group">
                            LIHAT_DETAIL
                            <HiArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </Link>
                </ScrollReveal>
              ))}
            </div>

            {pagination && totalPages > 1 && (
              <nav aria-label="Projects pagination" className="flex items-center justify-between mt-12 pt-8 border-t border-border/30">
                <Link
                  href={pagination.hasPreviousPage ? getProjectsHref(currentFilters, currentPage - 1) : getProjectsHref(currentFilters, 1)}
                  aria-disabled={!pagination.hasPreviousPage}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-sm border px-4 py-2 font-mono text-xs transition-all duration-200",
                    pagination.hasPreviousPage
                      ? "border-primary/30 text-primary hover:bg-primary/10"
                      : "pointer-events-none border-border/20 text-muted-foreground/40"
                  )}
                >
                  <FiChevronLeft className="w-4 h-4" /> Previous
                </Link>
                <span className="font-mono text-xs text-muted-foreground">
                  Page {currentPage} / {totalPages}
                </span>
                <Link
                  href={pagination.hasNextPage ? getProjectsHref(currentFilters, currentPage + 1) : getProjectsHref(currentFilters, totalPages)}
                  aria-disabled={!pagination.hasNextPage}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-sm border px-4 py-2 font-mono text-xs transition-all duration-200",
                    pagination.hasNextPage
                      ? "border-primary/30 text-primary hover:bg-primary/10"
                      : "pointer-events-none border-border/20 text-muted-foreground/40"
                  )}
                >
                  Next <FiChevronRight className="w-4 h-4" />
                </Link>
              </nav>
            )}
          </>
        )}
      </div>
    </div>
  );
}
