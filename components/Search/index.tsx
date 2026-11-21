'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ArrowUpRight, X } from 'lucide-react'

import Alert from '@/components/Alert'
import SearchSourceOptions from '@/components/SearchSourceOptions'
import SearchSuggestions from '@/components/SearchSuggestions'
import SearchSourceSelector from '@/components/SearchSourceSelector'
import SearchTitle from '@/components/SearchTitle'
import SearchVoice from '@/components/SearchVoice'
import Tooltip from '@/components/Tooltip'
import { useSearch } from '@/contexts/SearchContext'
import type { ISearchCategory, ISearchChild } from '@/interfaces/search'
import { normalizeId } from '@/utils/formats'
import { addSearchHistory } from '@/utils/searchHistory'
import {
  getSearchSourcePreference,
  saveSearchSourcePreference,
} from '@/utils/searchSourcePreference'

import Style from './Search.module.css'
import BlurBackground from '../BlurBackground'

interface Props {
  selectedCategory: ISearchCategory
}

const EXPANDED_INPUT_LENGTH = 35

export default function Search({ selectedCategory }: Readonly<Props>) {
  const locale = useLocale()
  const t = useTranslations('t')

  const {
    setCategory,
    searchSource,
    setSearchSource,
    searchSourceResetKey,
    searchUrl,
    setSearchUrl,
    inputValue,
    setInputValue,
    isMobileViewport,
    refSearchInput,
    inputFocus,
  } = useSearch()

  const refSearchButton = useRef<HTMLAnchorElement>(null)

  const [isValid, setIsValid] = useState(false)
  const searchName = selectedCategory?.name_translated || selectedCategory?.name
  const searchSources = useMemo(
    () =>
      selectedCategory.data.filter(
        (source) =>
          (typeof source.action === 'string' &&
            source.action.trim().length > 0) ||
          (source.child?.length ?? 0) > 0
      ),
    [selectedCategory.data]
  )
  const isExpanded = Boolean(
    inputValue &&
    (inputValue.length >= EXPANDED_INPUT_LENGTH || inputValue.includes('\n'))
  )

  const handleResize = useCallback(() => {
    if (refSearchInput.current) {
      refSearchInput.current.style.height = 'auto'
    }
  }, [refSearchInput])

  const handleReset = () => {
    setInputValue('')
    setIsValid(false)
    handleResize()
  }
  const handleSearch = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (!isValid) {
      event.preventDefault()
      inputFocus()
      return
    }

    addSearchHistory(inputValue ?? '')
  }
  const handleKeyEnter = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && event.shiftKey) {
      // prevents Enter from skipping a line without Shift
    } else if (event.key === 'Enter') {
      event.preventDefault()
      if (isValid) {
        refSearchButton.current?.click()
      } else {
        inputFocus()
      }
    }
  }
  const applySelectedSource = useCallback(
    (id: string) => {
      const source = searchSources.find((item) => normalizeId(item.name) === id)

      if (source) {
        setSearchSource({ ...source, id: id })
      }

      return source
    },
    [searchSources, setSearchSource]
  )
  const handleSelectedSource = useCallback(
    (id: string) => {
      if (applySelectedSource(id)) {
        saveSearchSourcePreference(selectedCategory.name, id)
      }
    },
    [applySelectedSource, selectedCategory.name]
  )
  const handleValue = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(event.target.value)
    setIsValid(event.target.value !== '')

    event.target.style.height = 'auto'
    event.target.style.height = event.target.scrollHeight + 'px'
  }
  const handleFocus = (event: React.FocusEvent<HTMLTextAreaElement>) => {
    event.currentTarget.style.height = 'auto'
    event.currentTarget.style.height = event.currentTarget.scrollHeight + 'px'
  }
  const handlePlaceholder = () => {
    if (isMobileViewport) {
      return t('search')
    }

    if (searchSource?.name) {
      return t('placeholder') + ' ' + searchSource?.name
    }

    return t('placeholder')
  }
  const handleShowWarnings = () => {
    if (selectedCategory?.name === 'Torrent') {
      return <Alert>{t('warnings.torrent')}</Alert>
    }

    if (selectedCategory?.name === 'Darknet') {
      return <Alert>{t('warnings.darknet')}</Alert>
    }
  }
  const searchSourceSelector = (
    <SearchSourceSelector
      sources={searchSources}
      selectedSourceName={searchSource?.name}
      ariaLabel={`${t('placeholder')} ${searchSource?.name ?? ''}`}
      onValueChange={handleSelectedSource}
      onSelectionComplete={inputFocus}
    />
  )
  const searchSourceOptions = searchSource?.child && (
    <SearchSourceOptions
      key={normalizeId(searchSource.name)}
      options={searchSource.child.map((item: ISearchChild) => ({
        label: item.name,
        value: item.action,
      }))}
      label={searchSource.name}
    />
  )
  const resetButton = (
    <Tooltip text={t('clear')} disable={isMobileViewport}>
      <button
        type="button"
        onClick={handleReset}
        className={Style.resetButton}
        style={{ display: isValid ? 'flex' : 'none' }}>
        <X aria-hidden="true" />
        {t('clear')}
      </button>
    </Tooltip>
  )

  // resize
  useEffect(() => {
    if (isMobileViewport) {
      handleResize()
    }
  }, [isMobileViewport])

  // url
  useEffect(() => {
    const additional = searchSource?.additional ?? ''
    const action = searchSource?.action
    const value = inputValue || ''

    if (action) {
      setSearchUrl(`${action}${encodeURIComponent(value)}${additional}`)
    }
  }, [inputValue, searchSource, setSearchUrl])

  // Restore action visibility for values loaded from storage or the URL.
  useEffect(() => {
    setIsValid(inputValue !== undefined && inputValue !== '')
  }, [inputValue])

  // initial state
  useEffect(() => {
    if (selectedCategory) {
      setCategory(selectedCategory.name)
      const storedSource = getSearchSourcePreference(selectedCategory.name)

      if (searchSources.length === 0) {
        setSearchSource(undefined)
        setSearchUrl('')
        return
      }

      const sourceId = normalizeId(searchSources[0].name)
      const isStoredSourceAvailableOnCurrentCategory = searchSources.some(
        (item) => normalizeId(item.name) === storedSource
      )

      applySelectedSource(
        storedSource && isStoredSourceAvailableOnCurrentCategory
          ? storedSource
          : sourceId
      )
    }
  }, [
    applySelectedSource,
    searchSources,
    searchSourceResetKey,
    selectedCategory,
    setCategory,
    setSearchSource,
    setSearchUrl,
  ])

  return (
    <section className={Style.section}>
      <div className={Style.container}>
        <BlurBackground category={selectedCategory?.name} />

        <SearchTitle
          category={selectedCategory?.name}
          categoryTitle={searchName}
        />

        {/* Input */}
        <div
          className={`${Style.containerInput} ${isExpanded ? Style.expanded : ''}`}
          role="search"
          aria-label={t('search')}>
          <div className={Style.searchRow}>
            <div
              className={`${Style.input} ${isExpanded ? Style.expandedInput : ''}`}>
              <div className={Style.textareaContainer}>
                <textarea
                  id="search"
                  ref={refSearchInput}
                  value={inputValue}
                  aria-label={t('search')}
                  className={Style.input}
                  placeholder={handlePlaceholder()}
                  autoComplete="off"
                  inputMode="search"
                  enterKeyHint="search"
                  maxLength={2500}
                  rows={1}
                  onChange={handleValue}
                  onFocus={handleFocus}
                  onKeyDown={handleKeyEnter}
                />

                <div className={Style.searchActions}>
                  {!isExpanded && resetButton}
                </div>
              </div>

              <div
                className={`${Style.searchControls} ${isExpanded ? Style.expandedControls : ''}`}>
                {isExpanded && resetButton}
                <Tooltip text={t('search')} disable={isMobileViewport}>
                  <a
                    ref={refSearchButton}
                    className={Style.searchButton}
                    href={searchUrl}
                    target="_blank"
                    rel="noopener"
                    onClick={handleSearch}
                    style={{
                      opacity:
                        isValid && searchSources.length > 0 ? '1' : '.45',
                      display:
                        isValid && searchSources.length > 0
                          ? 'inline-flex'
                          : 'none',
                    }}>
                    <ArrowUpRight aria-hidden="true" />
                    {t('search')}
                  </a>
                </Tooltip>
                <SearchVoice display={!isValid} />
              </div>
            </div>

            {searchSources.length > 0 && (
              <div className={Style.searchSource}>{searchSourceSelector}</div>
            )}
          </div>

          {searchSource?.child && (
            <div className={Style.childOptions}>{searchSourceOptions}</div>
          )}

          <div className={Style.suggestions}>
            <SearchSuggestions locale={locale} term={inputValue ?? ''} />
          </div>
        </div>

        {handleShowWarnings()}
      </div>
    </section>
  )
}
