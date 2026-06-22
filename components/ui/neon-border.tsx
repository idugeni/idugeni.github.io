"use client";
import { cn } from "@/lib/utils";

interface NeonBorderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  active?: boolean;
}

export function NeonBorder({ children, className, active = false, ...props }: NeonBorderProps) {
  return (
    <div
      className={cn(
        "relative rounded-lg p-[1px] overflow-hidden group bg-gradient-to-b from-border/50 to-border/10",
        active && "from-primary/50 to-primary/10 shadow-[0_0_15px_rgba(6,182,212,0.2)]",
        className
      )}
      {...props}
    >
      <div className="neon-scan-beam absolute inset-0 bg-gradient-to-r from-transparent via-primary/30 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 group-hover:animate-[neon-scan_2s_ease-in-out_infinite]" />
      <div className="h-full w-full bg-card/90 backdrop-blur-sm rounded-[7px] relative z-10">
        {children}
      </div>
    </div>
  );
}
