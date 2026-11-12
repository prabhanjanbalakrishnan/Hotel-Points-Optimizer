import { useState } from 'react'
import { NO_STATUS_TIER } from '../constants.js'
import { getTier, computeNights, formatCurrency, presenceFor } from '../utils/pointsLogic.js'
import { cardLinksFor, describeLink } from '../utils/cardLogic.js'
import { formatDate } from '../utils/tripFormat.js'
import RedemptionTable from './RedemptionTable.jsx'
import TierExamples from './TierExamples.jsx'
import DealChecker from './DealChecker.jsx'
import StatusTracker from './StatusTracker.jsx'
import Tabs from './Tabs.jsx'
import './ChainResultCard.css'

function formatPointValue(valuePerPoint, currency) {
  return currency === 'INR' ? `${valuePerPoint} paise` : `${valuePerPoint}¢`
}

const CARD_KIND_LABELS = {
  transfers: 'Transfer',
  'earns-directly': 'Earns directly',
  status: 'Status',
}

const NO_TRANSFERS = { sources: [], total: 0 }

/**
 * One program's details, shown on the right of the Results page when it is
 * picked in the list. Every program's panel stays mounted (hidden unless
 * `active`) so what the user typed into "Check a price" and which sub-tab they
 * were on survive switching between programs.
 */
export default function ChainResultCard({
  chain,
  membership,
  resolved,
  destination,
  trip,
  card,
  transfers = NO_TRANSFERS,
  active = true,
}) {
  const [tab, setTab] = useState('redeem')

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
  const isChart = chain.programType === 'redemption-chart'
  const hasCardInfo = cardNotes.length > 0 || transfers.sources.length > 0

  const firstTabLabel = isChart
    ? 'Redeem'
    : chain.programType === 'cashback-currency'
      ? 'Balance value'
      : 'Discount'
  const tabs = [
    { id: 'redeem', label: firstTabLabel },
    ...(hasCardInfo ? [{ id: 'cards', label: 'Your cards' }] : []),
    { id: 'perks', label: 'Perks and status' },
    { id: 'brands', label: 'Brands' },
    ...(isChart ? [{ id: 'price', label: 'Check a price' }] : []),
  ]
  // The picked tab can disappear (e.g. the card is cleared); fall back to the first.
  const current = tabs.some((t) => t.id === tab) ? tab : tabs[0].id
  const idPrefix = `sub-${membership.id}`
  const panelProps = (id) => ({
    role: 'tabpanel',
    id: `${idPrefix}-panel-${id}`,
    'aria-labelledby': `${idPrefix}-tab-${id}`,
    hidden: current !== id,
    className: 'chain-result-card__panel',
  })

  return (
    <article
      className="chain-result-card"
      id={`result-${membership.id}`}
      aria-labelledby={`pick-${membership.id}`}
      hidden={!active}
    >
      <header
        className="chain-result-card__header"
        style={{ borderLeftColor: chain.accentColor }}
      >
        <h3>{chain.name}</h3>
        <span className="chain-result-card__tier">{tierLabel}</span>
      </header>

      {destination && (
        <p className="chain-result-card__region-hint">
          {presence
            ? `Why ${chain.name}: presence in ${regionLabel} is ${presence.level}.`
            : resolved
              ? `We don't have ${chain.name} presence data for ${destination}, so it isn't ranked.`
              : `We couldn't match your destination to a region, so ${chain.name} isn't ranked.`}
        </p>
      )}

      <Tabs
        tabs={tabs}
        value={current}
        onChange={setTab}
        idPrefix={idPrefix}
        label={`${chain.name} details`}
        variant="sub"
      />

      <div {...panelProps('redeem')}>
        {isChart && (
          <>
            {transfers.total > 0 && (
              <p className="chain-result-card__counting">
                These figures count {transfers.total.toLocaleString()} points moved from your cards.
              </p>
            )}
            <RedemptionTable chain={chain} balance={balance} nights={nights} rooms={trip.rooms} />
            <p className="chain-result-card__valuation">
              Rule of thumb: your {chain.name} points are worth about{' '}
              {formatPointValue(chain.pointValuation.valuePerPoint, chain.currency)} each. If a
              room&rsquo;s cash price works out to more than that per point, points are the better
              deal; if less, pay cash and save your points. Got a real price? Use Check a price.
            </p>
          </>
        )}

        {chain.programType === 'cashback-currency' && (
          <div className="chain-result-card__cashback">
            <p className="chain-result-card__cashback-peg">{chain.cashbackDetails.pegDescription}</p>
            {balance > 0 ? (
              <p className="chain-result-card__cashback-balance">
                Your balance of {balance.toLocaleString()} {chain.cashbackDetails.currencyName} is
                worth exactly {formatCurrency(balance, chain.currency)} toward any stay.
              </p>
            ) : null}
            <p className="chain-result-card__valuation">
              You&rsquo;ll earn {chain.cashbackDetails.earnRateRange} back in{' '}
              {chain.cashbackDetails.currencyName} on eligible spend, depending on your tier. Since
              it&rsquo;s pegged 1:1 to {chain.currency}, there&rsquo;s no &ldquo;cash vs. points&rdquo;
              trade-off to weigh like the redemption-chart programs: it&rsquo;s simply a rebate on
              whatever you pay.
            </p>
          </div>
        )}

        {chain.programType === 'discount-tier' && (
          <p className="chain-result-card__discount">{chain.discountDetails.note}</p>
        )}
      </div>

      {hasCardInfo && (
        <div {...panelProps('cards')}>
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

          {transfers.sources.length > 0 && (
            <div className="chain-result-card__transfers">
              <h4>Points from your cards</h4>
              <ul>
                {transfers.sources.map((src) => (
                  <li key={src.rowId}>
                    {src.balance.toLocaleString()} {src.pointsName} ({src.cardName}) at {src.ratio}{' '}
                    becomes{' '}
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
                  ? `With your own ${ownBalance.toLocaleString()} points, that's ${balance.toLocaleString()} in total, and the figures on the other tabs use it.`
                  : `The figures on the other tabs use this ${balance.toLocaleString()}.`}{' '}
                Transfers are usually one-way and can&rsquo;t be undone, and the same card points
                can&rsquo;t also go to another program.
              </p>
            </div>
          )}
        </div>
      )}

      <div {...panelProps('perks')}>
        <div className="chain-result-card__perks">
          <h4>Perks at your tier</h4>
          <ul>
            {perks.map((perk) => (
              <li key={perk}>{perk}</li>
            ))}
          </ul>
        </div>
        <StatusTracker chain={chain} nightsSoFar={membership.nightsThisYear} tripNights={nights} />
      </div>

      <div {...panelProps('brands')}>
        <TierExamples chain={chain} collapsible={false} showEmpty={isChart} />
      </div>

      {isChart && (
        <div {...panelProps('price')}>
          <DealChecker chain={chain} balance={balance} nights={nights} rooms={trip.rooms} />
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
