import { useState, useEffect } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { MandalaIcon, SparkleIcon } from './Icons'

export default function Navbar() {
  const { user, logout } = useAuth()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // close mobile menu on route change
  useEffect(() => { setMenuOpen(false) }, [location.pathname])

  return (
    <nav className={`navbar${scrolled ? ' navbar-scrolled' : ''}`}>
      {/* Brand */}
      <Link to="/" className="brand">
        <span className="brand-icon" style={{ color: '#FFB627' }}>
          <MandalaIcon size={34} />
        </span>
        <span className="brand-text">QuizArena</span>
      </Link>

      {/* AI pill — always visible */}
      <Link to={user ? '/ai-quiz' : '/login'} className="nav-ai-pill" title="AI Quiz Generator">
        <span className="nav-ai-pill-glow" />
        <SparkleIcon size={13} color="#FF6B35" />
        <span>AI Powered</span>
      </Link>

      {/* Desktop nav links */}
      <div className={`nav-links${menuOpen ? ' nav-links-open' : ''}`}>
        <NavLink to="/contests">Contests</NavLink>
        <NavLink to="/quizzes">Browse</NavLink>
        {user && <NavLink to="/create">Create</NavLink>}
        {user && (
          <NavLink to="/ai-quiz" className="nav-link-ai">
            <SparkleIcon size={14} color="#FF6B35" />
            AI Generate
          </NavLink>
        )}
        {user && <NavLink to="/my-quizzes">My Quizzes</NavLink>}
        {user && <NavLink to="/scores">Scores</NavLink>}

        {user ? (
          <div className="nav-user">
            <img src={user.pictureUrl} alt={user.name || 'User'} className="avatar" title={user.name} />
            <button className="btn secondary nav-logout-btn" onClick={logout}>Logout</button>
          </div>
        ) : (
          <Link to="/login" className="btn nav-login-btn">
            Sign In
          </Link>
        )}
      </div>

      {/* Hamburger for mobile */}
      <button
        className={`hamburger${menuOpen ? ' hamburger-open' : ''}`}
        onClick={() => setMenuOpen(o => !o)}
        aria-label="Toggle menu"
      >
        <span /><span /><span />
      </button>
    </nav>
  )
}