'use client'

import styles from './CardFeed.module.css'
import CardFeedFetch from '@/components/CardFeedFetch'
import { useMemo } from 'react'
import { normalizeId } from '@/utils/formats'
import type { ISearchCategory } from '@/interfaces/search'

type Props = {
  readonly locale: string
  readonly category?: ISearchCategory
}

export default function Card(props: Readonly<Props>) {
  const category = props.category
  const feeds = useMemo(
    () => category?.data.filter((item) => Boolean(item.rssUrl?.trim())) ?? [],
    [category]
  )

  return (
    <div className={styles.feed}>
      {category &&
        feeds.map((item) => (
          <div key={props.locale + item.name} id={normalizeId(item.name)}>
            <figure
              style={{
                backgroundImage:
                  'url(/images/logos/' + normalizeId(item.name) + '.svg)',
              }}>
              <h3>{item.name}</h3>
            </figure>

            <CardFeedFetch
              locale={props.locale}
              category={category.name}
              name={item.name}
            />
          </div>
        ))}
    </div>
  )
}
