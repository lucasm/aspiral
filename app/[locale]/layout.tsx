import type { Viewport } from 'next'
import { hasLocale, NextIntlClientProvider } from 'next-intl'
import { getMessages, getTranslations } from 'next-intl/server'
import { ThemeProvider } from 'next-themes'
import { Plus_Jakarta_Sans } from 'next/font/google'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import './global.css'

import ScriptsTelemetry from '@/components/ScriptsTelemetry'
import { routing } from '@/i18n/routing'

const fontFamily = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-family',
})

export const viewport: Viewport = {
  themeColor: 'white',
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const p = await params
  const { locale } = p

  if (!routing.locales.includes(locale)) {
    notFound()
  }

  const t = await getTranslations({
    locale,
    namespace: 't.metadata',
  })

  return {
    title: {
      absolute: 'Aspiral — ' + t('title'),
      default: 'Aspiral',
      template: 'Aspiral — %s',
    },
    description: t('description'),
    authors: [
      { name: 'Aspiral', url: 'https://aspiral.app/' },
      { name: 'Lucas Maués', url: 'https://lucasmaues.com/' },
    ],
    icons: {
      icon: [
        '/favicon.ico?v=3',
        '/icon-192x192.png?v=3',
        '/icon-512x512.png?v=3',
        'icon.svg?v=3',
      ],
      apple: '/apple-touch-icon.png?v=3',
    },
    manifest: '/manifest.webmanifest?v=3',
    applicationName: 'Aspiral',
    //   viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
    metadataBase: new URL('https://aspiral.app'),
    alternates: {
      languages: {
        'en-US': '/en-US',
        'pt-BR': '/pt-BR',
        'zh-CN': '/zh-CN',
        ru: '/ru',
      },
    },
    openGraph: {
      images: '/share.jpg',
      type: 'website',
    },
    twitter: {
      site: '@aspiralapp',
      creator: '@lucasmmau',
      card: 'summary_large_image',
      images: '/share.jpg',
    },
  }
}

export default async function Layout(props: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const params = await props.params
  const { locale } = params
  const { children } = props

  // Ensure that the incoming `locale` is valid
  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  const [messages, cookieStore] = await Promise.all([getMessages(), cookies()])
  const savedTheme = cookieStore.get('theme')?.value
  const initialTheme =
    savedTheme === 'dark' || savedTheme === 'light' ? savedTheme : undefined

  return (
    <html
      lang={locale}
      className={fontFamily.className}
      suppressHydrationWarning
      data-theme={initialTheme}
      data-scroll-behavior="smooth">
      <body>
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="system"
          enableSystem={true}
          scriptProps={{ type: 'application/json' }}>
          <NextIntlClientProvider locale={locale} messages={messages}>
            {children}
          </NextIntlClientProvider>
        </ThemeProvider>
        <ScriptsTelemetry />
      </body>
    </html>
  )
}
