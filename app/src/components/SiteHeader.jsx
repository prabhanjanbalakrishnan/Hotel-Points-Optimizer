import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import './SiteHeader.css'

// Where Back goes when there is nothing in this app's history to go back to
// (the page was opened directly, or after a refresh): one step up the flow.
const FALLBACK = {
  '/memberships': '/',
  '/destination': '/memberships',
  '/explore': '/destination',
  '/results': '/destination',
  '/hotels': '/',
}

export default function SiteHeader() {
  const navigate = useNavigate()
  const { pathname, key } = useLocation()
  const showBack = pathname !== '/'

  // `key` is "default" for the first page loaded in this tab; going back from
  // there would leave the app, so use the fixed fallback instead.
  const goBack = () => (key === 'default' ? navigate(FALLBACK[pathname] ?? '/') : navigate(-1))

  return (
    <header className="site-header">
      <div className="site-header__left">
        {showBack && (
          <button type="button" className="site-header__back" onClick={goBack}>
            <span aria-hidden="true">←</span> Back
          </button>
        )}
        <NavLink to="/" className="site-header__brand">
          Hotel Points Optimizer
        </NavLink>
      </div>
      <nav className="site-header__nav">
        <NavLink to="/" end>
          Home
        </NavLink>
        <NavLink to="/hotels">More Hotel Info</NavLink>
      </nav>
    </header>
  )
}
