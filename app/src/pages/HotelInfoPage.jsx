import { useOptimizer } from '../context/OptimizerContext.jsx'
import chainsData from '../data/chains.json'
import HotelInfoCard from '../components/HotelInfoCard.jsx'
import './HotelInfoPage.css'

export default function HotelInfoPage() {
  const { state } = useOptimizer()

  const membershipFor = (chainId) => state.memberships.find((m) => m.chainId === chainId) ?? null

  const usChains = chainsData.chains.filter((c) => c.market === 'US')
  const indiaChains = chainsData.chains.filter((c) => c.market === 'India')

  return (
    <section className="hotel-info-page">
      <h2>More hotel info</h2>
      <p className="hotel-info-page__subtitle">
        Every chain's full membership ladder in one place — see what perks a higher tier actually
        unlocks before deciding whether it's worth chasing with a given chain.
      </p>
      <p className="hotel-info-page__disclaimer">{chainsData._meta.disclaimer}</p>

      <div className="hotel-info-page__section">
        <h3>🇺🇸 United States</h3>
        <div className="hotel-info-page__grid">
          {usChains.map((chain) => (
            <HotelInfoCard key={chain.id} chain={chain} currentMembership={membershipFor(chain.id)} />
          ))}
        </div>
      </div>

      <div className="hotel-info-page__section">
        <h3>🇮🇳 India</h3>
        <div className="hotel-info-page__grid">
          {indiaChains.map((chain) => (
            <HotelInfoCard key={chain.id} chain={chain} currentMembership={membershipFor(chain.id)} />
          ))}
        </div>
      </div>
    </section>
  )
}
