import { notFound } from 'next/navigation'
import { getLocale } from 'next-intl/server'
import CardFeed from '@/components/CardFeed/CardFeed'
import SectionFeed from '@/components/SectionFeed/SectionFeed'
import WidgetVideoStories from '@/components/WidgetVideoStories'
import { categories, isCategory } from '@/constants/categories'

interface CategoryPageProps {
  params: Promise<{ category: string }>
}

export default async function CategoryPage({ params }: Readonly<CategoryPageProps>) {
  const locale = await getLocale()
  const { category } = await params

  if (!isCategory(category)) {
    notFound()
  }

  return (
    <div id="home">
      <SectionFeed id={category}>
        <WidgetVideoStories locale={locale} category={category} />
        <CardFeed locale={locale} category={category} />
      </SectionFeed>
    </div>
  )
}

export function generateStaticParams() {
  return categories.map((category) => ({ category }))
}
