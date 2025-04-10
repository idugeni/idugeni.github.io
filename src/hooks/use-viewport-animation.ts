'use client';

import { useEffect, useRef, useState } from 'react';

type AnimationType = 'fade-in' | 'slide-in-up' | 'slide-in-down' | 'slide-in-left' | 'slide-in-right';

type AnimationOptions = {
  threshold?: number;
  rootMargin?: string;
  repeat?: boolean;
  delay?: number;
  initiallyVisible?: boolean;
  type?: AnimationType;
  duration?: number;
};

/**
 * A hook that applies animations when an element enters the viewport
 * @param options Configuration options for the intersection observer
 * @returns An object containing the ref to attach to the element and animation state
 */
export function useViewportAnimation<T extends HTMLElement = HTMLDivElement>(options: AnimationOptions = {}) {
  const {
    threshold = 0.1,
    rootMargin = '0px',
    repeat = false,
    delay = 0,
    initiallyVisible = false,
    type = 'fade-in',
    duration = 500
  } = options;
  
  const ref = useRef<T | null>(null);
  const [isInView, setIsInView] = useState(initiallyVisible);
  const [hasAnimated, setHasAnimated] = useState(initiallyVisible);
  useEffect(() => {
    const currentRef = ref.current;
    if (!currentRef) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        
        if (entry.isIntersecting) {
          if (!repeat && hasAnimated) return;
          
          if (delay > 0) {
            setTimeout(() => {
              setIsInView(true);
              setHasAnimated(true);
            }, delay);
          } else {
            setIsInView(true);
            setHasAnimated(true);
          }
        } else if (repeat) {
          setIsInView(false);
          setHasAnimated(false);
        }
      },
      { threshold, rootMargin }
    );
    
    observer.observe(currentRef);
    
    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [threshold, rootMargin, repeat, delay, hasAnimated]);
  
  const style = {
    opacity: initiallyVisible ? 1 : isInView ? 1 : 0,
    transform: initiallyVisible ? 'none' : isInView
      ? 'none'
      : type === 'slide-in-up'
      ? 'translateY(20px)'
      : type === 'slide-in-down'
      ? 'translateY(-20px)'
      : type === 'slide-in-left'
      ? 'translateX(-20px)'
      : type === 'slide-in-right'
      ? 'translateX(20px)'
      : 'none',
    transition: `opacity ${duration}ms cubic-bezier(0.4, 0, 0.2, 1), transform ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`,
    willChange: 'opacity, transform',
    position: 'relative',
    visibility: isInView || initiallyVisible ? 'visible' : 'hidden'
  };
  
  return { ref, isInView, style };
}