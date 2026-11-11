import { DESTINATION_KEYWORDS } from '../data/regionMapping.js'
import { INDIA_DESTINATION_KEYWORDS } from '../data/regionMappingIndia.js'
import destinationsUS from '../data/destinations.json'
import destinationsIndia from '../data/destinationsIndia.json'
import destinationsInternational from '../data/destinationsInternational.json'
import { PROPERTY_TIERS, NO_STATUS_TIER, CURRENCY_LOCALES, CURRENCY_SYMBOLS } from '../constants.js'

/**
 * Major-currency-unit range a points range is worth, given a valuePerPoint
 * expressed in minor units (cents for USD, paise for INR -- both are
 * 1/100th of the major unit, so the same /100 math works for either).
 */
export function estimateCashValue(pointsMin, pointsMax, valuePerPoint) {
  return {
    min: Math.round((pointsMin * valuePerPoint) / 100),
    max: Math.round((pointsMax * valuePerPoint) / 100),
  }
}

/** Formats a major-currency-unit amount with the right symbol and digit grouping (e.g. ₹12,34,567 vs $1,234,567). */
export function formatCurrency(amount, currencyCode) {
  const symbol = CURRENCY_SYMBOLS[currencyCode] ?? '$'
  const locale = CURRENCY_LOCALES[currencyCode] ?? 'en-US'
  return `${symbol}${amount.toLocaleString(locale)}`
}

/** Roughly how many nights a points balance covers at a given points-per-night range. */
export function estimateNightsCovered(balance, pointsMin, pointsMax, rooms = 1) {
  if (!(balance > 0)) return null
  const perNightMin = pointsMin * rooms
  const perNightMax = pointsMax * rooms
  return {
    min: Math.floor(balance / perNightMax) || 0,
    max: Math.floor(balance / perNightMin),
  }
}

/** Whole nights between two yyyy-mm-dd date strings, or null if either is missing/invalid/non-positive. */
export function computeNights(checkIn, checkOut) {
  if (!checkIn || !checkOut) return null
  const inDate = new Date(`${checkIn}T00:00:00`)
  const outDate = new Date(`${checkOut}T00:00:00`)
  if (Number.isNaN(inDate.getTime()) || Number.isNaN(outDate.getTime())) return null
  const nights = Math.round((outDate - inDate) / (1000 * 60 * 60 * 24))
  return nights > 0 ? nights : null
}

/** Total trip cost (points and cash) for a points-per-night range across nights and rooms. */
export function estimateTripCost(pointsMin, pointsMax, valuePerPoint, nights, rooms) {
  const totalMin = pointsMin * nights * rooms
  const totalMax = pointsMax * nights * rooms
  return {
    points: { min: totalMin, max: totalMax },
    cash: estimateCashValue(totalMin, totalMax, valuePerPoint),
  }
}

// Every curated destination, tagged with whether it's in India -- an exact
// pick from the dropdown uses the region already stored on the destination
// rather than re-deriving it from keywords.
const LISTED_DESTINATIONS = [
  ...destinationsUS.destinations.map((d) => ({ ...d, inIndia: false })),
  ...destinationsIndia.destinations.map((d) => ({ ...d, inIndia: true })),
  ...destinationsInternational.destinations.map((d) => ({ ...d, inIndia: false })),
]

const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/**
 * Region whose keyword matches `text` as a whole word/phrase, preferring the
 * longest matching keyword ("south america" beats "america"). Whole-word
 * matching is what stops "uk" matching Phuket, "india" matching
 * Indianapolis, and "oman" matching Romania.
 */
function bestKeywordMatch(text, keywordMap, skipRegions = []) {
  let best = null
  let bestLength = 0
  for (const [region, keywords] of Object.entries(keywordMap)) {
    if (skipRegions.includes(region)) continue
    for (const kw of keywords) {
      if (kw.length <= bestLength) continue
      if (new RegExp(`\\b${escapeRegExp(kw)}\\b`).test(text)) {
        best = region
        bestLength = kw.length
      }
    }
  }
  return best
}

/**
 * Resolves a destination (picked from the list or free text) to BOTH region
 * taxonomies at once: `worldRegion` (Asia, Europe, ...) and, for places in
 * India, `indiaRegion` (West India, South India, ...). Chains carry presence
 * data in one taxonomy or the other (Radisson has both), so resolving both
 * and letting presenceFor() pick is what lets a US chain and an India chain
 * be ranked side by side for the same destination -- independent of the
 * user's Explore hometown. Returns null if nothing matches.
 */
export function resolveDestination(destinationText) {
  if (!destinationText || !destinationText.trim()) return null
  const text = destinationText.trim().toLowerCase()

  const listed = LISTED_DESTINATIONS.find((d) => d.name.toLowerCase() === text)
  if (listed) {
    return listed.inIndia
      ? { worldRegion: 'Asia', indiaRegion: listed.region, inIndia: true }
      : { worldRegion: listed.region, indiaRegion: null, inIndia: false }
  }

  // India map's "International" bucket is for Indian travelers going abroad,
  // not a place -- never match a destination into it.
  const indiaRegion = bestKeywordMatch(text, INDIA_DESTINATION_KEYWORDS, ['International'])
  const inIndia = Boolean(indiaRegion) || /\bindia\b/.test(text)
  const worldRegion = inIndia ? 'Asia' : bestKeywordMatch(text, DESTINATION_KEYWORDS)
  if (!worldRegion && !indiaRegion) return null
  return { worldRegion, indiaRegion, inIndia }
}

/**
 * A chain's presence at a resolved destination: its India-zone rating if the
 * destination is in India and the chain tracks that zone, else its
 * world-region rating, else (India-taxonomy chains abroad) its lump
 * "International" rating. Null when the chain has no data for it.
 */
export function presenceFor(chain, dest) {
  if (!chain || !dest) return null
  const rp = chain.regionPresence ?? {}
  if (dest.indiaRegion && rp[dest.indiaRegion]) return { region: dest.indiaRegion, level: rp[dest.indiaRegion] }
  if (dest.worldRegion && rp[dest.worldRegion]) return { region: dest.worldRegion, level: rp[dest.worldRegion] }
  if (!dest.inIndia && rp.International) return { region: 'International', level: rp.International }
  return null
}

export const PRESENCE_RANK = { Strong: 0, Growing: 1, Limited: 2 }

/**
 * Sorts a user's memberships by how strong their chain's presence is at the
 * resolved destination. Keeps entry order when the destination is null.
 */
export function rankChainsByPresence(memberships, dest, chains) {
  if (!dest) return memberships
  const byId = Object.fromEntries(chains.map((c) => [c.id, c]))
  const rank = (m) => PRESENCE_RANK[presenceFor(byId[m.chainId], dest)?.level] ?? 3
  return [...memberships].sort((a, b) => rank(a) - rank(b))
}

/** Looks up a named elite tier on a chain, or null for "No status"/unknown. */
export function getTier(chain, tierName) {
  if (!chain || !tierName || tierName === NO_STATUS_TIER) return null
  return chain.eliteTiers.find((t) => t.name === tierName) ?? null
}

export { PROPERTY_TIERS }
