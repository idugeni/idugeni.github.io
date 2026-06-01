"use client";

import { PublicLayout } from "@/components/layout/public-layout";
import { useState } from "react";
import { useSendContactMessage } from "@/actions/hooks";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { NeonBorder } from "@/components/ui/neon-border";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  HiOutlineEnvelope,
  HiOutlineMapPin,
  HiOutlinePhone,
  HiOutlinePaperAirplane,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineChatBubbleLeftRight,
} from "react-icons/hi2";
import { FiGithub, FiInstagram } from "react-icons/fi";
import { siteConfig } from "@/lib/config/site";
import { getWhatsAppLink } from "@/lib/utils/whatsapp";

export default function Contact() {
  const sendMessage = useSendContactMessage();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    subjek: "",
    pesan: "",
    noWa: "",
  });
  const [sent, setSent] = useState(false);
  const [isCustomSubject, setIsCustomSubject] = useState(false);

  const handleSubjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === "custom") {
      setIsCustomSubject(true);
      setFormData((prev) => ({ ...prev, subjek: "" }));
    } else {
      setIsCustomSubject(false);
      setFormData((prev) => ({ ...prev, subjek: val }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await sendMessage.execute(formData);
    if (result) {
      const emailStatus = result.email?.adminNotification;
      toast({
        title: "TRANSMISSION_SUCCESSFUL",
        description: emailStatus === "sent"
          ? "Pesan Anda telah diterima dan notifikasi email berhasil dikirim."
          : "Pesan Anda telah diterima. Saya akan merespons dalam 24 jam.",
      });
      setFormData({ nama: "", email: "", subjek: "", pesan: "", noWa: "" });
      setIsCustomSubject(false);
      setSent(true);
    }
  };

  return (
    <PublicLayout>
      <div className="pt-4 pb-20 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Header */}
          <PageHeader
            badge="Open Channel"
            badgeIcon={<HiOutlineChatBubbleLeftRight className="w-4 h-4" />}
            title="ESTABLISH_CONTACT"
            description="Punya proyek menarik atau ingin berkolaborasi? Kirim transmisi dan saya akan merespons dalam waktu 24 jam."
          />

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Contact Form - 3 columns */}
            <div className="lg:col-span-3">
              <ScrollReveal delay={100}>
                <div className="relative">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/10 via-transparent to-primary/10 blur-sm opacity-50" />
                  <div className="relative bg-background border border-primary/20 p-6 md:p-8">
                    {/* Corner decorations */}
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary/50" />
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary/50" />
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary/50" />
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary/50" />

                    <div className="flex items-center gap-3 mb-8">
                      <div className="w-10 h-10 rounded bg-primary/10 border border-primary/30 flex items-center justify-center">
                        <HiOutlinePaperAirplane className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h2 className="font-orbitron font-bold text-lg text-foreground">
                          TRANSMIT_MESSAGE
                        </h2>
                        <p className="font-mono text-[10px] text-muted-foreground">
                          Semua field bertanda * wajib diisi
                        </p>
                      </div>
                    </div>

                    {sent ? (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
                          <HiOutlineCheckCircle className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="font-orbitron font-bold text-lg text-primary mb-2">
                          TRANSMISSION_COMPLETE
                        </h3>
                        <p className="font-mono text-sm text-muted-foreground mb-6">
                          Pesan Anda telah diterima. Saya akan merespons segera.
                        </p>
                        <Button
                          variant="outline"
                          className="font-mono border-primary/50"
                          onClick={() => {
                            setSent(false);
                            setIsCustomSubject(false);
                            setFormData({ nama: "", email: "", subjek: "", pesan: "", noWa: "" });
                          }}
                        >
                          SEND_ANOTHER
                        </Button>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div className="space-y-2">
                            <Label className="font-mono text-[10px] text-muted-foreground tracking-wider">
                              NAMA *
                            </Label>
                            <Input
                              required
                              placeholder="Nama lengkap Anda"
                              className="bg-secondary/30 border-border/50 focus:border-primary font-mono text-sm rounded-none h-11"
                              value={formData.nama}
                              onChange={(e) =>
                                setFormData({ ...formData, nama: e.target.value })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="font-mono text-[10px] text-muted-foreground tracking-wider">
                              EMAIL *
                            </Label>
                            <Input
                              required
                              type="email"
                              placeholder="email@example.com"
                              className="bg-secondary/30 border-border/50 focus:border-primary font-mono text-sm rounded-none h-11"
                              value={formData.email}
                              onChange={(e) =>
                                setFormData({ ...formData, email: e.target.value })
                              }
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div className="space-y-2">
                            <Label className="font-mono text-[10px] text-muted-foreground tracking-wider">
                              SUBJEK *
                            </Label>
                            <select
                              required
                              className="w-full bg-secondary/30 border border-border/50 focus:border-primary font-mono text-sm rounded-none h-11 px-3 text-foreground focus:outline-none focus:ring-0 focus-visible:ring-0 cursor-pointer"
                              value={isCustomSubject ? "custom" : formData.subjek}
                              onChange={handleSubjectChange}
                            >
                              <option value="" disabled className="bg-background text-muted-foreground">Pilih Subjek Transmisi...</option>
                              <option value="Jasa Pembuatan Website / Aplikasi" className="bg-background text-foreground">Website / Web App Development</option>
                              <option value="Konsultasi & Arsitektur Cloud" className="bg-background text-foreground">Consulting & Cloud Architecture</option>
                              <option value="Optimasi Performa & SecOps Hardening" className="bg-background text-foreground">Performance & SecOps Hardening</option>
                              <option value="Kolaborasi / Project Partnership" className="bg-background text-foreground">Project Collaboration / Partnership</option>
                              <option value="custom" className="bg-background text-primary font-bold">Lainnya (Ketik Manual...)</option>
                            </select>
                            {isCustomSubject && (
                              <Input
                                required
                                placeholder="Ketik subjek kustom Anda disini..."
                                className="bg-secondary/30 border-border/50 focus:border-primary font-mono text-sm rounded-none h-11 mt-2 animate-in slide-in-from-top-1 duration-200"
                                value={formData.subjek}
                                onChange={(e) =>
                                  setFormData({ ...formData, subjek: e.target.value })
                                }
                              />
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label className="font-mono text-[10px] text-muted-foreground tracking-wider">
                              WHATSAPP (opsional)
                            </Label>
                            <Input
                              placeholder="+62 812 xxxx xxxx"
                              className="bg-secondary/30 border-border/50 focus:border-primary font-mono text-sm rounded-none h-11"
                              value={formData.noWa}
                              onChange={(e) =>
                                setFormData({ ...formData, noWa: e.target.value })
                              }
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="font-mono text-[10px] text-muted-foreground tracking-wider">
                            PESAN *
                          </Label>
                          <textarea
                            required
                            placeholder="Ceritakan tentang proyek atau kebutuhan Anda..."
                            className="w-full min-h-[160px] bg-secondary/30 border border-border/50 focus:border-primary font-mono text-sm rounded-none p-3 resize-none focus:outline-none focus:ring-0 text-foreground placeholder:text-muted-foreground/50"
                            value={formData.pesan}
                            onChange={(e) =>
                              setFormData({ ...formData, pesan: e.target.value })
                            }
                          />
                        </div>

                        <Button
                          type="submit"
                          className="w-full font-mono bg-primary text-primary-foreground hover:bg-primary/90 h-12 rounded-none shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:shadow-[0_0_25px_rgba(6,182,212,0.5)] transition-shadow"
                          disabled={sendMessage.isLoading}
                        >
                          {sendMessage.isLoading ? (
                            "TRANSMITTING..."
                          ) : (
                            <>
                              <HiOutlinePaperAirplane className="w-4 h-4 mr-2" />
                              EXECUTE_TRANSMISSION
                            </>
                          )}
                        </Button>
                      </form>
                    )}
                  </div>
                </div>
              </ScrollReveal>
            </div>

            {/* Sidebar - 2 columns */}
            <div className="lg:col-span-2 space-y-6">
              {/* Contact Info */}
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
                            href={getWhatsAppLink(siteConfig.contact.whatsapp, "Halo, saya tertarik untuk berdiskusi tentang proyek.")}
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

              {/* Social Links */}
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
                          <p className="font-mono text-sm text-foreground group-hover:text-primary transition-colors">GitHub</p>
                          <p className="font-mono text-[10px] text-muted-foreground">@idugeni</p>
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
                          <p className="font-mono text-sm text-foreground group-hover:text-primary transition-colors">Instagram</p>
                          <p className="font-mono text-[10px] text-muted-foreground">@eliyantosarage_</p>
                        </div>
                      </a>
                    </div>
                  </div>
                </NeonBorder>
              </ScrollReveal>

              {/* Availability Status */}
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

              {/* FAQ Quick */}
              <ScrollReveal delay={500}>
                <div className="border border-border/50 bg-secondary/20 p-6">
                  <h3 className="font-orbitron font-bold text-sm mb-4 text-primary">
                    QUICK_FAQ
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <p className="font-mono text-xs text-foreground font-bold mb-1">
                        Berapa lama response time?
                      </p>
                      <p className="font-mono text-[11px] text-muted-foreground">
                        Biasanya dalam 24 jam di hari kerja.
                      </p>
                    </div>
                    <div className="border-t border-border/30 pt-4">
                      <p className="font-mono text-xs text-foreground font-bold mb-1">
                        Apakah menerima proyek remote?
                      </p>
                      <p className="font-mono text-[11px] text-muted-foreground">
                        Ya, 100% remote-friendly. Klien dari seluruh Indonesia dan internasional.
                      </p>
                    </div>
                    <div className="border-t border-border/30 pt-4">
                      <p className="font-mono text-xs text-foreground font-bold mb-1">
                        Minimum budget proyek?
                      </p>
                      <p className="font-mono text-[11px] text-muted-foreground">
                        Mulai dari Rp 5.000.000 untuk konsultasi. Proyek custom disesuaikan.
                      </p>
                    </div>
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
