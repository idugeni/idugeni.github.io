"use client";

/**
 * @module ContactSection
 * @description Modul yang menampilkan bagian kontak dengan formulir dan informasi kontak
 */

import React from 'react';
import contactData from '@/data/contact.json';
import { useViewportAnimation } from '@/hooks/use-viewport-animation';
import ContactForm from './ContactForm';
import ContactInfo from './ContactInfo';

/**
 * @function ContactSection
 * @description Komponen yang menampilkan formulir kontak dan informasi kontak
 * @returns {JSX.Element} Komponen React yang merender bagian kontak
 */
export function ContactSection() {
  const { intro, form, contactInfo } = contactData;
  const { ref: headerRef, style: headerStyle } = useViewportAnimation<HTMLDivElement>({type: "slide-in-up", duration: 700});

  return (
    <div className="flex flex-col gap-8 py-8 max-w-4xl mx-auto">
      <div 
        ref={headerRef}
        className="text-center"
        style={headerStyle}
      >
        <h2 className="text-2xl font-bold mb-4">Contact</h2>
        <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">{intro}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <ContactForm form={form} />
        <ContactInfo contactInfo={contactInfo} />
      </div>
    </div>
  );
}