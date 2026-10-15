import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import chainsData from '../data/chains.json'
import destinationsUS from '../data/destinations.json'
import destinationsIndia from '../data/destinationsIndia.json'
import destinationsInternational from '../data/destinationsInternational.json'
import { CURRENCY_SYMBOLS } from '../constants.js'
import './Home.css'

const chains = chainsData.chains

const STATS = [
  { value: chains.length, label: 'loyalty programs' },
  { value: chains.reduce((n, c) => n + c.brandFamily.length, 0), label: 'sub-brands to browse' },
  {
    value:
      destinationsUS.destinations.length +
      destinationsIndia.destinations.length +
      destinationsInternational.destinations.length,
    label: 'destinations to explore',
  },
  { value: 0, label: 'accounts to create' },
]

const STEPS = [
  {
    title: 'Add your programs',
    body: 'Pick the chains you belong to. Points balance and tier are optional.',
  },
  {
    title: 'Pick a destination',
    body: 'Type anywhere, choose from the list, or explore if you’re not sure where to go.',
  },
  {
    title: 'Get the verdict',
    body: 'Points-per-night ranges, cash vs. points, and the perks your status unlocks.',
  },
]

// Each demo is a real lookup against chains.json (which programs are rated
// "Strong" in that region), not hand-written sample output.
const DEMO_QUERIES = [
  { destination: 'Tokyo', region: 'Asia' },
  { destination: 'Paris', region: 'Europe' },
  { destination: 'Dubai', region: 'Middle East' },
  { destination: 'Goa', region: 'West India' },
]

function valueLabel(chain) {
  if (chain.programType === 'redemption-chart') {
    const v = chain.pointValuation.valuePerPoint
    return chain.currency === 'INR' ? `~${v} paise/pt` : `~${v}¢/pt`
  }
  if (chain.programType === 'cashback-currency') return `1 pt = ${CURRENCY_SYMBOLS[chain.currency]}1`
  return 'tier discounts'
}

const DEMOS = DEMO_QUERIES.map(({ destination, region }) => {
  const strong = chains.filter((c) => c.regionPresence?.[region] === 'Strong')
  return {
    destination,
    region,
    command: `optimize --to "${destination}"`,
    strongCount: strong.length,
    rows: strong.slice(0, 4).map((c) => ({ id: c.id, name: c.name, value: valueLabel(c) })),
  }
})

const CYCLE_MS = 6500

function TerminalDemo() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined
    const id = setInterval(() => setIndex((i) => (i + 1) % DEMOS.length), CYCLE_MS)
    return () => clearInterval(id)
  }, [])

  const demo = DEMOS[index]

  return (
    <div
      className="home-term"
      role="img"
      aria-label={`Example: searching ${demo.destination} lists the loyalty programs with strong presence there`}
    >
      <div className="home-term__bar" aria-hidden="true">
        <span className="home-term__square" />
        <span className="home-term__square" />
        <span className="home-term__square" />
        <span className="home-term__title">optimize.sh</span>
      </div>
      <div className="home-term__body" key={index} aria-hidden="true">
        <p className="home-term__cmd">
          <span className="home-term__prompt">$</span>
          <span className="home-term__typed" style={{ '--len': demo.command.length }}>
            {demo.command}
          </span>
          <span className="home-term__cursor" />
        </p>
        <p className="home-term__note">
          {demo.strongCount} of {chains.length} programs are strong in {demo.region}
        </p>
        <ul className="home-term__rows">
          {demo.rows.map((row, n) => (
            <li key={row.id} className="home-term__row" style={{ '--n': n }}>
              <span className="home-term__row-name">{row.name}</span>
              <span className="home-term__row-value num">{row.value}</span>
            </li>
          ))}
        </ul>
        <p className="home-term__foot">add yours to see your real numbers</p>
      </div>
    </div>
  )
}

function Marquee() {
  const names = chains.map((c) => c.name)
  return (
    <div className="home-marquee" aria-label="Supported loyalty programs">
      <div className="home-marquee__track">
        <ul className="home-marquee__list">
          {names.map((name) => (
            <li key={name}>{name}</li>
          ))}
        </ul>
        <ul className="home-marquee__list" aria-hidden="true">
          {names.map((name) => (
            <li key={name}>{name}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="home">
      <section className="home__hero">
        <div className="home__hero-copy">
          <p className="home__eyebrow">Hotel loyalty, minus the spreadsheet</p>
          <h1>
            All your hotel <mark>points</mark>, in one place.
          </h1>
          <p className="home__subtitle">
            Tell us which loyalty programs you belong to and where you’re headed — we’ll show you
            roughly how many points a stay costs, whether cash or points is the better deal, and
            what perks your status unlocks.
          </p>
          <div className="home__actions">
            <button type="button" className="home__cta" onClick={() => navigate('/memberships')}>
              Optimize Your Stay <span aria-hidden="true">→</span>
            </button>
            <div className="home__secondary">
              <Link className="home__link" to="/explore">
                Explore destinations
              </Link>
              <Link className="home__link" to="/hotels">
                Browse the programs
              </Link>
            </div>
          </div>
        </div>
        <TerminalDemo />
      </section>

      <Marquee />

      <section className="home__stats" aria-label="By the numbers">
        {STATS.map((stat) => (
          <div className="home__stat" key={stat.label}>
            <span className="home__stat-value num">{stat.value}</span>
            <span className="home__stat-label">{stat.label}</span>
          </div>
        ))}
      </section>

      <section className="home__how">
        <h2>How it works</h2>
        <ol className="home__steps">
          {STEPS.map((step) => (
            <li className="home__step" key={step.title}>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="home__band">
        <div>
          <h2>Add a program, pick a place, get your answer.</h2>
          <p>No sign-up. Nothing saved. Just the math.</p>
        </div>
        <button type="button" className="home__band-cta" onClick={() => navigate('/memberships')}>
          Optimize Your Stay <span aria-hidden="true">→</span>
        </button>
      </section>

      <p className="home__privacy-note">
        Your membership numbers and balances stay in your browser for this session only — we never
        save them.
      </p>
    </div>
  )
}
