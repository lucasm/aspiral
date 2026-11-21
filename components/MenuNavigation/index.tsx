'use client'

import * as NavigationMenu from '@radix-ui/react-navigation-menu'
import { ChevronDown, Menu } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { Link } from '@/i18n/routing'
import { ISearchCategory } from '@/interfaces/search'
import { normalizeId } from '@/utils/formats'
import { getCategoryIcon } from '@/utils/handleCategoryIcon'

import styles from './MenuNavigation.module.css'
import MenuTapMobile from '../MenuTapMobile'
import MenuMaxPanel from '../MenuMaxPanel'

const menuCategories = [
  { name: 'Home' },
  { name: 'News', children: ['Social', 'Legal', 'Fact-Check'] },
  { name: 'Business', children: ['Startups', 'Job'] },
  {
    name: 'Tech',
    children: ['Code', 'AI', 'Web', 'Apps', 'Torrent'],
  },
  { name: 'Sport' },
  {
    name: 'Culture',
    children: ['Videos', 'Music', 'Image', 'Games', 'Books', 'Art'],
  },
  { name: 'Celebrity' },
  { name: 'Science', children: ['Health', 'Academic'] },
  { name: 'Shopping' },
  { name: 'Local' },
]

interface MenuCategory {
  category: ISearchCategory
  children: ISearchCategory[]
}

const getMenuCategories = (
  sourceCategories: ISearchCategory[]
): MenuCategory[] => {
  const activeCategories = sourceCategories.filter(
    (category) => category.active
  )

  return menuCategories.flatMap(({ name, children = [] }) => {
    const category = activeCategories.find(
      (item) => item.name.toLowerCase() === name.toLowerCase()
    )

    if (!category) return []

    const childCategories = children
      .map((childName) =>
        activeCategories.find(
          (item) => item.name.toLowerCase() === childName.toLowerCase()
        )
      )
      .filter((child): child is ISearchCategory => Boolean(child))

    return [{ category, children: childCategories }]
  })
}

const getCategoryHref = (category: ISearchCategory) =>
  category.name.toLowerCase() === 'home'
    ? '/'
    : `/${normalizeId(category.name)}`

interface NavigationItemsProps {
  categories: MenuCategory[]
  mode: 'desktop' | 'mobile'
  selectedCategory?: ISearchCategory
  onNavigate?: () => void
  onHoverCategory?: (value: string) => void
  onKeyboardFocusCategory?: (value: string) => void
  onStartLongPress?: (value: string) => void
  onCancelLongPress?: () => void
  onClearLongPress?: () => void
  onConsumeLongPress?: (value: string) => boolean
  onTouchPointerDown?: (value: string, pointerType: string) => void
  onTouchPointerCancel?: (value: string) => void
  onTouchCategoryClick?: (value: string) => boolean
  onOpenMenu?: (trigger: HTMLButtonElement) => void
  isMenuOpen?: boolean
}

