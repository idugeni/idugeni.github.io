import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '@/styles/globals.css'
import { SpeedInsights } from '@vercel/speed-insights/next'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Loading from '@/app/loading'
import { Suspense } from 'react'
import Head from 'next/head'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    template: '%s - IduGeni SabdoDadi',
    default: 'IduGeni SabdoDadi',
  },
  description:
    'Showcasing innovation and excellence in personal and professional projects.',
  openGraph: {
    title: 'IduGeni SabdoDadi',
    description:
      'Showcasing innovation and excellence in personal and professional projects.',
    url: 'https://idugeni.vercel.app',
    siteName: 'IduGeni SabdoDadi',
    images: [
      {
        url: 'https://idugeni.vercel.app/api/og',
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'IduGeni SabdoDadi',
    description:
      'Showcasing innovation and excellence in personal and professional projects.',
    images: ['https://idugeni.vercel.app/api/og'],
  },
}

export default function RootLayout ({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html data-theme='night' lang='id'>
      <Head>
        <link rel='icon' type='image/x-icon' href='/favicon.ico' />
        <link
          rel='apple-touch-icon'
          type='image/png'
          sizes='180x180'
          href='/apple-touch-icon.png'
        />
      </Head>
      <body className={inter.className}>
        <Navbar />
        <Suspense fallback={<Loading />}>{children}</Suspense>
        <Footer />
        <SpeedInsights />
      </body>
    </html>
  )
}
