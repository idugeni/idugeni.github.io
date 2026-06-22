import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HiOutlineHome, HiOutlineArrowLeft } from "react-icons/hi2";
import { ReloadButton } from "./reload-button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden dark">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.05)_0%,transparent_70%)]" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-primary/3 rounded-full blur-3xl animate-pulse delay-1000" />

      <div className="relative z-10 text-center px-4 max-w-lg">
        <div className="relative mb-8">
          <h1 className="text-[120px] md:text-[180px] font-orbitron font-bold text-primary/10 leading-none select-none">404</h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-5xl md:text-7xl font-orbitron font-bold text-primary drop-shadow-[0_0_20px_rgba(6,182,212,0.5)]">404</span>
          </div>
        </div>

        <h2 className="font-orbitron text-xl md:text-2xl font-bold text-foreground mb-3">SIGNAL_LOST</h2>
        <p className="font-mono text-sm text-muted-foreground mb-2">Halaman yang Anda cari tidak ditemukan dalam sistem.</p>
        <p className="font-mono text-xs text-muted-foreground/60 mb-8">ERROR_CODE: PAGE_NOT_FOUND // PATH_UNRESOLVED</p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" prefetch={false}>
            <Button variant="outline" className="font-mono border-primary/50 hover:bg-primary/10">
              <HiOutlineArrowLeft className="mr-2 h-4 w-4" /> GO_BACK
            </Button>
          </Link>
          <ReloadButton />
          <Link href="/" prefetch={false}>
            <Button className="font-mono bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              <HiOutlineHome className="mr-2 h-4 w-4" /> HOME_BASE
            </Button>
          </Link>
        </div>

        <div className="mt-12 border border-border/50 bg-secondary/30 p-4 text-left font-mono text-xs text-muted-foreground/60 max-w-sm mx-auto">
          <div className="text-primary/70 mb-1">$ locate requested_page</div>
          <div className="text-destructive/70">Error: No matching route found</div>
          <div className="text-muted-foreground/40 mt-1">Suggestion: Check URL or navigate home</div>
          <div className="mt-2 flex items-center gap-1">
            <span className="text-primary">$</span>
            <span className="w-2 h-4 bg-primary/70 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
