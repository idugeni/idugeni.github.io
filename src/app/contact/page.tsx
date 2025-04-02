import type { Metadata } from 'next';
import { ContactSection } from '@/components/sections/contact';

export const metadata: Metadata = {
  title: 'Contact | IduGeni',
  description: 'Hubungi saya untuk kolaborasi, pertanyaan, atau diskusi tentang pengembangan web dan teknologi modern'
};

export default function ContactPage() {
  return <ContactSection />;
}