"use client";

import Link from "next/link";
import { type ComponentType, type MouseEventHandler, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AdminActionTooltip } from "./AdminActionTooltip";

type ActionIntent = "view" | "open" | "edit" | "duplicate" | "download" | "mail" | "status" | "delete";

const intentClassName: Record<ActionIntent, string> = {
  view: "hover:border-sky-400/50 hover:bg-sky-500/10 hover:text-sky-300",
  open: "hover:border-primary/50 hover:bg-primary/10 hover:text-primary",
  edit: "hover:border-violet-400/50 hover:bg-violet-500/10 hover:text-violet-300",
  duplicate: "hover:border-amber-400/50 hover:bg-amber-500/10 hover:text-amber-300",
  download: "hover:border-emerald-400/50 hover:bg-emerald-500/10 hover:text-emerald-300",
  mail: "hover:border-indigo-400/50 hover:bg-indigo-500/10 hover:text-indigo-300",
  status: "hover:border-primary/60 hover:bg-primary/10 hover:text-primary",
  delete: "hover:border-destructive/60 hover:bg-destructive/10 hover:text-destructive",
};

interface AdminTableActionButtonProps {
  label: string;
  icon: ComponentType<{ className?: string }>;
  intent: ActionIntent;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  href?: string;
  target?: string;
  rel?: string;
  download?: boolean;
  disabled?: boolean;
  className?: string;
  children?: ReactNode;
}

export function AdminTableActionButton({
  label,
  icon: Icon,
  intent,
  onClick,
  href,
  target,
  rel,
  download,
  disabled,
  className,
}: AdminTableActionButtonProps) {
  const sharedClassName = cn(
    "h-8 w-8 rounded-none border border-transparent text-muted-foreground transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_18px_hsl(var(--primary)/0.12)]",
    intentClassName[intent],
    className,
  );

  const content = <Icon className="h-4 w-4" />;

  if (href) {
    const isInternal = href.startsWith("/");
    const link = isInternal ? (
      <Link href={href} target={target} rel={rel} prefetch={false} aria-label={label} download={download ? "" : undefined}>
        {content}
      </Link>
    ) : (
      <a href={href} target={target} rel={rel} aria-label={label} download={download}>
        {content}
      </a>
    );

    return (
      <AdminActionTooltip label={label}>
        <Button asChild variant="ghost" size="icon" className={sharedClassName} disabled={disabled}>
          {link}
        </Button>
      </AdminActionTooltip>
    );
  }

  return (
    <AdminActionTooltip label={label}>
      <Button variant="ghost" size="icon" className={sharedClassName} onClick={onClick} aria-label={label} disabled={disabled}>
        {content}
      </Button>
    </AdminActionTooltip>
  );
}
