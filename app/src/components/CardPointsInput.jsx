import creditCards from '../data/creditCards.json'
import chainsData from '../data/chains.json'
import { transferCards, poolKey } from '../utils/cardLogic.js'
import parseBalance from '../utils/parseBalance.js'
import './CardPointsInput.css'

const TRANSFER_CARDS = transferCards(creditCards.cards)
const chainName = (id) => chainsData.chains.find((c) => c.id === id)?.name ?? id

/**
 * Optional "points on this card" field shown under "Card you'll pay with".
 *
 * It edits the same `bankPoints` list as the Memberships page, so a balance
 * entered in either place shows in both and nothing is counted twice. What it
 * shows depends on the card picked:
 *  - a card whose points transfer to hotels: the balance field;
 *  - a card that shares a points pool with one already entered (Amex Gold
 *    after Amex Platinum): no field, just a note -- a second entry would count
 *    the same points twice, and ratios can differ by card within an issuer;
 *  - a hotel co-brand card: a pointer to that hotel program's own balance,
 *    since those points ARE hotel points;
 *  - anything else (unrecognized, cashback, no hotel use): nothing.
 */
export default function CardPointsInput({ card, bankPoints, onSetBalance, onOpenMemberships }) {
  if (!card) return null

  const transferable = TRANSFER_CARDS.some((c) => c.id === card.id)

  if (transferable) {
    const row = bankPoints.find((b) => b.cardId === card.id)
    const poolMate = bankPoints.find((b) => {
      if (b.cardId === card.id || !(b.balance > 0)) return false
      const other = TRANSFER_CARDS.find((c) => c.id === b.cardId)
      return other && poolKey(other) === poolKey(card)
    })
    if (!row && poolMate) {
      const other = TRANSFER_CARDS.find((c) => c.id === poolMate.cardId)
      return (
        <div className="card-points">
          <p className="card-points__note">
            You&rsquo;ve already entered {poolMate.balance.toLocaleString()} {card.pointsName}{' '}
            points on {other.name}. {card.name} earns into the same pool, so they&rsquo;re counted
            once.{' '}
            <button type="button" className="card-points__link" onClick={onOpenMemberships}>
              Change them on the Memberships page
            </button>
            .
          </p>
        </div>
      )
    }

    return (
      <div className="card-points">
        <label htmlFor="card-points">Points on this card (optional)</label>
        <input
          id="card-points"
          type="number"
          min="0"
          inputMode="numeric"
          placeholder={`${card.pointsName} balance`}
          value={row?.balance ?? ''}
          onChange={(e) => onSetBalance(card, parseBalance(e.target.value))}
        />
        <p className="card-points__hint">
          Your {card.pointsName} balance. We&rsquo;ll show what it becomes in each program you
          added, and where it goes furthest. Same list as on the Memberships page.
        </p>
      </div>
    )
  }

  const direct = card.chainLinks.filter((l) => l.kind === 'earns-directly')
  if (direct.length > 0) {
    const names = [...new Set(direct.map((l) => chainName(l.chainId)))]
    return (
      <div className="card-points">
        <p className="card-points__note">
          {card.name} earns {names.join(' and ')} rewards directly, so there&rsquo;s no separate card
          balance. Enter what you hold as your {names.join(' / ')} points on the{' '}
          <button type="button" className="card-points__link" onClick={onOpenMemberships}>
            Memberships page
          </button>
          .
        </p>
      </div>
    )
  }

  return null
}
