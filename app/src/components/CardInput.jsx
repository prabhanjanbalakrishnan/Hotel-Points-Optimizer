import { useEffect, useMemo, useRef, useState } from 'react'
import creditCards from '../data/creditCards.json'
import './CityPicker.css'
import './CardInput.css'

const cards = creditCards.cards

const GROUPS = [
  {
    key: 'US',
    label: 'US Cards',
    flag: '🇺🇸',
    defaults: [
      'Chase Sapphire Reserve',
      'Chase Sapphire Preferred',
      'Amex Platinum',
      'Amex Gold',
      'Capital One Venture X',
      'Citi Strata Premier',
    ],
  },
  {
    key: 'Hotel co-brand',
    label: 'Hotel Co-brand Cards',
    flag: '🏨',
    defaults: [
      'Marriott Bonvoy Boundless',
      'Marriott Bonvoy Brilliant',
      'Hilton Honors Amex Surpass',
      'Hilton Honors Amex Aspire',
      'World of Hyatt Credit Card',
      'IHG One Rewards Premier',
    ],
  },
  {
    key: 'India',
    label: 'Indian Cards',
    flag: '🇮🇳',
    defaults: [
      'HDFC Infinia',
      'HDFC Diners Club Black',
      'Axis Atlas',
      'Marriott Bonvoy HDFC Bank',
      'Tata Neu Infinity HDFC Bank',
      'American Express Platinum Travel Card (India)',
    ],
  },
].map((group) => ({ ...group, items: cards.filter((c) => c.group === group.key) }))

function defaultOptions(group) {
  return group.defaults.map((name) => group.items.find((c) => c.name === name)).filter(Boolean)
}

function searchGroup(group, query, limit = 6) {
  const q = query.toLowerCase()
  return group.items
    .filter(
      (c) =>
        c.name.toLowerCase().includes(q) || (c.aliases ?? []).some((a) => a.toLowerCase().includes(q)),
    )
    .slice(0, limit)
}

/**
 * Grouped dropdown of known cards, in the same shape and style as
 * DestinationInput: an assist, not a constraint. `value` is a plain
 * controlled string, so any card can be typed -- ones we don't recognize
 * just get no card-specific notes on Results.
 */
export default function CardInput({ value, onChange }) {
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
    <div className="card-input">
      <label htmlFor="payment-card">Card you'll pay with (optional)</label>
      <div className="city-picker" ref={containerRef}>
        <input
          id="payment-card"
          type="text"
          className="city-picker__input"
          placeholder="e.g. Chase Sapphire Reserve, HDFC Infinia"
          autoComplete="off"
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
                      key={option.id}
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
      <p className="card-input__hint">
        We use this to note how your card connects to each hotel program. Just the card's name —
        never a card number.
      </p>
    </div>
  )
}
