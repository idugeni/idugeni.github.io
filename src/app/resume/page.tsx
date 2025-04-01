import type { Metadata } from 'next';
import Home from '../page';

export const metadata: Metadata = {
  title: 'Resume | Eliyanto Sarage',
  description: 'Resume dan riwayat profesional Eliyanto Sarage, mencakup pengalaman kerja, pendidikan, dan keahlian teknis',
};

export default function ResumePage() {
  'use client';
  return <Home />;
}