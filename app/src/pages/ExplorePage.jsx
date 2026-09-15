import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useOptimizer } from '../context/OptimizerContext.jsx'
import destinationsData from '../data/destinations.json'
import chainsData from '../data/chains.json'
import {
  classifyDestinations,
  findCity,
  preparePlaces,
  searchPlaces,
  LOCAL_RADIUS_MILES,
} from '../utils/distance.js'
import ExploreDestinationCard from '../components/ExploreDestinationCard.jsx'
import './ExplorePage.css'

export default function ExplorePage() {
  const { state, dispatch } = useOptimizer()
  const navigate = useNavigate()
  const [places, setPlaces] = useState(null)

  useEffect(() => {
    let cancelled = false
    import('../data/usPlaces.json').then((mod) => {
      if (cancelled) return
      setPlaces(preparePlaces(mod.default))
    })
    return () => {
      cancelled = true
    }
  }, [])

  const suggestions = useMemo(
    () => (places ? searchPlaces(state.homeCity, places) : []),
    [state.homeCity, places],
  )
  const home = useMemo(() => (places ? findCity(state.homeCity, places) : null), [
    state.homeCity,
    places,
  ])
  const { local, flight } = useMemo(
    () => classifyDestinations(home, destinationsData.destinations),
    [home],
  )
  const notRecognized = places && state.homeCity.trim() && !home

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
        Tell us your hometown and we'll split popular destinations into a quick local getaway vs.
        somewhere worth flying to.
      </p>

      <label className="explore-page__home-select">
        Hometown
        <input
          type="text"
          list="us-city-options"
          placeholder="e.g. Apex, NC"
          value={state.homeCity}
          disabled={!places}
          onChange={(e) => dispatch({ type: 'SET_HOME_CITY', homeCity: e.target.value })}
        />
        <datalist id="us-city-options">
          {suggestions.map((p) => (
            <option key={`${p.name}, ${p.state}`} value={`${p.name}, ${p.state}`} />
          ))}
        </datalist>
      </label>

      {!places && <p className="explore-page__hint">Loading the US places list…</p>}
      {places && !state.homeCity.trim() && (
        <p className="explore-page__hint">
          Start typing your hometown, city, or nearby small town (format "City, ST") — includes
          every US city, town, and unincorporated community, not just major metros. Pick a
          suggestion from the list so it matches exactly.
        </p>
      )}
      {notRecognized && (
        <p className="explore-page__hint explore-page__hint--error">
          We don't recognize "{state.homeCity}" — pick a suggestion from the dropdown as you type.
        </p>
      )}

      {home && (
        <>
          <p className="explore-page__disclaimer">
            Distances are straight-line estimates from {home.name}, {home.state}, not real driving
            directions — a rough guide, not turn-by-turn. "Local" means roughly within{' '}
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
