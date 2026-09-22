import { useNavigate } from 'react-router-dom'
import { useOptimizer } from '../context/OptimizerContext.jsx'
import DestinationInput from '../components/DestinationInput.jsx'
import TripDetailsInput from '../components/TripDetailsInput.jsx'
import './DestinationPage.css'

export default function DestinationPage() {
  const { state, dispatch } = useOptimizer()
  const navigate = useNavigate()

  const datesInvalid = state.checkIn && state.checkOut && state.checkOut <= state.checkIn

  const handleNext = () => {
    if (state.memberships.length === 0) {
      navigate('/memberships')
      return
    }
    if (datesInvalid) return
    navigate('/results')
  }

  return (
    <section className="destination-page">
      <h2>Where are you headed?</h2>
      <DestinationInput
        value={state.destination}
        onChange={(destination) => dispatch({ type: 'SET_DESTINATION', destination })}
      />
      <button type="button" className="destination-page__explore-link" onClick={() => navigate('/explore')}>
        Not sure where to go? Explore destinations →
      </button>
      <TripDetailsInput
        checkIn={state.checkIn}
        checkOut={state.checkOut}
        guests={state.guests}
        rooms={state.rooms}
        onChange={(patch) => dispatch({ type: 'SET_TRIP_DETAILS', patch })}
      />
      <div className="destination-page__actions">
        <button type="button" className="destination-page__back" onClick={() => navigate('/memberships')}>
          Back
        </button>
        <button
          type="button"
          className="destination-page__next"
          onClick={handleNext}
          disabled={datesInvalid}
        >
          Next
        </button>
      </div>
    </section>
  )
}
