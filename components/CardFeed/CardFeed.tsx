'use client'

import styles from './CardFeed.module.css'
import CardFeedFetch from '../CardFeedFetch'
import { useMemo } from 'react'
import { normalizeId } from '@/utils/normalizeId'

type Props = {
  readonly country: string
  readonly category: string
}

interface IFeedFile {
  name: string
  url: string
}

// Cache global para feeds carregados
const feedCache = new Map<string, Record<string, IFeedFile[]>>()

export default function Card(props: Readonly<Props>) {
  const feeds = useMemo<IFeedFile[]>(() => {
    if (!feedCache.has(props.country)) {
      feedCache.set(props.country, require('../../locales/feeds/' + props.country + '.json'))
    }
    return feedCache.get(props.country)![props.category] ?? []
  }, [props.country, props.category])

  return (
    <div className={styles.feed}>
      {feeds.map((item) => (
        <div key={props.country + item.name} id={normalizeId(item.name)}>
          <figure
            style={{
              backgroundImage: 'url(/images/logos/' + normalizeId(item.name) + '.svg)',
            }}>
            <h3>{item.name}</h3>
          </figure>

          <CardFeedFetch country={props.country} category={props.category} name={item.name} />
        </div>
      ))}
    </div>
  )
}
