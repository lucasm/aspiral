import type { Metadata } from 'next'
import { ReactNode } from 'react'
import Script from 'next/script'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import SetLanguage from '@/components/SetLanguage'
import MantineWrapper from '@/components/MantineWrapper'
import { getLocaleFromParams } from '@/lib/locale-utils'
import type { Locale } from '@/lib/locale-utils'

// locales
import en from '@/locales/en'
import pt_BR from '@/locales/pt-BR'
import pt_PT from '@/locales/pt-PT'

const localesMap = {
  en,
  'pt-BR': pt_BR,
  'pt-PT': pt_PT,
}

interface LangLayoutProps {
  children: ReactNode
  params: Promise<{ lang: string }>
}

export async function generateMetadata({ params }: LangLayoutProps): Promise<Metadata> {
  const { lang } = await params
  const locale = getLocaleFromParams(lang) as keyof typeof localesMap
  const t = localesMap[locale]

  const langMap: Record<Locale, string> = {
    en: 'en',
    'pt-BR': 'pt-BR',
    'pt-PT': 'pt-PT',
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://memeh.app'
  const canonicalUrl = `${baseUrl}/${locale === 'en' ? '' : locale}`

  return {
    title: t.title,
    description: t.description,
    keywords: ['news', 'headlines', 'feeds', 'rss', 'memeh', 'journalism', 'fact-checking', 'news aggregator'],
    authors: [{ name: 'Memeh', url: baseUrl }],
    creator: 'Memeh Team',
    publisher: 'Memeh',
    applicationName: 'Memeh',
    abstract: t.description,
    icons: {
      icon: [{ url: '/favicon.ico' }, { url: '/icon.svg', type: 'image/svg+xml' }],
      shortcut: '/favicon.ico',
      apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
    },
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
    alternates: {
      languages: {
        en: `${baseUrl}/`,
        'pt-BR': `${baseUrl}/pt-BR`,
        'pt-PT': `${baseUrl}/pt-PT`,
      },
      canonical: canonicalUrl,
    },
    manifest: '/manifest.json',
    openGraph: {
      type: 'website',
      locale: langMap[locale],
      alternateLocale: ['en', 'pt-BR', 'pt-PT'].filter((l) => l !== langMap[locale]),
      url: canonicalUrl,
      siteName: 'Memeh',
      title: t.title,
      description: t.description,
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
      title: t.title,
      description: t.description,

      images: [`${baseUrl}/share.png`],
    },
    robots: {
      index: true,
      follow: true,
      nocache: false,
    },
  }
}

export async function generateStaticParams() {
  return [{ lang: 'en' }, { lang: 'pt-BR' }, { lang: 'pt-PT' }]
}

export default async function LangLayout({ children, params }: LangLayoutProps) {
  const { lang } = await params

  return (
    <MantineWrapper>
      <SetLanguage />
      <Header />
      <main>{children}</main>
      <Footer />

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
    </MantineWrapper>
  )
}
