'use client';

/**
 * @module ProjectCard
 * @description Modul yang menampilkan kartu proyek individual dengan gambar, judul, deskripsi, dan tag
 */

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

/**
 * @interface ProjectCardProps
 * @description Interface untuk properti yang diperlukan oleh komponen ProjectCard
 */
interface ProjectCardProps {
  title: string;
  description: string;
  image: string;
  tags: string[];
  demoUrl?: string;
  repoUrl?: string;
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
export function ProjectCard({ title, description, image, tags, demoUrl, repoUrl }: ProjectCardProps) {
  return (
    <div className="h-full animate-duration-200 animate-ease-in-out">
      <Card className="overflow-hidden h-full transition-colors hover:bg-muted/50 flex flex-col py-0">
        {/* Image Section */}
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

        <CardContent className="p-6 flex-grow flex flex-col gap-4">
          {/* Tags Section */}
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>

          <Separator />

          {/* Title and Description Section */}
          <div>
            <CardTitle className="line-clamp-1 mb-2">{title}</CardTitle>
            <CardDescription className="line-clamp-2">{description}</CardDescription>
          </div>

          <Separator className="mt-auto" />

          {/* Footer Section */}
          <CardFooter className="p-0 flex gap-2">
            {demoUrl && (
              <Link 
                href={demoUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex-1"
              >
                <button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2 rounded-md text-sm font-medium transition-colors">
                  Demo
                </button>
              </Link>
            )}
            {repoUrl && (
              <Link 
                href={repoUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex-1"
              >
                <button className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/80 h-9 px-4 py-2 rounded-md text-sm font-medium transition-colors">
                  Repository
                </button>
              </Link>
            )}
          </CardFooter>
        </CardContent>
      </Card>
    </div>
  );
}