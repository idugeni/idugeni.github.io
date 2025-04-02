'use client';

import Link from 'next/link';
import { useViewportAnimation } from '@/hooks/use-viewport-animation';

export const NotFoundContent = () => {
  const { ref: contentRef, style: contentStyle } = useViewportAnimation({
    type: 'fade-in',
    duration: 700,
  });

  return (
    <div
      ref={contentRef}
      style={contentStyle}
      className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center gap-4 py-16 text-center"
    >
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-muted-foreground">This page could not be found.</p>
      <Link
        href="/"
        className="text-primary hover:text-primary/80 transition-colors"
      >
        Return Home
      </Link>
    </div>
  );
};