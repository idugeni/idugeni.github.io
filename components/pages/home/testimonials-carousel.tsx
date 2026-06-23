"use client";

import { useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { HiOutlineStar } from "react-icons/hi2";
import { RiDoubleQuotesL } from "react-icons/ri";
import type { TestimonialsCarouselProps } from "@/types/pages";
import type { Testimonial } from "@/types/pages";
import {
  getSafeImageSource,
  shouldBypassImageOptimization,
} from "@/lib/utils/image-source";
import { SectionEmptyState } from "./section-empty-state";

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <div className="w-[320px] md:w-[380px] shrink-0 mx-2">
      <div className="relative h-full bg-background border border-primary/20 p-5 group hover:border-primary/40 transition-colors">
        {/* Corner brackets */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary/50" />
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary/50" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary/50" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary/50" />

        <RiDoubleQuotesL className="w-5 h-5 text-primary/30 mb-2" />

        <p className="font-mono text-sm text-foreground/90 leading-relaxed mb-4 italic line-clamp-3">
          &ldquo;{testimonial.isi}&rdquo;
        </p>

        <div className="flex items-center gap-3">
          {getSafeImageSource(testimonial.avatarUrl) && (
            <Image
              src={getSafeImageSource(testimonial.avatarUrl)!}
              alt={testimonial.nama}
              width={36}
              height={36}
              className="rounded-full border border-primary/30 shadow-[0_0_10px_rgba(6,182,212,0.15)]"
              unoptimized={shouldBypassImageOptimization(testimonial.avatarUrl)}
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="font-orbitron font-bold text-xs text-foreground truncate">
              {testimonial.nama}
            </div>
            <div className="font-mono text-[10px] text-muted-foreground truncate">
              {testimonial.jabatan}
              {testimonial.perusahaan && ` @ ${testimonial.perusahaan}`}
            </div>
          </div>
        </div>

        <div className="flex gap-0.5 mt-2">
          {Array.from({ length: testimonial.rating }).map((_, i) => (
            <HiOutlineStar key={i} className="w-3 h-3 fill-primary text-primary" />
          ))}
        </div>
      </div>
    </div>
  );
}

function MarqueeRow({ testimonials, direction }: { testimonials: Testimonial[]; direction: "left" | "right" }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const positionRef = useRef<number | null>(null);
  const pausedRef = useRef(false);
  const animationRef = useRef<number>(0);

  const repeatCount = 2;
  const items = Array.from({ length: repeatCount }, () => testimonials).flat();

  const animate = useCallback(() => {
    const track = trackRef.current;
    if (!track) {
      animationRef.current = requestAnimationFrame(animate);
      return;
    }

    const singleSetWidth = track.scrollWidth / repeatCount;

    // Initialize position
    if (positionRef.current === null) {
      positionRef.current = direction === "left" ? 0 : -singleSetWidth;
    }

    if (!pausedRef.current) {
      const speed = 1; // px per frame

      if (direction === "left") {
        positionRef.current -= speed;
        if (positionRef.current <= -singleSetWidth) {
          positionRef.current += singleSetWidth;
        }
      } else {
        positionRef.current += speed;
        if (positionRef.current >= 0) {
          positionRef.current -= singleSetWidth;
        }
      }
    }

    track.style.transform = `translate3d(${positionRef.current}px, 0, 0)`;
    animationRef.current = requestAnimationFrame(animate);
  }, [direction]);

  useEffect(() => {
    animationRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationRef.current);
  }, [animate]);

  return (
    <div
      className="overflow-hidden marquee-safe"
      onMouseEnter={() => { pausedRef.current = true; }}
      onMouseLeave={() => { pausedRef.current = false; }}
    >
      <div ref={trackRef} className="flex w-max max-w-full will-change-transform">
        {items.map((testimonial, i) => (
          <TestimonialCard key={`${testimonial.id}-${i}`} testimonial={testimonial} />
        ))}
      </div>
    </div>
  );
}

export function TestimonialsCarousel({ testimonials }: TestimonialsCarouselProps) {
  // Split testimonials into two rows
  const mid = Math.ceil(testimonials.length / 2);
  const topRow = testimonials.slice(0, mid);
  const bottomRow = testimonials.length > 1 ? testimonials.slice(mid) : testimonials;

  return (
    <section className="py-24 bg-card relative overflow-hidden section-fade">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(6,182,212,0.03)_0%,transparent_50%)]" />

      <div className="relative z-10">
        <ScrollReveal>
          <div className="text-center mb-16 px-4">
            <span className="font-mono text-[10px] text-primary/70 tracking-widest">// WHAT CLIENTS SAY</span>
            <h2 className="text-3xl md:text-4xl font-orbitron font-bold neon-text mt-2">
              CLIENT_FEEDBACK
            </h2>
          </div>
        </ScrollReveal>

        {testimonials.length === 0 ? (
          <SectionEmptyState
            title="NO_TESTIMONIALS_YET"
            description="Client testimonials will appear here once published."
            icon="✦"
          />
        ) : (
          /* Marquee container */
          <div className="relative space-y-4">
            {/* Fade edges */}
            <div className="absolute left-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-r from-card to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-l from-card to-transparent z-10 pointer-events-none" />

            {/* Top row - left to right */}
            <MarqueeRow testimonials={topRow} direction="left" />

            {/* Bottom row - right to left */}
            <MarqueeRow testimonials={bottomRow} direction="right" />
          </div>
        )}
      </div>
    </section>
  );
}
