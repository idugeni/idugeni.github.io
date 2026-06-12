"use client";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface ConfirmActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isPending?: boolean;
  variant?: "default" | "destructive";
  onConfirm: () => void | Promise<void>;
}

export function ConfirmActionDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "CONFIRM",
  cancelLabel = "CANCEL",
  isPending = false,
  variant = "default",
  onConfirm,
}: ConfirmActionDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="rounded-none border-border/50 bg-background/95 shadow-2xl shadow-primary/10 backdrop-blur-xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-orbitron text-primary">{title}</AlertDialogTitle>
          <AlertDialogDescription className="font-mono text-sm leading-relaxed">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-none font-mono" disabled={isPending}>
            {cancelLabel}
          </AlertDialogCancel>
          <Button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onConfirm();
            }}
            disabled={isPending}
            className={
              variant === "destructive"
                ? "rounded-none bg-destructive font-mono text-destructive-foreground hover:bg-destructive/90"
                : "rounded-none bg-primary font-mono text-primary-foreground hover:bg-primary/90"
            }
          >
            {isPending ? "PROCESSING..." : confirmLabel}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