const NavigationItems = ({
  categories,
  mode,
  selectedCategory,
  onNavigate,
  onHoverCategory,
  onKeyboardFocusCategory,
  onStartLongPress,
  onCancelLongPress,
  onClearLongPress,
  onConsumeLongPress,
  onTouchPointerDown,
  onTouchPointerCancel,
  onTouchCategoryClick,
  onOpenMenu,
  isMenuOpen = false,
}: NavigationItemsProps) => (
  <NavigationMenu.List className={styles.list}>
    {categories.map(({ category, children }) => {
      const label = category.name_translated || category.name
      const href = getCategoryHref(category)
      const hasChildren = children.length > 0
      const CategoryIcon = getCategoryIcon(category.name)
      const isCategorySelected = selectedCategory?.name === category.name
      const isSelected =
        isCategorySelected ||
        children.some((child) => child.name === selectedCategory?.name)

      return (
        <NavigationMenu.Item
          className={styles.item}
          key={category.name}
          value={hasChildren ? category.name : undefined}
          onPointerEnter={(event) => {
            if (mode === 'desktop' && event.pointerType === 'mouse') {
              onHoverCategory?.(hasChildren ? category.name : '')
            }
          }}
          onFocusCapture={() => {
            if (mode === 'desktop') {
              onKeyboardFocusCategory?.(hasChildren ? category.name : '')
            }
          }}
          onClick={onClearLongPress}>
          {hasChildren ? (
            <>
              {mode === 'mobile' ? (
                <NavigationMenu.Trigger
                  className={`${styles.trigger} ${
                    isSelected ? styles.selectedCategory : ''
                  }`}>
                  <span className={styles.categoryLabel}>
                    <span aria-hidden="true" className={styles.categoryIcon}>
                      <CategoryIcon />
                    </span>
                    <span>{label}</span>
                  </span>
                  <ChevronDown
                    aria-hidden="true"
                    className={styles.submenuIcon}
                  />
                </NavigationMenu.Trigger>
              ) : (
                <div className={styles.categoryControls}>
                  <NavigationMenu.Link asChild>
                    <Link
                      className={`${styles.categoryLink} ${
                        isSelected ? styles.selectedCategory : ''
                      }`}
                      href={href}
                      onPointerDown={(event) => {
                        onTouchPointerDown?.(category.name, event.pointerType)

                        if (
                          event.pointerType === 'mouse' &&
                          event.button === 0
                        ) {
                          onStartLongPress?.(category.name)
                        }
                      }}
                      onPointerUp={onCancelLongPress}
                      onPointerLeave={onCancelLongPress}
                      onPointerCancel={() => {
                        onClearLongPress?.()
                        onTouchPointerCancel?.(category.name)
                      }}
                      onClick={(event) => {
                        if (onConsumeLongPress?.(category.name)) {
                          event.preventDefault()
                          return
                        }

                        if (onTouchCategoryClick?.(category.name)) {
                          event.preventDefault()
                          return
                        }

                        onNavigate?.()
                      }}>
                      {label}
                    </Link>
                  </NavigationMenu.Link>
                  <NavigationMenu.Trigger
                    aria-label={`Submenu de ${label}`}
                    className={styles.desktopSubmenuTrigger}>
                    <ChevronDown aria-hidden="true" />
                  </NavigationMenu.Trigger>
                </div>
              )}
              <NavigationMenu.Content className={styles.content}>
                <div className={styles.contentInner}>
                  <Link
                    aria-current={isCategorySelected ? 'page' : undefined}
                    className={`${styles.parentLink} ${
                      isCategorySelected ? styles.selectedCategory : ''
                    }`}
                    href={href}
                    onClick={onNavigate}>
                    {mode === 'mobile' && (
                      <span aria-hidden="true" className={styles.categoryIcon}>
                        <CategoryIcon />
                      </span>
                    )}
                    {label}
                  </Link>
                  <ul className={styles.subcategoryList}>
                    {children.map((child) => {
                      const ChildIcon = getCategoryIcon(child.name)
                      const isChildSelected =
                        selectedCategory?.name === child.name

                      return (
                        <li key={child.name}>
                          <Link
                            aria-current={isChildSelected ? 'page' : undefined}
                            className={
                              isChildSelected
                                ? styles.selectedCategory
                                : undefined
                            }
                            href={getCategoryHref(child)}
                            onClick={onNavigate}>
                            {mode === 'mobile' && (
                              <span
                                aria-hidden="true"
                                className={styles.categoryIcon}>
                                <ChildIcon />
                              </span>
                            )}
                            {child.name_translated || child.name}
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              </NavigationMenu.Content>
            </>
          ) : (
            <NavigationMenu.Link asChild>
              <Link
                aria-current={isSelected ? 'page' : undefined}
                className={`${styles.categoryLink} ${
                  isSelected ? styles.selectedCategory : ''
                }`}
                href={href}
                onClick={onNavigate}>
                {mode === 'mobile' && (
                  <span className={styles.categoryLabel}>
                    <span aria-hidden="true" className={styles.categoryIcon}>
                      <CategoryIcon />
                    </span>
                    <span>{label}</span>
                  </span>
                )}
                {mode === 'desktop' && label}
              </Link>
            </NavigationMenu.Link>
          )}
        </NavigationMenu.Item>
      )
    })}
    {mode === 'desktop' && (
      <NavigationMenu.Item className={styles.item}>
        <button
          aria-controls={isMenuOpen ? 'mobile-navigation' : undefined}
          aria-expanded={isMenuOpen}
          aria-label="Abrir menu completo"
          className={styles.desktopMenuButton}
          onClick={(event) => onOpenMenu?.(event.currentTarget)}
          type="button">
          <Menu aria-hidden="true" />
        </button>
      </NavigationMenu.Item>
    )}
    <NavigationMenu.Indicator className={styles.indicator} />
  </NavigationMenu.List>
)

interface Props {
  categories: ISearchCategory[]
  selectedCategory: ISearchCategory
}

const MenuNavigation = ({
  categories: sourceCategories,
  selectedCategory,
}: Props) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [desktopOpenCategory, setDesktopOpenCategory] = useState('')
  const [showKeyboardControls, setShowKeyboardControls] = useState(false)
  const menuNavigationRef = useRef<HTMLDivElement>(null)
  const returnFocusRef = useRef<HTMLButtonElement | null>(null)
  const isKeyboardNavigation = useRef(true)
  const longPressTimeoutRef = useRef<number | null>(null)
  const longPressCategoryRef = useRef('')
  const pendingTouchCategoryRef = useRef('')
  const touchOpenedCategoryRef = useRef('')
  const categories = getMenuCategories(sourceCategories)

  console.log('selected category', selectedCategory)

  const cancelLongPress = () => {
    if (longPressTimeoutRef.current !== null) {
      window.clearTimeout(longPressTimeoutRef.current)
      longPressTimeoutRef.current = null
    }
  }

  const clearLongPress = () => {
    cancelLongPress()
    longPressCategoryRef.current = ''
  }

  const startLongPress = (category: string) => {
    clearLongPress()
    longPressTimeoutRef.current = window.setTimeout(() => {
      longPressTimeoutRef.current = null
      longPressCategoryRef.current = category
      setDesktopOpenCategory(category)
    }, 500)
  }

  const consumeLongPress = (category: string) => {
    if (longPressCategoryRef.current !== category) return false

    longPressCategoryRef.current = ''
    return true
  }

  const handleTouchPointerDown = (category: string, pointerType: string) => {
    pendingTouchCategoryRef.current = pointerType === 'touch' ? category : ''
  }

  const handleTouchPointerCancel = (category: string) => {
    if (pendingTouchCategoryRef.current === category) {
      pendingTouchCategoryRef.current = ''
    }
  }

  const handleTouchCategoryClick = (category: string) => {
    if (pendingTouchCategoryRef.current !== category) return false

    pendingTouchCategoryRef.current = ''

    if (
      touchOpenedCategoryRef.current === category &&
      desktopOpenCategory === category
    ) {
      touchOpenedCategoryRef.current = ''
      return false
    }

    touchOpenedCategoryRef.current = category
    setDesktopOpenCategory(category)
    return true
  }

  const handleCategoryNavigate = () => {
    touchOpenedCategoryRef.current = ''
    pendingTouchCategoryRef.current = ''
  }

  useEffect(
    () => () => {
      if (longPressTimeoutRef.current !== null) {
        window.clearTimeout(longPressTimeoutRef.current)
      }
    },
    []
  )

  useEffect(() => {
    const handlePointerDown = () => {
      isKeyboardNavigation.current = false
      setShowKeyboardControls(false)
    }
    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType === 'mouse') {
        isKeyboardNavigation.current = false
        setShowKeyboardControls(false)
      }
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target
      const isMenuKeyEvent =
        target instanceof Node && menuNavigationRef.current?.contains(target)

      if (!isMenuKeyEvent && event.key !== 'Tab') return

      isKeyboardNavigation.current = true

      if (
        event.key === 'Tab' ||
        event.key.startsWith('Arrow') ||
        ['Enter', 'Escape', 'Home', 'End', ' '].includes(event.key)
      ) {
        setShowKeyboardControls(true)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown, true)
    document.addEventListener('pointermove', handlePointerMove, true)
    document.addEventListener('keydown', handleKeyDown, true)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown, true)
      document.removeEventListener('pointermove', handlePointerMove, true)
      document.removeEventListener('keydown', handleKeyDown, true)
    }
  }, [])

  useEffect(() => {
    if (!isOpen) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
        returnFocusRef.current?.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen || !isMounted) return

    const timeout = window.setTimeout(() => setIsMounted(false), 200)
    return () => window.clearTimeout(timeout)
  }, [isOpen, isMounted])

  const closeMenu = () => {
    setIsOpen(false)
    returnFocusRef.current?.focus()
  }

  const openMenu = (trigger: HTMLButtonElement) => {
    returnFocusRef.current = trigger
    setIsMounted(true)
    setIsOpen(true)
  }

  return (
    <div
      ref={menuNavigationRef}
      className={styles.menuNavigation}
      data-keyboard-navigation={showKeyboardControls || undefined}>
      <nav className={styles.desktopNav} aria-label="Navegação principal">
        <NavigationMenu.Root
          value={desktopOpenCategory}
          onValueChange={setDesktopOpenCategory}
          delayDuration={0}
          skipDelayDuration={0}>
          <NavigationItems
            categories={categories}
            mode="desktop"
            onNavigate={handleCategoryNavigate}
            onHoverCategory={setDesktopOpenCategory}
            onKeyboardFocusCategory={(value) => {
              if (isKeyboardNavigation.current) {
                setDesktopOpenCategory(value)
              }
            }}
            onStartLongPress={startLongPress}
            onCancelLongPress={cancelLongPress}
            onClearLongPress={clearLongPress}
            onConsumeLongPress={consumeLongPress}
            onTouchPointerDown={handleTouchPointerDown}
            onTouchPointerCancel={handleTouchPointerCancel}
            onTouchCategoryClick={handleTouchCategoryClick}
            onOpenMenu={openMenu}
            isMenuOpen={isOpen}
          />
        </NavigationMenu.Root>
      </nav>

      {/* Mobile */}
      <div className={styles.mobileMenu}>
        <MenuTapMobile
          categories={sourceCategories}
          selectedCategory={selectedCategory}
        />
      </div>

      <MenuMaxPanel isMounted={isMounted} isOpen={isOpen} onClose={closeMenu}>
        <nav aria-label="Navegação principal">
          <NavigationMenu.Root
            orientation="vertical"
            activationMode="manual"
            delayDuration={0}
            skipDelayDuration={0}>
            <NavigationItems
              categories={categories}
              mode="mobile"
              selectedCategory={selectedCategory}
              onNavigate={closeMenu}
            />
          </NavigationMenu.Root>
        </nav>
      </MenuMaxPanel>
    </div>
  )
}

export default MenuNavigation
