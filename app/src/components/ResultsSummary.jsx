import { REFERENCE_TIER, formatNights } from '../utils/verdictLogic.js'
import './ResultsSummary.css'

function headlineParts(verdict, destination) {
  const { winners, presenceDecided, balanceDecided, balanceLeader } = verdict
  const names = winners.map((w) => w.name)
  const tied = winners.length > 1
  const lines = []

  if (presenceDecided) {
    const { presence, presenceRegion } = winners[0]
    lines.push(
      tied
        ? `All ${winners.length} rate ${presence} presence${destination ? ` for ${destination}` : ''}.`
        : `${presence} presence in ${presenceRegion}.`,
    )
  }
  if (balanceDecided) {
    const covered = formatNights(winners[0].nightsCovered)
    lines.push(
      tied
        ? `Your balances stretch the same distance: ${covered} at an ${REFERENCE_TIER} hotel.`
        : `Your balance covers ${covered} at an ${REFERENCE_TIER} hotel${
            winners[0].transferPoints > 0
              ? `, counting ${winners[0].transferPoints.toLocaleString()} points moved from your cards`
              : ''
          }.`,
    )
  } else if (tied) {
    lines.push('Add points balances to separate them.')
  }
  if (balanceLeader) {
    const where = balanceLeader.presence
      ? `${balanceLeader.presence.toLowerCase()} presence in ${balanceLeader.presenceRegion}`
      : `no presence rating for ${destination || 'this destination'}`
    lines.push(
      `${balanceLeader.name} stretches furthest on balance (${formatNights(balanceLeader.nightsCovered)}), but has ${where}.`,
    )
  }

  return {
    title: tied ? `Tied for best fit: ${names.join(' and ')}` : `Best fit${destination ? ` for ${destination}` : ''}: ${names[0]}`,
    lines,
  }
}

export default function ResultsSummary({ summaries, verdict, destination, nights }) {
  const headline = verdict ? headlineParts(verdict, destination) : null
  // "Best fit" can still be a program that can't pay for the whole trip -- say so
  // rather than letting the badge imply it can.
  const fits = summaries.map((s) => s.fit).filter(Boolean)
  const anyTransfers = summaries.some((s) => s.transferPoints > 0)
  const nothingCoversTrip = nights && fits.length > 0 && fits.every((f) => f === 'short')

  return (
    <section className="results-summary" aria-label="Summary">
      {headline ? (
        <div className="results-summary__verdict">
          <p className="results-summary__eyebrow">At a glance</p>
          <h3>{headline.title}</h3>
          {headline.lines.length > 0 && (
            <ul className="results-summary__reasons">
              {headline.lines.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        summaries.length > 1 && (
          <p className="results-summary__nudge">
            <strong>At a glance:</strong> add points balances, or pick a destination we can place on
            the map, and we&rsquo;ll point out the best fit here.
          </p>
        )
      )}

      {nothingCoversTrip && (
        <p className="results-summary__warning">
          None of your balances fully covers {nights} night{nights === 1 ? '' : 's'} at an{' '}
          {REFERENCE_TIER} hotel. Consider paying part of the stay in cash, or a cheaper property
          tier.
        </p>
      )}

      <p className="results-summary__note">
        Compared at a typical {REFERENCE_TIER} hotel using rule-of-thumb point ranges, not live
        prices.
        {anyTransfers &&
          ' Card points can only be spent once: each figure that counts them assumes you move all of them to that program.'}
      </p>
    </section>
  )
}
