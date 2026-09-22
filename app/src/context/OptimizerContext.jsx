import { createContext, useContext, useReducer } from 'react'

const OptimizerContext = createContext(null)

const initialState = {
  memberships: [], // [{ id, chainId, balance, tier }]
  destination: '',
  checkIn: '',
  checkOut: '',
  guests: 1,
  rooms: 1,
  homeMarket: 'US',
  homeCity: '',
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
    case 'CHOOSE_HOME_CITY':
      // Sets homeMarket and homeCity together, atomically -- the city picker
      // derives the market from whichever list (US/India/International) the
      // chosen city came from, so there's no separate "pick your market
      // first" step, and no risk of a stale homeCity from a different list
      // lingering after the market changes.
      return { ...state, homeMarket: action.homeMarket, homeCity: action.homeCity }
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
