import { useTranslations } from 'next-intl'

import BannerAnimateCircleNav from '@/components/BannerAnimateCircleNav'
import BannerAnimatePressMe from '@/components/BannerAnimatePressMe'
import BannerAnimateText from '@/components/BannerAnimateText'
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
          <Link href="#more">
            <figure className={Style.icon}>
              <SvgLogo />
            </figure>
          </Link>
          <h1>{t('metadata.title')}</h1>
          <p>{t('metadata.description')}</p>
        </div>
      </section>

      <section id="more">
        <div className={Style.container}>
          <div className={Style.cardDuos}>
            <article>
              <BannerAnimateCircleNav />
              <div>
                <h2>Choose your source</h2>
                <p>
                  Aspiral is a search portal for Web content and AI. Compare
                  multiple trusted sources at once and take control of the
                  search algorithms and AI models you use.
                </p>
              </div>
            </article>

            <article>
              <BannerAnimateText />
              <div>
                <h2>Transparency of search</h2>
                <p>
                  Every search leaves a trace in datacenters. With Aspiral, you
                  can check the estimated levels of privacy, security, and
                  carbon footprint of each source. Make safer choices for
                  yourself and contribute to protecting Planet Earth.
                </p>
              </div>
            </article>

            <article>
              <BannerAnimatePressMe />
              <div>
                <h2>Open source project</h2>
                <p>
                  Aspiral is an open source project. We are building a universal
                  search experience based on trusted sources, where diversity is
                  key and people remain in control every step of the way. Join
                  us, contribute, and help create a better search experience for
                  everyone.
                </p>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className={Style.colorfulBackground}>
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
