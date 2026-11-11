import { CHAINS, NO_STATUS_TIER } from '../constants.js'
import parseBalance, { parseNights } from '../utils/parseBalance.js'
import { tierThresholds } from '../utils/statusLogic.js'
import './MembershipRow.css'

export default function MembershipRow({ membership, chainsData, takenChainIds, onChange, onRemove }) {
  const chain = chainsData.find((c) => c.id === membership.chainId)
  const availableChains = CHAINS.filter(
    (c) => c.slug === membership.chainId || !takenChainIds.includes(c.slug),
  )
  const chainsByMarket = (market) =>
    availableChains.filter((c) => chainsData.find((cd) => cd.id === c.slug)?.market === market)

  const hasBalance = chain?.programType !== 'discount-tier'
  const canTrackNights = tierThresholds(chain).length > 0
  const balanceLabel = chain?.programType === 'cashback-currency' ? 'Coin/point balance' : 'Points balance'

  return (
    <div className="membership-row">
      <select
        value={membership.chainId}
        onChange={(e) => onChange(membership.id, { chainId: e.target.value, tier: null, balance: null, nightsThisYear: null })}
        aria-label="Loyalty program"
      >
        <optgroup label="US-origin chains">
          {chainsByMarket('US').map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </optgroup>
        <optgroup label="India-origin chains">
          {chainsByMarket('India').map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </optgroup>
      </select>

      {hasBalance ? (
        <input
          type="number"
          min="0"
          placeholder={`${balanceLabel} (optional)`}
          value={membership.balance ?? ''}
          onChange={(e) =>
            onChange(membership.id, { balance: parseBalance(e.target.value) })
          }
          aria-label={balanceLabel}
        />
      ) : (
        <span className="membership-row__no-balance">No points balance — tier-based discounts only</span>
      )}

      <select
        value={membership.tier ?? NO_STATUS_TIER}
        onChange={(e) => onChange(membership.id, { tier: e.target.value })}
        aria-label="Elite tier"
      >
        <option value={NO_STATUS_TIER}>{NO_STATUS_TIER}</option>
        {chain?.eliteTiers.map((t) => (
          <option key={t.name} value={t.name}>
            {t.name}
          </option>
        ))}
      </select>

      <button
        type="button"
        className="membership-row__remove"
        onClick={() => onRemove(membership.id)}
        aria-label="Remove this program"
      >
        Remove
      </button>

      {canTrackNights && (
        <label className="membership-row__nights">
          <span>Nights stayed this year (optional) — to track your progress to the next tier</span>
          <input
            type="number"
            min="0"
            placeholder="0"
            value={membership.nightsThisYear ?? ''}
            onChange={(e) => onChange(membership.id, { nightsThisYear: parseNights(e.target.value) })}
            aria-label="Nights stayed this year"
          />
        </label>
      )}
    </div>
  )
}
