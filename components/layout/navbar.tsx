"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { HiOutlineBars3, HiOutlineXMark, HiOutlineChevronDown } from "react-icons/hi2";
import { FiCode, FiBriefcase, FiSmartphone, FiCloud, FiCpu, FiMessageSquare, FiFolder, FiStar, FiGitBranch, FiImage, FiVideo, FiAward, FiBookOpen, FiTrendingUp, FiLayers } from "react-icons/fi";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  {
    href: "/projects",
    label: "Projects",
    megaMenu: [
      { href: "/projects", label: "All Projects", desc: "Lihat semua portfolio proyek", icon: FiFolder },
      { href: "/projects?status=completed", label: "Completed", desc: "Proyek yang telah selesai", icon: FiStar },
      { href: "/projects?category=Web App", label: "Web Apps", desc: "Aplikasi web full-stack", icon: FiCode },
      { href: "/projects?category=Mobile App", label: "Mobile Apps", desc: "Aplikasi iOS & Android", icon: FiSmartphone },
      { href: "/projects?category=AI", label: "AI / ML", desc: "Machine learning & AI projects", icon: FiCpu },
      { href: "/projects?status=ongoing", label: "Ongoing", desc: "Proyek yang sedang berjalan", icon: FiGitBranch },
    ],
  },
  {
    href: "/services",
    label: "Services",
    megaMenu: [
      { href: "/services/web-development", label: "Web Development", desc: "Aplikasi web modern & scalable", icon: FiCode },
      { href: "/services/ai-ml-integration", label: "AI & ML Integration", desc: "Chatbot, NLP, dan predictive analytics", icon: FiCpu },
      { href: "/services/ui-ux-design", label: "UI/UX Design", desc: "Desain antarmuka yang beautiful", icon: FiBriefcase },
      { href: "/services/mobile-development", label: "Mobile Development", desc: "Cross-platform iOS & Android", icon: FiSmartphone },
      { href: "/services/devops-cloud", label: "DevOps & Cloud", desc: "Infrastructure & CI/CD pipeline", icon: FiCloud },
      { href: "/services/technical-consulting", label: "Technical Consulting", desc: "Arsitektur & code review", icon: FiMessageSquare },
    ],
  },
  {
    href: "/blog",
    label: "Blog",
    megaMenu: [
      { href: "/blog", label: "All Articles", desc: "Semua artikel & tutorial", icon: FiBookOpen },
      { href: "/blog?cat=web-development", label: "Web Development", desc: "Tips & tutorial web dev", icon: FiCode },
      { href: "/blog?cat=artificial-intelligence", label: "AI & Machine Learning", desc: "Eksplorasi dunia AI", icon: FiCpu },
      { href: "/blog?cat=ui-ux-design", label: "UI/UX Design", desc: "Design tips & trends", icon: FiLayers },
      { href: "/blog?cat=devops-cloud", label: "DevOps & Cloud", desc: "Infrastructure & deployment", icon: FiCloud },
      { href: "/blog?cat=mobile-development", label: "Mobile Dev", desc: "React Native & Flutter", icon: FiSmartphone },
    ],
  },
  {
    href: "/gallery",
    label: "Gallery",
    megaMenu: [
      { href: "/gallery", label: "All Media", desc: "Semua foto & video", icon: FiImage },
      { href: "/gallery?filter=workspace", label: "Workspace", desc: "Setup & environment kerja", icon: FiFolder },
      { href: "/gallery?filter=event", label: "Events", desc: "Conference & workshop", icon: FiTrendingUp },
      { href: "/gallery?filter=achievement", label: "Achievements", desc: "Penghargaan & sertifikasi", icon: FiAward },
      { href: "/gallery?filter=team", label: "Team", desc: "Kolaborasi & team building", icon: FiBriefcase },
      { href: "/gallery?filter=video", label: "Videos", desc: "Demo & presentasi video", icon: FiVideo },
    ],
  },
];

export function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState<string | null>(null);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-primary/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/">
          <span className="font-orbitron font-bold text-xl text-primary cursor-pointer hover:text-primary/80 transition-colors neon-text">
            IRNK
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <div
              key={link.href + link.label}
              className="relative"
              onMouseEnter={() => link.megaMenu && setMegaMenuOpen(link.label)}
              onMouseLeave={() => setMegaMenuOpen(null)}
            >
              <Link href={link.href}>
                <span
                  className={cn(
                    "text-sm font-mono tracking-wide transition-colors cursor-pointer hover:text-primary px-3 py-2 inline-flex items-center gap-1",
                    pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href))
                      ? "text-primary"
                      : "text-muted-foreground"
                  )}
                >
                  {link.label}
                  {link.megaMenu && (
                    <HiOutlineChevronDown className={cn("w-3 h-3 transition-transform", megaMenuOpen === link.label && "rotate-180")} />
                  )}
                </span>
              </Link>

              {/* Mega Menu Dropdown */}
              {link.megaMenu && megaMenuOpen === link.label && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 w-[520px]">
                  <div className="bg-background/95 backdrop-blur-xl border border-primary/20 shadow-[0_10px_40px_rgba(0,0,0,0.5)] p-4">
                    <div className="grid grid-cols-2 gap-1">
                      {link.megaMenu.map((item) => (
                        <Link key={item.label} href={item.href} prefetch={false}>
                          <div className="flex items-start gap-3 p-3 rounded-sm hover:bg-primary/5 transition-colors group cursor-pointer">
                            <div className="w-9 h-9 rounded bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                              <item.icon className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <div className="font-mono text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                                {item.label}
                              </div>
                              <div className="font-mono text-[10px] text-muted-foreground mt-0.5">
                                {item.desc}
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
          <Link href="/contact" className="ml-2">
            <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground font-mono text-xs h-9">
              [ CONTACT ]
            </Button>
          </Link>
        </nav>

        {/* Mobile Toggle */}
        <Button variant="ghost" size="icon" className="lg:hidden text-primary" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <HiOutlineXMark className="w-6 h-6" /> : <HiOutlineBars3 className="w-6 h-6" />}
        </Button>
      </div>

      {/* Mobile Nav - Using Sheet (Portal) to avoid z-index issues */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="left" className="w-fit max-w-[80vw] bg-background border-r border-primary/20 p-0 flex flex-col">
          <SheetHeader className="p-4 border-b border-primary/20 shrink-0">
            <SheetTitle className="font-orbitron font-bold text-xl text-primary tracking-wider text-left neon-text">
              IRNK
            </SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-1 p-4 overflow-y-auto flex-1">
            {navLinks.map((link) => (
              <div key={link.href + link.label}>
                <Link href={link.href}>
                  <span
                    className={cn(
                      "block text-base font-mono tracking-wide p-3 rounded-sm",
                      pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href))
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground"
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    {link.label}
                  </span>
                </Link>
                {/* Mobile sub-items */}
                {link.megaMenu && (
                  <div className="pl-4 space-y-1 mb-2">
                    {link.megaMenu.map((item) => (
                      <Link key={item.label} href={item.href} prefetch={false}>
                        <span
                          className="block font-mono text-xs text-muted-foreground/70 p-2 hover:text-primary transition-colors"
                          onClick={() => setIsOpen(false)}
                        >
                          → {item.label}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <Link href="/contact">
              <Button className="w-full bg-primary text-primary-foreground font-mono mt-3" onClick={() => setIsOpen(false)}>
                CONTACT
              </Button>
            </Link>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}
