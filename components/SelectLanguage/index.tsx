import { usePathname, useRouter } from '@/i18n/routing'
import { useLocale } from 'next-intl'

import Select from '@/components/Select'
import { Languages } from 'lucide-react'

interface Option {
  label: string
  value: string
}

const SelectLanguage = () => {
  const router = useRouter()
  const pathname = usePathname()
  const locale = useLocale()

  const options: Option[] = [
    { label: 'English (United States)', value: 'en-US' },
    { label: 'Português (Brasil)', value: 'pt-BR' },
    { label: '中文 (简体)', value: 'zh-CN' },
    { label: 'Русский', value: 'ru' },
    // { label: 'हिन्दी (भारत)', value: 'hi-IN' },
    // { label: 'Français (France)', value: 'fr-FR' },
    // { label: 'Deutsch (Deutschland)', value: 'de-DE' },
    // { label: 'English (United Kingdom)', value: 'en-GB' },
  ]

  const handleChange = (value: string) => {
    const selectedOption = options.find((option) => option.value === value)
    if (selectedOption && pathname) {
      router.replace(pathname, { locale: selectedOption.value })
    }
  }

  return (
    <Select
      options={options}
      id="language"
      onChange={handleChange}
      value={locale}
      label="Language"
      icon={<Languages />}
    />
  )
}

export default SelectLanguage
