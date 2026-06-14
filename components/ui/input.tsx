"use client";
import * as React from "react"

const inputBaseClassName = "flex h-9 w-full rounded-md border border-input/80 bg-input/70 px-3 py-1 text-base text-foreground shadow-sm shadow-black/10 transition-[border-color,box-shadow,background-color] file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground/80 hover:border-primary/35 hover:bg-input/90 focus-visible:border-primary/70 focus-visible:bg-background/95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={className ? `${inputBaseClassName} ${className}` : inputBaseClassName}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
