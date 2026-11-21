'use client'

import { X } from 'lucide-react'
import type { ReactNode } from 'react'

import styles from './MenuMaxPanel.module.css'

interface Props {
  isMounted: boolean
  isOpen: boolean
  onClose: () => void
  children: ReactNode
}

const MenuMaxPanel = ({ isMounted, isOpen, onClose, children }: Props) => {
  if (!isMounted) return null

  return (
    <>
      <button
        aria-label="Fechar menu"
        className={styles.backdrop}
        data-state={isOpen ? 'open' : 'closed'}
        disabled={!isOpen}
        onClick={onClose}
        type="button"
      />
      <div
        aria-hidden={!isOpen}
        aria-label="Menu de navegação"
        className={styles.panel}
        data-menu-max-panel=""
        data-state={isOpen ? 'open' : 'closed'}
        id="mobile-navigation"
        inert={!isOpen}
        role="region">
        <div className={styles.header}>
          <button
            aria-label="Fechar menu"
            className={styles.closeButton}
            onClick={onClose}
            type="button">
            <X aria-hidden="true" />
          </button>
        </div>
        {children}
      </div>
    </>
  )
}

export default MenuMaxPanel
