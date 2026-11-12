import { useMemo, useState } from 'react'
import DestinationInput from './DestinationInput.jsx'
import { MAX_COMPARE } from '../constants.js'
import { formatCurrency } from '../utils/pointsLogic.js'
import { buildComparison, canAddCompare } from '../utils/compareLogic.js'
import { REFERENCE_TIER, formatNights } from '../utils/verdictLogic.js'
import './ComparePanel.css'

const norm = (s) => s.trim().toLowerCase()

/** What a balance does, shown once per program -- it doesn't vary by destination. */
function balanceLine(summary) {
  if (summary.programType === 'discount-tier') return 'Tier discount, no points'
  if (!summary.hasBalance) return 'No balance entered'
  if (summary.programType === 'cashback-currency') {
    return `Worth ${formatCurrency(summary.cashValue, summary.currency)}`
  }
  return `${formatNights(summary.nightsCovered)} at ${REFERENCE_TIER}`
}

const REASONS = {
  full: `You can compare up to ${MAX_COMPARE} other destinations. Remove one to add another.`,
  duplicate: "That destination is already in the comparison.",
}

export default function ComparePanel({
  destination,
  compareTo,
  memberships,
  chains,
  nights,
  rooms,
  transfers,
  onAdd,
  onRemove,
}) {
  const [draft, setDraft] = useState('')

  // A compared destination that later becomes the main one would be a duplicate column.
  const extras = useMemo(
    () => compareTo.filter((d) => norm(d) !== norm(destination ?? '')),
    [compareTo, destination],
  )
  const mainName = (destination ?? '').trim()
  const columns = useMemo(() => (mainName ? [mainName, ...extras] : extras), [mainName, extras])

  const comparison = useMemo(
    () => buildComparison({ destinations: columns, memberships, chains, nights, rooms, transfers }),
    [columns, memberships, chains, nights, rooms, transfers],
  )

  const check = canAddCompare(draft, destination, compareTo)
  const showReason = draft.trim() && !check.ok ? REASONS[check.reason] : null
  const add = (name) => {
    if (!canAddCompare(name, destination, compareTo).ok) return
    onAdd(name.trim())
    setDraft('')
  }

  const hasTable = extras.length > 0 && comparison.length > 0

  return (
    <section className="compare-panel" aria-labelledby="compare-panel-heading">
      <h3 id="compare-panel-heading">Compare destinations</h3>

      <div className="compare-panel__body">
        <p className="compare-panel__hint">
          Wondering which of your programs is strongest somewhere else? Add up to {MAX_COMPARE} more
          places. Point costs are the same wherever you go in this app, so what changes between
          destinations is how strong each program&rsquo;s presence is there.
        </p>

        {extras.length > 0 && (
          <ul className="compare-panel__chips">
            {extras.map((d) => (
              <li key={d}>
                <span>{d}</span>
                <button type="button" onClick={() => onRemove(d)} aria-label={`Remove ${d} from comparison`}>
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}

        {extras.length < MAX_COMPARE && (
          <div className="compare-panel__add">
            <DestinationInput
              id="compare-destination"
              label="Add a destination to compare"
              placeholder="e.g. Lisbon, Dublin, Goa"
              hint={null}
              value={draft}
              onChange={setDraft}
              onCommit={add}
              onSubmit={() => add(draft)}
            />
            <button type="button" onClick={() => add(draft)} disabled={!check.ok}>
              Add
            </button>
          </div>
        )}
        {showReason && <p className="compare-panel__reason">{showReason}</p>}
        {extras.length >= MAX_COMPARE && <p className="compare-panel__reason">{REASONS.full}</p>}

        {hasTable && (
          <div className="compare-panel__scroll">
            <table>
              <thead>
                <tr>
                  <th scope="col">Program</th>
                  {comparison.map((col, i) => (
                    <th scope="col" key={col.name}>
                      {col.name}
                      {mainName && i === 0 && <span className="compare-panel__tag">your trip</span>}
                      {!col.resolved && <span className="compare-panel__tag compare-panel__tag--warn">no region match</span>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {memberships.map((m, row) => {
                  const first = comparison[0].cells[row]
                  return (
                    <tr key={m.id}>
                      <th scope="row">
                        {first.name}
                        <span className="compare-panel__sub">{balanceLine(first)}</span>
                      </th>
                      {comparison.map((col) => {
                        const cell = col.cells[row]
                        const level = cell.presence?.toLowerCase() ?? 'none'
                        const isBest = col.verdict?.winners.some((w) => w.membershipId === cell.membershipId)
                        return (
                          <td key={col.name} className={isBest ? 'compare-panel__best' : undefined}>
                            {col.resolved ? (
                              <>
                                <span className={`compare-panel__chip compare-panel__chip--${level}`}>
                                  {cell.presence ?? 'No data'}
                                </span>
                                {cell.presenceRegion && (
                                  <span className="compare-panel__sub">{cell.presenceRegion}</span>
                                )}
                              </>
                            ) : (
                              <span className="compare-panel__sub">—</span>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}
                <tr className="compare-panel__fit-row">
                  <th scope="row">Best fit</th>
                  {comparison.map((col) => (
                    <td key={col.name}>
                      {col.verdict
                        ? col.verdict.winners.length > 1
                          ? `Tie: ${col.verdict.winners.map((w) => w.name).join(', ')}`
                          : col.verdict.winners[0].name
                        : '—'}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}
