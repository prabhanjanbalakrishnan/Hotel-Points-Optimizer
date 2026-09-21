import { NO_STATUS_TIER } from '../constants.js'
import { getTier, computeNights, formatCurrency } from '../utils/pointsLogic.js'
import RedemptionTable from './RedemptionTable.jsx'
import './ChainResultCard.css'

function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })
}

function formatPointValue(valuePerPoint, currency) {
  return currency === 'INR' ? `${valuePerPoint} paise` : `${valuePerPoint}¢`
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
        <h3>{chain.name}</h3>
        <span className="chain-result-card__tier">{tierLabel}</span>
      </header>

      {showTripSummary && <p className="chain-result-card__trip-summary">{tripParts.join(' · ')}</p>}

      <p className="chain-result-card__region-hint">
        {region && presence
          ? `Why ${chain.name}: presence in ${region} is ${presence}.`
          : `We couldn't match your destination to a region — showing ${chain.name} without ranking.`}
      </p>

      <div className="chain-result-card__brands">
        {chain.brandFamily.map((brand) => (
          <span key={brand.name} className="chain-result-card__brand-chip">
            {brand.name}
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

      {chain.programType === 'redemption-chart' && (
        <>
          <RedemptionTable
            chain={chain}
            balance={membership.balance}
            nights={nights}
            rooms={trip.rooms}
          />
          <p className="chain-result-card__valuation">
            Rule of thumb: your {chain.name} points are worth about{' '}
            {formatPointValue(chain.pointValuation.valuePerPoint, chain.currency)} each. If a cash
            rate divided by the points price beats that, paying cash is the better deal —
            otherwise points win.
          </p>
        </>
      )}

      {chain.programType === 'cashback-currency' && (
        <div className="chain-result-card__cashback">
          <p className="chain-result-card__cashback-peg">{chain.cashbackDetails.pegDescription}</p>
          {membership.balance ? (
            <p className="chain-result-card__cashback-balance">
              Your balance of {membership.balance.toLocaleString()} {chain.cashbackDetails.currencyName}{' '}
              is worth exactly {formatCurrency(membership.balance, chain.currency)} toward any stay.
            </p>
          ) : null}
          <p className="chain-result-card__valuation">
            You'll earn {chain.cashbackDetails.earnRateRange} back in{' '}
            {chain.cashbackDetails.currencyName} on eligible spend, depending on your tier — since
            it's pegged 1:1 to {chain.currency}, there's no "cash vs. points" trade-off to weigh
            like the
            redemption-chart chains above: it's simply a rebate on whatever you pay.
          </p>
        </div>
      )}

      {chain.programType === 'discount-tier' && (
        <div className="chain-result-card__discount">
          <p className="chain-result-card__valuation">{chain.discountDetails.note}</p>
        </div>
      )}

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
