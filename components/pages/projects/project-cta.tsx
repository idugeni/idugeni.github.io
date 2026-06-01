"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Mail, FileText } from "@/lib/icons";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export function ProjectCTA() {
  return (
    <ScrollReveal delay={100}>
      <div className="mt-16 border-t border-border/30 pt-16">
        <div className="glass-card p-8 md:p-12 text-center">
          <h2 className="text-2xl md:text-3xl font-orbitron font-bold mb-4 text-primary">
            INTERESTED_IN_SIMILAR_PROJECT?
          </h2>
          <p className="font-mono text-sm md:text-base text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            I'm available for freelance work and full-time opportunities. 
            Let's discuss how I can help bring your project to life with cutting-edge technology and clean code.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/contact">
              <Button 
                size="lg" 
                className="font-mono bg-primary hover:bg-primary/90 shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] transition-all"
              >
                <Mail className="w-4 h-4 mr-2" />
                GET_IN_TOUCH
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                variant="outline"
                size="lg"
                className="font-mono border-primary/50 hover:bg-primary/20 hover:border-primary transition-all"
              >
                <FileText className="w-4 h-4 mr-2" />
                REQUEST_QUOTE
              </Button>
            </Link>
          </div>
          
          {/* Additional info */}
          <div className="mt-8 pt-8 border-t border-border/20">
            <p className="font-mono text-xs text-muted-foreground/60">
              Response time: <span className="text-primary">24-48 hours</span> • 
              Free consultation: <span className="text-primary">30 minutes</span>
            </p>
          </div>
        </div>
      </div>
    </ScrollReveal>
  );
}
