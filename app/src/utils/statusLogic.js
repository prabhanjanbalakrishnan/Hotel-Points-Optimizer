/**
 * Elite-status tiers are stored with a human-readable `qualification` string
 * ("25 nights/yr", "15 nights/yr (estimate)", "100 nights/yr + $23,000
 * qualifying spend"). Rather than duplicate those as a second set of numbers
 * that could drift, the night count is parsed straight out of that string, so
 * the tracker can only ever say what the data already says. Tiers whose
 * qualification isn't nights-based ("Enrollment only", Oberoi's internal
 * algorithm) don't parse and are simply not trackable.
 */
const NIGHTS_PATTERN = /^(\d+)\s+nights\/yr\b(.*)$/i

/** Trackable tiers for a chain, lowest to highest: `{name, nights, estimate, extra, perks}`. */
export function tierThresholds(chain) {
  return (chain?.eliteTiers ?? [])
    .map((t) => {
      const m = NIGHTS_PATTERN.exec(t.qualification ?? '')
      if (!m) return null
      const rest = m[2]
      return {
        name: t.name,
        nights: Number(m[1]),
        estimate: /\(estimate\)/i.test(rest),
        // Anything beyond the night count (e.g. "+ $23,000 qualifying spend").
        extra: /\+/.test(rest),
        perks: t.perks ?? [],
      }
    })
    .filter(Boolean)
    .sort((a, b) => a.nights - b.nights)
}

/**
 * Where a member stands against a chain's night-based tiers.
 *
 * `nightsSoFar` is what the user typed ("nights stayed this year"); null means
 * they didn't say, so there's nothing to track and this returns null. 0 is a
 * real answer. `tripNights` is the planned stay (null when no dates).
 *
 * Counts nights, not rooms: programs differ on whether extra rooms count, so
 * this assumes one qualifying room per night.
 */
export function statusProgress({ chain, nightsSoFar, tripNights }) {
  if (nightsSoFar === null || nightsSoFar === undefined) return null
  const tiers = tierThresholds(chain)
  if (tiers.length === 0) return null

  const reached = [...tiers].reverse().find((t) => t.nights <= nightsSoFar) ?? null
  const next = tiers.find((t) => t.nights > nightsSoFar) ?? null
  const afterTrip = nightsSoFar + (tripNights ?? 0)

  return {
    reached,
    next,
    top: tiers[tiers.length - 1],
    toGo: next ? next.nights - nightsSoFar : 0,
    afterTrip,
    // Whether this trip alone reaches the next tier (null when there are no dates).
    tripGetsThere: next && tripNights ? afterTrip >= next.nights : null,
    shortAfterTrip: next ? Math.max(0, next.nights - afterTrip) : 0,
  }
}
