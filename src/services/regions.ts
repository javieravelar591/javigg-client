// Mirrors the backend's riot/Region.java. Keep in sync if that enum changes.
export interface RegionOption {
  code: string
  label: string
}

export const REGIONS: RegionOption[] = [
  { code: 'NA1', label: 'NA' },
  { code: 'BR1', label: 'BR' },
  { code: 'LA1', label: 'LAN' },
  { code: 'LA2', label: 'LAS' },
  { code: 'EUW1', label: 'EUW' },
  { code: 'EUN1', label: 'EUNE' },
  { code: 'TR1', label: 'TR' },
  { code: 'RU', label: 'RU' },
  { code: 'KR', label: 'KR' },
  { code: 'JP1', label: 'JP' },
  { code: 'OC1', label: 'OCE' },
  { code: 'SG2', label: 'SG' },
  { code: 'TW2', label: 'TW' },
  { code: 'VN2', label: 'VN' },
  { code: 'PH2', label: 'PH' },
  { code: 'TH2', label: 'TH' },
]

const DEFAULT_REGION = 'NA1'

// Timezone offsets are a rough stand-in for "the user's current region" (issue #1's AC3) with no
// permission prompt. It's a best-effort guess, not a geolocation lookup; an unmatched or
// unavailable timezone falls back to NA1.
const TIMEZONE_REGION: Record<string, string> = {
  'Asia/Seoul': 'KR',
  'Asia/Tokyo': 'JP1',
  'Asia/Singapore': 'SG2',
  'Asia/Taipei': 'TW2',
  'Asia/Ho_Chi_Minh': 'VN2',
  'Asia/Manila': 'PH2',
  'Asia/Bangkok': 'TH2',
  'Europe/Istanbul': 'TR1',
  'Europe/Moscow': 'RU',
  'Australia/Sydney': 'OC1',
  'Australia/Melbourne': 'OC1',
  'Australia/Brisbane': 'OC1',
  'America/Sao_Paulo': 'BR1',
  'America/Mexico_City': 'LA1',
  'America/Bogota': 'LA1',
  'America/Santiago': 'LA2',
  'America/Argentina/Buenos_Aires': 'LA2',
  'America/Lima': 'LA2',
}

const EUROPE_WEST_TIMEZONES = new Set([
  'Europe/London', 'Europe/Dublin', 'Europe/Paris', 'Europe/Berlin', 'Europe/Madrid',
  'Europe/Rome', 'Europe/Amsterdam', 'Europe/Brussels', 'Europe/Lisbon', 'Europe/Vienna',
  'Europe/Zurich', 'Europe/Copenhagen', 'Europe/Oslo', 'Europe/Stockholm',
])

const EUROPE_EAST_TIMEZONES = new Set([
  'Europe/Warsaw', 'Europe/Prague', 'Europe/Budapest', 'Europe/Bucharest', 'Europe/Sofia',
  'Europe/Athens', 'Europe/Helsinki', 'Europe/Kiev', 'Europe/Riga', 'Europe/Vilnius',
  'Europe/Tallinn',
])

function isValidRegionCode(code: string): boolean {
  return REGIONS.some(r => r.code === code)
}

export function guessRegion(): string {
  try {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
    if (TIMEZONE_REGION[timeZone]) return TIMEZONE_REGION[timeZone]
    if (EUROPE_WEST_TIMEZONES.has(timeZone)) return 'EUW1'
    if (EUROPE_EAST_TIMEZONES.has(timeZone)) return 'EUN1'
  } catch {
    // Intl can throw in some locked-down environments; fall through to the default.
  }
  return DEFAULT_REGION
}

export function normalizeRegion(code: string | null | undefined): string {
  if (code && isValidRegionCode(code.toUpperCase())) return code.toUpperCase()
  return DEFAULT_REGION
}
