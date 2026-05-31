'use client'

import styles from './CardFeed.module.css'
import CardFeedFetch from '../CardFeedFetch'
import { useMemo } from 'react'
import { normalizeId } from '@/utils/normalizeId'

type Props = {
  readonly locale: string
  readonly category: string
}

interface IFeedFile {
  name: string
  url?: string
}

// Cache global para feeds carregados
const feedCache = new Map<string, Record<string, IFeedFile[]>>()

export default function Card(props: Readonly<Props>) {
  const feeds = useMemo<IFeedFile[]>(() => {
    if (!feedCache.has(props.locale)) {
      const localeData = require('../../locales/' + props.locale + '.json')
      feedCache.set(props.locale, localeData.feeds)
    }
    const categoryFeeds = feedCache.get(props.locale)![props.category] ?? []
    return categoryFeeds.filter((item) => Boolean(item.url))
  }, [props.locale, props.category])

  return (
    <div className={styles.feed}>
      {feeds.map((item) => (
        <div key={props.locale + item.name} id={normalizeId(item.name)}>
          <figure
            style={{
              backgroundImage: 'url(/images/logos/' + normalizeId(item.name) + '.svg)',
            }}>
            <h3>{item.name}</h3>
          </figure>

          <CardFeedFetch locale={props.locale} category={props.category} name={item.name} />
        </div>
      ))}
    </div>
  )
}
