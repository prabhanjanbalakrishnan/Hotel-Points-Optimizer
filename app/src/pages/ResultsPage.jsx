import { useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useOptimizer } from '../context/OptimizerContext.jsx'
import chainsData from '../data/chains.json'
import { matchRegion, rankChainsByRegion } from '../utils/pointsLogic.js'
import ChainResultCard from '../components/ChainResultCard.jsx'
import './ResultsPage.css'

export default function ResultsPage() {
  const { state, dispatch } = useOptimizer()
  const navigate = useNavigate()
  const { memberships, destination, checkIn, checkOut, guests, rooms } = state
  const trip = { checkIn, checkOut, guests, rooms }

  useEffect(() => {
    if (memberships.length === 0) navigate('/memberships', { replace: true })
  }, [memberships.length, navigate])

  const region = useMemo(() => matchRegion(destination), [destination])
  const ranked = useMemo(
    () => rankChainsByRegion(memberships, region, chainsData.chains),
    [memberships, region],
  )

  if (memberships.length === 0) return null

  return (
    <section className="results-page">
      <h2>{destination ? `Your options for ${destination}` : 'Your points, at a glance'}</h2>
      <p className="results-page__disclaimer">{chainsData._meta.disclaimer}</p>

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
