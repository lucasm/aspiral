import CookiesPopup from '@/components/CookiesPopup'
import Footer from '@/components/Footer'
import Header from '@/components/Header'
import { CookiesConsentContextProvider } from '@/contexts/CookiesConsentContext'
import { SearchContextProvider } from '@/contexts/SearchContext'
import { ISearchCategory } from '@/interfaces/search'

export default async function AppLayout({
  children,
  locale,
  category,
}: Readonly<{
  children: React.ReactNode
  locale: string
  category: ISearchCategory
}>) {
  return (
    <CookiesConsentContextProvider>
      <SearchContextProvider>
        <div>
          <Header locale={locale} category={category} />
          <main>{children}</main>
          <Footer />
          <CookiesPopup />
        </div>
      </SearchContextProvider>
    </CookiesConsentContextProvider>
  )
}
