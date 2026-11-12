import { useRef } from 'react'
import './Tabs.css'

/**
 * A row of tabs (WAI-ARIA tablist: arrow keys, Home/End, one tab stop).
 * The parent owns the panels: give each `role="tabpanel"`, the id
 * `${idPrefix}-panel-${tab.id}`, `aria-labelledby={`${idPrefix}-tab-${tab.id}`}`,
 * and `hidden` unless it is the active one. Hidden (not unmounted) panels keep
 * whatever the user typed into them.
 */
export default function Tabs({ tabs, value, onChange, idPrefix, label, variant = 'top' }) {
  const refs = useRef({})

  const onKeyDown = (e, index) => {
    let next
    if (e.key === 'ArrowRight') next = (index + 1) % tabs.length
    else if (e.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = tabs.length - 1
    else return
    e.preventDefault()
    onChange(tabs[next].id)
    refs.current[tabs[next].id]?.focus()
  }

  return (
    <div className={`tabs tabs--${variant}`} role="tablist" aria-label={label}>
      {tabs.map((t, i) => (
        <button
          key={t.id}
          type="button"
          role="tab"
          id={`${idPrefix}-tab-${t.id}`}
          aria-selected={t.id === value}
          aria-controls={`${idPrefix}-panel-${t.id}`}
          tabIndex={t.id === value ? 0 : -1}
          ref={(el) => {
            refs.current[t.id] = el
          }}
          className="tabs__tab"
          onClick={() => onChange(t.id)}
          onKeyDown={(e) => onKeyDown(e, i)}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}
