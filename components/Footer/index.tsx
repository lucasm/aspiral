'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { BannerCarbon, BannerOpenSource, IconTheTrustProject, IconAccessibility, IconAspiral } from '@/components/Icons'
import { useCookiesConsent } from '@/contexts/CookiesConsentContext'

import styles from './Footer.module.css'
import SelectLocale from '../SelectLocale'

export default function Footer() {
  const t = useTranslations()
  const { openPopup } = useCookiesConsent()

  return (
    <footer className={styles.footer} suppressHydrationWarning>
      <div className={styles.footerHeader}>
        <Link href="/" aria-label="Aspiral" className={styles.footerLogo}>
          <figure>
            <IconAspiral />
          </figure>
          <h3>{t('title')}</h3>
        </Link>

        <div>
          <SelectLocale />
          <ul className={styles.footerSocials}>
            <li className={styles.footerSocialItem}>
              <a href="https://github.com/lucasm" target="_blank" rel="external noreferrer" aria-label="GitHub">
                gh
              </a>
            </li>
            <li className={styles.footerSocialItem}>
              <a href="https://x.com/aspiralapp" target="_blank" rel="external noreferrer" aria-label="Twitter">
                x
              </a>
            </li>
            <li className={styles.footerSocialItem}>
              <a href="https://linkedin.com/in/lucasm" target="_blank" rel="external noreferrer" aria-label="LinkedIn">
                bs
              </a>
            </li>
          </ul>
        </div>
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
            <a href="https://lucasm.dev/legal" target="_blank" rel="external noopener noreferrer">
              {t('privacy')}
            </a>
          </li>
          <li>
            <button onClick={openPopup}>{t('cookies.reset')}</button>
          </li>
        </ul>

        <ul className={styles.footerNavSection + ' ' + styles.footerBanners}>
          <li>
            <a href="https://github.com/lucasm/aspiral" target="_blank" rel="external noopener noreferrer">
              <BannerOpenSource />
              Open Source
            </a>
          </li>
          <li>
            <a href="#">
              <IconAccessibility />
              Accessibility
            </a>
          </li>
          <li>
            <a href="https://www.websitecarbon.com/website/aspiral-app/" target="_blank" rel="external noreferrer">
              <BannerCarbon />
              Website Carbon
            </a>
          </li>
          <li>
            <a href="https://thetrustproject.org/" target="_blank" rel="external noreferrer">
              <IconTheTrustProject />
              The Trust Project
            </a>
          </li>
        </ul>

        {/* Copyright */}
        <div className={styles.footerCopyright}>
          © 2026 {t('credits')}{' '}
          <a href="https://lucasm.dev/?utm_source=aspiral_app" target="_blank" rel="external noreferrer">
            Lucas Maués
          </a>
          . {t('legal')}
        </div>
      </div>
    </footer>
  )
}
