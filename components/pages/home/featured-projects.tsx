import Link from "next/link";
import Image from "next/image";
import { TiltCard } from "@/components/ui/tilt-card";
import { NeonBorder } from "@/components/ui/neon-border";
import { Button } from "@/components/ui/button";
import { HiOutlineArrowRight } from "react-icons/hi2";
import type { FeaturedProjectsProps } from "@/types/pages";
import { getSafeImageSource, shouldBypassImageOptimization } from "@/lib/utils/image-source";
import { SectionEmptyState } from "./section-empty-state";

export function FeaturedProjects({ projects }: FeaturedProjectsProps) {
  return (
    <section className="py-24 relative overflow-hidden bg-[radial-gradient(ellipse_100%_50%_at_50%_50%,hsl(var(--secondary)/0.4),transparent)] before:absolute before:inset-0 before:bg-[linear-gradient(135deg,transparent_0%,hsl(var(--primary)/0.02)_50%,transparent_100%)]">
      {/* Noise texture overlay */}
      <div className="absolute inset-0 opacity-[0.015] mix-blend-soft-light pointer-events-none" 
        style={{backgroundImage: "url(data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E)"}} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="sr-reveal">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-orbitron font-bold neon-text">FEATURED_PROJECTS</h2>
            <Link href="/projects" prefetch={false}>
              <Button variant="ghost" className="font-mono text-primary hover:text-primary/80">
                VIEW_ALL <HiOutlineArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        {!projects || projects.length === 0 ? (
          <SectionEmptyState
            title="NO_FEATURED_PROJECTS_YET"
            description="Projects will appear here once published and marked as featured."
            icon="◇"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {projects.map((project, i) => (
              <div key={project.id} className="sr-reveal" style={{ transitionDelay: `${i * 150}ms` }}>
                <Link href={`/projects/${project.slug}`} prefetch={false}>
                  <TiltCard className="h-full">
                    <NeonBorder className="h-full flex flex-col">
                      <div className="relative h-48 bg-secondary/50 border-b border-primary/20 overflow-hidden group">
                        {getSafeImageSource(project.thumbnailUrl) ? (
                          <Image
                            src={getSafeImageSource(project.thumbnailUrl)!}
                            alt={project.nama}
                            fill
                            className="object-cover opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                            sizes="(max-width: 768px) 100vw, 400px"
                            unoptimized={shouldBypassImageOptimization(project.thumbnailUrl)}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="font-mono text-muted-foreground/50">[NO_IMAGE]</span>
                          </div>
                        )}
                        <div className="absolute top-3 right-3 bg-background/80 backdrop-blur px-2 py-1 border border-primary/30 font-mono text-[10px] text-primary">
                          {project.status?.toUpperCase()}
                        </div>
                      </div>
                      <div className="p-6 flex-1 flex flex-col">
                        <span className="text-xs font-mono text-primary mb-2">{project.kategori || "PROJECT"}</span>
                        <h3 className="text-lg font-orbitron font-bold mb-2">{project.nama}</h3>
                        <p className="text-muted-foreground font-mono text-xs line-clamp-2 mb-4 flex-1">{project.deskripsi}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {project.techStack?.slice(0, 3).map((tech: string) => (
                            <span key={tech} className="text-[10px] font-mono bg-secondary px-2 py-0.5 border border-border">{tech}</span>
                          ))}
                          {project.techStack?.length > 3 && (
                            <span className="text-[10px] font-mono text-muted-foreground">+{project.techStack.length - 3}</span>
                          )}
                        </div>
                      </div>
                    </NeonBorder>
                  </TiltCard>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
