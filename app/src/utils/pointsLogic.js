import { DESTINATION_KEYWORDS } from '../data/regionMapping.js'
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
  if (!balance || balance <= 0) return null
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

/**
 * Returns the matching region for a free-text destination, or null if
 * nothing matches. `keywordMap` defaults to the US world-region map, but
 * India mode passes its own India-region map (see regionMappingIndia.js) --
 * same shape, different taxonomy.
 */
export function matchRegion(destinationText, keywordMap = DESTINATION_KEYWORDS) {
  if (!destinationText || !destinationText.trim()) return null
  const text = destinationText.toLowerCase()
  for (const [region, keywords] of Object.entries(keywordMap)) {
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
