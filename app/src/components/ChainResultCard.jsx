import { NO_STATUS_TIER } from '../constants.js'
import { getTier } from '../utils/pointsLogic.js'
import RedemptionTable from './RedemptionTable.jsx'
import './ChainResultCard.css'

export default function ChainResultCard({ chain, membership, region }) {
  const tier = getTier(chain, membership.tier)
  const baseTier = chain.eliteTiers[0]
  const perks = tier?.perks ?? baseTier.perks
  const tierLabel = tier?.name ?? NO_STATUS_TIER

  const presence = region ? chain.regionPresence[region] : null

  return (
    <article className="chain-result-card">
      <header
        className="chain-result-card__header"
        style={{ borderLeftColor: chain.accentColor }}
      >
        <h3 style={{ color: chain.accentColor }}>{chain.name}</h3>
        <span className="chain-result-card__tier">{tierLabel}</span>
      </header>

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

      <RedemptionTable chain={chain} balance={membership.balance} />

      <p className="chain-result-card__valuation">
        Rule of thumb: your {chain.name} points are worth about {chain.pointValuation.centsPerPoint}
        ¢ each. If a cash rate divided by the points price beats that, paying cash is the better
        deal — otherwise points win.
      </p>
    </article>
  )
}
