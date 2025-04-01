'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card';
import { Badge } from './badge';

interface ProjectCardProps {
  title: string;
  description: string;
  image: string;
  tags: string[];
  link: string;
}

export function ProjectCard({ title, description, image, tags, link }: ProjectCardProps) {
  return (
    <Link href={link} target="_blank" rel="noopener noreferrer">
      <div className="h-full hover:animate-scale-102 active:animate-scale-98 animate-duration-200 animate-ease-in-out">
        <Card className="overflow-hidden h-full transition-colors hover:bg-muted/50">
          <CardHeader className="p-0">
            <div className="aspect-video relative overflow-hidden">
              <Image
                src={image}
                alt={title}
                fill
                className="object-cover transition-transform hover:scale-105"
              />
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