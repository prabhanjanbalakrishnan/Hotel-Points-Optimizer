import creditCards from '../data/creditCards.json'
import { transferCards, poolKey } from '../utils/cardLogic.js'
import parseBalance from '../utils/parseBalance.js'
import './BankPointsSection.css'

const CARDS = transferCards(creditCards.cards)
const GROUPS = [
  { key: 'US', label: 'US cards' },
  { key: 'India', label: 'Indian cards' },
]

export default function BankPointsSection({ bankPoints, onAdd, onChange, onRemove }) {
  const takenIds = bankPoints.map((b) => b.cardId)
  const nextCard = CARDS.find((c) => !takenIds.includes(c.id))

  // Two cards from one points pool (Amex Platinum + Gold, Sapphire Preferred +
  // Reserve) hold the same points, so a balance on both would be double-counted.
  const poolMembers = {}
  for (const b of bankPoints) {
    const card = CARDS.find((c) => c.id === b.cardId)
    if (!card) continue
    ;(poolMembers[poolKey(card)] ??= { pointsName: card.pointsName, cards: [] }).cards.push(card.name)
  }
  const sharedPools = Object.values(poolMembers).filter((p) => p.cards.length > 1)

  return (
    <section className="bank-points" aria-labelledby="bank-points-heading">
      <h3 id="bank-points-heading">
        Points on a bank or credit card <span>(optional)</span>
      </h3>
      <p className="bank-points__hint">
        Chase, Amex, Capital One, HDFC and similar points can be moved into hotel programs. Add the
        points you hold and we&rsquo;ll show what they become in each program you&rsquo;ve added.
        If several of your cards share one points balance, enter the total once.
      </p>

      {bankPoints.length > 0 && (
        <div className="bank-points__rows">
          {bankPoints.map((b) => (
            <div className="bank-points__row" key={b.id}>
              <select
                value={b.cardId}
                onChange={(e) => onChange(b.id, { cardId: e.target.value })}
                aria-label="Card holding the points"
              >
                {GROUPS.map((g) => (
                  <optgroup key={g.key} label={g.label}>
                    {CARDS.filter(
                      (c) => c.group === g.key && (c.id === b.cardId || !takenIds.includes(c.id)),
                    ).map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} — {c.pointsName}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <input
                type="number"
                min="0"
                placeholder="Points balance"
                value={b.balance ?? ''}
                onChange={(e) => onChange(b.id, { balance: parseBalance(e.target.value) })}
                aria-label="Points balance on this card"
              />
              <button
                type="button"
                className="bank-points__remove"
                onClick={() => onRemove(b.id)}
                aria-label="Remove this card's points"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      {sharedPools.map((p) => (
        <p className="bank-points__warning" key={p.pointsName + p.cards.join()}>
          {p.cards.join(' and ')} share one pool of {p.pointsName}. Enter that total on a single
          row, or it will be counted twice.
        </p>
      ))}

      <button
        type="button"
        className="bank-points__add"
        onClick={() => onAdd(nextCard.id)}
        disabled={!nextCard}
      >
        + Add card points
      </button>
    </section>
  )
}
