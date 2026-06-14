import { PublicLayout } from "@/components/layout/public-layout";
import { JsonLdContact, FAQJsonLd } from "@/components/seo/json-ld";
import { ContactFormClient } from "@/components/pages/contact/contact-form-client";
import { NeonBorder } from "@/components/ui/neon-border";
import { PageHeader } from "@/components/ui/page-header";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { siteConfig } from "@/lib/config/site";
import { getWhatsAppLink } from "@/lib/utils/whatsapp";
import type { Metadata } from "next";
import {
  HiOutlineChatBubbleLeftRight,
  HiOutlineClock,
  HiOutlineEnvelope,
  HiOutlineMapPin,
  HiOutlinePhone,
} from "react-icons/hi2";
import { FiGithub, FiInstagram, FiLinkedin, FiTwitter } from "react-icons/fi";
import { HiChevronDown } from "react-icons/hi";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Hubungi IRNK untuk konsultasi, kolaborasi, freelance, pengembangan website, aplikasi, cloud architecture, dan optimasi performa.",
};

export default function Contact() {
  return (
    <PublicLayout>
      <JsonLdContact />
      <FAQJsonLd />
      <div className="pt-4 pb-20 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <PageHeader
            badge="Open Channel"
            badgeIcon={<HiOutlineChatBubbleLeftRight className="w-4 h-4" />}
            title="ESTABLISH_CONTACT"
            description="Punya proyek menarik atau ingin berkolaborasi? Kirim transmisi dan saya akan merespons dalam waktu 24 jam."
          />

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3">
              <ContactFormClient />
            </div>

            <div className="lg:col-span-2 space-y-6">
              <ScrollReveal delay={200}>
                <NeonBorder>
                  <div className="p-6">
                    <h3 className="font-orbitron font-bold text-sm mb-6 text-primary">
                      NETWORK_NODES
                    </h3>
                    <div className="space-y-5">
                      <div className="flex items-start gap-4 group">
                        <div className="w-10 h-10 bg-primary/10 border border-primary/30 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                          <HiOutlineEnvelope className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-mono text-[10px] text-muted-foreground tracking-wider mb-0.5">
                            PRIMARY_CHANNEL
                          </p>
                          <p className="font-mono text-sm text-foreground">
                            {siteConfig.contact.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4 group">
                        <div className="w-10 h-10 bg-primary/10 border border-primary/30 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                          <HiOutlinePhone className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-mono text-[10px] text-muted-foreground tracking-wider mb-0.5">
                            SECURE_LINE
                          </p>
                          <a
                            href={getWhatsAppLink(
                              siteConfig.contact.whatsapp,
                              "Halo, saya tertarik untuk berdiskusi tentang proyek.",
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-sm text-foreground hover:text-primary transition-colors"
                          >
                            {siteConfig.contact.phone}
                          </a>
                        </div>
                      </div>
                      <div className="flex items-start gap-4 group">
                        <div className="w-10 h-10 bg-primary/10 border border-primary/30 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                          <HiOutlineMapPin className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-mono text-[10px] text-muted-foreground tracking-wider mb-0.5">
                            LOCATION
                          </p>
                          <p className="font-mono text-sm text-foreground">
                            {siteConfig.contact.address}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4 group">
                        <div className="w-10 h-10 bg-primary/10 border border-primary/30 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                          <HiOutlineClock className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-mono text-[10px] text-muted-foreground tracking-wider mb-0.5">
                            RESPONSE_TIME
                          </p>
                          <p className="font-mono text-sm text-foreground">
                            {siteConfig.contact.responseTime}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </NeonBorder>
              </ScrollReveal>

              <ScrollReveal delay={300}>
                <NeonBorder>
                  <div className="p-6">
                    <h3 className="font-orbitron font-bold text-sm mb-5 text-primary">
                      SOCIAL_LINKS
                    </h3>
                    <div className="space-y-3">
                      <a
                        href={siteConfig.social.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-4 p-3 border border-border/30 hover:border-primary/50 hover:bg-primary/5 transition-all group"
                      >
                        <div className="w-10 h-10 bg-primary/10 border border-primary/30 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                          <FiGithub className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-mono text-sm text-foreground group-hover:text-primary transition-colors">
                            GitHub
                          </p>
                          <p className="font-mono text-[10px] text-muted-foreground">
                            @idugeni
                          </p>
                        </div>
                      </a>
                      <a
                        href={siteConfig.social.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-4 p-3 border border-border/30 hover:border-primary/50 hover:bg-primary/5 transition-all group"
                      >
                        <div className="w-10 h-10 bg-primary/10 border border-primary/30 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                          <FiInstagram className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-mono text-sm text-foreground group-hover:text-primary transition-colors">
                            Instagram
                          </p>
                          <p className="font-mono text-[10px] text-muted-foreground">
                            @eliyantosarage_
                          </p>
                        </div>
                      </a>
                      <a
                        href={siteConfig.social.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-4 p-3 border border-border/30 hover:border-primary/50 hover:bg-primary/5 transition-all group"
                      >
                        <div className="w-10 h-10 bg-primary/10 border border-primary/30 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                          <FiLinkedin className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-mono text-sm text-foreground group-hover:text-primary transition-colors">
                            LinkedIn
                          </p>
                          <p className="font-mono text-[10px] text-muted-foreground">
                            Eliyanto Sarage
                          </p>
                        </div>
                      </a>
                      <a
                        href={siteConfig.social.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-4 p-3 border border-border/30 hover:border-primary/50 hover:bg-primary/5 transition-all group"
                      >
                        <div className="w-10 h-10 bg-primary/10 border border-primary/30 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                          <FiTwitter className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-mono text-sm text-foreground group-hover:text-primary transition-colors">
                            Twitter/X
                          </p>
                          <p className="font-mono text-[10px] text-muted-foreground">
                            @irnk_codes
                          </p>
                        </div>
                      </a>
                    </div>
                  </div>
                </NeonBorder>
              </ScrollReveal>

              <ScrollReveal delay={400}>
                <div className="relative overflow-hidden border border-primary/30 bg-primary/5 p-6">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-primary/10 rounded-full blur-2xl" />
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                      <span className="font-mono text-xs text-green-400 font-bold">
                        AVAILABLE
                      </span>
                    </div>
                    <h3 className="font-orbitron font-bold text-sm text-foreground mb-2">
                      ACCEPTING_PROJECTS
                    </h3>
                    <p className="font-mono text-xs text-muted-foreground leading-relaxed">
                      Saat ini tersedia untuk proyek freelance, konsultasi, dan
                      kolaborasi jangka panjang.
                    </p>
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={500}>
                <div className="border border-border/50 bg-secondary/20 p-6">
                  <h3 className="font-orbitron font-bold text-sm mb-4 text-primary">
                    QUICK_FAQ
                  </h3>
                  <div className="space-y-2">
                    <Collapsible>
                      <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-md hover:bg-primary/5 transition-colors group">
                        <span className="font-mono text-xs text-foreground font-bold text-left">
                          Berapa lama response time?
                        </span>
                        <HiChevronDown className="w-4 h-4 text-muted-foreground group-data-[state=open]:rotate-180 transition-transform" />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="px-3 pb-3">
                        <p className="font-mono text-[11px] text-muted-foreground leading-relaxed">
                          Biasanya dalam 24 jam di hari kerja. Untuk proyek urgent, kami akan memberikan response lebih cepat jika memungkinkan.
                        </p>
                      </CollapsibleContent>
                    </Collapsible>
                    <div className="border-t border-border/30" />
                    <Collapsible>
                      <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-md hover:bg-primary/5 transition-colors group">
                        <span className="font-mono text-xs text-foreground font-bold text-left">
                          Apakah menerima proyek remote?
                        </span>
                        <HiChevronDown className="w-4 h-4 text-muted-foreground group-data-[state=open]:rotate-180 transition-transform" />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="px-3 pb-3">
                        <p className="font-mono text-[11px] text-muted-foreground leading-relaxed">
                          Ya, 100% remote-friendly. Klien dari seluruh Indonesia dan internasional. Kami menggunakan tools kolaborasi modern seperti Slack, Notion, dan GitHub.
                        </p>
                      </CollapsibleContent>
                    </Collapsible>
                    <div className="border-t border-border/30" />
                    <Collapsible>
                      <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-md hover:bg-primary/5 transition-colors group">
                        <span className="font-mono text-xs text-foreground font-bold text-left">
                          Minimum budget proyek?
                        </span>
                        <HiChevronDown className="w-4 h-4 text-muted-foreground group-data-[state=open]:rotate-180 transition-transform" />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="px-3 pb-3">
                        <p className="font-mono text-[11px] text-muted-foreground leading-relaxed">
                          Mulai dari Rp 5.000.000 untuk konsultasi. Proyek custom disesuaikan dengan scope dan complexity. Kami memberikan quotation transparan sebelum memulai.
                        </p>
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
