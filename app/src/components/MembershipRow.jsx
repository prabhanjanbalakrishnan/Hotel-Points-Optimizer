import { CHAINS, NO_STATUS_TIER } from '../constants.js'
import './MembershipRow.css'

export default function MembershipRow({ membership, chainsData, takenChainIds, onChange, onRemove }) {
  const chain = chainsData.find((c) => c.id === membership.chainId)
  const availableChains = CHAINS.filter(
    (c) => c.slug === membership.chainId || !takenChainIds.includes(c.slug),
  )

  return (
    <div className="membership-row">
      <select
        value={membership.chainId}
        onChange={(e) => onChange(membership.id, { chainId: e.target.value, tier: null })}
        aria-label="Loyalty program"
      >
        {availableChains.map((c) => (
          <option key={c.slug} value={c.slug}>
            {c.name}
          </option>
        ))}
      </select>

      <input
        type="number"
        min="0"
        placeholder="Points balance (optional)"
        value={membership.balance ?? ''}
        onChange={(e) =>
          onChange(membership.id, { balance: e.target.value === '' ? null : Number(e.target.value) })
        }
        aria-label="Points balance"
      />

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
    </div>
  )
}
