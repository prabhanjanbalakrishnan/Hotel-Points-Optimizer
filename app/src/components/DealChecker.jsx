import { useState } from 'react'
import { CURRENCY_SYMBOLS } from '../constants.js'
import { formatCurrency } from '../utils/pointsLogic.js'
import { evaluateDeal } from '../utils/verdictLogic.js'
import './DealChecker.css'

// Typed text is kept as a string and parsed only when computing, so clearing
// or half-typing a value ("12.") never gets coerced back to a number under
// the user's cursor (same trap as the Guests/Rooms fields).
function parsePositive(text) {
  const n = Number(text.replace(/,/g, ''))
  return text.trim() !== '' && Number.isFinite(n) && n > 0 ? n : null
}

function formatValue(minorUnits, currency) {
  const v = Math.round(minorUnits * 100) / 100
  return currency === 'INR' ? `${v} paise` : `${v}¢`
}

const VERDICTS = {
  points: { title: 'Use points', tone: 'points' },
  cash: { title: 'Pay cash', tone: 'cash' },
  close: { title: 'Close call', tone: 'close' },
}

export default function DealChecker({ chain, balance, nights, rooms }) {
  const [cashText, setCashText] = useState('')
  const [pointsText, setPointsText] = useState('')
  const { currency } = chain
  const typical = chain.pointValuation.valuePerPoint

  const cash = parsePositive(cashText)
  const points = parsePositive(pointsText)
  const deal = evaluateDeal({ cash, points, valuePerPoint: typical })
  const typedSomething = cashText.trim() !== '' || pointsText.trim() !== ''

  const stayMultiplier = (nights || 1) * rooms
  const showStay = deal && stayMultiplier > 1
  const stayPoints = deal ? points * stayMultiplier : null
  const stayCash = deal ? cash * stayMultiplier : null
  const hasBalance = balance > 0

  let explain = null
  if (deal) {
    const yours = formatValue(deal.observed, currency)
    const usual = formatValue(typical, currency)
    explain =
      deal.verdict === 'points'
        ? `Your points would be worth about ${yours} each here, more than the usual ${usual}.`
        : deal.verdict === 'cash'
          ? `Your points would be worth about ${yours} each here, less than the usual ${usual}. Paying cash keeps them for a better redemption.`
          : `Your points would be worth about ${yours} each here, right around the usual ${usual}. Either choice is reasonable.`
  }

  return (
    <div className="deal-checker">
      <h4>Check a real price</h4>
      <p className="deal-checker__hint">
        Found a room on {chain.name}&rsquo;s site? Enter its cash price and its points price for the
        same room and night.
      </p>

      <div className="deal-checker__inputs">
        <label>
          <span>Cash price per night ({CURRENCY_SYMBOLS[currency]})</span>
          <input
            type="text"
            inputMode="decimal"
            value={cashText}
            onChange={(e) => setCashText(e.target.value)}
            placeholder={currency === 'INR' ? 'e.g. 8500' : 'e.g. 220'}
            autoComplete="off"
          />
        </label>
        <label>
          <span>Points price per night</span>
          <input
            type="text"
            inputMode="numeric"
            value={pointsText}
            onChange={(e) => setPointsText(e.target.value)}
            placeholder="e.g. 40000"
            autoComplete="off"
          />
        </label>
      </div>

      {deal && (
        <div className={`deal-checker__result deal-checker__result--${VERDICTS[deal.verdict].tone}`}>
          <p className="deal-checker__verdict">{VERDICTS[deal.verdict].title}</p>
          <p>{explain}</p>
          {showStay && (
            <p className="deal-checker__stay">
              For {nights ? `${nights} night${nights === 1 ? '' : 's'}` : '1 night'}
              {rooms > 1 ? `, ${rooms} rooms` : ''}: {stayPoints.toLocaleString()} points or{' '}
              {formatCurrency(Math.round(stayCash), currency)}.
            </p>
          )}
          {hasBalance && (
            <p className="deal-checker__stay">
              {balance >= stayPoints
                ? `Your ${balance.toLocaleString()}-point balance covers it, leaving ${(balance - stayPoints).toLocaleString()}.`
                : `Your ${balance.toLocaleString()}-point balance is ${(stayPoints - balance).toLocaleString()} short of that.`}
            </p>
          )}
        </div>
      )}

      {!deal && typedSomething && (
        <p className="deal-checker__prompt">Enter both prices (numbers only) to compare.</p>
      )}
      <p className="deal-checker__note">
        Compared against the typical value for {chain.name} points, a rule of thumb. Use the same
        room, dates and taxes-included prices for both.
      </p>
    </div>
  )
}
