'use client'

import { useTranslations, useLocale } from 'next-intl'
import { useRouter, usePathname } from '@/i18n/routing'
import { Select } from '@mantine/core'

const data = [
  { value: 'en', label: 'International' },
  { value: 'pt-BR', label: 'Brasil' },
  { value: 'pt-PT', label: 'Portugal' },
]

export default function SelectLocale() {
  const router = useRouter()
  const pathname = usePathname()
  const currentLocale = useLocale()
  const t = useTranslations()

  function changeLanguage(value: string | null) {
    if (!value) return
    router.replace(pathname, { locale: value })
  }

  return (
    <div
      style={{
        margin: '0 auto',
        maxWidth: '16rem',
      }}>
      <Select
        label={t('edition')}
        labelProps={{
          style: {
            fontWeight: 700,
            fontSize: '1rem',
          },
        }}
        wrapperProps={{
          style: {
            display: 'flex',
            gap: '1rem',
            alignItems: 'center',
            verticalAlign: 'middle',
          },
        }}
        data={data}
        value={currentLocale}
        onChange={changeLanguage}
        allowDeselect={false}
        size="lg"
      />
    </div>
  )
}
