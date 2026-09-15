import { useNavigate } from 'react-router-dom'
import { useOptimizer } from '../context/OptimizerContext.jsx'
import DestinationInput from '../components/DestinationInput.jsx'
import './DestinationPage.css'

function trackSelections(chainIds) {
  fetch('/api/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chains: chainIds }),
  }).catch(() => {
    // Anonymous analytics failing should never block the user's flow.
  })
}

export default function DestinationPage() {
  const { state, dispatch } = useOptimizer()
  const navigate = useNavigate()

  const handleNext = () => {
    if (state.memberships.length === 0) {
      navigate('/memberships')
      return
    }
    if (!state.trackSubmitted) {
      trackSelections(state.memberships.map((m) => m.chainId))
      dispatch({ type: 'MARK_TRACKED' })
    }
    navigate('/results')
  }

  return (
    <section className="destination-page">
      <h2>Where are you headed?</h2>
      <DestinationInput
        value={state.destination}
        onChange={(destination) => dispatch({ type: 'SET_DESTINATION', destination })}
      />
      <div className="destination-page__actions">
        <button type="button" className="destination-page__back" onClick={() => navigate('/memberships')}>
          Back
        </button>
        <button type="button" className="destination-page__next" onClick={handleNext}>
          Next
        </button>
      </div>
    </section>
  )
}
