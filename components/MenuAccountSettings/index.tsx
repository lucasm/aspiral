'use client'

import * as Popover from '@radix-ui/react-popover'
import {
  Cookie,
  Heart,
  MessageSquare,
  Monitor,
  Moon,
  Sun,
  User,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useTheme } from 'next-themes'
import { useState } from 'react'

import Button from '@/components/Button'
import WidgetSearchSettings from '@/components/WidgetSearchSettings'
import { useCookiesConsent } from '@/contexts/CookiesConsentContext'

import SelectLanguage from '../SelectLanguage'
import styles from './MenuAccountSettings.module.css'

type Props = {
  size?: 'small' | 'medium' | 'large' | 'big'
}

const MenuAccountSettings = ({ size = 'small' }: Readonly<Props>) => {
  const t = useTranslations('t')
  const { theme, setTheme } = useTheme()
  const { openPopup } = useCookiesConsent()
  const [isOpen, setIsOpen] = useState(false)
  const normalizedSize = size === 'big' ? 'large' : size

  const saveTheme = (nextTheme: 'dark' | 'light' | 'system') => {
    setTheme(nextTheme)
    const secure = window.location.protocol === 'https:' ? '; Secure' : ''
    document.cookie = `theme=${nextTheme}; Path=/; Max-Age=31536000; SameSite=Lax${secure}`
  }

  const handleTheme = () => {
    if (theme === 'light') {
      saveTheme('dark')
      return
    }

    if (theme === 'dark') {
      saveTheme('system')
      return
    }

    saveTheme('light')
  }

  const handleCookiesConsent = () => {
    setIsOpen(false)
    openPopup()
  }

  return (
    <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
      <Popover.Trigger asChild>
        <Button
          color="transparent"
          size={size}
          className={[styles.trigger, styles[normalizedSize]].join(' ')}
          aria-label={t('settings') ?? 'Settings'}>
          <User aria-hidden="true" />
          {t('settings') ?? 'Settings'}
        </Button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          className={styles.content}
          align="end"
          side="bottom"
          sideOffset={16}>
          <div className={styles.containerSettings}>
            <section className={styles.setting}>
              <h3>{t('theme')}</h3>

              <Button onClick={handleTheme} size="small" color="gray">
                {theme === 'dark' ? (
                  <Moon aria-hidden="true" />
                ) : theme === 'light' ? (
                  <Sun aria-hidden="true" />
                ) : (
                  <Monitor aria-hidden="true" />
                )}

                {theme === 'dark'
                  ? 'Dark'
                  : theme === 'light'
                    ? 'Light'
                    : 'System'}
              </Button>
            </section>

            <section className={styles.setting}>
              <h3>{t('search')}</h3>
              <WidgetSearchSettings />
            </section>

            <section className={styles.setting}>
              <h3>{t('contribute') ?? 'Contribute'}</h3>

              <Button
                url="/contribute"
                color="gray"
                size="small"
                aria-label={t('contribute')}>
                <Heart aria-hidden="true" />
                {t('donate')}
              </Button>

              <Button
                url={t('feedback.url')}
                external
                color="gray"
                size="small"
                aria-label={t('feedback.title')}>
                <MessageSquare aria-hidden="true" />
                {t('feedback.title')}
              </Button>
            </section>

            <section className={styles.setting}>
              <h3>{t('privacy') ?? 'Privacy'}</h3>

              <Button color="gray" size="small" onClick={handleCookiesConsent}>
                <Cookie aria-hidden="true" />
                Cookies
              </Button>
            </section>

            <section className={styles.setting}>
              <h3>{t('language')}</h3>
              <SelectLanguage />
            </section>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}

export default MenuAccountSettings
