import { summarizeMembership, pickVerdict } from './verdictLogic.js'
import { transferIn } from './cardLogic.js'

const coverage = (summary) =>
  summary.nightsCovered ? (summary.nightsCovered.min + summary.nightsCovered.max) / 2 : -1

/**
 * "Where should this card's points go?" -- one entry per card balance the user
 * entered, each listing the programs they belong to that the card can transfer
 * into, best first.
 *
 * Every option is evaluated with ONLY that card's points moved there (plus the
 * program's own balance), through the same summarizeMembership() the Results
 * summary uses, and ranked with the same rules as the verdict: presence at the
 * destination first, then how far the balance goes at the reference tier.
 * `best` marks the winner(s) via pickVerdict(), so a tie is shown as a tie.
 *
 * Like everywhere else, each option assumes the user moves *all* of the card's
 * points to that one program; splitting a balance across programs is an
 * allocation problem this app deliberately doesn't try to solve.
 *
 * Only programs the user has added are options. `otherChains` names the ones
 * the card also reaches that they haven't, so the UI can say so in a line
 * without ranking programs they don't hold.
 */
export function buildPooling({ bankPoints, cards, memberships, chains, resolved, nights, rooms }) {
  const chainsById = Object.fromEntries(chains.map((c) => [c.id, c]))
  const addedChainIds = new Set(memberships.map((m) => m.chainId))
  const entries = []

  for (const row of bankPoints) {
    if (!(row.balance > 0)) continue
    const card = cards.find((c) => c.id === row.cardId)
    if (!card) continue

    const options = []
    for (const membership of memberships) {
      const chain = chainsById[membership.chainId]
      const { sources } = transferIn(membership.chainId, [row], cards)
      if (!chain || sources.length === 0) continue
      const summary = summarizeMembership({
        chain,
        membership,
        resolved,
        nights,
        rooms,
        transferPoints: sources[0].points,
      })
      options.push({
        membershipId: membership.id,
        chainId: chain.id,
        name: chain.name,
        currency: chain.currency,
        source: sources[0],
        ownBalance: membership.balance > 0 ? membership.balance : 0,
        summary,
      })
    }

    // Same order as the verdict: stronger presence first, then the bigger
    // balance. Array.sort is stable, so ties keep the user's program order.
    options.sort(
      (a, b) =>
        (a.summary.presenceRank ?? 0) - (b.summary.presenceRank ?? 0) ||
        coverage(b.summary) - coverage(a.summary),
    )

    const verdict = pickVerdict(options.map((o) => o.summary))
    const bestIds = new Set(verdict ? verdict.winners.map((w) => w.membershipId) : [])

    entries.push({
      rowId: row.id,
      cardName: card.name,
      pointsName: card.pointsName,
      balance: row.balance,
      options: options.map((o) => ({ ...o, isBest: bestIds.has(o.membershipId) })),
      otherChains: card.chainLinks
        .filter((l) => l.kind === 'transfers' && !addedChainIds.has(l.chainId))
        .map((l) => chainsById[l.chainId]?.name)
        .filter(Boolean),
    })
  }
  return entries
}
