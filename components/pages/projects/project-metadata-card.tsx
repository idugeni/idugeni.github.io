"use client";

import { Clock, Users, Briefcase, User } from "@/lib/icons";
import type { Project } from "@/types/pages";

interface ProjectMetadataCardProps {
  project: Project;
}

export function ProjectMetadataCard({ project }: ProjectMetadataCardProps) {
  // Check if any metadata exists
  const hasMetadata = 
    project.tanggalMulai || 
    project.tanggalSelesai || 
    project.klien || 
    project.timSize || 
    project.peran;

  // Don't render if no metadata
  if (!hasMetadata) return null;

  // Format date range
  const formatDateRange = () => {
    if (!project.tanggalMulai && !project.tanggalSelesai) return null;
    
    const formatDate = (dateStr: string) => {
      const date = new Date(dateStr);
      return date.toLocaleDateString("id-ID", { 
        year: "numeric", 
        month: "short" 
      });
    };

    if (project.tanggalMulai && project.tanggalSelesai) {
      return `${formatDate(project.tanggalMulai)} - ${formatDate(project.tanggalSelesai)}`;
    } else if (project.tanggalMulai) {
      return `${formatDate(project.tanggalMulai)} - Present`;
    } else if (project.tanggalSelesai) {
      return `Completed ${formatDate(project.tanggalSelesai)}`;
    }
    return null;
  };

  const dateRange = formatDateRange();

  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-orbitron font-bold mb-4 border-b border-primary/20 pb-2">
        PROJECT_INFO
      </h3>
      
      <dl className="space-y-4">
        {/* Timeline */}
        {dateRange && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Clock className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1">
              <dt className="font-mono text-xs text-muted-foreground uppercase mb-1">
                Timeline
              </dt>
              <dd className="font-mono text-sm text-foreground">
                {dateRange}
              </dd>
            </div>
          </div>
        )}

        {/* Client */}
        {project.klien && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Briefcase className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1">
              <dt className="font-mono text-xs text-muted-foreground uppercase mb-1">
                Client
              </dt>
              <dd className="font-mono text-sm text-foreground">
                {project.klien}
              </dd>
            </div>
          </div>
        )}

        {/* Team Size */}
        {project.timSize && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Users className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1">
              <dt className="font-mono text-xs text-muted-foreground uppercase mb-1">
                Team Size
              </dt>
              <dd className="font-mono text-sm text-foreground">
                {project.timSize}
              </dd>
            </div>
          </div>
        )}

        {/* Role */}
        {project.peran && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <User className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1">
              <dt className="font-mono text-xs text-muted-foreground uppercase mb-1">
                Role
              </dt>
              <dd className="font-mono text-sm text-foreground">
                {project.peran}
              </dd>
            </div>
          </div>
        )}
      </dl>
    </div>
  );
}
