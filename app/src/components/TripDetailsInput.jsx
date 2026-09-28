import { useState } from 'react'
import './TripDetailsInput.css'

function today() {
  return new Date().toISOString().slice(0, 10)
}

/**
 * A "min 1" number field that's actually typable. The naive controlled
 * pattern (`value={n}`, commit `Math.max(1, Number(raw) || 1)` on every
 * keystroke) snaps back to 1 the instant the field is empty -- which is
 * every keystroke where you've backspaced the old value to type a new one
 * (`Number('') || 1` is 1) -- so the only way to change it was the spinner
 * arrows. This keeps its own text buffer so an empty or transiently-invalid
 * string can sit in the input while the user types, only pushing a value
 * up to the caller once it parses as a whole number >= 1, and cleaning up
 * to a valid integer on blur (empty, "0", "-3", "2.5", "abc" all become 1
 * or their floor, matching the old min-1 behavior).
 */
function useCountField(value, onChangeValue) {
  const [text, setText] = useState(String(value))
  const [syncedValue, setSyncedValue] = useState(value)

  // Adjusting local text from an external value change (e.g. Next/Back
  // preserving state) during render rather than in an effect -- same
  // pattern as CityPicker.jsx, avoids an extra render just to mirror props.
  if (value !== syncedValue) {
    setSyncedValue(value)
    setText(String(value))
  }

  const commit = (n) => {
    setSyncedValue(n)
    onChangeValue(n)
  }

  return {
    value: text,
    onChange: (e) => {
      const raw = e.target.value
      setText(raw)
      const parsed = Number(raw)
      if (raw !== '' && Number.isInteger(parsed) && parsed >= 1) commit(parsed)
    },
    onBlur: () => {
      const floored = Math.floor(Number(text))
      const final = Number.isFinite(floored) && floored >= 1 ? floored : 1
      setText(String(final))
      commit(final)
    },
  }
}

export default function TripDetailsInput({ checkIn, checkOut, guests, rooms, onChange }) {
  const guestsField = useCountField(guests, (n) => onChange({ guests: n }))
  const roomsField = useCountField(rooms, (n) => onChange({ rooms: n }))
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
          <input type="number" min="1" {...guestsField} />
        </label>
        <label>
          Rooms
          <input type="number" min="1" {...roomsField} />
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
