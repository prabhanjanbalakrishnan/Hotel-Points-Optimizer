import { formatCurrency } from '../utils/pointsLogic.js'
import { REFERENCE_TIER, FIT_LABELS, formatNights } from '../utils/verdictLogic.js'
import './PointsPooling.css'

function outcome(option) {
  const { summary } = option
  if (summary.programType === 'cashback-currency') {
    return `worth ${formatCurrency(summary.cashValue, option.currency)} toward a stay`
  }
  return `${formatNights(summary.nightsCovered)} at an ${REFERENCE_TIER} hotel`
}

function presenceText(summary, destination) {
  if (!summary.presenceRegion) return null
  return summary.presence
    ? `${summary.presence} presence in ${summary.presenceRegion}`
    : `no rating for ${destination || 'this destination'}`
}

/**
 * "Where to send your card points": for each card balance the user entered,
 * the programs they belong to that it can transfer into, best first for this
 * destination. Pure display of buildPooling()'s result.
 */
export default function PointsPooling({ entries, destination, nights }) {
  if (entries.length === 0) return null

  return (
    <section className="points-pooling" aria-labelledby="points-pooling-heading">
      <h3 id="points-pooling-heading">Where to send your card points</h3>
      <p className="points-pooling__intro">
        For each card, the programs you&rsquo;ve added that its points can move into
        {destination ? `, ranked for ${destination}` : ''}. Presence in the destination comes first,
        then how far the points go.
      </p>

      <ul className="points-pooling__cards">
        {entries.map((entry) => (
          <li className="points-pooling__card" key={entry.rowId}>
            <h4>
              {entry.cardName}
              <span className="points-pooling__balance num">
                {entry.balance.toLocaleString()} {entry.pointsName}
              </span>
            </h4>

            {entry.options.length > 0 ? (
              <ol className="points-pooling__options">
                {entry.options.map((o) => {
                  const presence = presenceText(o.summary, destination)
                  return (
                    <li
                      key={o.membershipId}
                      className={`points-pooling__option${o.isBest ? ' points-pooling__option--best' : ''}`}
                    >
                      <span className="points-pooling__name">
                        {o.name}
                        {o.isBest && <span className="points-pooling__badge">Best home</span>}
                      </span>
                      <span className="points-pooling__move num">
                        {o.source.ratio} → {o.source.points.toLocaleString()} points
                        {o.ownBalance > 0 && ` (plus your ${o.ownBalance.toLocaleString()})`}
                      </span>
                      <span className="points-pooling__result">
                        {outcome(o)}
                        {o.summary.fit && (
                          <span className={`points-pooling__fit points-pooling__fit--${o.summary.fit}`}>
                            {FIT_LABELS[o.summary.fit]}
                            {nights ? ` (${nights} night${nights === 1 ? '' : 's'})` : ''}
                          </span>
                        )}
                      </span>
                      {presence && <span className="points-pooling__presence">{presence}</span>}
                      {o.source.caveat && (
                        <span className="points-pooling__caveat">{o.source.caveat}</span>
                      )}
                    </li>
                  )
                })}
              </ol>
            ) : (
              <p className="points-pooling__empty">
                None of the programs you added accept these points.
              </p>
            )}

            {entry.otherChains.length > 0 && (
              <p className="points-pooling__other">
                {entry.options.length > 0 ? 'Also moves to' : 'Moves to'}{' '}
                {entry.otherChains.join(', ')}
                {entry.options.length > 0 ? ', which you haven’t added' : ''}. Add{' '}
                {entry.otherChains.length === 1 ? 'it' : 'one'} on the Memberships page to include{' '}
                {entry.otherChains.length === 1 ? 'it' : 'them'} here.
              </p>
            )}
          </li>
        ))}
      </ul>

      <p className="points-pooling__note">
        Points can only be spent once: each option assumes you move all of that card&rsquo;s points
        to that one program. Transfers are usually one-way and some programs move points in blocks
        (for example 1,000), so check with your card issuer before transferring.
      </p>
    </section>
  )
}
