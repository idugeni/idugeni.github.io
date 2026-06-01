import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/utils";

type StatusPillTone = "default" | "primary" | "success" | "warning" | "danger" | "info" | "muted";

const toneClasses: Record<StatusPillTone, string> = {
  default: "border-border/60 bg-secondary/40 text-muted-foreground",
  primary: "border-primary/40 bg-primary/10 text-primary",
  success: "border-success/30 bg-success/10 text-success",
  warning: "border-warning/30 bg-warning/10 text-warning",
  danger: "border-danger/30 bg-danger/10 text-danger",
  info: "border-info/30 bg-info/10 text-info",
  muted: "border-border/60 bg-background/40 text-muted-foreground",
};

interface StatusPillProps extends ComponentPropsWithoutRef<"span"> {
  tone?: StatusPillTone;
}

export function StatusPill({ tone = "default", className, ...props }: StatusPillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center border px-2 py-1 text-center font-mono text-[11px] uppercase tracking-label",
        toneClasses[tone],
        className,
      )}
      {...props}
    />
  );
}
