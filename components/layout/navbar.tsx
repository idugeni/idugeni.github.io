"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState, useCallback } from "react";
import { HiOutlineBars3, HiOutlineXMark, HiOutlineChevronDown } from "react-icons/hi2";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { navLinks } from "./nav-links";
import type { NavItem } from "./nav-links";

function MegaMenu({ items }: { items: NavItem["megaMenu"] }) {
  if (!items) return null;
  return (
    <div className="grid grid-cols-2 gap-1">
      {items.map((item) => (
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
  );
}

export function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState<string | null>(null);

  const closeMobileMenu = useCallback(() => setIsOpen(false), []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-primary/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" prefetch={false}>
          <span className="font-orbitron font-bold text-xl text-primary cursor-pointer hover:text-primary/80 transition-colors neon-text">
            IRNK
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <div
              key={link.href + link.label}
              className="relative"
              onMouseEnter={() => link.megaMenu && setMegaMenuOpen(link.label)}
              onMouseLeave={() => setMegaMenuOpen(null)}
            >
              <Link href={link.href} prefetch={false}>
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

              {link.megaMenu && megaMenuOpen === link.label && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 w-[min(520px,95vw)]">
                  <div className="bg-background/95 backdrop-blur-xl border border-primary/20 shadow-[0_10px_40px_rgba(0,0,0,0.5)] p-4 overflow-x-auto">
                    <MegaMenu items={link.megaMenu} />
                  </div>
                </div>
              )}
            </div>
          ))}
          <Link href="/contact" prefetch={false} className="ml-2">
            <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground font-mono text-xs h-9">
              [ CONTACT ]
            </Button>
          </Link>
        </nav>

        <Button variant="ghost" size="icon" className="lg:hidden text-primary" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <HiOutlineXMark className="w-6 h-6" /> : <HiOutlineBars3 className="w-6 h-6" />}
        </Button>
      </div>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="left" className="w-fit max-w-[80vw] bg-background border-r border-primary/20 p-0 flex flex-col">
          <SheetHeader className="p-4 border-b border-primary/20 shrink-0">
            <SheetTitle className="font-orbitron font-bold text-xl text-primary tracking-wider text-left neon-text">
              IRNK
            </SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col gap-1 p-4 overflow-y-auto flex-1" aria-label="Mobile navigation">
            {navLinks.map((link) => (
              <div key={link.href + link.label}>
                <Link href={link.href} prefetch={false}>
                  <span
                    className={cn(
                      "block text-base font-mono tracking-wide p-3 rounded-sm",
                      pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href))
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground"
                    )}
                    onClick={closeMobileMenu}
                  >
                    {link.label}
                  </span>
                </Link>
                {link.megaMenu && (
                  <div className="pl-4 space-y-1 mb-2">
                    {link.megaMenu.map((item) => (
                      <Link key={item.label} href={item.href} prefetch={false}>
                        <span
                          className="block font-mono text-xs text-muted-foreground/70 p-2 hover:text-primary transition-colors"
                          onClick={closeMobileMenu}
                        >
                          → {item.label}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <Link href="/contact" prefetch={false}>
              <Button className="w-full bg-primary text-primary-foreground font-mono mt-3" onClick={closeMobileMenu}>
                CONTACT
              </Button>
            </Link>
          </nav>
        </SheetContent>
      </Sheet>
    </header>
  );
}
