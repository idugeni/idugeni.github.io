"use client";

import { ScrollReveal } from "@/components/ui/scroll-reveal";
import type { ReactNode } from "react";

interface PageHeaderProps {
  badge: string;
  badgeIcon?: ReactNode;
  title: string;
  description: string;
}

export function PageHeader({ badge, badgeIcon, title, description }: PageHeaderProps) {
  return (
    <ScrollReveal>
      <div className="relative mb-16 py-12 text-center">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent rounded-3xl" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 mb-5">
            {badgeIcon && <span className="text-primary">{badgeIcon}</span>}
            <span className="font-mono text-xs text-primary tracking-wider uppercase">
              {badge}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-orbitron font-bold neon-text tracking-tight">
            {title}
          </h1>
          <p className="mt-4 font-mono text-sm text-muted-foreground max-w-xl mx-auto">
            {description}
          </p>
        </div>
      </div>
    </ScrollReveal>
  );
}
