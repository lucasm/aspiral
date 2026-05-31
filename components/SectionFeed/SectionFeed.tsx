import { ReactNode } from 'react'
import { useTranslations } from 'next-intl'
import styles from './SectionFeed.module.css'

interface SectionFeedProps {
  id: string
  children: ReactNode
}

export default function SectionFeed({ id, children }: SectionFeedProps) {
  const t = useTranslations()

  return (
    <section id={id}>
      <div className={styles.container}>
        <h1>{t(id)}</h1>
        {children}
      </div>
    </section>
  )
}
