import { formatCurrency } from '../utils/pointsLogic.js'
import { FIT_LABELS, formatNights } from '../utils/verdictLogic.js'
import './ProgramList.css'

/** The short outcome line under a program's name, e.g. "about 2–3 nights". */
function outcome(summary) {
  if (summary.programType === 'discount-tier') return 'Tier discount'
  if (!summary.hasBalance) return 'No balance'
  if (summary.programType === 'cashback-currency') {
    return `Worth ${formatCurrency(summary.cashValue, summary.currency)}`
  }
  return formatNights(summary.nightsCovered)
}

/**
 * The left-hand list on Results: one button per program the user added, with
 * its presence at the destination and what its balance does. Picking one shows
 * that program's details on the right (the parent owns the selection).
 */
export default function ProgramList({ summaries, verdict, resolved, selectedId, onSelect, nights }) {
  const winnerIds = new Set(verdict ? verdict.winners.map((w) => w.membershipId) : [])

  return (
    <ul className="program-list" aria-label="Your programs">
      {summaries.map((s) => {
        const selected = s.membershipId === selectedId
        const isWinner = winnerIds.has(s.membershipId)
        const presence = resolved ? (s.presence ?? 'No rating') : null
        return (
          <li key={s.membershipId}>
            <button
              type="button"
              id={`pick-${s.membershipId}`}
              className={`program-list__item${selected ? ' program-list__item--on' : ''}`}
              aria-current={selected ? 'true' : undefined}
              aria-controls={`result-${s.membershipId}`}
              onClick={() => onSelect(s.membershipId)}
            >
              <span className="program-list__name">{s.name}</span>
              {isWinner && <span className="program-list__badge">Best fit</span>}
              <span className="program-list__line">
                {[presence, outcome(s)].filter(Boolean).join(' · ')}
              </span>
              {s.fit && (
                <span className={`program-list__fit program-list__fit--${s.fit}`}>
                  {FIT_LABELS[s.fit]}
                  {nights ? ` (${nights} night${nights === 1 ? '' : 's'})` : ''}
                </span>
              )}
            </button>
          </li>
        )
      })}
    </ul>
  )
}
