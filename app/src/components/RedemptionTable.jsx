import { PROPERTY_TIERS, estimateCashValue, estimateNightsCovered } from '../utils/pointsLogic.js'
import './RedemptionTable.css'

export default function RedemptionTable({ chain, balance }) {
  const { pointsPerNightByTier, note } = chain.redemptionGuidance
  const { centsPerPoint } = chain.pointValuation

  return (
    <div className="redemption-table">
      <table>
        <thead>
          <tr>
            <th>Property tier</th>
            <th>Points / night</th>
            <th>Est. cash value</th>
            {balance ? <th>Nights your balance covers</th> : null}
          </tr>
        </thead>
        <tbody>
          {PROPERTY_TIERS.map((tier) => {
            const range = pointsPerNightByTier[tier]
            const cash = estimateCashValue(range.min, range.max, centsPerPoint)
            const nights = balance ? estimateNightsCovered(balance, range.min, range.max) : null
            return (
              <tr key={tier}>
                <td>{tier}</td>
                <td className="num">
                  {range.min.toLocaleString()}–{range.max.toLocaleString()}
                </td>
                <td className="num">
                  ${cash.min}–${cash.max}
                </td>
                {balance ? (
                  <td className="num">
                    {nights.max > 0 ? `~${nights.min}–${nights.max} nights` : '<1 night'}
                  </td>
                ) : null}
              </tr>
            )
          })}
        </tbody>
      </table>
      <p className="redemption-table__note">{note}</p>
    </div>
  )
}
