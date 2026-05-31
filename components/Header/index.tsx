'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { IconAspiral } from '@/components/Icons'
import { categories } from '@/constants/categories'
import { Button, Space } from '@mantine/core'
import styles from './Header.module.css'

export default function Header() {
  const [isActive, setActive] = useState<boolean>(false)
  const t = useTranslations()
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  // Check if we're on the home page (just locale like /pt-BR or /en)
  const localePath = `/${locale}`
  const isHomePage = pathname === localePath || pathname === `${localePath}/`

  function getCategoryHref(category: string) {
    return `${localePath}/${category}`
  }

  function handleToggle() {
    setActive(!isActive)
  }

  function handleLogoClick() {
    if (isHomePage) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      router.push(`/${t('language')}`)
    }
  }

  return (
    <>
      <header className={`${styles.header}${isHomePage ? '' : ` ${styles.headerInternal}`}`} suppressHydrationWarning>
        <button onClick={handleLogoClick} className={styles.logo} aria-label="Home" type="button">
          <IconAspiral />
          Aspiral
        </button>

        <nav className={styles.desktopNav} aria-label="Categories">
          <ul>
            {categories.map((category) => (
              <li key={category}>
                <a href={getCategoryHref(category)}>{t(category)}</a>
              </li>
            ))}
          </ul>
        </nav>

        <button onClick={handleToggle} className={isActive ? `${styles.menu} ${styles.menuOpen}` : styles.menu} type="button">
          Menu<div className={styles.hamburger}></div>
        </button>

        <nav className={isActive ? `${styles.mobileNav} ${styles.mobileNavOpen}` : styles.mobileNav} aria-label="Categories menu">
          <div>
            <ul>
              {categories.map((category) => (
                <li key={category}>
                  <a href={getCategoryHref(category)} onClick={handleToggle}>
                    {t(category)}
                  </a>
                </li>
              ))}
            </ul>

            <Space h="xl" />

            <Button size="md" component="a" href="https://github.com/sponsors/lucasm" target="_blank" rel="noopener noreferrer">
              ♥&#160;&#160;{t('donate')}
            </Button>
          </div>
        </nav>
      </header>

      <div onClick={handleToggle} className={isActive ? `${styles.layer} ${styles.layerActive}` : styles.layer}></div>
    </>
  )
}
