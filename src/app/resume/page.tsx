import type { Metadata } from 'next';
import Home from '../page';

export const metadata: Metadata = {
  title: 'Resume | IduGeni',
  description: 'Resume dan riwayat profesional IduGeni sebagai pengembang web full stack, mencakup pengalaman kerja dan keahlian teknis'
};

export default function ResumePage() {
  'use client';
  return <Home />;
}