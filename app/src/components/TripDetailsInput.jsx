import { useState } from 'react'
import './TripDetailsInput.css'

// Local date, not toISOString() -- that's UTC, which is already "tomorrow"
// for US users every evening (after 7pm Eastern), blocking today's check-in.
function today() {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
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

// A complete date as a browser reports it: yyyy-mm-dd. Anything else (a
// partly typed date reports '', a 5-digit year reports 5 digits) isn't one.
const COMPLETE_DATE = /^\d{4}-\d{2}-\d{2}$/

/**
 * A date input that's actually typable by hand. When you type a date, the
 * browser reports a value on every keystroke that completes one: typing the
 * year 2026 into "12/15/yyyy" reports 0002-12-15, then 0020-12-15, then
 * 0202-12-15, and only then 2026-12-15. The old handler rejected every value
 * before today, including those in-between years, and because the input is
 * controlled, rejecting meant React put the old value back -- wiping the
 * month, day and year you had just typed. Same trap as the Guests/Rooms
 * fields (see useCountField above), same fix: keep a draft of whatever the
 * browser reports so typing is never undone, and only push a value up to the
 * parent once it is a complete date that passes `rejection()`.
 *
 * `rejection(date)` returns a message if the date isn't allowed, else null.
 * A date that never becomes allowed is reverted when the field loses focus,
 * with that message, rather than silently. Clearing the field always works.
 */
function useDateField(value, rejection, onCommit, onNotice) {
  const [draft, setDraft] = useState(value)
  const [syncedValue, setSyncedValue] = useState(value)

  // Same adjust-state-from-props-during-render pattern as useCountField.
  if (value !== syncedValue) {
    setSyncedValue(value)
    setDraft(value)
  }

  const commit = (next) => {
    setSyncedValue(next)
    onCommit(next)
  }

  return {
    value: draft,
    onChange: (e) => {
      const raw = e.target.value
      setDraft(raw)
      onNotice(null)
      if (raw === '') {
        commit('')
        return
      }
      if (COMPLETE_DATE.test(raw) && !rejection(raw)) commit(raw)
    },
    onBlur: () => {
      if (draft === value) return
      // Whatever is left in the box never became a usable date: say why and
      // put back the last good value.
      onNotice(COMPLETE_DATE.test(draft) ? rejection(draft) : 'That isn’t a complete date.')
      setDraft(value)
    },
  }
}

export default function TripDetailsInput({ checkIn, checkOut, guests, rooms, onChange }) {
  const guestsField = useCountField(guests, (n) => onChange({ guests: n }))
  const roomsField = useCountField(rooms, (n) => onChange({ rooms: n }))
  const [notice, setNotice] = useState(null)
  const datesInvalid = checkIn && checkOut && checkOut <= checkIn

  // The `min` attribute below only affects the native calendar widget's
  // styling -- it doesn't stop a browser from firing onChange with an
  // out-of-range value (Safari's date picker lets you scroll past `min`,
  // and typing digits directly into any date input bypasses it entirely), so
  // a past check-in or a check-out on or before check-in is refused here.
  // But it's refused by *not committing it* (see useDateField), never by
  // resetting the input, which would undo a date the user is mid-way
  // through typing.
  const checkInRejection = (date) => (date < today() ? 'Check-in can’t be in the past.' : null)
  const checkOutRejection = (date) => {
    if (checkIn) return date <= checkIn ? 'Check-out needs to be after check-in.' : null
    return date < today() ? 'Check-out can’t be in the past.' : null
  }

  const checkInField = useDateField(
    checkIn,
    checkInRejection,
    (value) => {
      const patch = { checkIn: value }
      // A check-out that's now on or before the new check-in is no longer
      // valid -- clear it rather than leaving a stale invalid value sitting
      // there silently until the user notices the error hint.
      if (value && checkOut && checkOut <= value) patch.checkOut = ''
      onChange(patch)
    },
    setNotice,
  )
  const checkOutField = useDateField(
    checkOut,
    checkOutRejection,
    (value) => onChange({ checkOut: value }),
    setNotice,
  )

  return (
    <div className="trip-details-input">
      <div className="trip-details-input__row">
        <label>
          Check-in
          <input
            type="date"
            min={today()}
            {...checkInField}
          />
        </label>
        <label>
          Check-out
          <input
            type="date"
            min={checkIn || today()}
            {...checkOutField}
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

      <p
        className={
          datesInvalid || notice
            ? 'trip-details-input__hint trip-details-input__hint--error'
            : 'trip-details-input__hint'
        }
        role={notice ? 'alert' : undefined}
      >
        {notice ||
          (datesInvalid
            ? 'Check-out needs to be after check-in.'
            : 'Optional — add dates to see a total trip estimate, not just per-night.')}
      </p>
    </div>
  )
}
