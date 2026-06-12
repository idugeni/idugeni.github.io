"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import {
  Activity,
  BarChart,
  Briefcase,
  Database,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  LayoutDashboard,
  List,
  Lock,
  LogOut,
  Mail,
  Megaphone,
  Menu,
  MessageSquare,
  QrCode,
  Settings,
  Shield,
  Users,
  X,
} from "@/lib/icons";
import { Button } from "@/components/ui/button";
import { ConfirmActionDialog } from "@/components/admin/ConfirmActionDialog";

const navGroups = [
  {
    label: "COMMAND",
    items: [
      { href: "/admin", label: "Dashboard", description: "System overview", icon: LayoutDashboard },
      { href: "/admin/analytics", label: "Analytics", description: "Traffic intelligence", icon: BarChart },
    ],
  },
  {
    label: "CONTENT",
    items: [
      { href: "/admin/blog", label: "Blog", description: "Articles & editorial", icon: FileText },
      { href: "/admin/categories", label: "Categories", description: "Content taxonomy", icon: List },
      { href: "/admin/projects", label: "Projects", description: "Portfolio archive", icon: Briefcase },
      { href: "/admin/gallery", label: "Gallery", description: "Media collection", icon: ImageIcon },
      { href: "/admin/services", label: "Services", description: "Offer catalog", icon: Settings },
    ],
  },
  {
    label: "ENGAGEMENT",
    items: [
      { href: "/admin/testimonials", label: "Testimonials", description: "Social proof", icon: Users },
      { href: "/admin/messages", label: "Messages", description: "Contact inbox", icon: MessageSquare },
      { href: "/admin/newsletter", label: "Newsletter", description: "Subscriber base", icon: Mail },
      { href: "/admin/announcements", label: "Announcements", description: "Public bulletins & banners", icon: Megaphone },
    ],
  },
  {
    label: "TOOLS",
    items: [
      { href: "/admin/shortlinks", label: "Shortlinks", description: "Short URLs & QR codes", icon: QrCode },
    ],
  },
];

const allNavItems = navGroups.flatMap((group) => group.items);

function getActiveItem(pathname: string) {
  return allNavItems.find((item) => pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))) ?? allNavItems[0];
}

function formatRoute(pathname: string) {
  if (pathname === "/admin") return "ADMIN / DASHBOARD";
  return pathname
    .split("/")
    .filter(Boolean)
    .map((segment) => segment.replace(/-/g, " ").toUpperCase())
    .join(" / ");
}

