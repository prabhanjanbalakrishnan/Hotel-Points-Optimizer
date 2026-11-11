import chainsData from '../data/chains.json'
import creditCards from '../data/creditCards.json'
import { NO_STATUS_TIER } from '../constants.js'
import { transferCards } from './cardLogic.js'

/**
 * Opt-in "remember me" storage. The app is session-only by default; only when
 * the user ticks "remember on this device" does the profile below get written
 * to this browser's localStorage. It never leaves the browser, and unticking
 * (or "Start over") erases it.
 *
 * What's saved is the *profile* -- memberships, card points, the card name,
 * hometown -- not the trip (destination, dates, guests), which is stale by the
 * next visit.
 *
 * Everything touching storage is guarded: it can throw or be absent (private
 * windows, blocked site data), and the app must work identically without it.
 * Everything read back is re-validated, because stored data can be from an
 * older version, from before a chain was renamed, or hand-edited.
 */
const KEY = 'hotel-points-optimizer:profile'
const VERSION = 1
const MARKETS = ['US', 'India', 'International']

function store() {
  try {
    return window.localStorage
  } catch {
    return null
  }
}

/** Whether this browser will actually let us save (it may block storage). */
export function storageAvailable() {
  const s = store()
  if (!s) return false
  try {
    const probe = `${KEY}:probe`
    s.setItem(probe, '1')
    s.removeItem(probe)
    return true
  } catch {
    return false
  }
}

const positiveInt = (v) => (Number.isFinite(v) && v > 0 ? Math.floor(v) : null)
const nonNegativeInt = (v) => (Number.isFinite(v) && v >= 0 ? Math.floor(v) : null)

/**
 * Rebuilds a trustworthy profile from untrusted stored data, dropping anything
 * that no longer matches the app's own data: unknown chains or cards,
 * duplicate programs, tiers that no longer exist, non-numeric balances. Row
 * ids are reassigned. Returns null if `raw` isn't an object at all.
 */
export function sanitizeProfile(raw) {
  if (!raw || typeof raw !== 'object') return null

  const chainsById = Object.fromEntries(chainsData.chains.map((c) => [c.id, c]))
  const transferCardIds = new Set(transferCards(creditCards.cards).map((c) => c.id))
  let nextId = 1

  const seenChains = new Set()
  const memberships = []
  for (const m of Array.isArray(raw.memberships) ? raw.memberships : []) {
    const chain = chainsById[m?.chainId]
    if (!chain || seenChains.has(chain.id)) continue
    seenChains.add(chain.id)
    memberships.push({
      id: nextId++,
      chainId: chain.id,
      balance: chain.programType === 'discount-tier' ? null : positiveInt(m.balance),
      tier:
        m.tier === NO_STATUS_TIER || chain.eliteTiers.some((t) => t.name === m.tier) ? m.tier : null,
      nightsThisYear: nonNegativeInt(m.nightsThisYear),
    })
  }

  const seenCards = new Set()
  const bankPoints = []
  for (const b of Array.isArray(raw.bankPoints) ? raw.bankPoints : []) {
    if (!transferCardIds.has(b?.cardId) || seenCards.has(b.cardId)) continue
    seenCards.add(b.cardId)
    bankPoints.push({ id: nextId++, cardId: b.cardId, balance: positiveInt(b.balance) })
  }

  const marketOk = MARKETS.includes(raw.homeMarket)
  return {
    memberships,
    bankPoints,
    paymentCard: typeof raw.paymentCard === 'string' ? raw.paymentCard.slice(0, 120) : '',
    homeMarket: marketOk ? raw.homeMarket : 'US',
    homeCity: marketOk && typeof raw.homeCity === 'string' ? raw.homeCity.slice(0, 100) : '',
  }
}

/** The saved profile, or null if nothing is saved, it's unreadable, or it's from another version. */
export function loadSaved() {
  const s = store()
  if (!s) return null
  try {
    const text = s.getItem(KEY)
    if (!text) return null
    const data = JSON.parse(text)
    return data?.v === VERSION ? sanitizeProfile(data.profile) : null
  } catch {
    return null
  }
}

/** True only if the profile was actually written (false when storage is blocked or full). */
export function saveProfile(profile) {
  const s = store()
  if (!s) return false
  try {
    s.setItem(KEY, JSON.stringify({ v: VERSION, profile }))
    return true
  } catch {
    return false
  }
}

export function clearSaved() {
  try {
    store()?.removeItem(KEY)
  } catch {
    /* storage blocked -- nothing was saved to clear */
  }
}
