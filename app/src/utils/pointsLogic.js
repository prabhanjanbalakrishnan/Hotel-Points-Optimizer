import { DESTINATION_KEYWORDS } from '../data/regionMapping.js'
import { PROPERTY_TIERS, NO_STATUS_TIER } from '../constants.js'

/** Dollar range a points range is worth, given a cents-per-point valuation. */
export function estimateCashValue(pointsMin, pointsMax, centsPerPoint) {
  return {
    min: Math.round((pointsMin * centsPerPoint) / 100),
    max: Math.round((pointsMax * centsPerPoint) / 100),
  }
}

/** Roughly how many nights a points balance covers at a given points-per-night range. */
export function estimateNightsCovered(balance, pointsMin, pointsMax) {
  if (!balance || balance <= 0) return null
  return {
    min: Math.floor(balance / pointsMax) || 0,
    max: Math.floor(balance / pointsMin),
  }
}

/** Returns the matching region for a free-text destination, or null if nothing matches. */
export function matchRegion(destinationText) {
  if (!destinationText || !destinationText.trim()) return null
  const text = destinationText.toLowerCase()
  for (const [region, keywords] of Object.entries(DESTINATION_KEYWORDS)) {
    if (keywords.some((kw) => text.includes(kw))) return region
  }
  return null
}

const PRESENCE_RANK = { Strong: 0, Growing: 1, Limited: 2 }

/**
 * Sorts a user's memberships by how strong their chain's presence is in the
 * matched region. Falls back to entry order (stable sort, no ranking) when
 * region is null.
 */
export function rankChainsByRegion(memberships, region, chains) {
  if (!region) return memberships
  const byId = Object.fromEntries(chains.map((c) => [c.id, c]))
  return [...memberships].sort((a, b) => {
    const rankA = PRESENCE_RANK[byId[a.chainId]?.regionPresence?.[region]] ?? 3
    const rankB = PRESENCE_RANK[byId[b.chainId]?.regionPresence?.[region]] ?? 3
    return rankA - rankB
  })
}

/** Looks up a named elite tier on a chain, or null for "No status"/unknown. */
export function getTier(chain, tierName) {
  if (!chain || !tierName || tierName === NO_STATUS_TIER) return null
  return chain.eliteTiers.find((t) => t.name === tierName) ?? null
}

export { PROPERTY_TIERS }
