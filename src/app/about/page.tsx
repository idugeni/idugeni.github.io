import type { Metadata } from 'next';
import { AboutSection } from '@/components/sections/about';

export const metadata: Metadata = {
  title: 'About | Eliyanto Sarage',
  description: 'Pelajari lebih lanjut tentang latar belakang, pengalaman, dan passion saya dalam dunia pengembangan perangkat lunak',
};

export default function AboutPage() {
  return <AboutSection />;
}