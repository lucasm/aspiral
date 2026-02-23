import type { Metadata, Viewport } from 'next'
import { ReactNode } from 'react'
import { IBM_Plex_Sans } from 'next/font/google'
import Script from 'next/script'
import { notFound } from 'next/navigation'
import { NextIntlClientProvider, hasLocale } from 'next-intl'
import { getMessages, getTranslations } from 'next-intl/server'

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import MantineWrapper from '@/components/MantineWrapper'
import { routing } from '@/i18n/routing'

import '../globals.css'

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

interface LocaleLayoutProps {
  children: ReactNode
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: LocaleLayoutProps): Promise<Metadata> {
  const { locale } = await params

  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  const t = await getTranslations({ locale, namespace: undefined })

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://memeh.app'
  const canonicalUrl = `${baseUrl}/${locale === 'en' ? '' : locale}`

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: t('title'),
      template: '%s | Memeh',
    },
    description: t('description'),
    keywords: ['news', 'headlines', 'feeds', 'rss', 'memeh', 'journalism', 'fact-checking', 'news aggregator'],
    authors: [{ name: 'Memeh', url: baseUrl }],
    creator: 'Memeh Team',
    publisher: 'Memeh',
    applicationName: 'Memeh',
    abstract: t('description'),
    icons: {
      icon: [{ url: '/favicon.ico' }, { url: '/icon.svg', type: 'image/svg+xml' }],
      shortcut: '/favicon.ico',
      apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
      other: [{ rel: 'mask-icon', url: '/icon-maskable.svg', color: '#ffffff' }],
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: 'default',
      title: 'Memeh',
    },
    formatDetection: { telephone: false, email: false, address: false },
    alternates: {
      languages: {
        en: `${baseUrl}/`,
        'pt-BR': `${baseUrl}/pt-BR`,
        'pt-PT': `${baseUrl}/pt-PT`,
      },
      canonical: canonicalUrl,
    },
    manifest: '/manifest.json',
    category: 'news',
    robots: { index: true, follow: true, nocache: false },
    openGraph: {
      type: 'website',
      locale,
      alternateLocale: routing.locales.filter((l) => l !== locale),
      url: canonicalUrl,
      siteName: 'Memeh',
      title: t('title'),
      description: t('description'),
      images: [
        {
          url: `${baseUrl}/share.png`,
          width: 1200,
          height: 630,
          alt: 'Memeh news feed - trusted news and memes',
          type: 'image/png',
          secureUrl: `${baseUrl}/share.png`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@memeh_news',
      creator: '@memeh_news',
      title: t('title'),
      description: t('description'),
      images: [`${baseUrl}/share.png`],
    },
  }
}

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params

  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  const messages = await getMessages()

  return (
    <html suppressHydrationWarning lang={locale} className={font.className}>
      <body>
        <NextIntlClientProvider messages={messages}>
          <MantineWrapper>
            <Header />
            <main>{children}</main>
            <Footer />
          </MantineWrapper>
        </NextIntlClientProvider>

        {/* Clarity Analytics */}
        <Script
          id="MS-CLARITY"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "5d4q9fkiga");
            `,
          }}
        />

        {/* Google Analytics */}
        <Script strategy="afterInteractive" src="https://www.googletagmanager.com/gtag/js?id=G-89JR74CJC7" />
        <Script
          id="G-ANALYTICS"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-89JR74CJC7');
            `,
          }}
        />
      </body>
    </html>
  )
}
