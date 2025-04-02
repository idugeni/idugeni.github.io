import type { Metadata } from 'next';
import { ProjectsSection } from '@/components/sections/projects';

export const metadata: Metadata = {
  title: 'Projects | Eliyanto Sarage',
  description: 'Lihat koleksi proyek inovatif yang telah saya kembangkan menggunakan React, Node.js, dan teknologi modern lainnya'
};

export default function ProjectsPage() {
  return <ProjectsSection />;
}