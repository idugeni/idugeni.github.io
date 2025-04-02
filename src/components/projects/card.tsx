'use client';

/**
 * @module ProjectCard
 * @description Modul yang menampilkan kartu proyek individual dengan gambar, judul, deskripsi, dan tag
 */

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';

/**
 * @interface ProjectCardProps
 * @description Interface untuk properti yang diperlukan oleh komponen ProjectCard
 */
interface ProjectCardProps {
  title: string;
  description: string;
  image: string;
  tags: string[];
  link: string;
}

/**
 * @function ProjectCard
 * @description Komponen yang menampilkan informasi proyek dalam bentuk kartu yang dapat diklik
 * @param {ProjectCardProps} props - Properti yang diperlukan untuk menampilkan kartu proyek
 * @param {string} props.title - Judul proyek
 * @param {string} props.description - Deskripsi singkat proyek
 * @param {string} props.image - URL gambar proyek
 * @param {string[]} props.tags - Array tag teknologi yang digunakan dalam proyek
 * @param {string} props.link - URL yang akan dibuka ketika kartu diklik
 * @returns {JSX.Element} Komponen React yang merender kartu proyek
 */
export function ProjectCard({ title, description, image, tags, link }: ProjectCardProps) {
  return (
    <Link href={link} target="_blank" rel="noopener noreferrer">
      <div className="h-full animate-duration-200 animate-ease-in-out">
        <Card className="overflow-hidden h-full transition-colors hover:bg-muted/50">
          <CardHeader className="p-0">
            <div className="aspect-video relative overflow-hidden group">
              <Image
                src={image}
                alt={title}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 ease-in-out transform translate-y-full group-hover:translate-y-0"></div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <CardTitle className="line-clamp-1 mb-2">{title}</CardTitle>
            <CardDescription className="line-clamp-2">{description}</CardDescription>
          </CardContent>
          <CardFooter className="p-6 pt-0 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </CardFooter>
        </Card>
      </div>
    </Link>
  );
}