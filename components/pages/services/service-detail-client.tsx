"use client";

import Link from "next/link";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { NeonBorder } from "@/components/ui/neon-border";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import {
  HiCheckCircle,
  HiArrowRight,
  HiCommandLine,
  HiCpuChip,
  HiSparkles,
} from "react-icons/hi2";
import { RiTerminalBoxLine } from "react-icons/ri";
import { sanitizeRichHtml } from "@/lib/security/sanitize-html";
import type { Service } from "@/types/pages";

interface ServiceDetailClientProps {
  service: Service;
  relatedServices: Service[];
}

export function ServiceDetailClient({
  service,
  relatedServices,
}: ServiceDetailClientProps) {
  return (
    <div className="pt-4 pb-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Header */}
        <PageHeader
          badge="Service Details"
          badgeIcon={<RiTerminalBoxLine className="w-4 h-4" />}
          title={service.nama}
          description={service.deskripsiPendek}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Detailed Description */}
            {service.deskripsiPanjang && (
              <ScrollReveal>
                <NeonBorder>
                  <div className="p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <HiSparkles className="w-6 h-6 text-primary" />
                      <h2 className="text-2xl font-orbitron font-bold text-foreground">
                        OVERVIEW
                      </h2>
                    </div>
                    <div
                      className="prose prose-invert max-w-none font-mono text-sm text-muted-foreground leading-relaxed"
                      dangerouslySetInnerHTML={{
                        __html: sanitizeRichHtml(service.deskripsiPanjang),
                      }}
                    />
                  </div>
                </NeonBorder>
              </ScrollReveal>
            )}

            {/* Features Section */}
            {service.fitur && service.fitur.length > 0 && (
              <ScrollReveal delay={150}>
                <NeonBorder>
                  <div className="p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <HiCommandLine className="w-6 h-6 text-primary" />
                      <h2 className="text-2xl font-orbitron font-bold text-foreground">
                        KEY_FEATURES
                      </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {service.fitur.map((feature: string, index: number) => (
                        <div
                          key={index}
                          className="flex items-start gap-3 p-4 rounded-lg bg-secondary/30 border border-border/30 hover:border-primary/30 transition-colors"
                        >
                          <HiCheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                          <span className="font-mono text-sm text-foreground">
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </NeonBorder>
              </ScrollReveal>
            )}

            {/* Process Section */}
            <ScrollReveal delay={300}>
              <NeonBorder>
                <div className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <HiCpuChip className="w-6 h-6 text-primary" />
                    <h2 className="text-2xl font-orbitron font-bold text-foreground">
                      WORKFLOW_PROCESS
                    </h2>
                  </div>
                  <div className="space-y-6">
                    {[
                      {
                        step: "01",
                        title: "Discovery & Planning",
                        desc: "Analisis kebutuhan dan perencanaan arsitektur sistem",
                      },
                      {
                        step: "02",
                        title: "Design & Prototyping",
                        desc: "Desain UI/UX dan prototype interaktif",
                      },
                      {
                        step: "03",
                        title: "Development & Testing",
                        desc: "Implementasi kode dan testing menyeluruh",
                      },
                      {
                        step: "04",
                        title: "Deployment & Support",
                        desc: "Deploy ke production dan maintenance berkelanjutan",
                      },
                    ].map((process, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-4 p-4 rounded-lg bg-secondary/20 border border-border/20"
                      >
                        <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                          <span className="font-orbitron text-sm font-bold text-primary">
                            {process.step}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-mono text-sm font-bold text-foreground mb-1">
                            {process.title}
                          </h3>
                          <p className="font-mono text-xs text-muted-foreground">
                            {process.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </NeonBorder>
            </ScrollReveal>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Pricing Card */}
            {service.hargaMulai && (
              <ScrollReveal delay={200}>
                <NeonBorder active>
                  <div className="p-6">
                    <span className="font-mono text-xs text-muted-foreground block mb-2 tracking-wider">
                      STARTING_FROM
                    </span>
                    <div className="text-3xl font-orbitron font-bold text-primary mb-6">
                      {service.hargaMulai}
                    </div>
                    <Link href="/contact" prefetch={false}>
                      <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-mono">
                        REQUEST_QUOTE
                        <HiArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </NeonBorder>
              </ScrollReveal>
            )}

            {/* Quick Info */}
            <ScrollReveal delay={250}>
              <NeonBorder>
                <div className="p-6">
                  <h3 className="font-orbitron text-lg font-bold text-foreground mb-4">
                    QUICK_INFO
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2 border-b border-border/30">
                      <span className="font-mono text-xs text-muted-foreground">
                        Delivery Time
                      </span>
                      <span className="font-mono text-xs text-foreground font-medium">
                        2-4 weeks
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-border/30">
                      <span className="font-mono text-xs text-muted-foreground">
                        Revisions
                      </span>
                      <span className="font-mono text-xs text-foreground font-medium">
                        Unlimited
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-border/30">
                      <span className="font-mono text-xs text-muted-foreground">
                        Support
                      </span>
                      <span className="font-mono text-xs text-foreground font-medium">
                        30 days
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="font-mono text-xs text-muted-foreground">
                        Source Code
                      </span>
                      <span className="font-mono text-xs text-foreground font-medium">
                        Included
                      </span>
                    </div>
                  </div>
                </div>
              </NeonBorder>
            </ScrollReveal>
          </div>
        </div>

        {/* Related Services */}
        {relatedServices.length > 0 && (
          <ScrollReveal delay={400}>
            <div className="mb-16">
              <div className="flex items-center gap-3 mb-8">
                <HiCommandLine className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-orbitron font-bold text-foreground">
                  RELATED_SERVICES
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedServices.map((relatedService, index) => (
                  <Link
                    key={relatedService.id}
                    href={`/services/${relatedService.slug}`}
                  >
                    <NeonBorder className="h-full hover:shadow-[0_0_30px_rgba(6,182,212,0.15)] transition-shadow duration-500">
                      <div className="p-6 flex flex-col h-full">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                          <span className="font-orbitron text-sm font-bold text-primary">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                        </div>
                        <h3 className="text-lg font-orbitron font-bold mb-2 text-foreground">
                          {relatedService.nama}
                        </h3>
                        <p className="text-sm font-mono text-muted-foreground mb-4 flex-1 line-clamp-2">
                          {relatedService.deskripsiPendek}
                        </p>
                        {relatedService.hargaMulai && (
                          <div className="pt-4 border-t border-border/30">
                            <span className="font-mono text-xs text-muted-foreground block mb-1">
                              FROM
                            </span>
                            <span className="text-lg font-orbitron font-bold text-primary">
                              {relatedService.hargaMulai}
                            </span>
                          </div>
                        )}
                      </div>
                    </NeonBorder>
                  </Link>
                ))}
              </div>
            </div>
          </ScrollReveal>
        )}

        {/* CTA Section */}
        <ScrollReveal delay={500}>
          <NeonBorder active>
            <div className="p-10 md:p-16 text-center">
              <HiSparkles className="w-10 h-10 text-primary mx-auto mb-6" />
              <h2 className="text-2xl md:text-3xl font-orbitron font-bold mb-4 text-foreground">
                READY_TO_START?
              </h2>
              <p className="font-mono text-muted-foreground text-sm md:text-base max-w-xl mx-auto mb-8 leading-relaxed">
                Hubungi kami untuk konsultasi gratis dan dapatkan solusi yang
                disesuaikan dengan kebutuhan Anda.
              </p>
              <Link href="/contact" prefetch={false}>
                <Button className="inline-flex items-center gap-2 px-8 py-3 font-mono text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all duration-300 group">
                  CONTACT_US
                  <HiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </NeonBorder>
        </ScrollReveal>
      </div>
    </div>
  );
}
