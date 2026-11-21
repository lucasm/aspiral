import { normalizeId } from '@/utils/formats'

const LEGACY_SEARCH_KEY = 'search'
const LEGACY_CATEGORY_KEY = 'searchCategory'
const SEARCH_SOURCE_KEY_PREFIX = 'search:'

function getStorageKey(categoryName: string) {
  return `${SEARCH_SOURCE_KEY_PREFIX}${normalizeId(categoryName)}`
}

function migrateLegacyPreference() {
  const categoryName = window.localStorage.getItem(LEGACY_CATEGORY_KEY)
  const sourceId = window.localStorage.getItem(LEGACY_SEARCH_KEY)

  if (!categoryName || !sourceId) return

  const storageKey = getStorageKey(categoryName)

  if (window.localStorage.getItem(storageKey) === null) {
    window.localStorage.setItem(storageKey, sourceId)
  }

  window.localStorage.removeItem(LEGACY_SEARCH_KEY)
  window.localStorage.removeItem(LEGACY_CATEGORY_KEY)
}

export function getSearchSourcePreference(categoryName: string) {
  migrateLegacyPreference()
  return window.localStorage.getItem(getStorageKey(categoryName))
}

export function saveSearchSourcePreference(
  categoryName: string,
  sourceId: string
) {
  window.localStorage.setItem(getStorageKey(categoryName), sourceId)
}

export function clearSearchSourcePreferences() {
  const storage = window.localStorage
  const keys = Array.from({ length: storage.length }, (_, index) =>
    storage.key(index)
  )

  keys.forEach((key) => {
    if (
      key === LEGACY_SEARCH_KEY ||
      key === LEGACY_CATEGORY_KEY ||
      key?.startsWith(SEARCH_SOURCE_KEY_PREFIX)
    ) {
      storage.removeItem(key)
    }
  })
}
