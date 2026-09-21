import { NavLink } from 'react-router-dom'
import './SiteHeader.css'

export default function SiteHeader() {
  return (
    <header className="site-header">
      <NavLink to="/" className="site-header__brand">
        Hotel Points Optimizer
      </NavLink>
      <nav className="site-header__nav">
        <NavLink to="/" end>
          Home
        </NavLink>
        <NavLink to="/hotels">More Hotel Info</NavLink>
        <NavLink to="/stats">Stats</NavLink>
      </nav>
    </header>
  )
}
