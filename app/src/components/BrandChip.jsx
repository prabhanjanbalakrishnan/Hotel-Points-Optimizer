import { useState } from 'react'
import './BrandChip.css'

export default function BrandChip({ brand }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="brand-chip">
      <button
        type="button"
        className={open ? 'brand-chip__pill brand-chip__pill--open' : 'brand-chip__pill'}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        {brand.name}
      </button>

      {open && (
        <div className="brand-chip__panel">
          <p className="brand-chip__blurb">{brand.blurb}</p>
          <a className="brand-chip__link" href={brand.url} target="_blank" rel="noopener noreferrer">
            Visit {brand.name} ↗
          </a>
        </div>
      )}
    </div>
  )
}
