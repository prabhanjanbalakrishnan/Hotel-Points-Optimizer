import {
  PRESENCE_RANK,
  presenceFor,
  estimateCashValue,
  estimateNightsCovered,
} from './pointsLogic.js'

/**
 * Chains' redemption charts differ by property tier, so comparing "how far
 * does your balance go" across programs needs one fixed yardstick. Upscale is
 * the middle of the four buckets -- a typical leisure-trip hotel.
 */
export const REFERENCE_TIER = 'Upscale'

// A chain whose regionPresence has no entry for the matched region ranks
// after Limited -- same convention as rankChainsByPresence().
const NO_DATA_RANK = 3

/**
 * Condenses one membership into the handful of facts the summary compares.
 * `resolved` is resolveDestination()'s result and may be null (destination
 * didn't match anything); `nights` may be null (no dates entered).
 *
 * Presence comes from presenceFor(), the same lookup the ranking and the
 * result cards use, so the three can't disagree. Each chain is rated against
 * whichever region taxonomy it tracks, so `presenceRegion` is per-chain (a US
 * chain may be rated for "Europe" while an India chain, for the same
 * destination, is rated for "International").
 */
export function summarizeMembership({ chain, membership, resolved, nights, rooms }) {
  const found = presenceFor(chain, resolved)
  const presence = found?.level ?? null
  const summary = {
    membershipId: membership.id,
    chainId: chain.id,
    name: chain.name,
    currency: chain.currency,
    programType: chain.programType,
    tier: membership.tier,
    presence,
    presenceRegion: found
      ? found.region === 'International'
        ? 'markets outside India'
        : found.region
      : null,
    presenceRank: resolved ? (PRESENCE_RANK[presence] ?? NO_DATA_RANK) : null,
    hasBalance: Boolean(membership.balance && membership.balance > 0),
    nightsCovered: null, // {min, max} at REFERENCE_TIER, redemption-chart chains only
    fit: null, // 'covers' | 'maybe' | 'short' -- needs both a balance and trip dates
    cashValue: null, // major currency units, cashback chains only
  }

  if (!summary.hasBalance) return summary

  if (chain.programType === 'redemption-chart') {
    const range = chain.redemptionGuidance.pointsPerNightByTier[REFERENCE_TIER]
    summary.nightsCovered = estimateNightsCovered(membership.balance, range.min, range.max, rooms)
    if (nights) {
      if (summary.nightsCovered.min >= nights) summary.fit = 'covers'
      else if (summary.nightsCovered.max >= nights) summary.fit = 'maybe'
      else summary.fit = 'short'
    }
  } else if (chain.programType === 'cashback-currency') {
    summary.cashValue = estimateCashValue(
      membership.balance,
      membership.balance,
      chain.pointValuation.valuePerPoint,
    ).min
  }

  return summary
}

function coverageScore(summary) {
  return (summary.nightsCovered.min + summary.nightsCovered.max) / 2
}

/**
 * Picks the best-fit program(s) out of a trip's summaries, or null when there
 * isn't enough signal (fewer than two programs, or no region match and no
 * balances to separate them).
 *
 * Presence in the destination's region decides first -- a program with no
 * hotels near you can't be redeemed no matter how big the balance. Among
 * programs tied on presence, the bigger balance (in nights at REFERENCE_TIER)
 * breaks the tie. Anything still level is returned together as a tie rather
 * than arbitrarily crowning one.
 */
export function pickVerdict(summaries) {
  if (summaries.length < 2) return null

  const bestPresenceRank = Math.min(
    ...summaries.map((s) => (s.presenceRank === null ? Infinity : s.presenceRank)),
  )
  // Null means no region match; NO_DATA_RANK for everyone means the data has
  // nothing to say about this region. Either way presence can't separate them.
  const presenceDecides = bestPresenceRank !== Infinity && bestPresenceRank < NO_DATA_RANK

  const pool = presenceDecides
    ? summaries.filter((s) => s.presenceRank === bestPresenceRank)
    : summaries

  const scored = pool.filter((s) => s.nightsCovered && s.nightsCovered.max > 0)
  let winners = pool
  if (scored.length > 0) {
    const top = Math.max(...scored.map(coverageScore))
    winners = scored.filter((s) => coverageScore(s) === top)
  }

  // Nothing separated the programs at all: no presence signal, no balances.
  if (!presenceDecides && scored.length === 0) return null

  // Someone with a clearly bigger balance but weaker presence in this region
  // is worth a mention, so the verdict doesn't silently bury them.
  let balanceLeader = null
  const allScored = summaries.filter((s) => s.nightsCovered && s.nightsCovered.max > 0)
  if (allScored.length > 0) {
    const leader = allScored.reduce((a, b) => (coverageScore(b) > coverageScore(a) ? b : a))
    const winnerBest = scored.length > 0 ? coverageScore(winners[0]) : -1
    if (!winners.includes(leader) && coverageScore(leader) > winnerBest) balanceLeader = leader
  }

  return {
    winners,
    presenceDecided: presenceDecides,
    balanceDecided: scored.length > 0,
    balanceLeader,
  }
}
