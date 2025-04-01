import type { Metadata } from 'next';
import { ProjectsSection } from '@/components/sections/projects';

export const metadata: Metadata = {
  title: 'Projects | Eliyanto Sarage',
  description: 'Lihat koleksi Project-Project yang telah saya kerjakan, termasuk detail teknologi dan implementasinya',
};

export default function ProjectsPage() {
  return <ProjectsSection />;
}