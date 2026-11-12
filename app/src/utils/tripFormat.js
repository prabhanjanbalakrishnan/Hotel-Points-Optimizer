/** "Dec 15" from a yyyy-mm-dd string (local date, never UTC-shifted). */
export function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })
}

/** The trip as short parts, e.g. ["Dec 15–Dec 20", "5 nights", "1 room", "2 guests"]. */
export function tripParts(trip, nights) {
  return [
    nights ? `${formatDate(trip.checkIn)}–${formatDate(trip.checkOut)}` : null,
    nights ? `${nights} night${nights > 1 ? 's' : ''}` : null,
    `${trip.rooms} room${trip.rooms > 1 ? 's' : ''}`,
    `${trip.guests} guest${trip.guests > 1 ? 's' : ''}`,
  ].filter(Boolean)
}
