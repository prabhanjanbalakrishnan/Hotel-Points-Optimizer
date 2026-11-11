import { PROPERTY_TIERS, TIER_DESCRIPTIONS } from '../constants.js'
import chainsData from '../data/chains.json'
import BrandChip from './BrandChip.jsx'
import './TierExamples.css'

/**
 * Brands grouped by the property tier they typically sit in, each as the same
 * expandable BrandChip used elsewhere (blurb + link to the brand's own site).
 * This is what turns the redemption table's "Upscale" / "Luxury" rows into
 * hotels a traveler recognizes.
 *
 * `showEmpty` keeps a tier row with an explanation when the program has no
 * brand there (right under the redemption table, where that row exists and a
 * gap would look like a bug); `collapsible` wraps it in a disclosure so a
 * result card stays compact.
 */
export default function TierExamples({ chain, collapsible = true, showEmpty = true }) {
  const groups = PROPERTY_TIERS.map((tier) => ({
    tier,
    brands: chain.brandFamily.filter((b) => b.tier === tier),
  })).filter((g) => showEmpty || g.brands.length > 0)

  const body = (
    <div className="tier-examples__groups">
      {groups.map(({ tier, brands }) => (
        <div className="tier-examples__group" key={tier}>
          <h5>{tier}</h5>
          <p className="tier-examples__desc">{TIER_DESCRIPTIONS[tier]}</p>
          {brands.length > 0 ? (
            <div className="tier-examples__brands">
              {brands.map((brand) => (
                <BrandChip key={brand.name} brand={brand} />
              ))}
            </div>
          ) : (
            <p className="tier-examples__empty">No brand in this program sits at this level.</p>
          )}
        </div>
      ))}
      <p className="tier-examples__note">{chainsData._meta.brandTierNote}</p>
    </div>
  )

  if (!collapsible) {
    return (
      <section className="tier-examples" aria-label="Brands by property tier">
        {body}
      </section>
    )
  }
  return (
    <details className="tier-examples tier-examples--collapsible">
      <summary>What do these tiers look like? See example brands</summary>
      {body}
    </details>
  )
}
