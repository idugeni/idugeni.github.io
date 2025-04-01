'use client';

import { Github, Linkedin, Twitter, Instagram } from 'lucide-react';

interface SocialIconsProps {
  iconName: string;
  size?: number;
}

export function SocialIcons({ iconName, size = 24 }: SocialIconsProps) {
  switch (iconName) {
    case 'github':
      return <Github size={size} />;
    case 'linkedin':
      return <Linkedin size={size} />;
    case 'twitter':
      return <Twitter size={size} />;
    case 'instagram':
      return <Instagram size={size} />;
    default:
      return null;
  }
}