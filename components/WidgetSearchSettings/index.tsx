'use client'

import { useTranslations } from 'next-intl'
import { useEffect, useRef, useState } from 'react'

import Button from '@/components/Button'
import { useSearch } from '@/contexts/SearchContext'
import { clearSearchHistory, getSearchHistory } from '@/utils/searchHistory'
import { clearSearchSourcePreferences } from '@/utils/searchSourcePreference'

import {
  History,
  SearchExclamationPoint,
  Earth,
  ShieldCheck,
  LockKeyhole,
  Trash2,
  X,
} from 'lucide-react'

import Styles from './WidgetSearchSettings.module.css'

export default function WidgetSearchSettings() {
  const t = useTranslations('t')
  const { searchSource, putValue, resetSearchSource } = useSearch()
  const [dialogView, setDialogView] = useState<'source' | 'history' | null>(
    null
  )
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (dialogView && !dialog.open) {
      dialog.showModal()
    } else if (!dialogView && dialog.open) {
      dialog.close()
    }
  }, [dialogView])

  const domain = searchSource?.domain

  const openHistory = () => {
    setSearchHistory(getSearchHistory())
    setDialogView('history')
  }
  const handleClearHistory = () => {
    clearSearchHistory()
    setSearchHistory([])
  }
  const handleClearSearchSources = () => {
    clearSearchSourcePreferences()
    resetSearchSource()
  }

  return (
    <>
      <Button
        size="small"
        color="gray"
        aria-haspopup="dialog"
        onClick={() => setDialogView('source')}>
        <SearchExclamationPoint />
        {t('widgetSearch.source')}
      </Button>

      <Button
        aria-haspopup="dialog"
        onClick={openHistory}
        size="small"
        color="gray">
        <History />
        {t('widgetSearch.history')}
      </Button>

      <dialog
        ref={dialogRef}
        className={Styles.dialog}
        aria-labelledby="widget-search-title"
        aria-describedby={
          dialogView === 'source' ? 'widget-search-description' : undefined
        }
        onCancel={() => setDialogView(null)}
        onClose={() => setDialogView(null)}
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            dialogRef.current?.close()
          }
        }}>
        <section className={Styles.content}>
          <header className={Styles.header}>
            <section>
              <h2 id="widget-search-title">
                {dialogView === 'history'
                  ? t('widgetSearch.history')
                  : searchSource?.name
                    ? `${t('widgetSearch.source')}: ${searchSource.name}`
                    : t('widgetSearch.source')}
              </h2>
              {dialogView === 'source' && (
                <p id="widget-search-description">
                  {t('widgetSearch.description')}
                </p>
              )}
            </section>

            <button
              type="button"
              className={Styles.closeButton}
              aria-label={t('close')}
              onClick={() => dialogRef.current?.close()}>
              <X />
            </button>
          </header>

          {dialogView === 'source' && domain && (
            <nav className={Styles.links}>
              <a
                href={`https://sitecheck.sucuri.net/results/${domain}`}
                rel="noreferrer noopener"
                target="_blank">
                <LockKeyhole />
                {t('widgetSearch.security')}
              </a>

              <a
                href={`https://aesirx.io/services/privacy-scanner/result/${domain}`}
                rel="noreferrer noopener"
                target="_blank">
                <ShieldCheck />
                {t('widgetSearch.privacy')}
              </a>

              <a
                href={`https://www.websitecarbon.com/website/${domain.replace('.', '-')}`}
                rel="noreferrer noopener"
                target="_blank">
                <Earth />
                {t('widgetSearch.carbon')}
              </a>
            </nav>
          )}

          {dialogView === 'history' &&
            (searchHistory.length > 0 ? (
              <ul className={Styles.historyList}>
                {searchHistory.map((query) => (
                  <li key={query}>
                    <button
                      type="button"
                      onClick={() => {
                        putValue(query)
                        dialogRef.current?.close()
                      }}>
                      {query}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={Styles.historyEmpty}>
                {t('widgetSearch.historyEmpty')}
              </p>
            ))}

          {dialogView === 'history' && (
            <>
              <Button size="small" color="gray" onClick={handleClearHistory}>
                <Trash2 aria-hidden="true" />
                {t('widgetSearch.clearHistory')}
              </Button>

              <Button
                size="small"
                color="gray"
                onClick={handleClearSearchSources}>
                <Trash2 aria-hidden="true" />
                {t('widgetSearch.clearSources')}
              </Button>
            </>
          )}
        </section>
      </dialog>
    </>
  )
}
