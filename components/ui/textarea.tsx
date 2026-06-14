"use client";
import * as React from "react"

import { cn } from "@/lib/utils"

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[60px] w-full rounded-md border border-input/80 bg-input/70 px-3 py-2 text-base text-foreground shadow-sm shadow-black/10 transition-[border-color,box-shadow,background-color] placeholder:text-muted-foreground/80 hover:border-primary/35 hover:bg-input/90 focus-visible:border-primary/70 focus-visible:bg-background/95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }
