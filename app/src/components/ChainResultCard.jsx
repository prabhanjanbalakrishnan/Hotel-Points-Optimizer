import { NO_STATUS_TIER } from '../constants.js'
import { getTier, computeNights, formatCurrency, presenceFor } from '../utils/pointsLogic.js'
import { cardLinksFor, describeLink } from '../utils/cardLogic.js'
import RedemptionTable from './RedemptionTable.jsx'
import BrandChip from './BrandChip.jsx'
import TierExamples from './TierExamples.jsx'
import DealChecker from './DealChecker.jsx'
import StatusTracker from './StatusTracker.jsx'
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

const CARD_KIND_LABELS = {
  transfers: 'Transfer',
  'earns-directly': 'Earns directly',
  status: 'Status',
}

const NO_TRANSFERS = { sources: [], total: 0 }

export default function ChainResultCard({
  chain,
  membership,
  resolved,
  destination,
  trip,
  card,
  transfers = NO_TRANSFERS,
}) {
  // The user's own points plus whatever their card points would become here.
  const ownBalance = membership.balance > 0 ? membership.balance : 0
  const balance = ownBalance + transfers.total
  const cardNotes = cardLinksFor(card, chain.id).map((link) => describeLink(card, link, chain))
  const tier = getTier(chain, membership.tier)
  const baseTier = chain.eliteTiers[0]
  const perks = tier?.perks ?? baseTier.perks
  const tierLabel = tier?.name ?? NO_STATUS_TIER

  const presence = presenceFor(chain, resolved)
  const regionLabel = presence?.region === 'International' ? 'markets outside India' : presence?.region

  const nights = computeNights(trip.checkIn, trip.checkOut)
  const showTripSummary = nights || trip.rooms > 1 || trip.guests > 1
  const tripParts = [
    nights ? `${formatDate(trip.checkIn)}–${formatDate(trip.checkOut)}` : null,
    nights ? `${nights} night${nights > 1 ? 's' : ''}` : null,
    `${trip.rooms} room${trip.rooms > 1 ? 's' : ''}`,
    `${trip.guests} guest${trip.guests > 1 ? 's' : ''}`,
  ].filter(Boolean)

  return (
    <article className="chain-result-card" id={`result-${membership.id}`}>
      <header
        className="chain-result-card__header"
        style={{ borderLeftColor: chain.accentColor }}
      >
        <h3>{chain.name}</h3>
        <span className="chain-result-card__tier">{tierLabel}</span>
      </header>

      {showTripSummary && <p className="chain-result-card__trip-summary">{tripParts.join(' · ')}</p>}

      {destination && (
        <p className="chain-result-card__region-hint">
          {presence
            ? `Why ${chain.name}: presence in ${regionLabel} is ${presence.level}.`
            : resolved
              ? `We don't have ${chain.name} presence data for ${destination} — showing it without ranking.`
              : `We couldn't match your destination to a region — showing ${chain.name} without ranking.`}
        </p>
      )}

      {cardNotes.length > 0 && (
        <ul className="chain-result-card__card-notes">
          {cardNotes.map((note, i) => (
            <li key={`${note.kind}-${i}`}>
              <span className="chain-result-card__card-kind">{CARD_KIND_LABELS[note.kind]}</span>{' '}
              {note.text}.
              {note.caveat && (
                <>
                  {' '}
                  <span className="chain-result-card__card-caveat">{note.caveat}</span>
                </>
              )}
            </li>
          ))}
        </ul>
      )}

      <div className="chain-result-card__brands">
        {chain.brandFamily.map((brand) => (
          <BrandChip key={brand.name} brand={brand} />
        ))}
      </div>

      {transfers.sources.length > 0 && (
        <div className="chain-result-card__transfers">
          <h4>Points from your cards</h4>
          <ul>
            {transfers.sources.map((src) => (
              <li key={src.rowId}>
                {src.balance.toLocaleString()} {src.pointsName} ({src.cardName}) at {src.ratio} becomes{' '}
                <strong>
                  {src.points.toLocaleString()} {chain.name} points
                </strong>
                .
                {src.caveat && <span className="chain-result-card__card-caveat">{src.caveat}</span>}
              </li>
            ))}
          </ul>
          <p>
            {ownBalance > 0
              ? `With your own ${ownBalance.toLocaleString()} points, that's ${balance.toLocaleString()} in total, and the figures below use it.`
              : `The figures below use this ${balance.toLocaleString()}.`}{' '}
            Transfers are usually one-way and can&rsquo;t be undone, and the same card points can&rsquo;t
            also go to another program.
          </p>
        </div>
      )}

      <StatusTracker chain={chain} nightsSoFar={membership.nightsThisYear} tripNights={nights} />

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
            balance={balance}
            nights={nights}
            rooms={trip.rooms}
          />
          <TierExamples chain={chain} />
          <p className="chain-result-card__valuation">
            Rule of thumb: your {chain.name} points are worth about{' '}
            {formatPointValue(chain.pointValuation.valuePerPoint, chain.currency)} each. If a room's
            cash price works out to more than that per point, points are the better deal;
            if less, pay cash and save your points. Got a real price? Check it below.
          </p>
          <DealChecker
            chain={chain}
            balance={balance}
            nights={nights}
            rooms={trip.rooms}
          />
        </>
      )}

      {chain.programType === 'cashback-currency' && (
        <div className="chain-result-card__cashback">
          <p className="chain-result-card__cashback-peg">{chain.cashbackDetails.pegDescription}</p>
          {balance > 0 ? (
            <p className="chain-result-card__cashback-balance">
              Your balance of {balance.toLocaleString()} {chain.cashbackDetails.currencyName}{' '}
              is worth exactly {formatCurrency(balance, chain.currency)} toward any stay.
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
