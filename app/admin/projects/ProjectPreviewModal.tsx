"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Star, ExternalLink } from "@/lib/icons";
import Image from "next/image";
import Link from "next/link";

interface ProjectPreviewModalProps {
  project: {
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
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProjectPreviewModal({ project, open, onOpenChange }: ProjectPreviewModalProps) {
  if (!project) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto rounded-none border-border/50">
        <DialogHeader>
          <DialogTitle className="font-orbitron text-xl">
            PROJECT_PREVIEW
          </DialogTitle>
          <DialogDescription className="font-mono text-sm text-muted-foreground">
            Preview of project details and metadata
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Thumbnail */}
          {project.thumbnail_url && (
            <div className="relative w-full h-64 bg-secondary">
              <Image
                src={project.thumbnail_url}
                alt={project.nama}
                fill
                className="object-cover"
              />
            </div>
          )}

          {/* Title */}
          <div>
            <h2 className="text-2xl font-bold font-orbitron">{project.nama}</h2>
          </div>

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            {/* Status */}
            <Badge
              variant={project.status === "completed" ? "default" : "secondary"}
              className="font-mono rounded-none"
            >
              {project.status.toUpperCase()}
            </Badge>

            {/* Featured */}
            {project.featured && (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="font-mono text-xs">FEATURED</span>
              </div>
            )}

            {/* Category */}
            {project.kategori && (
              <span className="font-mono text-sm px-2 py-1 bg-secondary border border-border/50">
                {project.kategori}
              </span>
            )}

            {/* Client */}
            {project.klien && (
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-muted-foreground">CLIENT:</span>
                <span className="font-mono text-sm">{project.klien}</span>
              </div>
            )}

            {/* Timeline */}
            {(project.tanggal_mulai || project.tanggal_selesai) && (
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-muted-foreground">TIMELINE:</span>
                <span className="font-mono text-sm">
                  {[project.tanggal_mulai, project.tanggal_selesai].filter(Boolean).join(" - ")}
                </span>
              </div>
            )}
          </div>

          {/* Description */}
          {project.deskripsi && (
            <div>
              <h3 className="font-mono text-sm font-semibold mb-2 text-primary">
                DESCRIPTION:
              </h3>
              <p className="text-muted-foreground">{project.deskripsi}</p>
            </div>
          )}

          {/* Tech Stack */}
          {project.tech_stack && project.tech_stack.length > 0 && (
            <div>
              <h3 className="font-mono text-sm font-semibold mb-2 text-primary">
                TECH_STACK:
              </h3>
              <div className="flex flex-wrap gap-2">
                {project.tech_stack.map((tech, idx) => (
                  <span
                    key={idx}
                    className="font-mono text-xs px-2 py-1 bg-primary/10 text-primary border border-primary/20"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Links */}
          <div className="flex flex-wrap gap-4">
            {/* Live Demo */}
            {project.live_url && (
              <Link href={project.live_url} target="_blank">
                <Badge
                  variant="outline"
                  className="font-mono rounded-none cursor-pointer hover:bg-secondary"
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  LIVE_DEMO
                </Badge>
              </Link>
            )}

            {/* Repository */}
            {project.github_url && (
              <Link href={project.github_url} target="_blank">
                <Badge
                  variant="outline"
                  className="font-mono rounded-none cursor-pointer hover:bg-secondary"
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  REPOSITORY
                </Badge>
              </Link>
            )}

            {/* Public Page */}
            <Link href={`/projects/${project.slug}`} target="_blank">
              <Badge
                variant="outline"
                className="font-mono rounded-none cursor-pointer hover:bg-secondary"
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                PUBLIC_PAGE
              </Badge>
            </Link>
          </div>

          {/* Slug */}
          <div>
            <h3 className="font-mono text-sm font-semibold mb-2 text-primary">
              SLUG:
            </h3>
            <code className="text-sm bg-secondary px-2 py-1 rounded font-mono">
              /projects/{project.slug}
            </code>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
