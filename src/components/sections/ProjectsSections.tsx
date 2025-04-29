'use client';

import useSWR from 'swr';
import { ProjectCard } from '@/components/projects/ProjectsCard';
import { useViewportAnimation } from '@/hooks/use-viewport-animation';

/**
 * Tipe data untuk mendefinisikan struktur proyek.
 * @property id ID unik proyek.
 * @property title Judul proyek.
 * @property description Deskripsi proyek.
 * @property technologies Array teknologi yang digunakan.
 * @property imageUrl URL gambar proyek.
 * @property image URL thumbnail dari GitHub (opsional).
 * @property demoUrl URL demo proyek (opsional).
 * @property repoUrl URL repository proyek (opsional).
 */
export type Project = {
  /**
   * ID unik proyek.
   */
  id: number;
  /**
   * Judul proyek.
   */
  title: string;
  /**
   * Deskripsi proyek.
   */
  description: string;
  /**
   * Array teknologi yang digunakan.
   */
  technologies: string[];
  /**
   * URL gambar proyek.
   */
  imageUrl: string;
  /**
   * URL thumbnail dari GitHub (opsional).
   */
  image?: string;
  /**
   * URL demo proyek (opsional).
   */
  demoUrl?: string;
  /**
   * URL repository proyek (opsional).
   */
  repoUrl?: string;
};

/**
 * Fungsi fetcher untuk SWR (pengambilan data proyek dari API).
 * @param url URL endpoint yang akan di-fetch.
 * @returns Data hasil fetch dalam bentuk Promise.
 */
const fetcher = (url: string) => fetch(url).then(res => {
  if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
  return res.json();
});

/**
 * Komponen untuk menampilkan bagian proyek-proyek dengan SWR.
 * Menampilkan daftar proyek dengan animasi fade-in dan slide-in-up.
 *
 * @returns Komponen React yang merender bagian proyek.
 */
export function ProjectsSection() {
  const { data, error, isLoading }: { data: { intro: string, projects: Project[] } | undefined, error: unknown, isLoading: boolean } = useSWR<{ intro: string, projects: Project[] }>(
    '/api/github-projects',
    fetcher,
    { revalidateOnFocus: false }
  );

  const intro = data?.intro || '';
  const projects = data?.projects || [];

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
        {isLoading ? (
          Array.from({ length: 4 }).map((_, index: number) => (
            <div key={index} className="h-[400px] bg-muted animate-pulse rounded-lg"></div>
          ))
        ) : error ? (
          <div className="col-span-2 text-center py-8">
            <p className="text-red-500">Gagal memuat proyek. Silakan coba lagi nanti.</p>
          </div>
        ) : (
          projects.map((project: Project, index: number) => (
            <ProjectCardWithAnimation key={project.id} project={project} index={index} />
          ))
        )}
      </div>
    </div>
  );
}

/**
 * Komponen untuk menampilkan kartu proyek dengan animasi.
 * @param props Properti komponen.
 * @param props.project Data proyek yang akan ditampilkan.
 * @param props.index Indeks proyek untuk menentukan delay animasi.
 * @returns Kartu proyek dengan animasi slide-in-up.
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