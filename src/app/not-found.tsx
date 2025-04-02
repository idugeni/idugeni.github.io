'use client'

import Link from 'next/link'
import { useViewportAnimation } from '@/hooks/use-viewport-animation'
import { ThemeProvider } from "next-themes";

export default function NotFound() {
  const { ref: headerRef, style: headerStyle } = useViewportAnimation<HTMLDivElement>({
    type: "fade-in",
    duration: 800
  });

  const { ref: contentRef, style: contentStyle } = useViewportAnimation<HTMLDivElement>({
    type: "slide-in-up",
    delay: 200,
    duration: 800
  });

  return (
    <ThemeProvider
    attribute="class"
    defaultTheme="system"
    enableSystem
    disableTransitionOnChange
  >
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div ref={headerRef} style={headerStyle}>
          <h1 className="text-9xl font-bold text-foreground">404</h1>
        </div>
        <div ref={contentRef} style={contentStyle}>
          <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">
            Oops! Page Not Found
          </h2>
          <p className="text-muted-foreground mb-8">
            The page you are looking for might have been removed, had its name changed,
            or is temporarily unavailable.
          </p>
          <Link 
            href="/"
            className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-lg
                     hover:bg-primary/90 transition-colors duration-200"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
    </ThemeProvider>
  )
}
