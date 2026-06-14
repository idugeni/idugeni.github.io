"use client";

import Link from "next/link";
import Image from "next/image";
import { GlitchText } from "@/components/ui/glitch-text";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { ArrowLeft, GitBranch as Github, ExternalLink } from "@/lib/icons";
import type { Project } from "@/types/pages";
import { getAspectRatioClass } from "@/lib/utils/aspect-ratio";
import { ProjectMetadataCard } from "./project-metadata-card";
import { RelatedProjects } from "./related-projects";
import { ProjectCTA } from "./project-cta";
import {
  getSafeImageSource,
  shouldBypassImageOptimization,
} from "@/lib/utils/image-source";

interface ProjectDetailClientProps {
  project: Project;
  relatedProjects?: Project[];
  processedDescription: string;
}

export function ProjectDetailClient({
  project,
  relatedProjects,
  processedDescription,
}: ProjectDetailClientProps) {
  return (
    <div className="pt-4 pb-16 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <Link href="/projects" prefetch={false}>
            <Button variant="ghost" className="mb-8 font-mono text-muted-foreground hover:text-primary">
              <ArrowLeft className="mr-2 h-4 w-4" /> RETURN_TO_ARCHIVES
            </Button>
          </Link>

          <div className="mb-6 flex items-center gap-4">
            <span className="text-xs font-mono text-primary border border-primary/30 bg-primary/10 px-3 py-1 rounded-full">
              {project.kategori || "UNCATEGORIZED"}
            </span>
            <span className="text-xs font-mono text-accent border border-accent/30 bg-accent/10 px-3 py-1 rounded-full uppercase">
              STATUS: {project.status}
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-orbitron font-bold mb-6 neon-text">
            <GlitchText text={project.nama.toUpperCase()} />
          </h1>

          <div className="flex flex-wrap gap-4 mb-12">
            {project.githubUrl && (
              <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="font-mono border-primary/50 hover:bg-primary/20">
                  <Github className="mr-2 h-4 w-4" /> REPOSITORY
                </Button>
              </a>
            )}
            {project.liveUrl && (
              <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                <Button className="font-mono bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_15px_rgba(6,182,212,0.4)]">
                  <ExternalLink className="mr-2 h-4 w-4" /> LAUNCH_LIVE
                </Button>
              </a>
            )}
          </div>
        </ScrollReveal>

        <ScrollReveal delay={200}>
          {getSafeImageSource(project.thumbnailUrl) ? (
            <div className={`w-full ${getAspectRatioClass(project.thumbnailAspectRatio)} border border-primary/30 rounded-lg overflow-hidden mb-12 shadow-[0_0_30px_rgba(6,182,212,0.15)] relative group`}>
              <div className="absolute inset-0 bg-primary/20 mix-blend-overlay group-hover:opacity-0 transition-opacity duration-500 z-10" />
              <Image
                src={getSafeImageSource(project.thumbnailUrl)!}
                alt={project.nama}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 900px"
                loading="eager"
                fetchPriority="high"
                unoptimized={shouldBypassImageOptimization(project.thumbnailUrl)}
              />
              <div className="absolute top-4 left-4 z-20 font-mono text-xs bg-background/80 backdrop-blur px-2 py-1 border border-primary/30 text-primary">
                SYS_IMG_01
              </div>
            </div>
          ) : (
            <div className="w-full aspect-video border border-primary/30 rounded-lg mb-12 flex items-center justify-center bg-secondary/50">
              <span className="font-mono text-muted-foreground">[IMAGE_DATA_MISSING]</span>
            </div>
          )}
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <ScrollReveal delay={300} className="md:col-span-2">
            <h2 className="text-2xl font-orbitron font-bold mb-4 text-primary">PROJECT_OVERVIEW</h2>
            <article
              className="irnk-prose text-justify"
              dangerouslySetInnerHTML={{ __html: processedDescription }}
            />
          </ScrollReveal>

          <ScrollReveal delay={400} className="space-y-8">
            <div className="glass-card p-6">
              <h3 className="text-lg font-orbitron font-bold mb-4 border-b border-primary/20 pb-2">TECH_STACK</h3>
              <div className="flex flex-wrap gap-2">
                {project.techStack?.map((tech: string) => (
                  <span key={tech} className="font-mono text-xs bg-secondary/80 border border-primary/30 px-3 py-1.5 text-foreground">
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            <ProjectMetadataCard project={project} />
          </ScrollReveal>
        </div>

        {/* Related Projects */}
        {relatedProjects && relatedProjects.length > 0 && (
          <RelatedProjects projects={relatedProjects} />
        )}

        {/* Call to Action */}
        <ProjectCTA />
      </div>
    </div>
  );
}
