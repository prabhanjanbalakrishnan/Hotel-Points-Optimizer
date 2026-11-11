import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useOptimizer } from '../context/OptimizerContext.jsx'
import creditCards from '../data/creditCards.json'
import { findCard } from '../utils/cardLogic.js'
import CardPointsInput from '../components/CardPointsInput.jsx'
import DestinationInput from '../components/DestinationInput.jsx'
import TripDetailsInput from '../components/TripDetailsInput.jsx'
import CardInput from '../components/CardInput.jsx'
import './DestinationPage.css'

export default function DestinationPage() {
  const { state, dispatch } = useOptimizer()
  const navigate = useNavigate()

  const datesInvalid = state.checkIn && state.checkOut && state.checkOut <= state.checkIn

  const card = useMemo(() => findCard(state.paymentCard, creditCards.cards), [state.paymentCard])

  // Writes to the same bankPoints list the Memberships page edits. Clearing
  // the field removes the row (an empty one holds nothing); a first balance
  // creates it.
  const setCardPoints = (c, balance) => {
    const row = state.bankPoints.find((b) => b.cardId === c.id)
    if (row && balance === null) dispatch({ type: 'REMOVE_BANK_POINTS', id: row.id })
    else if (row) dispatch({ type: 'UPDATE_BANK_POINTS', id: row.id, patch: { balance } })
    else if (balance !== null) dispatch({ type: 'ADD_BANK_POINTS', cardId: c.id, balance })
  }

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
      <CardInput
        value={state.paymentCard}
        onChange={(paymentCard) => dispatch({ type: 'SET_TRIP_DETAILS', patch: { paymentCard } })}
      />
      <CardPointsInput
        card={card}
        bankPoints={state.bankPoints}
        onSetBalance={setCardPoints}
        onOpenMemberships={() => navigate('/memberships')}
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
