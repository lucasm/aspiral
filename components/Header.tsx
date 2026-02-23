'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { IconMemeh } from '@/components/Icons'
import { Button, Space } from '@mantine/core'

export default function Header() {
  const [isActive, setActive] = useState<boolean>(false)
  const t = useTranslations()

  function handleToggle() {
    setActive(!isActive)
  }

  return (
    <header suppressHydrationWarning>
      <Link href="/" id="logo" aria-label="homepage">
        <IconMemeh />
        Memeh
      </Link>

      <button onClick={handleToggle} className={isActive ? 'open' : undefined} id="menu" type="button">
        Menu<div className="hamburger"></div>
      </button>

      <nav className={isActive ? 'open' : undefined}>
        <ul>
          <li>
            <a href="#news" onClick={handleToggle}>
              {t('news')}
            </a>
          </li>
          <li>
            <a href="#biz" onClick={handleToggle}>
              {t('biz')}
            </a>
          </li>
          <li>
            <a href="#tech" onClick={handleToggle}>
              {t('tech')}
            </a>
          </li>
          <li>
            <a href="#sport" onClick={handleToggle}>
              {t('sport')}
            </a>
          </li>
          <li>
            <a href="#cult" onClick={handleToggle}>
              {t('cult')}
            </a>
          </li>
          <li>
            <a href="#geek" onClick={handleToggle}>
              {t('geek')}
            </a>
          </li>
          <li>
            <a href="#sci" onClick={handleToggle}>
              {t('sci')}
            </a>
          </li>
          <li>
            <a href="#check" onClick={handleToggle}>
              {t('check')}
            </a>
          </li>
          <li>
            <a href="#dscvr" onClick={handleToggle}>
              {t('dscvr')}
            </a>
          </li>
        </ul>

        <Space h="xl" />

        <Button size="lg" component="a" href="https://github.com/sponsors/lucasm" target="_blank" rel="noopener noreferrer">
          ♥&#160;&#160;{t('donate')}
        </Button>
      </nav>

      <div onClick={handleToggle} className={isActive ? 'layer layer-active' : 'layer'}></div>
    </header>
  )
}
