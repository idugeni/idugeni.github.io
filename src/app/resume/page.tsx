import type { Metadata } from 'next';
import Home from '@/app/page';

export const metadata: Metadata = {
  title: 'Resume | Eliyanto Sarage',
  description: 'Resume dan riwayat profesional Eliyanto Sarage sebagai pengembang web full stack, mencakup pengalaman kerja dan keahlian teknis'
};

export default function ResumePage() {
  'use client';
  return <Home />;
}