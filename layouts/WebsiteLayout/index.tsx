import { getLocale, getTranslations } from 'next-intl/server'
import Link from 'next/link'

import BlurBackground from '@/components/BlurBackground'
import AppFooter from '@/components/Footer'
import SvgLogo from '@/components/SvgLogo'
import Style from './WebsiteLayout.module.css'

export default async function WebsiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [locale, t] = await Promise.all([getLocale(), getTranslations('t')])

  const page = (
    <div className={Style.page}>
      <header className={Style.header}>
        <Link href={`/${locale}`} translate="no">
          <div id="logo" className={Style.logo}>
            <SvgLogo />
            Aspiral
          </div>
        </Link>

        <nav>
          <ul>
            <li>
              <Link href={`/${locale}/about`}>{t('about')}</Link>
            </li>
            <li>
              <Link href={`/${locale}/contribute`}>{t('contribute')}</Link>
            </li>
            <li>
              <Link href={`/${locale}`}>{t('openApp')}</Link>
            </li>
          </ul>
        </nav>
      </header>

      <main>
        <BlurBackground category="none" />
        {children}
      </main>

      <AppFooter />
    </div>
  )

  return page
}
