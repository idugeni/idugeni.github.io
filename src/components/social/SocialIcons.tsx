'use client';

import { Github, Linkedin, Twitter, Instagram } from 'lucide-react';
import { ThreadsIcon } from '@/components/social/ThreadsIcon';

/**
 * Komponen SocialIcons
 * @module SocialIcons
 * @description Menyediakan komponen untuk menampilkan ikon media sosial.
 * @param {SocialIconsProps} props - Properti untuk menentukan ikon dan ukurannya.
 */
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
    case 'threads':
      return <ThreadsIcon size={size} />;
    default:
      return null;
  }
}

/**
 * Properti untuk komponen SocialIcons
 */
export interface SocialIconsProps {
  iconName: string;
  size?: number;
}