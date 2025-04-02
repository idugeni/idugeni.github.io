'use client';

import { ProjectCard } from '@/components/projects/card';
import projectsData from '@/data/projects.json';
import { useViewportAnimation } from '@/hooks/use-viewport-animation';

// Definisikan tipe untuk Project
type Project = {
  id: number;
  title: string;
  description: string;
  technologies: string[];
  imageUrl: string;
  demoUrl?: string;
  repoUrl?: string;
};

export function ProjectsSection() {
  // Menggunakan data dari projects.json
  const { intro, projects } = projectsData as { intro: string, projects: Project[] };

  const { ref: headerRef, style: headerStyle } = useViewportAnimation<HTMLDivElement>({
    type: "fade-in",
    duration: 800
  });

  return (
    <div className="flex flex-col gap-8 py-8 max-w-4xl mx-auto">
      <div ref={headerRef} style={headerStyle} className="text-center">
        <h2 className="text-2xl font-bold mb-4">Project</h2>
        <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">{intro}</p>
      </div>

      <div 
        className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in animate-duration-500 animate-ease-in-out"
      >
        {projects.map((project, index) => (
          <ProjectCardWithAnimation key={project.id} project={project} index={index} />
        ))}
      </div>
    </div>
  );
}

function ProjectCardWithAnimation({ project, index }: { project: Project; index: number }) {
  const { ref: cardRef, style: cardStyle } = useViewportAnimation({
    type: "slide-in-up",
    delay: index * 100,
    duration: 800
  });

  return (
    <div ref={cardRef} style={cardStyle}>
      <ProjectCard
        title={project.title}
        description={project.description}
        image={project.imageUrl}
        tags={project.technologies}
        link={project.demoUrl || project.repoUrl || '#'}
      />
    </div>
  );
}