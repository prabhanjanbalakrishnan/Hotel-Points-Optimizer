/**
 * Blank, negative, or non-numeric input becomes "no balance" (null) rather
 * than a negative number reaching the results math, which used to crash it.
 * Shared by the hotel-program and bank-points balance fields.
 */
export default function parseBalance(raw) {
  if (raw === '') return null
  const n = Math.floor(Number(raw))
  return Number.isFinite(n) && n > 0 ? n : null
}

/**
 * A night count: blank or invalid is "not tracking" (null), but 0 is a real
 * answer ("I've stayed no nights yet"), unlike a points balance where 0 and
 * blank mean the same thing.
 */
export function parseNights(raw) {
  if (raw === '') return null
  const n = Math.floor(Number(raw))
  return Number.isFinite(n) && n >= 0 ? n : null
}
