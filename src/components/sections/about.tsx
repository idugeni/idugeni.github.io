/**
 * @module AboutSection
 * @description Modul yang menampilkan bagian tentang dengan informasi personal dan profesional
 */

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import aboutData from '@/data/about.json';

/**
 * @function AboutSection
 * @description Komponen yang menampilkan informasi tentang pemilik portfolio
 * @returns {JSX.Element} Komponen React yang merender bagian about
 */
export function AboutSection() {
  const { intro, paragraphs } = aboutData;

  return (
    <div className="flex flex-col gap-8 py-8 max-w-4xl mx-auto">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">About</h2>
        <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">{intro}</p>
      </div>
      <Card>
        <CardContent className="py-8 px-6">
          {paragraphs.map((paragraph, index) => (
            <div key={index} className="mb-8 last:mb-0">
              <h3 className="text-xl font-semibold mb-3">{paragraph.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{paragraph.content}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}