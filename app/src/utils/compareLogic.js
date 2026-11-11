import { MAX_COMPARE } from '../constants.js'
import { resolveDestination } from './pointsLogic.js'
import { summarizeMembership, pickVerdict } from './verdictLogic.js'

const norm = (s) => (s ?? '').trim().toLowerCase()

/**
 * Whether `name` can be added as an extra destination to compare against the
 * main one: non-empty, not already there (case-insensitive, including the
 * main destination), and under the cap. `reason` says why not.
 */
export function canAddCompare(name, mainDestination, compareTo) {
  const n = norm(name)
  if (!n) return { ok: false, reason: 'empty' }
  if (compareTo.length >= MAX_COMPARE) return { ok: false, reason: 'full' }
  if (n === norm(mainDestination) || compareTo.some((c) => norm(c) === n)) {
    return { ok: false, reason: 'duplicate' }
  }
  return { ok: true, reason: null }
}

/**
 * The same per-program summary the Results page builds for one destination,
 * built for several: one entry per destination, each with a cell per
 * membership (in the user's own order, so rows stay put as destinations are
 * added) and that destination's best-fit verdict.
 *
 * `transfers` is keyed by membership id and does not depend on the
 * destination (card points convert the same everywhere), so one map serves
 * every column.
 *
 * Note what does and doesn't vary: this app's points-per-night ranges are
 * per chain, not per place, so across destinations only presence changes --
 * nights covered is identical in every column. The UI says so rather than
 * implying a destination-specific price.
 */
export function buildComparison({ destinations, memberships, chains, nights, rooms, transfers }) {
  const byId = Object.fromEntries(chains.map((c) => [c.id, c]))
  return destinations.map((name) => {
    const resolved = resolveDestination(name)
    const cells = memberships.map((m) =>
      summarizeMembership({
        chain: byId[m.chainId],
        membership: m,
        resolved,
        nights,
        rooms,
        transferPoints: transfers?.[m.id]?.total ?? 0,
      }),
    )
    return { name, resolved, cells, verdict: pickVerdict(cells) }
  })
}
