import { NO_STATUS_TIER } from '../constants.js'
import { getTier, computeNights } from '../utils/pointsLogic.js'
import RedemptionTable from './RedemptionTable.jsx'
import './ChainResultCard.css'

function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })
}

export default function ChainResultCard({ chain, membership, region, destination, trip }) {
  const tier = getTier(chain, membership.tier)
  const baseTier = chain.eliteTiers[0]
  const perks = tier?.perks ?? baseTier.perks
  const tierLabel = tier?.name ?? NO_STATUS_TIER

  const presence = region ? chain.regionPresence[region] : null

  const nights = computeNights(trip.checkIn, trip.checkOut)
  const showTripSummary = nights || trip.rooms > 1 || trip.guests > 1
  const tripParts = [
    nights ? `${formatDate(trip.checkIn)}–${formatDate(trip.checkOut)}` : null,
    nights ? `${nights} night${nights > 1 ? 's' : ''}` : null,
    `${trip.rooms} room${trip.rooms > 1 ? 's' : ''}`,
    `${trip.guests} guest${trip.guests > 1 ? 's' : ''}`,
  ].filter(Boolean)

  return (
    <article className="chain-result-card">
      <header
        className="chain-result-card__header"
        style={{ borderLeftColor: chain.accentColor }}
      >
        <h3 style={{ color: chain.accentColor }}>{chain.name}</h3>
        <span className="chain-result-card__tier">{tierLabel}</span>
      </header>

      {showTripSummary && <p className="chain-result-card__trip-summary">{tripParts.join(' · ')}</p>}

      <p className="chain-result-card__region-hint">
        {region
          ? `Why ${chain.name}: presence in ${region} is ${presence}.`
          : `We couldn't match your destination to a region — showing ${chain.name} without ranking.`}
      </p>

      <div className="chain-result-card__brands">
        {chain.brandFamily.map((brand) => (
          <span key={brand} className="chain-result-card__brand-chip">
            {brand}
          </span>
        ))}
      </div>

      <div className="chain-result-card__perks">
        <h4>Perks at your tier</h4>
        <ul>
          {perks.map((perk) => (
            <li key={perk}>{perk}</li>
          ))}
        </ul>
      </div>

      <RedemptionTable
        chain={chain}
        balance={membership.balance}
        nights={nights}
        rooms={trip.rooms}
      />

      <p className="chain-result-card__valuation">
        Rule of thumb: your {chain.name} points are worth about {chain.pointValuation.centsPerPoint}
        ¢ each. If a cash rate divided by the points price beats that, paying cash is the better
        deal — otherwise points win.
      </p>

      <div className="chain-result-card__booking">
        <a
          className="chain-result-card__booking-link"
          href={chain.bookingUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Search real rooms on {chain.name} ↗
        </a>
        <p className="chain-result-card__booking-hint">
          {destination
            ? `Opens the official ${chain.name} site — search "${destination}"${
                nights ? ` for ${formatDate(trip.checkIn)}–${formatDate(trip.checkOut)}` : ''
              }${
                trip.rooms > 1 || trip.guests > 1
                  ? ` (${trip.rooms} room${trip.rooms > 1 ? 's' : ''}, ${trip.guests} guest${trip.guests > 1 ? 's' : ''})`
                  : ''
              } there to see live rooms and book with your own account.`
            : `Opens the official ${chain.name} site to search and book with your own account.`}
        </p>
      </div>
    </article>
  )
}
