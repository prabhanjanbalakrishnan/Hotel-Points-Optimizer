import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useOptimizer } from '../context/OptimizerContext.jsx'
import destinationsUS from '../data/destinations.json'
import destinationsIndia from '../data/destinationsIndia.json'
import { US_CITIES } from '../data/usCitiesMajor.js'
import { INDIA_CITIES } from '../data/indiaCities.js'
import chainsData from '../data/chains.json'
import {
  classifyDestinations,
  findCity,
  preparePlaces,
  haversineMiles,
  haversineKm,
  LOCAL_RADIUS_MILES,
  LOCAL_RADIUS_KM,
} from '../utils/distance.js'
import CityPicker from '../components/CityPicker.jsx'
import ExploreDestinationCard from '../components/ExploreDestinationCard.jsx'
import './ExplorePage.css'

// International isn't a key here on purpose -- picking an international
// hometown is a valid CityPicker selection, but there's no curated
// destination list (or local/flight radius convention) to rank against for
// it, so ExplorePage just skips the recommendation sections for that market
// rather than faking one. See CLAUDE.md "Explore destinations".
const MARKETS = {
  US: {
    destinations: destinationsUS.destinations,
    distanceFn: haversineMiles,
    radius: LOCAL_RADIUS_MILES,
    unit: 'mi',
    radiusLabel: `${LOCAL_RADIUS_MILES} miles, about a 4-hour drive`,
    places: preparePlaces(US_CITIES),
  },
  India: {
    destinations: destinationsIndia.destinations,
    distanceFn: haversineKm,
    radius: LOCAL_RADIUS_KM,
    unit: 'km',
    radiusLabel: `${LOCAL_RADIUS_KM} km -- actual drive time varies a lot with traffic and road conditions`,
    places: preparePlaces(INDIA_CITIES),
  },
}

export default function ExplorePage() {
  const { state, dispatch } = useOptimizer()
  const navigate = useNavigate()

  const market = MARKETS[state.homeMarket]
  const home = useMemo(() => (market ? findCity(state.homeCity, market.places) : null), [
    market,
    state.homeCity,
  ])
  const { local, flight } = useMemo(
    () =>
      market
        ? classifyDestinations(home, market.destinations, {
            radius: market.radius,
            distanceFn: market.distanceFn,
          })
        : { local: [], flight: [] },
    [home, market],
  )

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

      <label className="explore-page__home-select">
        Hometown
        <CityPicker
          value={state.homeCity}
          placeholder="e.g. Chicago, Mumbai, Paris…"
          onSelect={({ label, group }) =>
            dispatch({ type: 'CHOOSE_HOME_CITY', homeMarket: group, homeCity: label })
          }
        />
      </label>

      {!state.homeCity && (
        <p className="explore-page__hint">
          Pick your hometown from the dropdown to see nearby vs. far-flung destinations.
        </p>
      )}

      {state.homeMarket === 'International' && state.homeCity && (
        <p className="explore-page__hint">
          Destination recommendations aren't tuned for international home bases yet — head back to{' '}
          <button
            type="button"
            className="explore-page__inline-link"
            onClick={() => navigate('/destination')}
          >
            Destination
          </button>{' '}
          to search directly.
        </p>
      )}

      {market && home && (
        <>
          <p className="explore-page__disclaimer">
            Distances are straight-line estimates from {home.name}, {home.state}, not real driving
            directions — a rough guide, not turn-by-turn. "Local" means roughly within{' '}
            {market.radiusLabel}.
          </p>

          <div className="explore-page__section">
            <h3>🚗 Local — worth a drive</h3>
            {local.length === 0 && (
              <p className="explore-page__empty">Nothing nearby on our list — try one worth flying to.</p>
            )}
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
