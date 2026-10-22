import { normalizeRegion } from './regions'

const STORAGE_KEY = 'javigg_recent_searches'
const MAX_SEARCHES = 10

export interface RecentSearch {
  gameName: string
  tagLine: string
  region: string
}

export function getRecentSearches(): RecentSearch[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    // Entries saved before region support don't have a `region` field; treat them as NA1.
    return parsed.map((s: Partial<RecentSearch>) => ({
      gameName: s.gameName ?? '',
      tagLine: s.tagLine ?? '',
      region: normalizeRegion(s.region),
    }))
  } catch {
    return []
  }
}

export function saveRecentSearch(gameName: string, tagLine: string, region: string): void {
  const current = getRecentSearches()
  const filtered = current.filter(
    s => !(s.gameName.toLowerCase() === gameName.toLowerCase() &&
           s.tagLine.toLowerCase() === tagLine.toLowerCase() &&
           s.region === region)
  )
  const updated = [{ gameName, tagLine, region }, ...filtered].slice(0, MAX_SEARCHES)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
}
