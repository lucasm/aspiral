import { useTranslations } from 'next-intl'

import Button from '@/components/Button'
import CardsFeat from '@/components/CardsFeat'
import SvgLogo from '@/components/SvgLogo'
import { Link } from '@/i18n/routing'
import WebsiteLayout from '@/layouts/WebsiteLayout'
import Style from '@/layouts/WebsiteLayout/WebsiteLayout.module.css'

export const metadata = {
  title: 'About',
  description:
    'Aspiral is a search portal for Web content and AI, based on trusted sources.',
}

export default function PageAbout() {
  const t = useTranslations('t')

  return (
    <WebsiteLayout>
      <section>
        <div className={Style.container}>
          <Link href="#features">
            <figure className={Style.icon}>
              <SvgLogo />
            </figure>
          </Link>
          <h1>{t('metadata.title')}</h1>
          <p>{t('metadata.description')}</p>
        </div>
      </section>

      <section id="features" className={Style.colorfulBackground}>
        <div className={Style.container}>
          <CardsFeat />
        </div>
      </section>

      <section>
        <div className={Style.container}>
          <div className={Style.actionContainer}>
            <h2>Aspiral is free for everyone</h2>
            <p>Search. Discover. For people.</p>
            <Button url="/" color="black" size="big">
              {t('openApp')}
            </Button>
          </div>
        </div>
      </section>
    </WebsiteLayout>
  )
}
