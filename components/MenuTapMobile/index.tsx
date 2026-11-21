'use client'

import { LayoutGridCircles } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { ISearchCategory } from '@/interfaces/search'

import SearchNav from '../SearchNav'

import styles from './MenuTapMobile.module.css'
import Button from '../Button'

interface Props {
  categories: ISearchCategory[]
  selectedCategory: ISearchCategory
}

const MenuTapMobile = ({ categories, selectedCategory }: Props) => {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!isOpen) return

    const handleOutsideClick = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [isOpen])

  return (
    <div className={styles.container} ref={containerRef}>
      <Button
        color="transparent"
        aria-controls={isOpen ? 'mobile-search-navigation' : undefined}
        aria-expanded={isOpen}
        className={isOpen ? styles.opened : ''}
        onClick={() => setIsOpen((open) => !open)}>
        <LayoutGridCircles />
        Menu
      </Button>

      {isOpen && (
        <div className={styles.containerDropdown} id="mobile-search-navigation">
          <SearchNav
            data={{ categories }}
            variant="vertical"
            selectedCategory={selectedCategory}
          />
        </div>
      )}
    </div>
  )
}

export default MenuTapMobile
