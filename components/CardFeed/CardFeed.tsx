'use client'

import styles from './CardFeed.module.css'
import CardFeedFetch from '../CardFeedFetch'
import { useEffect, useState, useMemo } from 'react'
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
const feedCache = new Map<string, IFeedFile[]>()

export default function Card(props: Readonly<Props>) {
  // Memoizar o carregamento do arquivo para evitar recálculos
  const feedData = useMemo(() => {
    const cacheKey = props.country
    if (!feedCache.has(cacheKey)) {
      feedCache.set(cacheKey, require('../../locales/feeds/' + props.country + '.json'))
    }
    return feedCache.get(cacheKey) || {}
  }, [props.country])

  // random
  const [feeds, setFeeds] = useState<IFeedFile[]>([])

  //   console.log('LAYOUT CARD MOUNTED', props.category)

  useEffect(() => {
    // random disabled
    // .sort(() => Math.random() - 0.5)
    setFeeds(feedData[props.category] || [])
  }, [feedData, props.category])

  return (
    <div className={styles.feed}>
      {feeds.map((item, index) => (
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
