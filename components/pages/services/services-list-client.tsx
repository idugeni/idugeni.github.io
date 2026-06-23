"use client";

import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { NeonBorder } from "@/components/ui/neon-border";
import { PageHeader } from "@/components/ui/page-header";
import Link from "next/link";
import { HiCheckCircle, HiArrowRight, HiCommandLine, HiCpuChip } from "react-icons/hi2";
import { RiShieldKeyholeLine, RiTerminalBoxLine } from "react-icons/ri";
import type { ServicesListClientProps } from "@/types/pages";

export function ServicesListClient({ services }: ServicesListClientProps) {
  return (
    <div className="pt-4 pb-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Hero Header */}
        <PageHeader
          badge="Services Active"
          badgeIcon={<RiTerminalBoxLine className="w-4 h-4" />}
          title="SERVICES_CATALOG"
          description="Sistem layanan premium yang dirancang untuk mengakselerasi transformasi digital Anda. Setiap layanan dioptimalkan untuk performa maksimal."
        />

        {/* Services Grid */}
        {!services || services.length === 0 ? (
          <ScrollReveal>
            <div className="py-20 text-center border border-dashed border-primary/20 rounded-xl bg-card/50">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/5 border border-primary/20 mb-4">
                <HiCommandLine className="w-7 h-7 text-primary/40" />
              </div>
              <p className="font-orbitron text-lg text-muted-foreground mb-2">
                NO_SERVICES_AVAILABLE
              </p>
              <p className="font-mono text-xs text-muted-foreground/60">
                Layanan akan muncul di sini setelah dikonfigurasi di panel admin.
              </p>
            </div>
          </ScrollReveal>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
            {services.map((service, i) => (
            <ScrollReveal key={service.id} delay={i * 120}>
              <Link href={`/services/${service.slug}`} prefetch={false}>
                <NeonBorder className="h-full hover:shadow-[0_0_30px_rgba(6,182,212,0.15)] transition-shadow duration-500 cursor-pointer">
                <div className="p-8 flex flex-col h-full relative overflow-hidden">
                  {/* Background glow effect */}
                  <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                  {/* Number badge */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <span className="font-orbitron text-sm font-bold text-primary">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <HiCommandLine className="w-5 h-5 text-primary/30" />
                  </div>

                  {/* Service name */}
                  <h3 className="text-xl font-orbitron font-bold mb-3 text-foreground tracking-tight">
                    {service.nama}
                  </h3>

                  {/* Short description */}
                  <p className="text-sm font-mono text-muted-foreground mb-6 leading-relaxed flex-1">
                    {service.deskripsiPendek}
                  </p>

                  {/* Feature list */}
                  {service.fitur && service.fitur.length > 0 && (
                    <div className="space-y-2.5 mb-6 pt-4 border-t border-border/30">
                      {service.fitur.map((feature: string, j: number) => (
                        <div
                          key={j}
                          className="flex items-start gap-2.5 text-sm font-mono text-foreground/80"
                        >
                          <HiCheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Price */}
                  {service.hargaMulai && (
                    <div className="mt-auto pt-4 border-t border-border/30">
                      <span className="font-mono text-xs text-muted-foreground block mb-1 tracking-wider">
                        STARTING_FROM
                      </span>
                      <span className="text-2xl font-orbitron font-bold text-primary">
                        {service.hargaMulai}
                      </span>
                    </div>
                  )}

                  {/* View Details Button */}
                  <div className="mt-6 pt-4 border-t border-border/30">
                    <button className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 font-mono text-xs font-medium rounded bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20 hover:border-primary/50 transition-all duration-200 group">
                      LIHAT_DETAIL
                      <HiArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </NeonBorder>
            </Link>
            </ScrollReveal>
          ))}
        </div>
        )}

        {/* CTA Section */}
        <ScrollReveal>
          <div className="relative max-w-4xl mx-auto">
            <NeonBorder active>
              <div className="p-10 md:p-16 text-center relative overflow-hidden">
                {/* Background decorative elements */}
                <div className="absolute top-0 left-0 w-full h-full">
                  <div className="absolute top-4 left-4 w-2 h-2 rounded-full bg-primary/30" />
                  <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-primary/30" />
                  <div className="absolute bottom-4 left-4 w-2 h-2 rounded-full bg-primary/30" />
                  <div className="absolute bottom-4 right-4 w-2 h-2 rounded-full bg-primary/30" />
                </div>

                <RiShieldKeyholeLine className="w-10 h-10 text-primary mx-auto mb-6" />

                <h2 className="text-2xl md:text-3xl font-orbitron font-bold mb-4 text-foreground">
                  INITIATE_CONTACT
                </h2>
                <p className="font-mono text-muted-foreground text-sm md:text-base max-w-xl mx-auto mb-8 leading-relaxed">
                  Siap untuk memulai proyek Anda? Hubungi kami untuk konsultasi gratis
                  dan dapatkan solusi yang disesuaikan dengan kebutuhan sistem Anda.
                </p>

                <Link href="/contact" prefetch={false}>
                  <button className="inline-flex items-center gap-2 px-8 py-3 font-mono text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all duration-300 group">
                    ESTABLISH_CONNECTION
                    <HiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </Link>
              </div>
            </NeonBorder>
          </div>
        </ScrollReveal>

      </div>
    </div>
  );
}
