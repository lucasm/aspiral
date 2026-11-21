'use client'

import * as Select from '@radix-ui/react-select'
import { ChevronDown } from 'lucide-react'
import { useRef } from 'react'

import type { ISearch } from '@/interfaces/search'
import { normalizeId } from '@/utils/formats'

import SearchSourceIcon from '../SearchSourceIcon'
import styles from './SearchSourceSelector.module.css'

interface Props {
  sources: ISearch[]
  selectedSourceName?: string
  ariaLabel: string
  onValueChange: (id: string) => void
  onSelectionComplete: () => void
}

export default function SearchSourceSelector({
  sources,
  selectedSourceName,
  ariaLabel,
  onValueChange,
  onSelectionComplete,
}: Readonly<Props>) {
  const shouldFocusInput = useRef(false)
  const selectedSource =
    sources.find(
      (source) =>
        normalizeId(source.name) === normalizeId(selectedSourceName ?? '')
    ) ?? sources[0]
  const selectedSourceId = selectedSource
    ? normalizeId(selectedSource.name)
    : ''

  return (
    <div className={styles.container}>
      <Select.Root value={selectedSourceId} onValueChange={onValueChange}>
        <Select.Trigger className={styles.trigger} aria-label={ariaLabel}>
          <span className={styles.value}>
            {selectedSource && (
              <span className={styles.icon} aria-hidden="true">
                <SearchSourceIcon name={selectedSource.name} size={20} />
              </span>
            )}
            <Select.Value>{selectedSource?.name}</Select.Value>
          </span>
          <Select.Icon className={styles.chevron}>
            <ChevronDown aria-hidden="true" />
          </Select.Icon>
        </Select.Trigger>
        <Select.Portal>
          <Select.Content
            className={styles.content}
            position="popper"
            sideOffset={4}
            onCloseAutoFocus={(event) => {
              if (shouldFocusInput.current) {
                event.preventDefault()
                shouldFocusInput.current = false
                window.setTimeout(onSelectionComplete, 0)
              }
            }}>
            <Select.Viewport>
              {sources.map((source) => (
                <Select.Item
                  key={source.name}
                  value={normalizeId(source.name)}
                  className={styles.item}
                  onPointerUp={() => {
                    shouldFocusInput.current = true
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      shouldFocusInput.current = true
                    }
                  }}>
                  <span className={styles.icon} aria-hidden="true">
                    <SearchSourceIcon name={source.name} size={20} />
                  </span>
                  <Select.ItemText>{source.name}</Select.ItemText>
                </Select.Item>
              ))}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    </div>
  )
}
