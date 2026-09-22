import { useEffect, useMemo, useRef, useState } from 'react'
import { preparePlaces, searchPlaces } from '../utils/distance.js'
import { US_CITIES } from '../data/usCitiesMajor.js'
import { INDIA_CITIES } from '../data/indiaCities.js'
import { INTERNATIONAL_CITIES } from '../data/internationalCities.js'
import './CityPicker.css'

const GROUPS = [
  {
    key: 'US',
    label: 'US Cities',
    flag: '🇺🇸',
    places: preparePlaces(US_CITIES),
    defaults: ['New York', 'Los Angeles', 'Chicago', 'San Francisco', 'Miami', 'Las Vegas'],
  },
  {
    key: 'India',
    label: 'Indian Cities',
    flag: '🇮🇳',
    places: preparePlaces(INDIA_CITIES),
    defaults: ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Jaipur'],
  },
  {
    key: 'International',
    label: 'International Cities',
    flag: '🌍',
    places: preparePlaces(INTERNATIONAL_CITIES),
    defaults: ['Paris', 'Tokyo', 'London', 'Singapore', 'Dubai', 'Sydney'],
  },
]

function defaultOptions(group) {
  return group.defaults.map((name) => group.places.find((p) => p.name === name)).filter(Boolean)
}

/**
 * Grouped, custom-styled city picker replacing a plain <input list="..."> +
 * native <datalist> combo -- browsers render datalist with zero styling
 * control, and it can't show grouped sections. Deliberately a curated list
 * (US_CITIES/INDIA_CITIES/INTERNATIONAL_CITIES, a few hundred entries total)
 * rather than an exhaustive per-suburb dataset -- see CLAUDE.md for why that
 * trade was made here. Selecting a city commits both its label and which
 * group it came from; the caller derives homeMarket from the group.
 */
export default function CityPicker({ value, onSelect, placeholder }) {
  const [query, setQuery] = useState(value || '')
  const [syncedValue, setSyncedValue] = useState(value)
  const [open, setOpen] = useState(false)
  const [highlight, setHighlight] = useState(0)
  const containerRef = useRef(null)

  // Adjusting local state from a prop during render (React's documented
  // pattern for this) instead of in an effect -- avoids an extra render pass
  // just to mirror an external reset of `value` into the input text.
  if (value !== syncedValue) {
    setSyncedValue(value)
    setQuery(value || '')
  }

  useEffect(() => {
    function handleOutsideClick(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  const resultsByGroup = useMemo(() => {
    const trimmed = query.trim()
    const groupsWithOptions = GROUPS.map((group) => ({
      group,
      options: trimmed ? searchPlaces(trimmed, group.places, 6) : defaultOptions(group),
    })).filter((g) => g.options.length > 0)

    return groupsWithOptions.reduce((acc, g) => {
      const prev = acc[acc.length - 1]
      const startIndex = prev ? prev.startIndex + prev.options.length : 0
      acc.push({ ...g, startIndex })
      return acc
    }, [])
  }, [query])

  const flatOptions = useMemo(() => resultsByGroup.flatMap((g) => g.options), [resultsByGroup])

  const commit = (option, group) => {
    const label = `${option.name}, ${option.state}`
    setQuery(label)
    setSyncedValue(label)
    setOpen(false)
    onSelect({ label, group: group.key })
  }

  const handleKeyDown = (e) => {
    if (!open && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      setOpen(true)
      return
    }
    if (!open) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlight((h) => Math.min(h + 1, flatOptions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlight((h) => Math.max(h - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const picked = flatOptions[highlight]
      if (picked) {
        const group = resultsByGroup.find((g) => g.options.includes(picked)).group
        commit(picked, group)
      }
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div className="city-picker" ref={containerRef}>
      <input
        type="text"
        className="city-picker__input"
        placeholder={placeholder}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setHighlight(0)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onClick={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
      />
      {open && resultsByGroup.length > 0 && (
        <div className="city-picker__panel" role="listbox">
          {resultsByGroup.map(({ group, options, startIndex }) => (
            <div key={group.key} className="city-picker__group">
              <div className="city-picker__group-label">
                {group.flag} {group.label}
              </div>
              {options.map((option, i) => {
                const flatIndex = startIndex + i
                const isHighlighted = flatIndex === highlight
                return (
                  <button
                    type="button"
                    key={`${option.name}, ${option.state}`}
                    className={
                      isHighlighted
                        ? 'city-picker__option city-picker__option--highlighted'
                        : 'city-picker__option'
                    }
                    onMouseEnter={() => setHighlight(flatIndex)}
                    onClick={() => commit(option, group)}
                  >
                    {option.name}, {option.state}
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      )}
      {open && resultsByGroup.length === 0 && (
        <div className="city-picker__panel">
          <p className="city-picker__empty">No cities match "{query}" — try a nearby bigger city.</p>
        </div>
      )}
    </div>
  )
}
