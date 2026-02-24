'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import SelectLocale from './SelectLocale'
import { IconAspiral } from '@/components/Icons'

export default function Footer() {
  const t = useTranslations()

  return (
    <footer suppressHydrationWarning>
      <div className="container">
        <Link href="/" aria-label="Aspiral" className="logo">
          <IconAspiral />
        </Link>

        <p>{t('title')}</p>

        <SelectLocale />

        <p>
          {t('legal')} {t('credits')}{' '}
          <a href="https://lucasm.dev/?utm_source=aspiral_app" target="_blank" rel="external noreferrer">
            Lucas Maués
          </a>
          .
        </p>

        <ul>
          <li>
            <a href="https://github.com/sponsors/lucasm" target="_blank" rel="external noreferrer">
              ♥ {t('donate')}
            </a>
          </li>
          <li>
            <a href="https://github.com/lucasm/aspiral" target="_blank" rel="external noopener noreferrer">
              {t('about')}
            </a>
          </li>
          <li>
            <a href="https://lucasm.dev/legal" target="_blank" rel="external noopener noreferrer">
              {t('privacy')}
            </a>
          </li>

          <li>
            <a href="mailto:feedback@aspiral.app?subject=Feedback">{t('feedback')}</a>
          </li>
        </ul>
      </div>
    </footer>
  )
}
