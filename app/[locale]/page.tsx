import Banner from '@/components/Banner'
import CardFeed from '@/components/CardFeed/CardFeed'
import Search from '@/components/Search'
import WidgetCategories from '@/components/WidgetCategories'
import WidgetTrends from '@/components/WidgetTrends'
import WidgetVideoStories from '@/components/WidgetVideoStories'
import AppLayout from '@/layouts/AppLayout'
import { getLocaleData } from '@/utils/getLocaleData'

export default async function Page(props: {
  params: Promise<{ locale: string }>
}) {
  const params = await props.params
  const { locale } = params
  const data = await getLocaleData(locale)

  const selectedCategory = data?.categories?.find(
    (category: { name: string }) => category?.name.toLowerCase() === 'home'
  )

  return (
    <AppLayout locale={locale} category={selectedCategory}>
      <Search selectedCategory={selectedCategory} />
      <WidgetTrends title={selectedCategory?.name_trends} />
      {selectedCategory && (
        <WidgetVideoStories locale={locale} category={selectedCategory} />
      )}
      <CardFeed locale={locale} category={selectedCategory} />
      <WidgetCategories />
      <Banner />
    </AppLayout>
  )
}
