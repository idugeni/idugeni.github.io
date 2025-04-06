'use client';

/**
 * @module SocialIcons
 * @description Modul yang menyediakan komponen untuk menampilkan ikon media sosial
 */

import { Github, Linkedin, Twitter, Instagram } from 'lucide-react';
import { ThreadsIcon } from './threads-icon';

/**
 * @interface SocialIconsProps
 * @description Interface untuk properti yang diperlukan oleh komponen SocialIcons
 */
interface SocialIconsProps {
  iconName: string;
  size?: number;
}

/**
 * @function SocialIcons
 * @description Komponen yang menampilkan ikon media sosial berdasarkan nama yang diberikan
 * @param {SocialIconsProps} props - Properti yang diperlukan untuk menampilkan ikon
 * @param {string} props.iconName - Nama ikon media sosial ('github', 'linkedin', 'twitter', 'instagram')
 * @param {number} [props.size=24] - Ukuran ikon dalam pixel
 * @returns {JSX.Element | null} Komponen React yang merender ikon media sosial atau null jika nama tidak valid
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