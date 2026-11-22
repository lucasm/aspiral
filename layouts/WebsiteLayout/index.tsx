import { getLocale, getTranslations } from 'next-intl/server'
import Link from 'next/link'

import BlurBackground from '@/components/BlurBackground'
import AppFooter from '@/components/Footer'
import { IconMenu } from '@/components/SvgIcons'
import SvgLogo from '@/components/SvgLogo'
import WidgetDropdown from '@/components/WidgetDropdown'
import Style from './WebsiteLayout.module.css'

export default async function WebsiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [locale, t] = await Promise.all([getLocale(), getTranslations('t')])

  const renderDesktop = (): React.ReactElement => {
    return (
      <ul>
        <li className={Style.hideOnMobile}>
          <Link href={`/${locale}/about`}>{t('about')}</Link>
        </li>
        <li className={Style.hideOnMobile}>
          <Link href={`/${locale}/contribute`}>{t('contribute')}</Link>
        </li>
        <li>
          <Link href={`/${locale}`}>{t('openApp')} </Link>
        </li>
      </ul>
    )
  }
  const renderMobile = () => {
    return (
      <ul className={Style.menuMobile}>
        <li>
          <Link href={`/${locale}/about`}>{t('about')}</Link>
        </li>
        <li className={Style.hideOnMobile}>
          <Link href={`/${locale}/contribute`}>{t('contribute')}</Link>
        </li>
      </ul>
    )
  }

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
          {renderDesktop()}
          <WidgetDropdown
            title={undefined}
            ariaLabel="Menu"
            icon={<IconMenu />}
            className={Style.showOnMobile}>
            {renderMobile()}
          </WidgetDropdown>
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
