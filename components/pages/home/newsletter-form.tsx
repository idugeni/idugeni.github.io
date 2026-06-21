"use client";

import { useState } from "react";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { HiOutlineEnvelope } from "react-icons/hi2";
import { subscribeNewsletter } from "@/actions/newsletter";
import { toast } from "sonner";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || isLoading) return;

    setIsLoading(true);
    try {
      const result = await subscribeNewsletter({ email });
      if (result.success) {
        toast.success("Subscribed!", { description: result.message });
        setEmail("");
      } else {
        toast.error("Info", { description: result.message });
      }
    } catch {
      toast.error("Error", { description: "Gagal berlangganan. Silakan coba lagi." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,hsl(var(--primary)/0.05)_0%,transparent_60%)]" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <ScrollReveal>
          <div className="relative">
            {/* Outer glow border */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 blur-sm" />

            <div className="relative bg-background border border-primary/30 p-8 md:p-12 text-center">
              {/* Corner decorations */}
              <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-primary/60" />
              <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-primary/60" />
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-primary/60" />
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-primary/60" />

              <div className="w-14 h-14 mx-auto mb-6 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
                <HiOutlineEnvelope className="w-6 h-6 text-primary" />
              </div>

              <span className="font-mono text-[10px] text-primary/70 tracking-widest">
                // JOIN THE NETWORK
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-orbitron font-bold mt-2 mb-4">
                STAY_CONNECTED
              </h2>
              <p className="text-muted-foreground font-mono text-sm mb-8 max-w-lg mx-auto">
                Dapatkan update terbaru tentang proyek, artikel, dan insight
                teknologi langsung ke inbox Anda.
              </p>

              <form
                onSubmit={handleSubmit}
                className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
              >
                <Input
                  id="home-newsletter-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-secondary/50 font-mono border-primary/30 rounded-none h-12 flex-1 focus:border-primary focus:shadow-glow-xs"
                />
                <Button
                  type="submit"
                  className="font-mono h-12 px-8 rounded-none bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow-xs hover:shadow-glow-sm transition-shadow"
                  disabled={isLoading}
                >
                  {isLoading ? "PROCESSING..." : "SUBSCRIBE"}
                </Button>
              </form>

              <div className="flex items-center justify-center gap-6 mt-6 font-mono text-[10px] text-muted-foreground/50">
                <span>✓ No spam</span>
                <span>✓ Unsubscribe kapan saja</span>
                <span>✓ Weekly digest</span>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
