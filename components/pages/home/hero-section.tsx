import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HeroTypewriter } from "./hero-typewriter";

export function HeroSection() {
  return (
    <section className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden pt-16 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(var(--primary)/0.08),transparent)] before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_80%_20%,hsl(189_96%_44%/0.05)_0%,transparent_50%)] after:absolute after:inset-0 after:bg-[radial-gradient(circle_at_20%_80%,hsl(217_91%_60%/0.04)_0%,transparent_40%)]">
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(hsl(var(--primary)/0.02)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--primary)/0.02)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_75%)]" />
      
      {/* Animated gradient mesh */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[100px] animate-[pulse_8s_ease-in-out_infinite]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[100px] animate-[pulse_10s_ease-in-out_infinite_2s]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/5 text-primary text-xs font-mono mb-6 backdrop-blur-md motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-500">
          <span className="w-2 h-2 rounded-full bg-primary" />
          SYSTEM_ONLINE
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-orbitron font-bold mb-4 tracking-tighter text-balance">
          <span className="relative inline-block">
            <span className="relative z-10">IRNK CODES</span>
          </span>
        </h1>

        <HeroTypewriter />

        <p className="max-w-2xl text-muted-foreground font-mono mb-10 text-sm md:text-base leading-relaxed motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-700 motion-safe:delay-100">
          Saya tidak sekadar membangun perangkat lunak; saya merekayasa
          masa depan. Menggabungkan estetika cyberpunk dengan fungsionalitas
          presisi tinggi.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-700 motion-safe:delay-150">
          <Link href="/projects" prefetch={false}>
            <Button className="font-mono h-12 px-8 rounded-none border border-primary bg-primary/20 text-primary hover:bg-primary hover:text-primary-foreground transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:shadow-[0_0_25px_rgba(6,182,212,0.6)]">
              [ LIHAT_PROYEK ]
            </Button>
          </Link>
          <Link href="/contact" prefetch={false}>
            <Button
              variant="outline"
              className="font-mono h-12 px-8 rounded-none border-primary/50 text-foreground hover:bg-primary/10 transition-all"
            >
              [ INISIASI_KONTAK ]
            </Button>
          </Link>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10 animate-bounce">
        <span className="text-xs font-mono text-primary/70">SCROLL</span>
        <div className="w-[1px] h-8 bg-gradient-to-b from-primary to-transparent" />
      </div>
    </section>
  );
}
