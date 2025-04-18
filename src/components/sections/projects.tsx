'use client';

import { useState, useEffect } from 'react';
import { ProjectCard } from '@/components/projects/ProjectsCard';
import { useViewportAnimation } from '@/hooks/use-viewport-animation';

/**
 * Tipe data untuk mendefinisikan struktur proyek
 * @typedef {Object} Project
 * @property {number} id - ID unik proyek
 * @property {string} title - Judul proyek
 * @property {string} description - Deskripsi proyek
 * @property {string[]} technologies - Array teknologi yang digunakan
 * @property {string} imageUrl - URL gambar proyek
 * @property {string} [demoUrl] - URL demo proyek (opsional)
 * @property {string} [repoUrl] - URL repository proyek (opsional)
 */
type Project = {
  id: number;
  title: string;
  description: string;
  technologies: string[];
  imageUrl: string;
  image?: string; // URL thumbnail dari GitHub
  demoUrl?: string;
  repoUrl?: string;
};

/**
 * Komponen untuk menampilkan bagian proyek-proyek
 * @returns {JSX.Element} Bagian proyek yang berisi daftar kartu proyek dengan animasi
 */
export function ProjectsSection() {
  const [projectsData, setProjectsData] = useState<{ intro: string, projects: Project[] }>({ 
    intro: "", 
    projects: [] 
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchProjects() {
      try {
        const response = await fetch('/api/github-projects', { signal: controller.signal });
        if (!response.ok) {
          throw new Error(`Failed to fetch projects: ${response.status}`);
        }
        const data = await response.json();
        setProjectsData(data);
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== 'AbortError') {
          console.error('Error fetching projects:', err);
          setError('Gagal memuat proyek. Silakan coba lagi nanti.');
        }
      } finally {
        setLoading(false);
      }
    }

    fetchProjects();
    return () => controller.abort();
  }, []);

  const { intro, projects } = projectsData;

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
        {loading ? (
          // Tampilkan skeleton loader saat loading
          Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-[400px] bg-muted animate-pulse rounded-lg"></div>
          ))
        ) : error ? (
          // Tampilkan pesan error jika gagal memuat
          <div className="col-span-2 text-center py-8">
            <p className="text-red-500">{error}</p>
          </div>
        ) : (
          // Tampilkan proyek jika berhasil dimuat
          projects.map((project, index) => (
            <ProjectCardWithAnimation key={project.id} project={project} index={index} />
          ))
        )}
      </div>
    </div>
  );
}

/**
 * Komponen untuk menampilkan kartu proyek dengan animasi
 * @param {Object} props - Props komponen
 * @param {Project} props.project - Data proyek yang akan ditampilkan
 * @param {number} props.index - Indeks proyek untuk menentukan delay animasi
 * @returns {JSX.Element} Kartu proyek dengan animasi slide-in-up
 */
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
        image={project.image || project.imageUrl}
        tags={project.technologies}
        demoUrl={project.demoUrl}
        repoUrl={project.repoUrl}
      />
    </div>
  );
}