const SEARCH_HISTORY_KEY = 'searchHistory'
const SEARCH_HISTORY_LIMIT = 10

export function getSearchHistory(): string[] {
  const savedHistory = window.localStorage.getItem(SEARCH_HISTORY_KEY)
  if (!savedHistory) return []

  try {
    const history: unknown = JSON.parse(savedHistory)
    if (!Array.isArray(history)) return []

    return history.filter(
      (item): item is string => typeof item === 'string' && item.trim() !== ''
    )
  } catch (error) {
    console.error('Failed to parse saved search history:', error)
    return []
  }
}

export function addSearchHistory(search: string): void {
  const query = search.trim()
  if (!query) return

  const history = getSearchHistory().filter((item) => item !== query)
  window.localStorage.setItem(
    SEARCH_HISTORY_KEY,
    JSON.stringify([query, ...history].slice(0, SEARCH_HISTORY_LIMIT))
  )
}

export function clearSearchHistory(): void {
  window.localStorage.removeItem(SEARCH_HISTORY_KEY)
}
