'use client';

/**
 * @module ProjectCard
 * @description Modul yang menampilkan kartu proyek individual dengan gambar, judul, deskripsi, dan tag
 */

import Image from 'next/image';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface ProjectCardProps {
  title: string;
  description: string;
  image: string;
  tags: string[];
  demoUrl?: string;
  repoUrl?: string;
}

export function ProjectCard({
  title,
  description,
  image,
  tags,
  demoUrl,
  repoUrl,
}: ProjectCardProps) {
  return (
    <div className="h-full animate-duration-200 animate-ease-in-out">
      <Card className="overflow-hidden h-full transition-colors hover:bg-muted/50 flex flex-col py-0">
        {/* Image Section */}
        <CardHeader className="p-0 m-0">
          <div className="aspect-video relative overflow-hidden group">
            <Image
              src={image}
              alt={title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 ease-in-out transform translate-y-full group-hover:translate-y-0" />
          </div>
        </CardHeader>

        <CardContent className="p-3 pt-2 flex-grow flex flex-col gap-3">
          {/* Title */}
          <CardTitle 
            className="
              text-center 
              uppercase 
              text-lg 
              font-bold 
              tracking-wider
              line-clamp-2
              font-montserrat
              letter-spacing-tight
            "
          >
            {title}
          </CardTitle>

          <Separator />

          {/* Description */}
          <CardDescription className="line-clamp-3 text-center">
            {description}
          </CardDescription>

          <Separator />

          {/* Tags */}
          <div className="flex flex-wrap gap-2 justify-center">
            {tags.map((tag) => (
              <Badge 
                key={tag} 
                variant="secondary" 
                className="rounded-full text-xs transition-colors duration-300 hover:bg-primary hover:text-primary-foreground"
              >
                {tag}
              </Badge>
            ))}
          </div>

          <Separator className="mt-auto" />

          {/* Footer */}
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