function AdminShellHeader({ pathname, onMenuClick }: { pathname: string; onMenuClick: () => void }) {
  const activeItem = getActiveItem(pathname);
  return (
    <header className="sticky top-0 z-30 border-b border-primary/15 bg-background/78 backdrop-blur-2xl supports-[backdrop-filter]:bg-background/58">
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      <div className="flex min-h-20 flex-col gap-4 px-4 py-4 md:px-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onMenuClick} className="rounded-none border border-border/50 md:hidden" aria-label="Open admin navigation">
            <Menu className="h-5 w-5 text-primary" />
          </Button>
          <div className="flex h-11 w-11 shrink-0 items-center justify-center border border-primary/30 bg-primary/10 text-primary shadow-[0_0_30px_hsl(var(--primary)/0.18)]">
            <activeItem.icon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="break-all font-mono text-[10px] uppercase tracking-[0.28em] text-primary/80">{formatRoute(pathname)}</p>
            <h2 className="break-words font-orbitron text-xl font-bold text-foreground md:text-2xl">{activeItem.label}</h2>
            <p className="font-mono text-xs text-muted-foreground">{activeItem.description}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          <span className="inline-flex items-center gap-2 border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-emerald-400">
            <Activity className="h-3.5 w-3.5" /> DYNAMIC_SSR
          </span>
          <span className="inline-flex items-center gap-2 border border-primary/30 bg-primary/10 px-3 py-2 text-primary">
            <Shield className="h-3.5 w-3.5" /> SECURE_ADMIN
          </span>
          <Button asChild variant="outline" size="sm" className="rounded-none font-mono">
            <Link href="/" target="_blank">
              <ExternalLink className="mr-2 h-3.5 w-3.5" /> View Site
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="rounded-none font-mono">
            <Link href="/admin/messages">
              <Mail className="mr-2 h-3.5 w-3.5" /> Inbox
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

function AdminShellFooter() {
  return (
    <footer className="mt-10 border-t border-primary/15 px-4 py-6 md:px-8">
      <div className="flex flex-col gap-4 rounded-none border border-border/50 bg-card/45 p-4 backdrop-blur md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-orbitron text-sm font-bold text-primary">IRNK_CODES_ADMIN</p>
          <p className="mt-1 font-mono text-xs text-muted-foreground">Production operations console · Next.js 16 · React 19 · Supabase</p>
        </div>
        <div className="flex flex-wrap gap-2 font-mono text-[10px] text-muted-foreground">
          <span className="border border-border/50 px-2 py-1">RSC_READY</span>
          <span className="border border-border/50 px-2 py-1">TURBOPACK_SAFE</span>
          <span className="border border-border/50 px-2 py-1">SERVER_FIRST</span>
          <Link href="/admin/analytics" className="border border-primary/30 px-2 py-1 text-primary transition-colors hover:bg-primary/10">ANALYTICS</Link>
        </div>
      </div>
    </footer>
  );
}

function SidebarContent({ pathname, onNavigate, onLogout }: { pathname: string; onNavigate: () => void; onLogout: () => void }) {
  const activeItem = getActiveItem(pathname);
  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="relative border-b border-sidebar-border/60 p-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.18),transparent_45%)]" />
        <div className="relative">
          <Link href="/admin" onClick={onNavigate} className="group block">
            <div className="font-orbitron text-2xl font-black leading-none tracking-[0.18em] text-primary transition-colors group-hover:text-primary/80">IRNK</div>
            <div className="mt-1 font-orbitron text-sm font-bold tracking-[0.38em] text-foreground">CODES</div>
          </Link>
          <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Admin Operations Console</p>
          <div className="mt-4 grid grid-cols-2 gap-2 font-mono text-[10px]">
            <div className="border border-emerald-500/25 bg-emerald-500/10 p-2 text-emerald-400">
              <span className="inline-flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399]" /> ONLINE</span>
            </div>
            <div className="border border-primary/25 bg-primary/10 p-2 text-primary">ADMIN</div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto overscroll-contain px-3 py-4">
        <nav className="space-y-5" aria-label="Admin navigation">
          {navGroups.map((group) => (
            <div key={group.label}>
              <div className="mb-2 px-3 font-mono text-[10px] font-bold tracking-[0.25em] text-muted-foreground/70">{group.label}</div>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const active = activeItem.href === item.href;
                  return (
                    <Link key={item.href} href={item.href} onClick={onNavigate} aria-current={active ? "page" : undefined} className="block">
                      <span className={cn(
                        "group relative flex items-center gap-3 overflow-hidden border border-transparent px-3 py-3 text-sm transition-all duration-200",
                        active
                          ? "border-primary/30 bg-primary/10 text-primary shadow-[inset_3px_0_0_hsl(var(--primary)),0_0_24px_hsl(var(--primary)/0.08)]"
                          : "text-muted-foreground hover:border-border/70 hover:bg-secondary/70 hover:text-foreground"
                      )}>
                        <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center border transition-colors", active ? "border-primary/40 bg-primary/15 text-primary" : "border-border/50 bg-background/40 group-hover:text-primary")}>
                          <item.icon className="h-4 w-4" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block font-mono font-semibold">{item.label}</span>
                          <span className="block truncate font-mono text-[10px] text-muted-foreground">{item.description}</span>
                        </span>
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      <div className="border-t border-sidebar-border/60 p-4">
        <div className="mb-3 rounded-none border border-border/50 bg-background/35 p-3 font-mono text-[10px] text-muted-foreground">
          <div className="mb-2 flex items-center gap-2 text-primary"><Lock className="h-3.5 w-3.5" /> AUTH_GUARD_ACTIVE</div>
          <div className="flex items-center gap-2"><Database className="h-3.5 w-3.5" /> Supabase session verified</div>
        </div>
        <Button variant="ghost" className="w-full justify-start rounded-none border border-transparent font-mono text-muted-foreground hover:border-destructive/30 hover:bg-destructive/10 hover:text-destructive" onClick={onLogout}>
          <LogOut className="mr-2 h-4 w-4" /> Logout
        </Button>
      </div>
    </div>
  );
}

export function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [isLogoutPending, setIsLogoutPending] = useState(false);
  const mobileSidebarRef = useRef<HTMLDivElement>(null);

  const closeMobileMenu = useCallback(() => setIsMobileMenuOpen(false), []);

  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMobileMenu();
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen, closeMobileMenu]);


  useEffect(() => {
    const segments = pathname
      .split("/")
      .filter(Boolean)
      .map(segment => {
        // Filter out UUIDs
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment);
        if (isUUID) return "Detail";
        
        // Format to Title Case
        return segment
          .replace(/-/g, " ")
          .replace(/\b\w/g, char => char.toUpperCase());
      });

    if (segments.length > 0) {
      const titleParts = [...segments].reverse();
      document.title = `${titleParts.join(" | ")} — IRNK Codes`;
    } else {
      document.title = "Admin — IRNK Codes";
    }
  }, [pathname]);

  const confirmLogout = async () => {
    setIsLogoutPending(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      setIsLogoutDialogOpen(false);
      router.replace("/login");
    } catch {
      setIsLogoutDialogOpen(false);
      router.replace("/login");
    } finally {
      setIsLogoutPending(false);
    }
  };


  return (
    <div className="dark min-h-[100dvh] bg-background text-foreground">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.13),transparent_30%),radial-gradient(circle_at_bottom_right,hsl(var(--accent)/0.10),transparent_28%)]" />
      <div className="fixed inset-0 -z-10 bg-[linear-gradient(to_right,hsl(var(--border)/0.18)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.14)_1px,transparent_1px)] bg-[size:48px_48px] opacity-30" />

      <div className="flex min-h-[100dvh]">
        <aside className="fixed inset-y-0 left-0 hidden h-[100dvh] w-80 border-r border-sidebar-border/60 bg-sidebar/92 backdrop-blur-xl md:block">
          <SidebarContent pathname={pathname} onNavigate={() => setIsMobileMenuOpen(false)} onLogout={() => setIsLogoutDialogOpen(true)} />
        </aside>

        <aside ref={mobileSidebarRef} className={cn("fixed inset-y-0 left-0 z-50 w-80 max-w-[86vw] border-r border-sidebar-border/60 bg-sidebar/96 backdrop-blur-xl transition-transform duration-300 md:hidden", isMobileMenuOpen ? "translate-x-0" : "-translate-x-full")} role="dialog" aria-modal="true" aria-label="Admin navigation">
          <div className="absolute right-3 top-3 z-10">
            <Button variant="ghost" size="icon" onClick={closeMobileMenu} className="rounded-none border border-border/50" aria-label="Close admin navigation">
              <X className="h-5 w-5" />
            </Button>
          </div>
          <SidebarContent pathname={pathname} onNavigate={closeMobileMenu} onLogout={() => setIsLogoutDialogOpen(true)} />
        </aside>

        {isMobileMenuOpen && <div className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden" onClick={closeMobileMenu} aria-hidden="true" />}

        <div className="flex min-w-0 flex-1 flex-col md:pl-[320px]">
          <AdminShellHeader pathname={pathname} onMenuClick={() => setIsMobileMenuOpen(true)} />
          <main className="min-w-0 flex-1 px-4 py-6 md:px-8 md:py-8">
            <div className="mx-auto w-full max-w-[1600px]">
              {children}
            </div>
          </main>
          <AdminShellFooter />
          <div className="px-4 pb-4 text-center font-mono text-[10px] text-muted-foreground/60 md:px-8">© 2026 IRNK Codes Admin Console</div>
        </div>
      </div>
      <ConfirmActionDialog
        open={isLogoutDialogOpen}
        onOpenChange={setIsLogoutDialogOpen}
        title="LOGOUT_ADMIN_SESSION"
        description="You are about to end the current admin session. Unsaved changes may be lost."
        confirmLabel="LOGOUT"
        variant="destructive"
        isPending={isLogoutPending}
        onConfirm={confirmLogout}
      />
    </div>
  );
}
