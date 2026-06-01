"use client";

import Link from "next/link";
import { FiGithub, FiInstagram, FiMail } from "react-icons/fi";
import { siteConfig } from "@/lib/config/site";

const YEAR = 2026;

export function Footer() {
  return (
    <footer className="border-t border-primary/20 bg-background/80 backdrop-blur-sm mt-auto relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Column 1: Brand */}
          <div>
            <span className="font-orbitron font-bold text-xl text-primary mb-4 block neon-text">
              {siteConfig.name.toUpperCase()}
            </span>
            <div className="text-muted-foreground font-mono text-xs leading-relaxed mb-6">
              {siteConfig.tagline}. {siteConfig.owner.title} based in {siteConfig.owner.location}.
            </div>
            <div className="flex gap-3">
              <a href={siteConfig.social.github} target="_blank" rel="noopener noreferrer" className="w-8 h-8 border border-border/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors">
                <FiGithub className="w-4 h-4" />
              </a>
              <a href={siteConfig.social.instagram} target="_blank" rel="noopener noreferrer" className="w-8 h-8 border border-border/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors">
                <FiInstagram className="w-4 h-4" />
              </a>
              <a href={`mailto:${siteConfig.contact.email}`} className="w-8 h-8 border border-border/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors">
                <FiMail className="w-4 h-4" />
              </a>
            </div>
            <div className="text-muted-foreground font-mono text-[10px] flex items-center gap-2 mt-4">
              STATUS: <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" /> ONLINE
            </div>
          </div>

          {/* Column 2: Navigation */}
          <div>
            <h4 className="font-orbitron text-xs font-bold text-foreground mb-4 tracking-wider">NAVIGATION</h4>
            <ul className="space-y-2.5 font-mono text-xs">
              <li><Link href="/" className="text-muted-foreground hover:text-primary transition-colors">Home</Link></li>
              <li><Link href="/about" className="text-muted-foreground hover:text-primary transition-colors">About</Link></li>
              <li><Link href="/projects" className="text-muted-foreground hover:text-primary transition-colors">Projects</Link></li>
              <li><Link href="/blog" className="text-muted-foreground hover:text-primary transition-colors">Blog</Link></li>
              <li><Link href="/gallery" className="text-muted-foreground hover:text-primary transition-colors">Gallery</Link></li>
              <li><Link href="/resume" className="text-muted-foreground hover:text-primary transition-colors">Resume</Link></li>
              <li><Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Column 3: Services */}
          <div>
            <h4 className="font-orbitron text-xs font-bold text-foreground mb-4 tracking-wider">SERVICES</h4>
            <ul className="space-y-2.5 font-mono text-xs">
              <li><Link href="/services" className="text-muted-foreground hover:text-primary transition-colors">Web Development</Link></li>
              <li><Link href="/services" className="text-muted-foreground hover:text-primary transition-colors">AI &amp; ML Integration</Link></li>
              <li><Link href="/services" className="text-muted-foreground hover:text-primary transition-colors">UI/UX Design</Link></li>
              <li><Link href="/services" className="text-muted-foreground hover:text-primary transition-colors">Mobile Development</Link></li>
              <li><Link href="/services" className="text-muted-foreground hover:text-primary transition-colors">DevOps &amp; Cloud</Link></li>
              <li><Link href="/services" className="text-muted-foreground hover:text-primary transition-colors">Technical Consulting</Link></li>
            </ul>
          </div>

          {/* Column 4: Contact & Legal */}
          <div>
            <h4 className="font-orbitron text-xs font-bold text-foreground mb-4 tracking-wider">CONTACT</h4>
            <ul className="space-y-2.5 font-mono text-xs">
              <li><Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors">Send Message</Link></li>
              <li><span className="text-muted-foreground">{siteConfig.contact.address}</span></li>
              <li><a href={`mailto:${siteConfig.contact.email}`} className="text-muted-foreground hover:text-primary transition-colors">{siteConfig.contact.email}</a></li>
            </ul>
            <h4 className="font-orbitron text-xs font-bold text-foreground mb-3 mt-6 tracking-wider">LEGAL</h4>
            <ul className="space-y-2.5 font-mono text-xs">
              <li><Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><Link href="/sitemap" className="text-muted-foreground hover:text-primary transition-colors">Sitemap</Link></li>
              <li><a href="/feed.xml" className="text-muted-foreground hover:text-primary transition-colors">RSS Feed</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-primary/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-muted-foreground font-mono text-[10px]">
            © {YEAR} {siteConfig.name}. All rights reserved.
          </div>
          <div className="text-muted-foreground font-mono text-[10px]">
            Crafted by {siteConfig.owner.name}
          </div>
        </div>
      </div>
    </footer>
  );
}
