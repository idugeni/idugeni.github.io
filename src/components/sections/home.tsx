/**
 * @module HomeSection
 * @description Modul yang menampilkan bagian beranda dengan informasi profil pengguna
 */

import React from 'react';
import profileData from '@/data/profile.json';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { SocialIcons } from '@/components/ui/social-icons';

/**
 * @function HomeSection
 * @description Komponen yang menampilkan informasi profil utama, termasuk foto, nama, bio, dan tautan sosial media
 * @returns {JSX.Element} Komponen React yang merender bagian beranda
 */
export function HomeSection() {
  // Menggunakan data dari profile.json
  const { name, title, bio, photo, actions, socialMedia } = profileData;

  return (
    <Card className="flex flex-col items-center justify-center gap-6 py-8 text-center max-w-4xl mx-auto bg-background/50 backdrop-blur-sm border-primary/10">
      <CardContent className="flex flex-col items-center gap-6 w-full">
        <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-primary/20">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 animate-pulse"></div>
          {/* Placeholder untuk foto profil */}
          <div className="absolute inset-0 flex items-center justify-center text-4xl font-bold text-primary/50">
            {photo.initials}
          </div>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">{name}</h1>
          <h2 className="text-xl text-muted-foreground">{title}</h2>
        </div>
        
        <p className="text-muted-foreground max-w-lg">
          {bio}
        </p>
        
        <div className="flex flex-wrap gap-4 justify-center">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant={action.primary ? "default" : "outline"}
              size="lg"
              className="rounded-full"
              asChild
            >
              <a href={action.href}>
                {action.label}
              </a>
            </Button>
          ))}
        </div>

        <div className="flex gap-4 mt-2 group">
          {socialMedia.map((social, index) => (
            <Button
              key={index}
              variant="ghost"
              size="icon"
              className="rounded-full bg-primary/10 hover:bg-primary/20 transition-all duration-300 transform perspective-1000 group-hover:hover:rotate-y-180"
              asChild
            >
              <a
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors duration-300 transform-style-preserve-3d backface-visible-hidden"
              >
                <SocialIcons iconName={social.icon} size={20} />
              </a>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}