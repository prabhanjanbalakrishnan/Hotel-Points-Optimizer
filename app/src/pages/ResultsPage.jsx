import { useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useOptimizer } from '../context/OptimizerContext.jsx'
import chainsData from '../data/chains.json'
import creditCards from '../data/creditCards.json'
import { matchRegion, rankChainsByRegion, computeNights } from '../utils/pointsLogic.js'
import { summarizeMembership, pickVerdict } from '../utils/verdictLogic.js'
import { findCard, cardLinksFor } from '../utils/cardLogic.js'
import { INDIA_DESTINATION_KEYWORDS } from '../data/regionMappingIndia.js'
import ChainResultCard from '../components/ChainResultCard.jsx'
import ResultsSummary from '../components/ResultsSummary.jsx'
import './ResultsPage.css'

export default function ResultsPage() {
  const { state, dispatch } = useOptimizer()
  const navigate = useNavigate()
  const { memberships, destination, checkIn, checkOut, guests, rooms } = state
  const trip = { checkIn, checkOut, guests, rooms }

  useEffect(() => {
    if (memberships.length === 0) navigate('/memberships', { replace: true })
  }, [memberships.length, navigate])

  const region = useMemo(
    () => matchRegion(destination, state.homeMarket === 'India' ? INDIA_DESTINATION_KEYWORDS : undefined),
    [destination, state.homeMarket],
  )
  const ranked = useMemo(
    () => rankChainsByRegion(memberships, region, chainsData.chains),
    [memberships, region],
  )

  const nights = computeNights(checkIn, checkOut)
  const summaries = useMemo(
    () =>
      ranked.map((m) =>
        summarizeMembership({
          chain: chainsData.chains.find((c) => c.id === m.chainId),
          membership: m,
          region,
          nights,
          rooms,
        }),
      ),
    [ranked, region, nights, rooms],
  )
  const verdict = useMemo(() => pickVerdict(summaries), [summaries])

  const typedCard = state.paymentCard.trim()
  const card = useMemo(() => findCard(typedCard, creditCards.cards), [typedCard])

  if (memberships.length === 0) return null

  // Chain-specific card notes render on each result card; this is the one
  // trip-wide line for when there are none to show (unknown card, a card
  // with no hotel ties, or one that doesn't connect to the programs added).
  let cardBanner = null
  if (typedCard && !card) {
    cardBanner = `We don't have notes on "${typedCard}" yet, so the results below don't use it.`
  } else if (card?.note) {
    cardBanner = `${card.name}: ${card.note}`
  } else if (card && !ranked.some((m) => cardLinksFor(card, m.chainId).length > 0)) {
    cardBanner = `${card.name} doesn't have a direct link to any of the programs you added.`
  }

  return (
    <section className="results-page">
      <h2>{destination ? `Your options for ${destination}` : 'Your points, at a glance'}</h2>
      <p className="results-page__disclaimer">{chainsData._meta.disclaimer}</p>
      {card && <p className="results-page__disclaimer">{creditCards._meta.disclaimer}</p>}
      {cardBanner && <p className="results-page__card-banner">{cardBanner}</p>}

      <ResultsSummary
        summaries={summaries}
        verdict={verdict}
        region={region}
        destination={destination}
        nights={nights}
      />

      <div className="results-page__cards">
        {ranked.map((m) => {
          const chain = chainsData.chains.find((c) => c.id === m.chainId)
          return (
            <ChainResultCard
              key={m.id}
              chain={chain}
              membership={m}
              region={region}
              destination={destination}
              trip={trip}
              card={card}
            />
          )
        })}
      </div>

      <button
        type="button"
        className="results-page__restart"
        onClick={() => {
          dispatch({ type: 'RESET' })
          navigate('/memberships')
        }}
      >
        Start over
      </button>
    </section>
  )
}
