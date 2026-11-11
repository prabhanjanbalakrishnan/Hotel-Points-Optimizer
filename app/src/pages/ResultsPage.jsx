import { useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useOptimizer } from '../context/OptimizerContext.jsx'
import chainsData from '../data/chains.json'
import creditCards from '../data/creditCards.json'
import { resolveDestination, rankChainsByPresence, computeNights } from '../utils/pointsLogic.js'
import { summarizeMembership, pickVerdict } from '../utils/verdictLogic.js'
import { findCard, cardLinksFor, transferIn } from '../utils/cardLogic.js'
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

  const resolved = useMemo(() => resolveDestination(destination), [destination])
  const ranked = useMemo(
    () => rankChainsByPresence(memberships, resolved, chainsData.chains),
    [memberships, resolved],
  )

  const nights = computeNights(checkIn, checkOut)
  // What the user's bank/card points would become in each program they added.
  const transfers = useMemo(
    () =>
      Object.fromEntries(
        ranked.map((m) => [m.id, transferIn(m.chainId, state.bankPoints, creditCards.cards)]),
      ),
    [ranked, state.bankPoints],
  )
  const summaries = useMemo(
    () =>
      ranked.map((m) =>
        summarizeMembership({
          chain: chainsData.chains.find((c) => c.id === m.chainId),
          membership: m,
          resolved,
          nights,
          rooms,
          transferPoints: transfers[m.id].total,
        }),
      ),
    [ranked, resolved, nights, rooms, transfers],
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
        resolved={resolved}
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
              resolved={resolved}
              destination={destination}
              trip={trip}
              card={card}
              transfers={transfers[m.id]}
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
