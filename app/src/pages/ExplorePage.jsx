import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useOptimizer } from '../context/OptimizerContext.jsx'
import { US_STATES } from '../data/usStateCoords.js'
import destinationsData from '../data/destinations.json'
import chainsData from '../data/chains.json'
import { classifyDestinations, LOCAL_RADIUS_MILES } from '../utils/distance.js'
import ExploreDestinationCard from '../components/ExploreDestinationCard.jsx'
import './ExplorePage.css'

export default function ExplorePage() {
  const { state, dispatch } = useOptimizer()
  const navigate = useNavigate()

  const home = US_STATES.find((s) => s.code === state.homeState) ?? null
  const { local, flight } = useMemo(
    () => classifyDestinations(home, destinationsData.destinations),
    [home],
  )

  const chainHintsFor = (region) =>
    state.memberships
      .map((m) => chainsData.chains.find((c) => c.id === m.chainId))
      .filter(Boolean)
      .map((c) => ({ name: c.name, presence: c.regionPresence[region] }))

  const handleChoose = (destinationName) => {
    dispatch({ type: 'SET_DESTINATION', destination: destinationName })
    navigate('/destination')
  }

  return (
    <section className="explore-page">
      <h2>Explore destinations</h2>
      <p className="explore-page__subtitle">
        Pick your home state and we'll split popular destinations into a quick local getaway vs.
        somewhere worth flying to.
      </p>

      <label className="explore-page__home-select">
        Home state
        <select
          value={state.homeState}
          onChange={(e) => dispatch({ type: 'SET_HOME_STATE', homeState: e.target.value })}
        >
          <option value="">Select a state…</option>
          {US_STATES.map((s) => (
            <option key={s.code} value={s.code}>
              {s.name}
            </option>
          ))}
        </select>
      </label>

      {!home && <p className="explore-page__hint">Pick a state to see destination ideas.</p>}

      {home && (
        <>
          <p className="explore-page__disclaimer">
            Distances are straight-line estimates from a representative point in your state, not
            real driving directions — a rough guide, not turn-by-turn. "Local" means roughly within{' '}
            {LOCAL_RADIUS_MILES} miles, about a 4-hour drive.
          </p>

          <div className="explore-page__section">
            <h3>🚗 Local — worth a drive</h3>
            {local.length === 0 && <p className="explore-page__empty">Nothing nearby on our list — try one worth flying to.</p>}
            <div className="explore-page__grid">
              {local.map((d) => (
                <ExploreDestinationCard
                  key={d.name}
                  destination={d}
                  chainHints={chainHintsFor(d.region)}
                  onChoose={handleChoose}
                />
              ))}
            </div>
          </div>

          <div className="explore-page__section">
            <h3>✈️ Worth flying to</h3>
            <div className="explore-page__grid">
              {flight.map((d) => (
                <ExploreDestinationCard
                  key={d.name}
                  destination={d}
                  chainHints={chainHintsFor(d.region)}
                  onChoose={handleChoose}
                />
              ))}
            </div>
          </div>
        </>
      )}

      <button type="button" className="explore-page__back" onClick={() => navigate('/destination')}>
        Back
      </button>
    </section>
  )
}
