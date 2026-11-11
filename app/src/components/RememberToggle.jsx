import { useState } from 'react'
import { storageAvailable } from '../utils/persistence.js'
import './RememberToggle.css'

export default function RememberToggle({ checked, onChange }) {
  // Checked once: a browser that blocks storage won't start allowing it mid-visit.
  const [available] = useState(storageAvailable)

  return (
    <div className="remember-toggle">
      <label>
        <input
          type="checkbox"
          checked={checked}
          disabled={!available}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span>Remember my programs and card points on this device</span>
      </label>
      <p>
        {available
          ? 'Saved only in this browser and never sent anywhere. Untick to erase it. Trip details like destination and dates are never saved.'
          : 'Your browser is blocking site storage, so this can’t be turned on here. Everything still works for this visit.'}
      </p>
    </div>
  )
}
