import { createContext, useContext, useReducer } from 'react'

const OptimizerContext = createContext(null)

const initialState = {
  memberships: [], // [{ id, chainId, balance, tier }]
  destination: '',
  checkIn: '',
  checkOut: '',
  guests: 1,
  rooms: 1,
  trackSubmitted: false,
}

let nextRowId = 1

function reducer(state, action) {
  switch (action.type) {
    case 'ADD_MEMBERSHIP':
      return {
        ...state,
        memberships: [
          ...state.memberships,
          { id: nextRowId++, chainId: action.chainId, balance: null, tier: null },
        ],
      }
    case 'REMOVE_MEMBERSHIP':
      return { ...state, memberships: state.memberships.filter((m) => m.id !== action.id) }
    case 'UPDATE_MEMBERSHIP':
      return {
        ...state,
        memberships: state.memberships.map((m) =>
          m.id === action.id ? { ...m, ...action.patch } : m,
        ),
      }
    case 'SET_DESTINATION':
      return { ...state, destination: action.destination }
    case 'SET_TRIP_DETAILS':
      return { ...state, ...action.patch }
    case 'MARK_TRACKED':
      return { ...state, trackSubmitted: true }
    case 'RESET':
      return initialState
    default:
      return state
  }
}

export function OptimizerProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  return (
    <OptimizerContext.Provider value={{ state, dispatch }}>{children}</OptimizerContext.Provider>
  )
}

export function useOptimizer() {
  const ctx = useContext(OptimizerContext)
  if (!ctx) throw new Error('useOptimizer must be used within OptimizerProvider')
  return ctx
}
