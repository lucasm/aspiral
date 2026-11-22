import { useLocale, useTranslations } from 'next-intl'

import Link from 'next/link'
import {
  IconBluesky,
  IconDiscord,
  IconGitHub,
  IconInstagram,
  IconLinkedIn,
  IconX,
} from '../SvgIcons'
import SvgLogo from '../SvgLogo'
import Style from './Footer.module.css'

const Footer = () => {
  const year = new Date().getFullYear()
  const locale = useLocale()
  const t = useTranslations('t')

  return (
    <footer className={Style.footer}>
      <div className={Style.container}>
        <ul>
          <li>
            <Link href={`/${locale}`} title="Aspiral">
              <SvgLogo />
            </Link>
          </li>
          <li>
            <p>
              <Link href={`/${locale}`}>Aspiral</Link> © {year}
            </p>
          </li>

          <li>
            <Link href={`/${locale}/about`}>{t('about')}</Link>
          </li>
          <li>
            <Link href={`/${locale}/contribute`}>{t('contribute')}</Link>
          </li>
          <li>
            <Link href={`/${locale}/privacy`}>{t('privacy')}</Link>
          </li>
          <li>
            <Link href={`/${locale}/terms`}>{t('terms')}</Link>
          </li>
          <li>
            <p>
              {t('copyright')}
              <a
                href="https://lucasmaues.com/?utm_source=aspiral&utm_medium=footer"
                target="_blank"
                rel="noopener">
                {' '}
                Lucas Maués
              </a>
              .
            </p>
          </li>

          <li>
            <Link
              href="https://x.com/aspiralapp"
              target="_blank"
              rel="noreferrer"
              aria-label="X">
              <IconX />
            </Link>
          </li>
          <li>
            <Link
              href="https://instagram.com/aspiralapp"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram">
              <IconInstagram />
            </Link>
          </li>
          <li>
            <Link
              href="https://bsky.app/profile/aspiral.app"
              target="_blank"
              rel="noreferrer"
              aria-label="Bluesky">
              <IconBluesky />
            </Link>
          </li>
          <li>
            <Link
              href="https://discord.gg/XbZcvNuQ6F"
              target="_blank"
              rel="noreferrer"
              aria-label="Discord">
              <IconDiscord />
            </Link>
          </li>
          <li>
            <Link
              href="https://linkedin.com/company/aspiralapp/"
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn">
              <IconLinkedIn />
            </Link>
          </li>
          <li>
            <Link
              href="https://github.com/lucasm/aspiral"
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub">
              <IconGitHub />
            </Link>
          </li>
        </ul>

        {/* <a
            href="https://facebook.com/findtoapp"
            target="_blank"
            rel="noopener"
            title="Facebook">
            Facebook
            <Facebook />
          </a> */}

        {/* <a
          href="https://youtube.com/findtoapp"
          target="_blank"
          rel="noopener"
          title="YouTube">
          YouTube
          <Youtube />
        </a> */}
      </div>
    </footer>
  )
}

export default Footer
