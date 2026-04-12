const STORAGE_KEY = 'javigg_recent_searches'
const MAX_SEARCHES = 10

export interface RecentSearch {
  gameName: string
  tagLine: string
}

export function getRecentSearches(): RecentSearch[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
  } catch {
    return []
  }
}

export function saveRecentSearch(gameName: string, tagLine: string): void {
  const current = getRecentSearches()
  const filtered = current.filter(
    s => !(s.gameName.toLowerCase() === gameName.toLowerCase() &&
           s.tagLine.toLowerCase() === tagLine.toLowerCase())
  )
  const updated = [{ gameName, tagLine }, ...filtered].slice(0, MAX_SEARCHES)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
}
