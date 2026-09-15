import './DestinationInput.css'

export default function DestinationInput({ value, onChange }) {
  return (
    <div className="destination-input">
      <label htmlFor="destination">Destination</label>
      <input
        id="destination"
        type="text"
        placeholder="e.g. Tokyo, Paris, rural Montana"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <p className="destination-input__hint">
        This just helps us guess which of your programs have good presence there — it's not a
        live search of specific hotels.
      </p>
    </div>
  )
}
