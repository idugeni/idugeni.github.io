"use client";

import { ParticleBackground } from "@/components/ui/particle-background";
import { GlitchText } from "@/components/ui/glitch-text";
import { TypewriterText } from "@/components/ui/typewriter-text";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function HeroSection() {
  return (
    <section className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden pt-16">
      <ParticleBackground />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
        <ScrollReveal delay={100}>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/5 text-primary text-xs font-mono mb-6 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            SYSTEM_ONLINE
          </div>
        </ScrollReveal>

        <ScrollReveal delay={200}>
          <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-orbitron font-bold mb-4 tracking-tighter">
            <GlitchText text="IRNK CODES" />
          </h1>
        </ScrollReveal>

        <ScrollReveal delay={400}>
          <div className="h-12 md:h-16 text-xl md:text-3xl font-mono text-foreground/80 mb-8">
            <TypewriterText
              words={[
                "Full Stack Developer",
                "UI/UX Designer",
                "AI Engineer",
                "Mobile Developer",
              ]}
              typingSpeed={80}
              deletingSpeed={40}
              delayBeforeDelete={2000}
              className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent font-bold"
            />
          </div>
        </ScrollReveal>

        <ScrollReveal delay={600}>
          <p className="max-w-2xl text-muted-foreground font-mono mb-10 text-sm md:text-base leading-relaxed">
            Saya tidak sekadar membangun perangkat lunak; saya merekayasa
            masa depan. Menggabungkan estetika cyberpunk dengan fungsionalitas
            presisi tinggi.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={800} className="flex flex-col sm:flex-row gap-4">
          <Link href="/projects">
            <Button className="font-mono h-12 px-8 rounded-none border border-primary bg-primary/20 text-primary hover:bg-primary hover:text-primary-foreground transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:shadow-[0_0_25px_rgba(6,182,212,0.6)]">
              [ LIHAT_PROYEK ]
            </Button>
          </Link>
          <Link href="/contact">
            <Button
              variant="outline"
              className="font-mono h-12 px-8 rounded-none border-primary/50 text-foreground hover:bg-primary/10 transition-all"
            >
              [ INISIASI_KONTAK ]
            </Button>
          </Link>
        </ScrollReveal>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10 animate-bounce">
        <span className="text-xs font-mono text-primary/70">SCROLL</span>
        <div className="w-[1px] h-8 bg-gradient-to-b from-primary to-transparent" />
      </div>
    </section>
  );
}
