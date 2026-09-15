import { CHAINS } from '../constants.js'
import './StatsChart.css'

export default function StatsChart({ counts }) {
  const max = Math.max(1, ...Object.values(counts))

  return (
    <div className="stats-chart">
      {CHAINS.map((chain) => {
        const count = counts[chain.slug] ?? 0
        const pct = Math.round((count / max) * 100)
        return (
          <div className="stats-chart__row" key={chain.slug}>
            <span className="stats-chart__label">{chain.name}</span>
            <div className="stats-chart__track">
              <div className="stats-chart__bar" style={{ width: `${pct}%` }} />
            </div>
            <span className="stats-chart__count num">{count}</span>
          </div>
        )
      })}
    </div>
  )
}
