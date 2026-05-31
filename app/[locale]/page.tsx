import { getLocale } from 'next-intl/server'
import CardFeed from '@/components/CardFeed/CardFeed'
import SectionFeed from '@/components/SectionFeed/SectionFeed'

export default async function HomePage() {
  const locale = await getLocale()

  return (
    <div id="home">
      <SectionFeed id="news">
        <CardFeed locale={locale} category="news" />
      </SectionFeed>
    </div>
  )
}
