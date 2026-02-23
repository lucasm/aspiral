import type { Metadata, Viewport } from 'next'
import { ReactNode } from 'react'
import './globals.css'

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
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
  category: 'news',
  abstract: 'Trusted news without algorithms. Headlines, fact-checkers, and opinions from reliable journalism.',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    alternateLocale: ['pt_BR', 'pt_PT'],
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
  verification: {
    google: undefined,
  },
}

interface RootLayoutProps {
  children: ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html suppressHydrationWarning lang="en">
      <head>
        {/* DNS Prefetch for external resources */}
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />

        {/* Preconnect to fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* Font stylesheet */}
        <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;600;700&display=swap" rel="stylesheet" />

        {/* Resource hints for performance */}
        <link rel="prefetch" href="/share.png" as="image" />
        <link rel="preload" href="/share.png" as="image" type="image/png" />

        {/* Social sharing meta tags */}
        <meta property="og:image" content={`${process.env.NEXT_PUBLIC_BASE_URL || 'https://memeh.app'}/share.png`} />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Memeh news feed - breaking news and memes" />
        <meta name="twitter:image" content={`${process.env.NEXT_PUBLIC_BASE_URL || 'https://memeh.app'}/share.png`} />
        <meta name="twitter:image:alt" content="Memeh news feed - breaking news and memes" />

        {/* Web app metadata */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Memeh" />

        {/* Additional SEO and web standards */}
        <meta httpEquiv="x-ua-compatible" content="ie=edge" />
        <meta name="referrer" content="strict-origin-when-cross-origin" />
        <meta name="permissions-policy" content="camera=(), microphone=(), geolocation=()" />

        {/* Canonical */}
        <link rel="canonical" href={process.env.NEXT_PUBLIC_BASE_URL || 'https://memeh.app'} />
      </head>
      <body>{children}</body>
    </html>
  )
}
