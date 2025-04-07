'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface RedirectContentProps {
  path: string
  isInvalidPath: boolean
  isIgnoredSlug: boolean
}

export default function RedirectContent({
  path,
  isInvalidPath,
  isIgnoredSlug,
}: RedirectContentProps) {
  const [countdown, setCountdown] = useState(10)

  const isDev = process.env.NODE_ENV === 'development'
  const enableRedirect = !isDev && !isInvalidPath && !isIgnoredSlug
  const targetURL = `https://blog.oldsoul.id/${encodeURIComponent(path)}`

  useEffect(() => {
    if (!enableRedirect) return

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          window.location.href = targetURL
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [enableRedirect, targetURL])

  const renderErrorCard = (title: string, description: string) => (
    <Card className="w-full max-w-4xl text-center shadow-xl">
      <CardHeader className="text-2xl md:text-3xl font-bold bg-destructive/10 rounded-t-lg py-6">
        {title}
      </CardHeader>
      <CardContent className="p-6">
        <p className="text-base md:text-lg text-muted-foreground mb-6">{description}</p>
        <Link href="/">
          <Button variant="outline" className="hover:scale-105 transition-transform duration-200">
            Kembali ke Beranda
          </Button>
        </Link>
      </CardContent>
    </Card>
  )

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <main className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-transparent h-screen min-h-[100dvh] overflow-hidden">
      {children}
    </main>
  )

  if (isInvalidPath) {
    return (
      <Wrapper>
        {renderErrorCard(
          'URL Tidak Valid',
          'URL yang Anda masukkan kosong atau tidak sesuai format yang kami dukung.'
        )}
      </Wrapper>
    )
  }

  if (isIgnoredSlug) {
    return (
      <Wrapper>
        {renderErrorCard(
          'Halaman Tidak Tersedia',
          `Halaman /${path} termasuk dalam daftar yang tidak dapat diakses atau diabaikan.`
        )}
      </Wrapper>
    )
  }

  return (
    <Wrapper>
      <Card className="w-full max-w-2xl text-center shadow-xl py-0">
        <CardHeader className="text-2xl md:text-3xl font-bold bg-primary/10 rounded-t-lg py-6">
          Halaman Telah Dipindahkan
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <p className="text-base md:text-lg text-muted-foreground animate-pulse">
            Anda akan dialihkan dalam{' '}
            <span className="text-primary font-semibold">{countdown}</span> detik...
          </p>

          <div className="space-y-2">
            <p className="text-base md:text-lg">Konten kini tersedia di lokasi baru:</p>
            <div className="font-mono text-sm bg-primary/5 p-3 rounded-md break-all">
              {targetURL}
            </div>
          </div>

          <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
            <p className="text-sm md:text-base">
              Kami telah memindahkan seluruh konten blog ke subdomain khusus agar lebih terorganisir dan
              mudah diakses.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-6">
            <Link href={targetURL} className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto">Kunjungi Sekarang</Button>
            </Link>
            <Link href="/" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto">Kembali ke Beranda</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </Wrapper>
  )
}
