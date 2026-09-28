import './TripDetailsInput.css'

function today() {
  return new Date().toISOString().slice(0, 10)
}

export default function TripDetailsInput({ checkIn, checkOut, guests, rooms, onChange }) {
  const datesInvalid = checkIn && checkOut && checkOut <= checkIn

  // The `min` attribute below only affects the native calendar widget's
  // styling -- it doesn't stop a browser from firing onChange with an
  // out-of-range value (Safari's date picker lets you scroll past `min`,
  // and typing digits directly into any date input bypasses it entirely).
  // Rejecting the update here, not just flagging it as invalid afterward,
  // is what actually prevents picking a past check-in or a check-out on or
  // before check-in.
  const handleCheckInChange = (value) => {
    if (value < today()) return
    const patch = { checkIn: value }
    // A check-out that's now on or before the new check-in is no longer
    // valid -- clear it rather than leaving a stale invalid value sitting
    // there silently until the user notices the error hint.
    if (checkOut && checkOut <= value) patch.checkOut = ''
    onChange(patch)
  }

  const handleCheckOutChange = (value) => {
    if (checkIn && value <= checkIn) return
    if (!checkIn && value < today()) return
    onChange({ checkOut: value })
  }

  return (
    <div className="trip-details-input">
      <div className="trip-details-input__row">
        <label>
          Check-in
          <input
            type="date"
            min={today()}
            value={checkIn}
            onChange={(e) => handleCheckInChange(e.target.value)}
          />
        </label>
        <label>
          Check-out
          <input
            type="date"
            min={checkIn || today()}
            value={checkOut}
            onChange={(e) => handleCheckOutChange(e.target.value)}
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
