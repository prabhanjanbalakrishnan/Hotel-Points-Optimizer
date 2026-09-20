import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useOptimizer } from '../context/OptimizerContext.jsx'
import destinationsUS from '../data/destinations.json'
import destinationsIndia from '../data/destinationsIndia.json'
import { INDIA_CITIES } from '../data/indiaCities.js'
import chainsData from '../data/chains.json'
import {
  classifyDestinations,
  findCity,
  preparePlaces,
  searchPlaces,
  haversineMiles,
  haversineKm,
  LOCAL_RADIUS_MILES,
  LOCAL_RADIUS_KM,
} from '../utils/distance.js'
import ExploreDestinationCard from '../components/ExploreDestinationCard.jsx'
import './ExplorePage.css'

const MARKETS = {
  US: {
    label: 'United States',
    flag: '🇺🇸',
    destinations: destinationsUS.destinations,
    distanceFn: haversineMiles,
    radius: LOCAL_RADIUS_MILES,
    unit: 'mi',
    placeholder: 'e.g. Apex, NC',
    radiusLabel: `${LOCAL_RADIUS_MILES} miles, about a 4-hour drive`,
  },
  India: {
    label: 'India',
    flag: '🇮🇳',
    destinations: destinationsIndia.destinations,
    distanceFn: haversineKm,
    radius: LOCAL_RADIUS_KM,
    unit: 'km',
    placeholder: 'e.g. Jaipur, Rajasthan',
    radiusLabel: `${LOCAL_RADIUS_KM} km -- actual drive time varies a lot with traffic and road conditions`,
  },
}

const INDIA_PLACES = preparePlaces(INDIA_CITIES)

export default function ExplorePage() {
  const { state, dispatch } = useOptimizer()
  const navigate = useNavigate()
  const [usPlaces, setUsPlaces] = useState(null)

  const market = MARKETS[state.homeMarket]

  useEffect(() => {
    if (state.homeMarket !== 'US' || usPlaces) return
    let cancelled = false
    import('../data/usPlaces.json').then((mod) => {
      if (cancelled) return
      setUsPlaces(preparePlaces(mod.default))
    })
    return () => {
      cancelled = true
    }
  }, [state.homeMarket, usPlaces])

  const places = state.homeMarket === 'US' ? usPlaces : INDIA_PLACES
  const placesLoading = state.homeMarket === 'US' && !usPlaces

  const suggestions = useMemo(
    () => (places ? searchPlaces(state.homeCity, places) : []),
    [state.homeCity, places],
  )
  const home = useMemo(() => (places ? findCity(state.homeCity, places) : null), [
    state.homeCity,
    places,
  ])
  const { local, flight } = useMemo(
    () => classifyDestinations(home, market.destinations, { radius: market.radius, distanceFn: market.distanceFn }),
    [home, market],
  )
  const notRecognized = places && state.homeCity.trim() && !home

  const chainHintsFor = (region) =>
    state.memberships
      .map((m) => chainsData.chains.find((c) => c.id === m.chainId))
      .filter(Boolean)
      .map((c) => ({ name: c.name, presence: c.regionPresence?.[region] }))
      .filter((h) => h.presence)

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

      <div className="explore-page__market-toggle" role="group" aria-label="Home base">
        {Object.entries(MARKETS).map(([key, m]) => (
          <button
            key={key}
            type="button"
            className={
              state.homeMarket === key
                ? 'explore-page__market-btn explore-page__market-btn--active'
                : 'explore-page__market-btn'
            }
            onClick={() => dispatch({ type: 'SET_HOME_MARKET', homeMarket: key })}
          >
            {m.flag} {m.label}
          </button>
        ))}
      </div>

      <label className="explore-page__home-select">
        Hometown
        <input
          type="text"
          list="home-city-options"
          placeholder={market.placeholder}
          value={state.homeCity}
          disabled={placesLoading}
          onChange={(e) => dispatch({ type: 'SET_HOME_CITY', homeCity: e.target.value })}
        />
        <datalist id="home-city-options">
          {suggestions.map((p) => (
            <option key={`${p.name}, ${p.state}`} value={`${p.name}, ${p.state}`} />
          ))}
        </datalist>
      </label>

      {placesLoading && <p className="explore-page__hint">Loading the US places list…</p>}
      {!placesLoading && !state.homeCity.trim() && (
        <p className="explore-page__hint">
          Start typing your hometown, city, or nearby small town (format "City, ST") — pick a
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
            {market.radiusLabel}.
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
                  unit={market.unit}
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
                  unit={market.unit}
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
