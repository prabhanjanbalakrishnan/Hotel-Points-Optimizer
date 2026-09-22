import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useOptimizer } from '../context/OptimizerContext.jsx'
import destinationsUS from '../data/destinations.json'
import destinationsIndia from '../data/destinationsIndia.json'
import destinationsInternational from '../data/destinationsInternational.json'
import { US_CITIES } from '../data/usCitiesMajor.js'
import { INDIA_CITIES } from '../data/indiaCities.js'
import { INTERNATIONAL_CITIES } from '../data/internationalCities.js'
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

// Each home market ranks against up to three destination lists: its own
// "domestic" list (with a local/flight split, since a same-country trip can
// genuinely be a quick drive), plus flat, distance-sorted sections for the
// other two lists (always effectively "a flight" regardless of the exact
// number, so no local/flight split there). International hometowns have no
// domestic list of their own -- see CLAUDE.md "Explore destinations".
const MARKETS = {
  US: {
    home: { distanceFn: haversineMiles, unit: 'mi', places: preparePlaces(US_CITIES) },
    domestic: {
      label: 'Domestic Destinations',
      list: destinationsUS.destinations,
      radius: LOCAL_RADIUS_MILES,
      radiusLabel: `${LOCAL_RADIUS_MILES} miles, about a 4-hour drive`,
    },
    sections: [
      { label: 'Indian Destinations', list: destinationsIndia.destinations },
      { label: 'International Destinations', list: destinationsInternational.destinations },
    ],
  },
  India: {
    home: { distanceFn: haversineKm, unit: 'km', places: preparePlaces(INDIA_CITIES) },
    domestic: {
      label: 'Domestic Destinations',
      list: destinationsIndia.destinations,
      radius: LOCAL_RADIUS_KM,
      radiusLabel: `${LOCAL_RADIUS_KM} km -- actual drive time varies a lot with traffic and road conditions`,
    },
    sections: [
      { label: 'US Destinations', list: destinationsUS.destinations },
      { label: 'International Destinations', list: destinationsInternational.destinations },
    ],
  },
  International: {
    home: { distanceFn: haversineKm, unit: 'km', places: preparePlaces(INTERNATIONAL_CITIES) },
    domestic: null,
    sections: [
      { label: 'US Destinations', list: destinationsUS.destinations },
      { label: 'Indian Destinations', list: destinationsIndia.destinations },
      { label: 'International Destinations', list: destinationsInternational.destinations },
    ],
  },
}

/**
 * Distance-sorted, non-local-split view of a destination list -- reuses
 * classifyDestinations' distance math and its "don't recommend the user's
 * own city back to them" filter, radius: 0 just means nothing can land in
 * `local` (the >2 self-match filter already guarantees the smallest
 * surviving distance is 3), so `flight` ends up holding everything, sorted
 * nearest-first.
 */
function sortedByDistance(home, list, distanceFn) {
  return classifyDestinations(home, list, { radius: 0, distanceFn }).flight
}

export default function ExplorePage() {
  const { state, dispatch } = useOptimizer()
  const navigate = useNavigate()

  const market = MARKETS[state.homeMarket]
  const home = useMemo(() => (market ? findCity(state.homeCity, market.home.places) : null), [
    market,
    state.homeCity,
  ])

  const domesticSplit = useMemo(() => {
    if (!market?.domestic || !home) return null
    return classifyDestinations(home, market.domestic.list, {
      radius: market.domestic.radius,
      distanceFn: market.home.distanceFn,
    })
  }, [market, home])

  const otherSections = useMemo(() => {
    if (!market || !home) return []
    return market.sections.map((s) => ({
      label: s.label,
      items: sortedByDistance(home, s.list, market.home.distanceFn),
    }))
  }, [market, home])

  const chainHintsFor = (region) =>
    state.memberships
      .map((m) => chainsData.chains.find((c) => c.id === m.chainId))
      .filter(Boolean)
      .map((c) => ({
        name: c.name,
        // Chains with a world-region taxonomy (Hilton, Marriott, ...) have
        // no "International" key, so this fallback is a no-op for them.
        // Chains with an India-region taxonomy (Taj, Oberoi, ...) track
        // overseas presence as one lump "International" figure instead of
        // per-world-region, so this is what surfaces their hint on any
        // destination outside India, not just ones literally in that list.
        presence: c.regionPresence?.[region] ?? c.regionPresence?.International,
      }))
      .filter((h) => h.presence)

  const handleChoose = (destinationName) => {
    dispatch({ type: 'SET_DESTINATION', destination: destinationName })
    navigate('/destination')
  }

  const renderGrid = (items) => (
    <div className="explore-page__grid">
      {items.map((d) => (
        <ExploreDestinationCard
          key={d.name}
          destination={d}
          chainHints={chainHintsFor(d.region)}
          onChoose={handleChoose}
          unit={market.home.unit}
        />
      ))}
    </div>
  )

  return (
    <section className="explore-page">
      <h2>Explore destinations</h2>
      <p className="explore-page__subtitle">
        Tell us your hometown and we'll sort popular destinations into a quick local getaway vs.
        farther-flung trips, split by region.
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

      {market && home && (
        <>
          <p className="explore-page__disclaimer">
            Distances are straight-line estimates from {home.name}, {home.state}, not real driving
            directions — a rough guide, not turn-by-turn.
            {market.domestic && (
              <> "Local" means roughly within {market.domestic.radiusLabel}.</>
            )}
          </p>

          {market.domestic && domesticSplit && (
            <div className="explore-page__section">
              <h3>{market.domestic.label}</h3>
              <div className="explore-page__subsection">
                <h4>🚗 Local — worth a drive</h4>
                {domesticSplit.local.length === 0 && (
                  <p className="explore-page__empty">
                    Nothing nearby on our list — try one worth flying to.
                  </p>
                )}
                {domesticSplit.local.length > 0 && renderGrid(domesticSplit.local)}
              </div>
              <div className="explore-page__subsection">
                <h4>✈️ Worth flying to</h4>
                {renderGrid(domesticSplit.flight)}
              </div>
            </div>
          )}

          {otherSections.map((s) => (
            <div className="explore-page__section" key={s.label}>
              <h3>{s.label}</h3>
              {s.items.length === 0 ? (
                <p className="explore-page__empty">Nothing on our list yet.</p>
              ) : (
                renderGrid(s.items)
              )}
            </div>
          ))}
        </>
      )}

      <button type="button" className="explore-page__back" onClick={() => navigate('/destination')}>
        Back
      </button>
    </section>
  )
}
