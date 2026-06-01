"use client";

import { type ReactNode } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface AdminActionTooltipProps {
  label: string;
  children: ReactNode;
  side?: "top" | "right" | "bottom" | "left";
}

export function AdminActionTooltip({ label, children, side = "top" }: AdminActionTooltipProps) {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent side={side} className="rounded-none border border-primary/30 bg-popover/95 font-mono text-xs font-medium text-popover-foreground shadow-lg shadow-black/30 backdrop-blur supports-[backdrop-filter]:bg-popover/90">
          {label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
