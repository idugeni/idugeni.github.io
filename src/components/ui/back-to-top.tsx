'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useViewportAnimation } from '@/hooks/use-viewport-animation';
import { ChevronUp } from 'lucide-react';

export function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  const { ref, style } = useViewportAnimation<HTMLDivElement>({
    type: 'fade-in',
    duration: 500,
  });

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);

    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!isVisible) return null;

  return (
    <div
      ref={ref}
      style={style}
      className="fixed bottom-8 right-8 z-50 transition-transform duration-300 hover:scale-110"
    >
      <Button
        variant="secondary"
        size="icon"
        className="rounded-full shadow-lg bg-primary/10 hover:bg-primary/20 backdrop-blur-sm"
        onClick={scrollToTop}
      >
        <ChevronUp className="h-5 w-5" />
      </Button>
    </div>
  );
}