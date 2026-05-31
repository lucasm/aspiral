'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { IconAspiral } from '@/components/Icons'
import { useCookiesConsent } from '@/contexts/CookiesConsentContext'

import styles from './Footer.module.css'
import SelectLocale from '../SelectLocale'

export default function Footer() {
  const t = useTranslations()
  const { openPopup } = useCookiesConsent()

  return (
    <footer className={styles.footer} suppressHydrationWarning>
      <div className={styles.footerHeader}>
        <Link href="#" aria-label="Aspiral" className={styles.footerLogo}>
          <figure>
            <IconAspiral />
          </figure>
          <h3>{t('title')}</h3>
        </Link>

        <SelectLocale />

        <ul className={styles.footerSocials}>
          <li className={styles.footerSocialItem}>
            <a href="https://x.com/aspiralapp" target="_blank" rel="external noreferrer" aria-label="Twitter">
              x
            </a>
          </li>
          <li className={styles.footerSocialItem}>
            <a href="https://tiktok.com/aspiralapp" target="_blank" rel="external noreferrer" aria-label="LinkedIn">
              tk
            </a>
          </li>
          <li className={styles.footerSocialItem}>
            <a href="https://github.com/lucasm/aspiral" target="_blank" rel="external noreferrer" aria-label="GitHub">
              gh
            </a>
          </li>
        </ul>
      </div>

      <div className={styles.footerContent}>
        <ul className={styles.footerNavSection}>
          <li>
            <a href="https://github.com/sponsors/lucasm" target="_blank" rel="external noreferrer">
              ♥ {t('donate')}
            </a>
          </li>
          <li>
            <Link href="/about">{t('about')}</Link>
          </li>
          <li>
            <a href="mailto:feedback@aspiral.app?subject=Feedback">{t('feedback')}</a>
          </li>
          <li>
            <a href="https://lucasmaues.com/legal" target="_blank" rel="external noopener noreferrer">
              {t('privacy')}
            </a>
          </li>
          <li>
            <button onClick={openPopup}>{t('cookies.reset')}</button>
          </li>
        </ul>

        {/* Copyright */}
        <div className={styles.footerCopyright}>
          © 2026 {t('credits')}{' '}
          <a href="https://lucasmaues.com/?utm_source=aspiral_app" target="_blank" rel="external noreferrer">
            Lucas Maués
          </a>
          . {t('legal')}
        </div>
      </div>
    </footer>
  )
}
