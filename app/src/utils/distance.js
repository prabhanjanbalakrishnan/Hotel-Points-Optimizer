const EARTH_RADIUS_MILES = 3958.8
const MILES_TO_KM = 1.60934

export const LOCAL_RADIUS_MILES = 250
// India's threshold is deliberately in km (not a mile conversion of the US
// number) and slightly lower in equivalent distance -- India's road/traffic
// conditions mean a given straight-line distance often takes longer to
// drive than the US benchmark this app's US mode is loosely calibrated to,
// so "roughly a same-day drive" lands at a shorter radius, not exactly 250mi
// converted. Still just a rule-of-thumb, disclosed as such on the page.
export const LOCAL_RADIUS_KM = 200

/** Great-circle distance in miles between two lat/lng points. */
export function haversineMiles(lat1, lng1, lat2, lng2) {
  const toRad = (deg) => (deg * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return EARTH_RADIUS_MILES * c
}

/** Great-circle distance in km between two lat/lng points. */
export function haversineKm(lat1, lng1, lat2, lng2) {
  return haversineMiles(lat1, lng1, lat2, lng2) * MILES_TO_KM
}

/**
 * Converts the raw [name, state, lat, lng] tuples (the compact shape
 * usPlaces.json ships in, to keep that ~32k-row file smaller) into objects
 * with a precomputed lowercase `label` ("name, state"), sorted by that label.
 * Sorting by name-first (rather than the file's original state-then-name
 * order) is what makes searchPlaces/findCity fast: it turns "everything
 * starting with a given prefix" into a contiguous slice you can binary-search
 * into, instead of a scan spread evenly across all 50 states.
 */
export function preparePlaces(rawRows) {
  const places = rawRows.map(([name, state, lat, lng]) => ({
    name,
    state,
    lat,
    lng,
    label: `${name}, ${state}`.toLowerCase(),
  }))
  places.sort((a, b) => (a.label < b.label ? -1 : a.label > b.label ? 1 : 0))
  return places
}

/** Index of the first place whose label is >= query, in a label-sorted array. */
function lowerBound(sortedPlaces, query) {
  let lo = 0
  let hi = sortedPlaces.length
  while (lo < hi) {
    const mid = (lo + hi) >>> 1
    if (sortedPlaces[mid].label < query) lo = mid + 1
    else hi = mid
  }
  return lo
}

/**
 * Finds a city by exact "City, ST" match (case-insensitive, whitespace-
 * trimmed) against a label-sorted array (see preparePlaces), or null if the
 * text is empty or doesn't match anything. Deliberately exact rather than
 * fuzzy -- many city names repeat across states (Springfield, Portland,
 * Charleston, and thousands more once every US town is included), so
 * guessing wrong would silently anchor the distance calculation to the
 * wrong place.
 */
export function findCity(query, sortedPlaces) {
  if (!query || !query.trim()) return null
  const normalized = query.trim().toLowerCase()
  const candidate = sortedPlaces[lowerBound(sortedPlaces, normalized)]
  return candidate && candidate.label === normalized ? candidate : null
}

/**
 * Returns up to `limit` places whose label starts with the query, via binary
 * search into a label-sorted array (see preparePlaces) rather than scanning
 * it -- with ~32k US places, a linear scan of every keystroke is either too
 * slow (full scan) or silently misses whole states (scan capped at some N
 * rows, since the file's original state-then-name order spreads matches for
 * a common prefix like "s" evenly across all 50 states rather than
 * clustering them). Sorting by name first turns this into O(log n).
 */
export function searchPlaces(query, sortedPlaces, limit = 8) {
  if (!query || !query.trim()) return []
  const q = query.trim().toLowerCase()
  const start = lowerBound(sortedPlaces, q)
  const results = []
  for (let i = start; i < sortedPlaces.length && results.length < limit; i++) {
    if (!sortedPlaces[i].label.startsWith(q)) break
    results.push(sortedPlaces[i])
  }
  return results
}

/**
 * Splits destinations into "local" (within `radius` straight-line distance
 * of home, per `distanceFn`) and "flight" (beyond it), each sorted
 * nearest-first. This is a straight-line approximation, not real driving
 * directions. Defaults match the original US mode (miles); India mode
 * passes { radius: LOCAL_RADIUS_KM, distanceFn: haversineKm }.
 */
export function classifyDestinations(
  home,
  destinations,
  { radius = LOCAL_RADIUS_MILES, distanceFn = haversineMiles } = {},
) {
  if (!home) return { local: [], flight: [] }

  const withDistance = destinations
    .map((d) => ({
      ...d,
      distanceValue: Math.round(distanceFn(home.lat, home.lng, d.lat, d.lng)),
    }))
    // A destination essentially at home's own coordinates (e.g. searching
    // "Jaipur, Rajasthan" when Jaipur is itself in the destinations list)
    // isn't a useful "local getaway" suggestion -- drop it rather than
    // recommend the user's own city to them.
    .filter((d) => d.distanceValue > 2)

  const byDistance = (a, b) => a.distanceValue - b.distanceValue
  return {
    local: withDistance.filter((d) => d.distanceValue <= radius).sort(byDistance),
    flight: withDistance.filter((d) => d.distanceValue > radius).sort(byDistance),
  }
}
