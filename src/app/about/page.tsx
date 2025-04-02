import type { Metadata } from 'next';
import { AboutSection } from '@/components/sections/about';

export const metadata: Metadata = {
  title: 'About | Eliyanto Sarage',
  description: 'Pelajari lebih lanjut tentang latar belakang, pengalaman, dan passion saya dalam pengembangan web full stack dan teknologi modern',
};

export default function AboutPage() {
  return <AboutSection />;
}