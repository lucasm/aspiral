'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Button, Group, Text, Anchor } from '@mantine/core'

import { useCookiesConsent } from '@/contexts/CookiesConsentContext'

import styles from './CookiesPopup.module.css'

const ANIMATION_DURATION = 350 // ms (sincronizado com CSS animate slideDownFadeOut)

const CookiesPopup = () => {
  const t = useTranslations()
  const { isAccepted, isHydrated, accept, reject } = useCookiesConsent()
  const [isClosing, setIsClosing] = useState(false)

  if (!isHydrated) return null
  if (isAccepted !== null && !isClosing) return null

  const handleClose = (action: () => void) => {
    setIsClosing(true)
    setTimeout(() => {
      action()
      setIsClosing(false) // reseta para próxima vez que abrir
    }, ANIMATION_DURATION)
  }

  return (
    <div
      className={`${styles.cookiesPopup} ${isClosing ? styles.slideDown : styles.slideUp}`}
      role="dialog"
      aria-live="polite"
      aria-label={t('cookies.title')}>
      <Text size="sm">
        {t('cookies.message')}{' '}
        <Anchor href="https://lucasm.dev/legal" component={Link} target="_blank" rel="noopener" mt="sm">
          {t('privacy')}
        </Anchor>
        .
      </Text>

      <Group justify="center" gap="md">
        <Button onClick={() => handleClose(accept)} variant="filled" color="white" radius="xl" size="sm">
          {t('cookies.accept')}
        </Button>
        <Button onClick={() => handleClose(reject)} variant="subtle" color="white" radius="xl" size="sm">
          {t('cookies.reject')}
        </Button>
      </Group>
    </div>
  )
}

export default CookiesPopup
