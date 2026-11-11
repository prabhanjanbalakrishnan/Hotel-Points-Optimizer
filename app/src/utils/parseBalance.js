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
