import type { Metadata, Viewport } from 'next'
import { ReactNode } from 'react'
import { IBM_Plex_Sans } from 'next/font/google'
import './globals.css'

const font = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font',
  display: 'swap',
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
  colorScheme: 'light dark',
}

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://memeh.app'),
  title: {
    default: 'Memeh — Trusted news and memes',
    template: '%s | Memeh',
  },
  description: 'Breaking news headlines from trusted journalism. Be critical. Fight against misinformation.',
  keywords: ['news', 'journalism', 'fact-check', 'memes', 'headlines', 'trusted sources'],
  authors: [{ name: 'Memeh' }],
  creator: 'Lucas Maués',
  publisher: 'Memeh',
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [{ url: '/favicon.ico' }, { url: '/icon.svg', type: 'image/svg+xml' }],
    shortcut: '/favicon.ico',
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
    other: [
      {
        rel: 'mask-icon',
        url: '/icon-maskable.svg',
        color: '#ffffff',
      },
    ],
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Memeh',
  },
  category: 'news',
  abstract: 'Trusted news without algorithms. Headlines, fact-checkers, and opinions from reliable journalism.',
  openGraph: {
    type: 'website',
    images: [
      {
        url: `/share.png`,
        width: 1200,
        height: 630,
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@lucasmezs',
    images: [`/share.png`],
  },
}

interface RootLayoutProps {
  children: ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html suppressHydrationWarning lang="en" className={font.className}>
      <body>{children}</body>
    </html>
  )
}
