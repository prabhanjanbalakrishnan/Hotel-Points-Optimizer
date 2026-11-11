const normalize = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()

/**
 * Exact (case/punctuation-insensitive) match on a card's name or aliases --
 * deliberately not fuzzy. "Amex Platinum" and "American Express Platinum
 * Travel Card (India)" are different cards with different transfer partners,
 * so a "close enough" match would silently show the wrong card's notes.
 * An unrecognized string just returns null and the Results page says so.
 */
export function findCard(typed, cards) {
  const q = normalize(typed ?? '')
  if (!q) return null
  return (
    cards.find(
      (c) => normalize(c.name) === q || (c.aliases ?? []).some((a) => normalize(a) === q),
    ) ?? null
  )
}

export function cardLinksFor(card, chainId) {
  return card ? card.chainLinks.filter((l) => l.chainId === chainId) : []
}

const pointWord = (n) => (n === 1 ? 'point' : 'points')

function ratioText(link, chainName) {
  if (link.from === link.to) return '1:1'
  return `${link.from}:${link.to} (${link.from} ${pointWord(link.from)} = ${link.to} ${chainName} ${pointWord(link.to)})`
}

/** One displayable note for a card->chain link: `{ kind, text, caveat }`. */
export function describeLink(card, link, chain) {
  let text
  if (link.kind === 'transfers') {
    text = `${card.name}'s points transfer to ${chain.name} at ${ratioText(link, chain.name)}`
  } else if (link.kind === 'status') {
    text = `${card.name} comes with ${link.status} status at ${chain.name}`
  } else {
    text = link.detail
      ? `${card.name} ${link.detail}`
      : `${card.name} earns ${chain.name} points directly`
  }
  return { kind: link.kind, text, caveat: link.caveat ?? null }
}

// --- Bank/card points that can be transferred into a hotel program --------

const hasTransfers = (card) => card.chainLinks.some((l) => l.kind === 'transfers')

/**
 * Cards whose points the user can hold a balance in and move to a hotel
 * program: they have a points currency name and at least one transfer link.
 * Cards with no transfers (or only co-brand earning) have nothing to convert.
 */
export function transferCards(cards) {
  return cards.filter((c) => c.pointsName && hasTransfers(c))
}

/**
 * Cards of the same issuer and points currency share ONE pool of points (an
 * Amex Platinum and an Amex Gold both earn Membership Rewards), so a balance
 * entered on both would be counted twice.
 */
export const poolKey = (card) => `${card.issuer}|${card.pointsName}`

/** "1:2" -- card points : hotel points, same convention as the data. */
export const ratioLabel = (link) => `${link.from}:${link.to}`

/**
 * What the user's bank/card points become in one hotel program, if they
 * transferred them all there: `{ sources, total }`. `sources` has one entry
 * per card balance that has a transfer link to this chain.
 *
 * Each card's own ratio is used (HDFC's differ by card), and the result is
 * floored because partial hotel points don't exist. Callers must treat the
 * total as a per-program "if you move everything here" figure: the same bank
 * points can't also be spent on another program.
 */
export function transferIn(chainId, bankPoints, cards) {
  const sources = []
  for (const row of bankPoints) {
    if (!(row.balance > 0)) continue
    const card = cards.find((c) => c.id === row.cardId)
    const link = card?.chainLinks.find((l) => l.kind === 'transfers' && l.chainId === chainId)
    if (!link) continue
    const points = Math.floor((row.balance * link.to) / link.from)
    if (points < 1) continue
    sources.push({
      rowId: row.id,
      cardName: card.name,
      pointsName: card.pointsName,
      balance: row.balance,
      ratio: ratioLabel(link),
      points,
      caveat: link.caveat ?? null,
    })
  }
  return { sources, total: sources.reduce((sum, s) => sum + s.points, 0) }
}
