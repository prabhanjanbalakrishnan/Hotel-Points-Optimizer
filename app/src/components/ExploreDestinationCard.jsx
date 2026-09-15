import './ExploreDestinationCard.css'

export default function ExploreDestinationCard({ destination, chainHints, onChoose }) {
  return (
    <div className="explore-destination-card">
      <div className="explore-destination-card__main">
        <span className="explore-destination-card__name">{destination.name}</span>
        <span className="explore-destination-card__distance">
          ~{destination.distanceMiles.toLocaleString()} mi
        </span>
      </div>
      {chainHints.length > 0 && (
        <p className="explore-destination-card__chains">
          {chainHints.map((h) => `${h.name} (${h.presence})`).join(' · ')}
        </p>
      )}
      <button
        type="button"
        className="explore-destination-card__choose"
        onClick={() => onChoose(destination.name)}
      >
        Choose this destination →
      </button>
    </div>
  )
}
