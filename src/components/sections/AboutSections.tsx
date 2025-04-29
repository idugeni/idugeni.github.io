'use client';

/**
 * Komponen AboutSection
 * @module AboutSection
 * @description Menampilkan bagian tentang dengan informasi personal dan profesional.
 */
export function AboutSection() {
  const { intro, paragraphs } = aboutData;

  const { ref: headerRef, style: headerStyle } = useViewportAnimation<HTMLDivElement>({
    type: 'fade-in',
    duration: 800
  });

  const { ref: cardRef, style: cardStyle } = useViewportAnimation<HTMLDivElement>({
    type: 'slide-in-up',
    delay: 200,
    duration: 800
  });

  return (
    <div className="flex flex-col gap-8 py-8 max-w-4xl mx-auto">
      <div ref={headerRef} style={headerStyle} className="text-center">
        <h2 className="text-2xl font-bold mb-4">About</h2>
        <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">{intro}</p>
      </div>
      <Card ref={cardRef} style={cardStyle}>
        <CardContent className="p-6">
          {paragraphs.map((paragraph: { title: string; content: string }, index: number) => (
            <section key={index} className="mb-8 last:mb-0">
              <h3 className="text-xl font-semibold mb-3">{paragraph.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{paragraph.content}</p>
            </section>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import aboutData from '@/data/aboutData.json';
import { useViewportAnimation } from '@/hooks/use-viewport-animation';