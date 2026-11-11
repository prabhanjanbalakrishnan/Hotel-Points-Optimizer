import { createContext, useContext, useEffect, useReducer } from 'react'
import { canAddCompare } from '../utils/compareLogic.js'
import { loadSaved, saveProfile, clearSaved } from '../utils/persistence.js'

const OptimizerContext = createContext(null)

const initialState = {
  memberships: [], // [{ id, chainId, balance, tier, nightsThisYear }]
  bankPoints: [], // [{ id, cardId, balance }] -- points held on a card, transferable to hotel programs
  destination: '',
  checkIn: '',
  checkOut: '',
  guests: 1,
  rooms: 1,
  homeMarket: 'US',
  homeCity: '',
  paymentCard: '',
  compareTo: [], // extra destinations to compare on Results (trip-specific, never saved)
  remember: false, // opt-in: mirror the profile fields to this browser's localStorage
}

let nextRowId = 1

// Starting state: a remembered profile if the user opted in on a past visit,
// otherwise blank. Row ids are re-seeded past the loaded ones so new rows
// can't collide with them.
function init() {
  const saved = loadSaved()
  if (!saved) return initialState
  const maxId = Math.max(0, ...saved.memberships.map((m) => m.id), ...saved.bankPoints.map((b) => b.id))
  nextRowId = Math.max(nextRowId, maxId + 1)
  return { ...initialState, ...saved, remember: true }
}

function reducer(state, action) {
  switch (action.type) {
    case 'ADD_MEMBERSHIP':
      return {
        ...state,
        memberships: [
          ...state.memberships,
          { id: nextRowId++, chainId: action.chainId, balance: null, tier: null, nightsThisYear: null },
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
    case 'ADD_BANK_POINTS':
      return {
        ...state,
        bankPoints: [
          ...state.bankPoints,
          { id: nextRowId++, cardId: action.cardId, balance: action.balance ?? null },
        ],
      }
    case 'UPDATE_BANK_POINTS':
      return {
        ...state,
        bankPoints: state.bankPoints.map((b) => (b.id === action.id ? { ...b, ...action.patch } : b)),
      }
    case 'REMOVE_BANK_POINTS':
      return { ...state, bankPoints: state.bankPoints.filter((b) => b.id !== action.id) }
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
    case 'ADD_COMPARE':
      return canAddCompare(action.name, state.destination, state.compareTo).ok
        ? { ...state, compareTo: [...state.compareTo, action.name.trim()] }
        : state
    case 'REMOVE_COMPARE':
      return { ...state, compareTo: state.compareTo.filter((d) => d !== action.name) }
    case 'SET_REMEMBER':
      return { ...state, remember: action.value }
    case 'NEW_TRIP':
      // Plan another trip with the same profile: clears only what's specific
      // to one trip. Used instead of RESET when the user is remembered.
      return {
        ...state,
        destination: '',
        checkIn: '',
        checkOut: '',
        guests: 1,
        rooms: 1,
        compareTo: [],
      }
    case 'RESET':
      // Back to a blank slate, including `remember: false` -- which also
      // erases anything saved on this device (see the effect in the provider).
      return initialState
    default:
      return state
  }
}

export function OptimizerProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, init)

  // Mirror the profile to localStorage only while the user has opted in; the
  // moment they haven't (unticked, or RESET), erase it. Trip fields and
  // compareTo are deliberately not part of what's saved.
  const { remember, memberships, bankPoints, paymentCard, homeMarket, homeCity } = state
  useEffect(() => {
    if (remember) saveProfile({ memberships, bankPoints, paymentCard, homeMarket, homeCity })
    else clearSaved()
  }, [remember, memberships, bankPoints, paymentCard, homeMarket, homeCity])

  return (
    <OptimizerContext.Provider value={{ state, dispatch }}>{children}</OptimizerContext.Provider>
  )
}

export function useOptimizer() {
  const ctx = useContext(OptimizerContext)
  if (!ctx) throw new Error('useOptimizer must be used within OptimizerProvider')
  return ctx
}
