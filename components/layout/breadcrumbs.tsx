"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HiOutlineHome, HiOutlineChevronRight } from "react-icons/hi2";

const labelMap: Record<string, string> = {
  projects: "Projects",
  blog: "Blog",
  services: "Services",
  gallery: "Gallery",
  contact: "Contact",
  resume: "Resume",
  about: "About",
  privacy: "Privacy Policy",
  terms: "Terms of Service",
};

export function Breadcrumbs() {
  const pathname = usePathname();

  if (pathname === "/") return null;

  const segments = pathname.split("/").filter(Boolean);

  const crumbs = segments.map((segment, index) => {
    const href = "/" + segments.slice(0, index + 1).join("/");
    const label = labelMap[segment] || decodeURIComponent(segment).replace(/-/g, " ");
    const isLast = index === segments.length - 1;

    return { href, label, isLast };
  });

  return (
    <nav aria-label="Breadcrumb" className="w-full border-b border-border/30 bg-secondary/20 backdrop-blur-sm pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2.5 py-3">
          <Link href="/" className="hover:text-primary transition-colors flex items-center gap-1.5 text-muted-foreground shrink-0">
            <HiOutlineHome className="w-3.5 h-3.5" />
            <span className="font-mono text-xs">Home</span>
          </Link>
          {crumbs.map((crumb) => (
            <div key={crumb.href} className="flex items-center gap-2.5">
              <HiOutlineChevronRight className="w-3 h-3 text-primary/40 shrink-0" />
              {crumb.isLast ? (
                <span className="font-mono text-xs text-primary font-bold capitalize truncate max-w-[250px]">
                  {crumb.label}
                </span>
              ) : (
                <Link href={crumb.href} className="font-mono text-xs text-muted-foreground hover:text-primary transition-colors capitalize">
                  {crumb.label}
                </Link>
              )}
            </div>
          ))}
          <span className="ml-auto font-mono text-[9px] text-muted-foreground/30 hidden md:block shrink-0">
            {pathname}
          </span>
        </div>
      </div>
    </nav>
  );
}
