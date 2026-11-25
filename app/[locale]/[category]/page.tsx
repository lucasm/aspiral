import { notFound } from 'next/navigation'
import { Metadata } from 'next/types'

import Banner from '@/components/Banner'
import CardFeed from '@/components/CardFeed/CardFeed'
import Search from '@/components/Search'
import WidgetCategories from '@/components/WidgetCategories'
import WidgetTrends from '@/components/WidgetTrends'
import WidgetVideoStories from '@/components/WidgetVideoStories'
import { ISearchCategory } from '@/interfaces/search'
import AppLayout from '@/layouts/AppLayout'
import { getLocaleData } from '@/utils/getLocaleData'

interface PageParams {
  locale: string
  category: string
}

interface PageProps {
  params: Promise<PageParams>
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params
  const data = await getLocaleData(params.locale)
  const selectedCategory = data?.categories?.find(
    (category: ISearchCategory) =>
      category?.name.toLowerCase() === params.category.toLowerCase()
  )

  const categoryTitle =
    selectedCategory?.name_seo ||
    selectedCategory?.name_translated ||
    selectedCategory?.name ||
    'Aspiral'

  const categoryDescription =
    selectedCategory?.description ||
    `Search decentralized on ${categoryTitle} with the best sources available.`

  return {
    title: {
      absolute: `Aspiral ${categoryTitle}`,
    },
    description: categoryDescription,
  }
}

export default async function Page(props: PageProps) {
  const params = await props.params
  const data = await getLocaleData(params.locale)
  const selectedCategory = data?.categories?.find(
    (category: ISearchCategory) =>
      category?.name.toLowerCase() === params.category.toLowerCase()
  )

  if (!selectedCategory) {
    notFound()
  }

  const showTrendsFirst = ['home', 'web', 'ai', 'academic', 'social'].includes(
    selectedCategory.name.toLowerCase()
  )

  return (
    <AppLayout locale={params.locale} category={selectedCategory}>
      <Search selectedCategory={selectedCategory} />

      {showTrendsFirst && <WidgetTrends title={selectedCategory.name_trends} />}

      {selectedCategory && (
        <WidgetVideoStories
          locale={params.locale}
          category={selectedCategory}
        />
      )}

      <CardFeed locale={params.locale} category={selectedCategory} />

      {!showTrendsFirst && (
        <WidgetTrends title={selectedCategory.name_trends} />
      )}

      <WidgetCategories />

      <Banner />
    </AppLayout>
  )
}
