import React, { useEffect, ReactNode, useRef, useId } from 'react'

import styles from './Modal.module.css'
import { IconClose } from '../SvgIcons'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  title?: string
  className?: string
  contentClassName?: string
}

const Modal = ({
  isOpen,
  onClose,
  children,
  title,
  className,
  contentClassName,
}: ModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null)
  const firstFocusableElementRef = useRef<HTMLElement | null>(null)
  const lastFocusableElementRef = useRef<HTMLElement | null>(null)
  const previouslyFocusedElementRef = useRef<HTMLElement | null>(null)
  const titleId = useId()

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'auto'

    if (isOpen) {
      previouslyFocusedElementRef.current =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null
      modalRef.current?.focus()
    } else {
      previouslyFocusedElementRef.current?.focus()
    }

    const clickableElements = modalRef.current?.querySelectorAll<HTMLElement>(
      'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )

    if (clickableElements && clickableElements.length > 0) {
      firstFocusableElementRef.current = clickableElements[0]
      lastFocusableElementRef.current =
        clickableElements[clickableElements.length - 1]
    }
  }, [isOpen])

  const handleClose = () => {
    onClose()
    document.body.style.overflow = 'auto'
  }

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      handleClose()
    }
  }

  const handleTabKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab' && isOpen) {
      if (
        e.shiftKey &&
        (document.activeElement === firstFocusableElementRef.current ||
          document.activeElement === modalRef.current)
      ) {
        lastFocusableElementRef.current?.focus()
        e.preventDefault()
      } else if (
        !e.shiftKey &&
        document.activeElement === lastFocusableElementRef.current
      ) {
        firstFocusableElementRef.current?.focus()
        e.preventDefault()
      }
    }

    if (e.key === 'Escape' && isOpen) {
      handleClose()
    }
  }

  return (
    <div
      className={`${styles['modal-overlay']} ${isOpen ? styles.open : ''}`}
      aria-hidden={!isOpen}
      inert={!isOpen}
      onClick={handleOverlayClick}>
      <div
        className={`${styles.modal} ${className ?? ''} ${isOpen ? styles.open : ''}`}
        ref={modalRef}
        role="dialog"
        aria-modal={isOpen}
        aria-labelledby={title ? titleId : undefined}
        tabIndex={isOpen ? 0 : -1}
        onKeyDown={handleTabKeyPress}>
        <button
          type="button"
          className={styles['modal-close']}
          onClick={handleClose}
          tabIndex={isOpen ? 0 : -1}>
          <IconClose />
          Fechar
        </button>
        <div
          className={`${styles['modal-content']} ${contentClassName ?? ''} ${isOpen ? styles.open : ''}`}>
          {title && (
            <h2 id={titleId} className={styles.modalTitle}>
              {title}
            </h2>
          )}
          {children}
        </div>
      </div>
    </div>
  )
}

export default Modal
