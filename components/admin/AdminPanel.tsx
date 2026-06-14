import type { ComponentPropsWithoutRef, ElementType } from "react";

import { cn } from "@/lib/utils";

type AdminPanelTone = "default" | "strong";

interface AdminPanelProps<T extends ElementType = "section"> {
  as?: T;
  tone?: AdminPanelTone;
  className?: string;
}

export function AdminPanel<T extends ElementType = "section">({
  as,
  tone = "default",
  className,
  ...props
}: AdminPanelProps<T> & Omit<ComponentPropsWithoutRef<T>, keyof AdminPanelProps<T>>) {
  const Component = as ?? "section";

  return (
    <Component
      className={cn(tone === "strong" ? "admin-panel-strong" : "admin-panel", className)}
      {...props}
    />
  );
}
