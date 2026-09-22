import { useEffect, useMemo, useRef, useState } from 'react'
import destinationsUS from '../data/destinations.json'
import destinationsIndia from '../data/destinationsIndia.json'
import destinationsInternational from '../data/destinationsInternational.json'
import '../components/CityPicker.css'
import './DestinationInput.css'

const GROUPS = [
  {
    key: 'US',
    label: 'US Destinations',
    flag: '🇺🇸',
    items: destinationsUS.destinations,
    defaults: ['New York, NY', 'Los Angeles, CA', 'Miami, FL', 'Las Vegas, NV', 'Chicago, IL', 'Orlando, FL'],
  },
  {
    key: 'India',
    label: 'Indian Destinations',
    flag: '🇮🇳',
    items: destinationsIndia.destinations,
    defaults: ['Goa', 'Jaipur, Rajasthan', 'Mumbai, Maharashtra', 'Delhi', 'Agra, Uttar Pradesh', 'Kochi, Kerala'],
  },
  {
    key: 'International',
    label: 'International Destinations',
    flag: '🌍',
    items: destinationsInternational.destinations,
    defaults: ['Paris, France', 'Tokyo, Japan', 'London, UK', 'Singapore', 'Dubai, UAE', 'Bali, Indonesia'],
  },
]

function defaultOptions(group) {
  return group.defaults.map((name) => group.items.find((d) => d.name === name)).filter(Boolean)
}

function searchGroup(group, query, limit = 6) {
  const q = query.toLowerCase()
  return group.items.filter((d) => d.name.toLowerCase().includes(q)).slice(0, limit)
}

/**
 * Grouped dropdown of curated destinations (same three lists Explore
 * Destinations sections into -- US/India/International), styled like
 * CityPicker for visual consistency. Unlike CityPicker, this is an assist,
 * not a constraint: the destination field accepts free text ("rural
 * Montana" is the example in its own placeholder) since matchRegion() does
 * keyword/substring matching, not an exact-list lookup -- so `value` is a
 * plain controlled input the whole time, and picking a suggestion just
 * fills it in rather than being the only way to set it.
 */
export default function DestinationInput({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const [highlight, setHighlight] = useState(0)
  const containerRef = useRef(null)

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
    const trimmed = value.trim()
    const groupsWithOptions = GROUPS.map((group) => ({
      group,
      options: trimmed ? searchGroup(group, trimmed) : defaultOptions(group),
    })).filter((g) => g.options.length > 0)

    return groupsWithOptions.reduce((acc, g) => {
      const prev = acc[acc.length - 1]
      const startIndex = prev ? prev.startIndex + prev.options.length : 0
      acc.push({ ...g, startIndex })
      return acc
    }, [])
  }, [value])

  const flatOptions = useMemo(() => resultsByGroup.flatMap((g) => g.options), [resultsByGroup])

  const commit = (option) => {
    onChange(option.name)
    setOpen(false)
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
      const picked = flatOptions[highlight]
      if (picked) {
        e.preventDefault()
        commit(picked)
      }
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div className="destination-input">
      <label htmlFor="destination">Destination</label>
      <div className="city-picker" ref={containerRef}>
        <input
          id="destination"
          type="text"
          className="city-picker__input"
          placeholder="e.g. Tokyo, Paris, rural Montana"
          value={value}
          onChange={(e) => {
            onChange(e.target.value)
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
                      key={option.name}
                      className={
                        isHighlighted
                          ? 'city-picker__option city-picker__option--highlighted'
                          : 'city-picker__option'
                      }
                      onMouseEnter={() => setHighlight(flatIndex)}
                      onClick={() => commit(option)}
                    >
                      {option.name}
                    </button>
                  )
                })}
              </div>
            ))}
          </div>
        )}
      </div>
      <p className="destination-input__hint">
        This just helps us guess which of your programs have good presence there — it's not a
        live search of specific hotels. Pick a suggestion or type anywhere else you're headed.
      </p>
    </div>
  )
}
