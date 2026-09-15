import { CHAINS } from '../constants.js'
import MembershipRow from './MembershipRow.jsx'
import './MembershipList.css'

export default function MembershipList({ memberships, chainsData, onAdd, onChange, onRemove }) {
  const takenChainIds = memberships.map((m) => m.chainId)
  const nextAvailableChain = CHAINS.find((c) => !takenChainIds.includes(c.slug))

  return (
    <div className="membership-list">
      {memberships.map((m) => (
        <MembershipRow
          key={m.id}
          membership={m}
          chainsData={chainsData}
          takenChainIds={takenChainIds}
          onChange={onChange}
          onRemove={onRemove}
        />
      ))}

      <button
        type="button"
        className="membership-list__add"
        onClick={() => onAdd(nextAvailableChain?.slug ?? CHAINS[0].slug)}
        disabled={!nextAvailableChain}
      >
        + Add another program
      </button>
      {!nextAvailableChain && (
        <p className="membership-list__hint">You've added all {CHAINS.length} supported chains.</p>
      )}
    </div>
  )
}
