import { useState } from 'react'
import TierLadder from './TierLadder.jsx'
import BrandChip from './BrandChip.jsx'
import './HotelInfoCard.css'

function ProgramTypeExplainer({ chain }) {
  if (chain.programType === 'cashback-currency') {
    return (
      <p className="hotel-info-card__explainer">
        {chain.cashbackDetails.pegDescription} You'll earn {chain.cashbackDetails.earnRateRange}{' '}
        back in {chain.cashbackDetails.currencyName} on eligible spend, depending on your tier.
      </p>
    )
  }
  if (chain.programType === 'discount-tier') {
    return <p className="hotel-info-card__explainer">{chain.discountDetails.note}</p>
  }
  return <p className="hotel-info-card__explainer">{chain.redemptionGuidance.note}</p>
}

export default function HotelInfoCard({ chain, currentMembership }) {
  const [open, setOpen] = useState(false)

  return (
    <article className="hotel-info-card" style={{ borderLeftColor: chain.accentColor }}>
      <button
        type="button"
        className="hotel-info-card__header"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span className="hotel-info-card__name" style={{ color: chain.accentColor }}>
          {chain.name}
        </span>
        {currentMembership && <span className="hotel-info-card__member-badge">You're a member</span>}
        <span className="hotel-info-card__chevron">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="hotel-info-card__body">
          <div className="hotel-info-card__brands">
            {chain.brandFamily.map((brand) => (
              <BrandChip key={brand.name} brand={brand} />
            ))}
          </div>

          <ProgramTypeExplainer chain={chain} />

          <h4 className="hotel-info-card__ladder-heading">Membership tiers</h4>
          <TierLadder chain={chain} currentTierName={currentMembership?.tier} />

          <a
            className="hotel-info-card__link"
            href={chain.bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Visit {chain.name} ↗
          </a>
        </div>
      )}
    </article>
  )
}
