const EARTH_RADIUS_MILES = 3958.8

export const LOCAL_RADIUS_MILES = 250

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

/**
 * Splits destinations into "local" (within LOCAL_RADIUS_MILES straight-line
 * distance of home) and "flight" (beyond it), each sorted nearest-first.
 * This is a straight-line approximation, not real driving directions.
 */
export function classifyDestinations(home, destinations) {
  if (!home) return { local: [], flight: [] }

  const withDistance = destinations.map((d) => ({
    ...d,
    distanceMiles: Math.round(haversineMiles(home.lat, home.lng, d.lat, d.lng)),
  }))

  const byDistance = (a, b) => a.distanceMiles - b.distanceMiles
  return {
    local: withDistance.filter((d) => d.distanceMiles <= LOCAL_RADIUS_MILES).sort(byDistance),
    flight: withDistance.filter((d) => d.distanceMiles > LOCAL_RADIUS_MILES).sort(byDistance),
  }
}
