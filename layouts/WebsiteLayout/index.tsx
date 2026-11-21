import { useTranslations } from 'next-intl'

import BlurBackground from '@/components/BlurBackground'
import AppFooter from '@/components/Footer'
import { IconMenu } from '@/components/SvgIcons'
import SvgLogo from '@/components/SvgLogo'
import WidgetDropdown from '@/components/WidgetDropdown'
import { Link } from '@/i18n/routing'

import Style from './WebsiteLayout.module.css'

export default function WebsiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const t = useTranslations('t')

  const renderDesktop = (): React.ReactElement => {
    return (
      <ul>
        <li className={Style.hideOnMobile}>
          <Link href="/about">{t('about')}</Link>
        </li>
        <li className={Style.hideOnMobile}>
          <Link href="/contribute">{t('contribute')}</Link>
        </li>
        <li>
          <Link href="/">{t('openApp')} </Link>
        </li>
      </ul>
    )
  }
  const renderMobile = () => {
    return (
      <ul className={Style.menuMobile}>
        <li>
          <Link href="/about">{t('about')}</Link>
        </li>
        <li className={Style.hideOnMobile}>
          <Link href="/contribute">{t('contribute')}</Link>
        </li>
      </ul>
    )
  }

  return (
    <div className={Style.page}>
      <header className={Style.header}>
        <Link href={'/'} translate="no">
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
}
