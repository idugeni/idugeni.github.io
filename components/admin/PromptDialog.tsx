"use client";

import { useState, useEffect, useRef } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface PromptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  defaultValue?: string;
  placeholder?: string;
  confirmLabel?: string;
  onSubmit: (value: string | null) => void;
}

export function PromptDialog({
  open,
  onOpenChange,
  title,
  description,
  defaultValue = "",
  placeholder = "",
  confirmLabel = "CONFIRM",
  onSubmit,
}: PromptDialogProps) {
  const [value, setValue] = useState(defaultValue);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setValue(defaultValue);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open, defaultValue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(value);
    onOpenChange(false);
  };

  const handleCancel = () => {
    onSubmit(null);
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={(isOpen) => { if (!isOpen) handleCancel(); }}>
      <AlertDialogContent className="rounded-none border-border/50 bg-background/95 shadow-2xl shadow-primary/10 backdrop-blur-xl">
        <form onSubmit={handleSubmit}>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-orbitron text-primary">
              {title}
            </AlertDialogTitle>
            {description && (
              <AlertDialogDescription className="font-mono text-sm leading-relaxed">
                {description}
              </AlertDialogDescription>
            )}
          </AlertDialogHeader>
          <div className="py-4">
            <Input
              ref={inputRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={placeholder}
              className="rounded-none border-primary/30 bg-secondary/50 font-mono"
            />
          </div>
          <AlertDialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="rounded-none font-mono"
            >
              CANCEL
            </Button>
            <Button
              type="submit"
              className="rounded-none bg-primary font-mono text-primary-foreground hover:bg-primary/90"
            >
              {confirmLabel}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
