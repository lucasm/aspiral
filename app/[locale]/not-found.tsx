import { getLocale, getTranslations } from 'next-intl/server'

import ButtonStyle from '@/components/Button/Button.module.css'
import WebsiteLayout from '@/layouts/WebsiteLayout'
import Style from '@/layouts/WebsiteLayout/WebsiteLayout.module.css'

export default async function NotFound() {
  const locale = await getLocale()
  const t = await getTranslations('t.notFound')

  return (
    <WebsiteLayout>
      <section>
        <div className={Style.container}>
          <h1>{t('title')}</h1>
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
