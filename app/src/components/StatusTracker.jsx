import { statusProgress } from '../utils/statusLogic.js'
import './StatusTracker.css'

const PERK_LIMIT = 3

export default function StatusTracker({ chain, nightsSoFar, tripNights }) {
  const progress = statusProgress({ chain, nightsSoFar, tripNights })
  if (!progress) return null
  const { reached, next, top, toGo, afterTrip, tripGetsThere, shortAfterTrip } = progress

  const qualifier = (t) =>
    `${t.estimate ? ' (estimate)' : ''}${t.extra ? ', plus other requirements' : ''}`

  return (
    <div className="status-tracker">
      <h4>Status progress</h4>
      <p className="status-tracker__line">
        <strong>{nightsSoFar} night{nightsSoFar === 1 ? '' : 's'}</strong> so far this year
        {reached ? `, enough for ${reached.name}` : ''}.
      </p>

      {next ? (
        <>
          <p className="status-tracker__line">
            Next: <strong>{next.name}</strong> at {next.nights} nights{qualifier(next)}. That&rsquo;s{' '}
            <strong>{toGo} to go</strong>.
          </p>
          {tripNights ? (
            <p
              className={`status-tracker__trip status-tracker__trip--${tripGetsThere ? 'yes' : 'no'}`}
            >
              {tripGetsThere
                ? `This ${tripNights}-night trip would get you there (${afterTrip} nights).`
                : `This ${tripNights}-night trip takes you to ${afterTrip} nights, still ${shortAfterTrip} short of ${next.name}.`}
            </p>
          ) : null}
          {next.perks.length > 0 && (
            <div className="status-tracker__perks">
              <span>{next.name} perks</span>
              <ul>
                {next.perks.slice(0, PERK_LIMIT).map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </div>
          )}
        </>
      ) : (
        <p className="status-tracker__line">
          That&rsquo;s past the top tier&rsquo;s {top.nights}-night mark{qualifier(top)}.
        </p>
      )}

      <p className="status-tracker__note">
        Night counts come from this app&rsquo;s program data, not your account. Programs differ on
        what counts (rooms, partner stays, bonus nights), so check your member dashboard.
      </p>
    </div>
  )
}
