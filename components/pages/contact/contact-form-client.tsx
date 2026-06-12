"use client";

import { useState } from "react";
import { useSendContactMessage } from "@/actions/hooks/use-contact";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NeonBorder } from "@/components/ui/neon-border";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { useToast } from "@/hooks/use-toast";
import {
  HiOutlineCheckCircle,
  HiOutlinePaperAirplane,
} from "react-icons/hi2";

const emptyContactForm = {
  nama: "",
  email: "",
  subjek: "",
  pesan: "",
  noWa: "",
};

export function ContactFormClient() {
  const sendMessage = useSendContactMessage();
  const { toast } = useToast();
  const [formData, setFormData] = useState(emptyContactForm);
  const [sent, setSent] = useState(false);
  const [isCustomSubject, setIsCustomSubject] = useState(false);

  const handleSubjectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    if (value === "custom") {
      setIsCustomSubject(true);
      setFormData((current) => ({ ...current, subjek: "" }));
      return;
    }

    setIsCustomSubject(false);
    setFormData((current) => ({ ...current, subjek: value }));
  };

  const resetForm = () => {
    setFormData(emptyContactForm);
    setIsCustomSubject(false);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const result = await sendMessage.execute(formData);

    if (!result) return;

    const emailStatus = result.email?.adminNotification;
    toast({
      title: "TRANSMISSION_SUCCESSFUL",
      description:
        emailStatus === "sent"
          ? "Pesan Anda telah diterima dan notifikasi email berhasil dikirim."
          : "Pesan Anda telah diterima. Saya akan merespons dalam 24 jam.",
    });
    resetForm();
    setSent(true);
  };

  return (
    <ScrollReveal delay={100}>
      <div className="relative">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/10 via-transparent to-primary/10 blur-sm opacity-50" />
        <div className="relative bg-background border border-primary/20 p-6 md:p-8">
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
                  resetForm();
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
                    onChange={(event) =>
                      setFormData({ ...formData, nama: event.target.value })
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
                    onChange={(event) =>
                      setFormData({ ...formData, email: event.target.value })
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
                      onChange={(event) =>
                        setFormData({ ...formData, subjek: event.target.value })
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
                    onChange={(event) =>
                      setFormData({ ...formData, noWa: event.target.value })
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
                  onChange={(event) =>
                    setFormData({ ...formData, pesan: event.target.value })
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
  );
}
