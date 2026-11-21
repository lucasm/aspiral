'use client'

import MenuAccountSettings from '@/components/MenuAccountSettings'
import MenuNavigation from '@/components/MenuNavigation'
import { ISearchCategory } from '@/interfaces/search'
import { getLocaleData } from '@/utils/getLocaleData'

import Style from './Header.module.css'
import { Asterisk } from 'lucide-react'
import Button from '../Button'
import SvgLogo from '../SvgLogo'

interface Props {
  locale: string
  category: ISearchCategory
}

const Header = ({ locale, category }: Props) => {
  const data = getLocaleData(locale)

  return (
    <header className={Style.header}>
      <div className={Style.buttonsContainer}>
        {/* Logo */}
        <Button url="/" color="transparent" translate="no">
          <SvgLogo />
          Aspiral
        </Button>
      </div>

      <MenuNavigation
        categories={data.categories}
        selectedCategory={category}
      />

      <div className={Style.buttonsContainer}>
        <MenuAccountSettings size="small" />
      </div>
    </header>
  )
}

export default Header
