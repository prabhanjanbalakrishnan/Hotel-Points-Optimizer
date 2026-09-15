import { useEffect, useState } from 'react'
import StatsChart from '../components/StatsChart.jsx'
import './StatsPage.css'

export default function StatsPage() {
  const [status, setStatus] = useState('loading')
  const [counts, setCounts] = useState(null)

  useEffect(() => {
    let cancelled = false
    fetch('/api/stats')
      .then((res) => {
        if (!res.ok) throw new Error('Request failed')
        return res.json()
      })
      .then((data) => {
        if (cancelled) return
        setCounts(data)
        setStatus('ready')
      })
      .catch(() => {
        if (!cancelled) setStatus('error')
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <section className="stats-page">
      <h2>Which programs people are optimizing</h2>
      <p className="stats-page__subtitle">
        Anonymous counts of how many times each program has been selected. No personal data is
        ever attached to these numbers.
      </p>

      {status === 'loading' && <p>Loading stats…</p>}
      {status === 'error' && (
        <p className="stats-page__error">
          Couldn't load stats right now. The tracking backend may not be configured yet.
        </p>
      )}
      {status === 'ready' && (
        <>
          {Object.values(counts).every((c) => c === 0) && (
            <p className="stats-page__empty">No selections recorded yet — be the first!</p>
          )}
          <StatsChart counts={counts} />
        </>
      )}
    </section>
  )
}
