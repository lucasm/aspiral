'use client'

import { useRouter, usePathname } from 'next/navigation'
import { Select } from '@mantine/core'
import { useLocale } from '@/lib/i18n'
import en from '@/locales/en'
import ptBR from '@/locales/pt-BR'
import ptPT from '@/locales/pt-PT'

type LocaleKey = 'en' | 'pt-BR' | 'pt-PT'

const localesData: Record<LocaleKey, any> = {
  en,
  'pt-BR': ptBR,
  'pt-PT': ptPT,
}

const data = [
  { value: 'en', label: 'International' },
  { value: 'pt-BR', label: 'Brasil' },
  { value: 'pt-PT', label: 'Portugal' },
]

export default function SelectLocale() {
  const router = useRouter()
  const pathname = usePathname()
  const currentLocale = useLocale() as LocaleKey
  const currentLocaleData = localesData[currentLocale]

  function changeLanguage(value: string | null) {
    if (!value) return
    const newLocale = value as LocaleKey
    const segments = pathname.split('/')
    // segments[0] is empty string before first /
    // segments[1] is current locale
    // Rest of path after locale
    const pathWithoutLocale = '/' + segments.slice(2).join('/')
    const newPath = `/${newLocale}${pathWithoutLocale}`
    router.push(newPath)
  }

  return (
    <div
      style={{
        margin: '0 auto',
        maxWidth: '16rem',
      }}>
      <Select
        label={currentLocaleData.edition}
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
