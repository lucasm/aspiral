import { useTranslations } from 'next-intl'

import Button from '@/components/Button'

import Styles from './Banner.module.css'

export default function Banner() {
  const t = useTranslations('t')

  return (
    <section className={Styles.container}>
      <div className={Styles.containerBanner}>
        <div>
          <h3>{t('metadata.title')}</h3>
          <p>{t('metadata.description')}</p>
        </div>

        <div className={Styles.buttonsContainer}>
          <Button url="/about" color="black" size="medium">
            <>{t('about')}</>
          </Button>

          <Button url="/contribute" color="black" size="medium">
            <>{t('contribute')}</>
          </Button>
        </div>
      </div>
    </section>
  )
}
