// Riot doesn't publish these through Data Dragon the way it does champion/item art. Every
// third-party LoL stats site sources tier emblems from Community Dragon instead, a community-run
// mirror of Riot's actual game files (not an official CDN, but the real assets).
const RANKED_EMBLEM_BASE =
  'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default'

const KNOWN_TIERS = new Set([
  'IRON', 'BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'EMERALD',
  'DIAMOND', 'MASTER', 'GRANDMASTER', 'CHALLENGER',
])

export function getRankEmblemUrl(tier: string | null | undefined): string {
  const upper = (tier ?? '').toUpperCase()
  if (!KNOWN_TIERS.has(upper)) return `${RANKED_EMBLEM_BASE}/unranked-emblem.png`
  return `${RANKED_EMBLEM_BASE}/ranked-emblem/emblem-${upper.toLowerCase()}.png`
}
