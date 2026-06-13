"use client";

import Link from "next/link";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { Button } from "@/components/ui/button";
import { HiOutlineArrowRight } from "react-icons/hi2";
import type { ServicesSectionProps } from "@/types/pages";

export function ServicesSection({ services }: ServicesSectionProps) {
  if (!services || services.length === 0) return null;

  return (
    <section className="py-24 bg-card relative section-fade">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-orbitron font-bold neon-text mb-4">
              SERVICES_CATALOG
            </h2>
            <p className="text-muted-foreground font-mono text-sm max-w-2xl mx-auto">
              Solusi end-to-end untuk kebutuhan digital Anda. Dari konsep
              hingga deployment.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.slice(0, 6).map((service, i) => (
            <ScrollReveal key={service.id} delay={i * 100}>
              <div className="relative group h-full">
                {/* Glow */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/10 to-primary/5 opacity-0 group-hover:opacity-100 blur transition-opacity duration-500" />

                <div className="relative bg-background border border-border/50 group-hover:border-primary/40 p-6 h-full flex flex-col transition-all duration-300">
                  {/* Top accent */}
                  <div className="absolute top-0 left-0 w-12 h-[2px] bg-primary/50 group-hover:w-full transition-all duration-500" />

                  {/* Number badge */}
                  <div className="font-orbitron text-[10px] text-primary/40 mb-4">
                    0{i + 1}
                  </div>

                  <h3 className="font-orbitron font-bold text-sm mb-3 group-hover:text-primary transition-colors">
                    {service.nama}
                  </h3>

                  <p className="text-muted-foreground font-mono text-xs leading-relaxed mb-5 flex-1">
                    {service.deskripsiPendek}
                  </p>

                  {service.hargaMulai && (
                    <div className="pt-4 border-t border-border/30 flex items-center justify-between">
                      <span className="font-mono text-[10px] text-muted-foreground/60">STARTING_AT</span>
                      <span className="font-mono text-sm text-primary font-bold">
                        {service.hargaMulai}
                      </span>
                    </div>
                  )}

                  {/* Corner decoration */}
                  <div className="absolute bottom-3 right-3 w-3 h-3 border-b border-r border-primary/20 group-hover:border-primary/60 transition-colors" />
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delay={400}>
          <div className="text-center mt-10">
            <Link href="/services">
              <Button
                variant="outline"
                className="font-mono border-primary/50 hover:bg-primary/10"
              >
                EXPLORE_ALL_SERVICES <HiOutlineArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
