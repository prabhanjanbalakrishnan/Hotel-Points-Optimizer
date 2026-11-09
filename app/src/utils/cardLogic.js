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
