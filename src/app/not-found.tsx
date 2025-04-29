'use client'

import Link from 'next/link'
import { useViewportAnimation } from '@/hooks/use-viewport-animation'
import { Button } from '@/components/ui/button';

/**
 * Komponen halaman error 404 yang menampilkan pesan halaman tidak ditemukan dan tombol kembali ke beranda.
 */
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
    <div className="min-h-screen flex items-center justify-center">
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
          <Link href="/">
            <Button asChild className="px-4 py-2 rounded-full">
              Return Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
