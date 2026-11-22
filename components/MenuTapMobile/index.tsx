'use client'

import * as Popover from '@radix-ui/react-popover'
import { LayoutGridCircles } from 'lucide-react'
import { useState } from 'react'

import { ISearchCategory } from '@/interfaces/search'

import buttonStyles from '../Button/Button.module.css'
import SearchNav from '../SearchNav'

import styles from './MenuTapMobile.module.css'

interface Props {
  categories: ISearchCategory[]
  selectedCategory: ISearchCategory
}

const MenuTapMobile = ({ categories, selectedCategory }: Props) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
      <Popover.Trigger
        className={`${buttonStyles.button} ${buttonStyles.transparent} ${buttonStyles.small} ${styles.trigger} ${
          isOpen ? styles.opened : ''
        }`}>
        <LayoutGridCircles aria-hidden="true" />
        Menu
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          aria-label="Menu de categorias"
          className={styles.containerDropdown}
          id="mobile-search-navigation"
          align="center"
          side="bottom"
          sideOffset={16}>
          <nav
            aria-label="Navegação por categorias"
            onClick={() => setIsOpen(false)}>
            <SearchNav
              data={{ categories }}
              variant="vertical"
              selectedCategory={selectedCategory}
            />
          </nav>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}

export default MenuTapMobile
