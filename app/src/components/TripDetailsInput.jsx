import './TripDetailsInput.css'

function today() {
  return new Date().toISOString().slice(0, 10)
}

export default function TripDetailsInput({ checkIn, checkOut, guests, rooms, onChange }) {
  const datesInvalid = checkIn && checkOut && checkOut <= checkIn

  return (
    <div className="trip-details-input">
      <div className="trip-details-input__row">
        <label>
          Check-in
          <input
            type="date"
            min={today()}
            value={checkIn}
            onChange={(e) => onChange({ checkIn: e.target.value })}
          />
        </label>
        <label>
          Check-out
          <input
            type="date"
            min={checkIn || today()}
            value={checkOut}
            onChange={(e) => onChange({ checkOut: e.target.value })}
          />
        </label>
      </div>

      <div className="trip-details-input__row">
        <label>
          Guests
          <input
            type="number"
            min="1"
            value={guests}
            onChange={(e) => onChange({ guests: Math.max(1, Number(e.target.value) || 1) })}
          />
        </label>
        <label>
          Rooms
          <input
            type="number"
            min="1"
            value={rooms}
            onChange={(e) => onChange({ rooms: Math.max(1, Number(e.target.value) || 1) })}
          />
        </label>
      </div>

      <p className={datesInvalid ? 'trip-details-input__hint trip-details-input__hint--error' : 'trip-details-input__hint'}>
        {datesInvalid
          ? 'Check-out needs to be after check-in.'
          : 'Optional — add dates to see a total trip estimate, not just per-night.'}
      </p>
    </div>
  )
}
