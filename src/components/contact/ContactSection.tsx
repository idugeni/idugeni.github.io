"use client";

import React from 'react';
import contactData from '@/data/contactData.json';
import { useViewportAnimation } from '@/hooks/use-viewport-animation';
import ContactForm from '@/components/contact/ContactForm';
import ContactInfo from '@/components/contact/ContactInfo';

/**
 * Komponen ContactSection
 * @module ContactSection
 * @description Menampilkan bagian kontak dengan formulir dan informasi kontak.
 */
export function ContactSection() {
  const { intro, form, contactInfo } = contactData;
  const { ref: headerRef, style: headerStyle } = useViewportAnimation<HTMLDivElement>({ type: 'slide-in-up', duration: 700 });

  return (
    <section className="flex flex-col gap-8 py-8 max-w-4xl mx-auto">
      <header ref={headerRef} className="text-center" style={headerStyle}>
        <h2 className="text-2xl font-bold mb-4">Contact</h2>
        <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">{intro}</p>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <ContactForm form={form} />
        <ContactInfo contactInfo={contactInfo} />
      </div>
    </section>
  );
}