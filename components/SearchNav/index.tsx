import { ISearchCategory } from '@/interfaces/search'
import { Link } from '@/i18n/routing'
import { normalizeId } from '@/utils/formats'
import { getCategoryIcon } from '@/utils/handleCategoryIcon'

import Style from './SearchNav.module.css'

interface Props {
  data: { categories: ISearchCategory[] }
  variant?: 'vertical' | 'cards'
  selectedCategory?: ISearchCategory
}

const SearchNav = ({ data, variant, selectedCategory }: Props) => {
  const navClass = `${Style.nav} ${variant && Style[variant]}`

  const hasActiveClass = (categoryName: string) => {
    return selectedCategory?.name === categoryName && variant !== 'cards'
  }

  return (
    <div className={navClass}>
      <ul>
        {data.categories?.map(
          (category, index) =>
            category?.active === true && (
              <li key={index}>
                <Link
                  className={hasActiveClass(category?.name) ? Style.active : ''}
                  href={'/' + normalizeId(category?.name)}>
                  <figure>
                    {(() => {
                      const IconComponent = getCategoryIcon(category?.name)
                      return <IconComponent />
                    })()}
                  </figure>
                  <span>{category?.name_translated || category?.name}</span>
                </Link>
              </li>
            )
        )}
      </ul>
    </div>
  )
}

export default SearchNav
