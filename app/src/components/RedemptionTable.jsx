import {
  PROPERTY_TIERS,
  estimateCashValue,
  estimateNightsCovered,
  estimateTripCost,
  formatCurrency,
} from '../utils/pointsLogic.js'
import './RedemptionTable.css'

export default function RedemptionTable({ chain, balance, nights, rooms = 1 }) {
  const { pointsPerNightByTier, note } = chain.redemptionGuidance
  const { valuePerPoint } = chain.pointValuation
  const currency = chain.currency

  return (
    <div className="redemption-table">
      <div className="redemption-table__scroll">
      <table>
        <thead>
          <tr>
            <th>Property tier</th>
            <th>Points / night</th>
            <th>Est. cash value / night</th>
            {nights ? <th>Est. total for {nights}-night trip{rooms > 1 ? `, ${rooms} rooms` : ''}</th> : null}
            {balance ? <th>Nights your balance covers</th> : null}
          </tr>
        </thead>
        <tbody>
          {PROPERTY_TIERS.map((tier) => {
            const range = pointsPerNightByTier[tier]
            const cash = estimateCashValue(range.min, range.max, valuePerPoint)
            const nightsCovered = balance
              ? estimateNightsCovered(balance, range.min, range.max, rooms)
              : null
            const trip = nights
              ? estimateTripCost(range.min, range.max, valuePerPoint, nights, rooms)
              : null
            return (
              <tr key={tier}>
                <td>{tier}</td>
                <td className="num">
                  {range.min.toLocaleString()}–{range.max.toLocaleString()}
                </td>
                <td className="num">
                  {formatCurrency(cash.min, currency)}–{formatCurrency(cash.max, currency)}
                </td>
                {nights ? (
                  <td className="num">
                    {trip.points.min.toLocaleString()}–{trip.points.max.toLocaleString()} pts
                    <br />
                    ({formatCurrency(trip.cash.min, currency)}–{formatCurrency(trip.cash.max, currency)})
                  </td>
                ) : null}
                {balance ? (
                  <td className="num">
                    {nightsCovered.max > 0
                      ? `~${nightsCovered.min}–${nightsCovered.max} nights`
                      : '<1 night'}
                    {rooms > 1 ? ` (${rooms} rooms/night)` : ''}
                  </td>
                ) : null}
              </tr>
            )
          })}
        </tbody>
      </table>
      </div>
      <p className="redemption-table__note">{note}</p>
    </div>
  )
}
