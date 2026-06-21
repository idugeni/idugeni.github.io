"use client";

import { TypewriterText } from "@/components/ui/typewriter-text";

const HERO_ROLES = [
  "Full Stack Developer",
  "UI/UX Designer",
  "AI Engineer",
  "Mobile Developer",
];

export function HeroTypewriter() {
  return (
    <div className="h-12 md:h-16 text-xl md:text-3xl font-mono text-foreground/80 mb-8" aria-label="Professional roles">
      <TypewriterText
        words={HERO_ROLES}
        typingSpeed={80}
        deletingSpeed={40}
        delayBeforeDelete={2000}
        className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent font-bold"
      />
    </div>
  );
}
