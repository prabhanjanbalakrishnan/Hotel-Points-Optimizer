import { useNavigate } from 'react-router-dom'
import { useOptimizer } from '../context/OptimizerContext.jsx'
import { CHAINS } from '../constants.js'
import chainsData from '../data/chains.json'
import MembershipList from '../components/MembershipList.jsx'
import './MembershipsPage.css'

export default function MembershipsPage() {
  const { state, dispatch } = useOptimizer()
  const navigate = useNavigate()
  const { memberships } = state

  const handleAdd = (chainId) => dispatch({ type: 'ADD_MEMBERSHIP', chainId })
  const handleChange = (id, patch) => dispatch({ type: 'UPDATE_MEMBERSHIP', id, patch })
  const handleRemove = (id) => dispatch({ type: 'REMOVE_MEMBERSHIP', id })

  return (
    <section className="memberships-page">
      <h2>Which programs are you a member of?</h2>
      <p className="memberships-page__subtitle">
        Add each hotel loyalty program you belong to. Points balance and tier are optional.
      </p>

      {memberships.length === 0 ? (
        <button
          type="button"
          className="memberships-page__first-add"
          onClick={() => handleAdd(CHAINS[0].slug)}
        >
          + Add your first program
        </button>
      ) : (
        <MembershipList
          memberships={memberships}
          chainsData={chainsData.chains}
          onAdd={handleAdd}
          onChange={handleChange}
          onRemove={handleRemove}
        />
      )}

      <div className="memberships-page__actions">
        <button
          type="button"
          className="memberships-page__next"
          disabled={memberships.length === 0}
          onClick={() => navigate('/destination')}
        >
          Next
        </button>
      </div>
    </section>
  )
}
