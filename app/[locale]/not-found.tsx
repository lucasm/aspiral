import type { Metadata } from 'next'
import { getLocale, getTranslations } from 'next-intl/server'

import ButtonStyle from '@/components/Button/Button.module.css'
import DocumentTitle from '@/components/DocumentTitle'
import WebsiteLayout from '@/layouts/WebsiteLayout'
import Style from '@/layouts/WebsiteLayout/WebsiteLayout.module.css'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('t.notFound')

  return {
    title: {
      absolute: `Aspiral — ${t('title')}`,
    },
  }
}

export default async function NotFound() {
  const locale = await getLocale()
  const t = await getTranslations('t.notFound')

  return (
    <WebsiteLayout>
      <DocumentTitle title={`Aspiral — ${t('title')}`} />
      <section>
        <div className={Style.container}>
          <h1>{t('title')}</h1>
          <br />
          <a
            href={`/${locale}`}
            className={`${ButtonStyle.button} ${ButtonStyle.black} ${ButtonStyle.medium}`}>
            {t('home')}
          </a>
        </div>
      </section>
    </WebsiteLayout>
  )
}
