"use client";

import Link from "next/link";
import Image from "next/image";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import type { Project } from "@/types/pages";
import { getAspectRatioClass } from "@/lib/utils/aspect-ratio";
import { ArrowRight } from "@/lib/icons";

interface RelatedProjectsProps {
  projects: Project[];
}

export function RelatedProjects({ projects }: RelatedProjectsProps) {
  // Don't render if no related projects
  if (!projects || projects.length === 0) return null;

  return (
    <div className="mt-16 border-t border-border/30 pt-16">
      <ScrollReveal>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-orbitron font-bold text-primary">
            RELATED_PROJECTS
          </h2>
          <Link 
            href="/projects"
            className="font-mono text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
          >
            VIEW_ALL
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </ScrollReveal>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {projects.map((project, i) => (
          <ScrollReveal key={project.id} delay={i * 100}>
            <Link href={`/projects/${project.slug}`}>
              <div className="glass-card group hover:border-primary/50 transition-all duration-300 overflow-hidden">
                {/* Thumbnail */}
                {project.thumbnailUrl ? (
                  <div className={`relative ${getAspectRatioClass(project.thumbnailAspectRatio)} overflow-hidden`}>
                    <Image 
                      src={project.thumbnailUrl} 
                      alt={project.nama} 
                      fill 
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                ) : (
                  <div className={`relative ${getAspectRatioClass(project.thumbnailAspectRatio)} bg-secondary/50 flex items-center justify-center`}>
                    <span className="font-mono text-xs text-muted-foreground">[NO_IMAGE]</span>
                  </div>
                )}

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-orbitron font-bold text-foreground group-hover:text-primary transition-colors mb-2 line-clamp-1">
                    {project.nama}
                  </h3>
                  
                  {/* Category & Status */}
                  <div className="flex items-center gap-2 mb-3">
                    {project.kategori && (
                      <span className="text-[10px] font-mono text-muted-foreground border border-border/30 bg-secondary/20 px-2 py-0.5 uppercase">
                        {project.kategori}
                      </span>
                    )}
                    <span className="text-[10px] font-mono text-accent border border-accent/30 bg-accent/10 px-2 py-0.5 uppercase">
                      {project.status}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="font-mono text-xs text-muted-foreground line-clamp-2 mb-3">
                    {project.deskripsi}
                  </p>

                  {/* Tech Stack */}
                  {project.techStack && project.techStack.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {project.techStack.slice(0, 3).map((tech) => (
                        <span 
                          key={tech}
                          className="text-[9px] font-mono bg-primary/10 text-primary px-2 py-0.5"
                        >
                          {tech}
                        </span>
                      ))}
                      {project.techStack.length > 3 && (
                        <span className="text-[9px] font-mono text-muted-foreground px-2 py-0.5">
                          +{project.techStack.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          </ScrollReveal>
        ))}
      </div>
    </div>
  );
}
