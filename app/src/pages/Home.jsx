import { useNavigate } from 'react-router-dom'
import './Home.css'

export default function Home() {
  const navigate = useNavigate()

  return (
    <section className="home">
      <h1>All your hotel points, in one place.</h1>
      <p className="home__subtitle">
        Tell us which loyalty programs you belong to and where you're headed — we'll show you
        roughly how many points a stay costs, whether cash or points is the better deal, and what
        perks your status unlocks.
      </p>
      <button type="button" className="home__cta" onClick={() => navigate('/memberships')}>
        Optimize Your Stay
      </button>
      <p className="home__privacy-note">
        Your membership numbers and balances stay in your browser for this session only — we
        never save them.
      </p>
    </section>
  )
}
