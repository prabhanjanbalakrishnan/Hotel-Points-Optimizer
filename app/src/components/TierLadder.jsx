import './TierLadder.css'

export default function TierLadder({ chain, currentTierName }) {
  return (
    <ol className="tier-ladder">
      {chain.eliteTiers.map((tier, i) => {
        const isCurrent = tier.name === currentTierName
        const isLast = i === chain.eliteTiers.length - 1
        return (
          <li key={tier.name} className={isCurrent ? 'tier-ladder__step tier-ladder__step--current' : 'tier-ladder__step'}>
            <div className="tier-ladder__marker">
              <span className="tier-ladder__dot" style={{ background: chain.accentColor }} />
              {!isLast && <span className="tier-ladder__line" />}
            </div>
            <div className="tier-ladder__content">
              <div className="tier-ladder__heading">
                <h5>{tier.name}</h5>
                {isCurrent && <span className="tier-ladder__badge">Your tier</span>}
              </div>
              <p className="tier-ladder__qualification">{tier.qualification}</p>
              <ul className="tier-ladder__perks">
                {tier.perks.map((perk) => (
                  <li key={perk}>{perk}</li>
                ))}
              </ul>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
