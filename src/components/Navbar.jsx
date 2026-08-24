import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { MandalaIcon } from './Icons'

export default function Navbar() {
  const { user, logout } = useAuth()
  return (
    <nav className="navbar">
      <Link to="/" className="brand">
        <span className="brand-icon" style={{ color: '#FFB627' }}>
          <MandalaIcon size={36} />
        </span>
        <span className="brand-text">QuizArena</span>
      </Link>
      
      <div className="nav-links">
        <Link to="/contests">Contests</Link>
        <NavLink to="/quizzes">Browse</NavLink>
        {user && <NavLink to="/create">Create</NavLink>}
        {user && <NavLink to="/ai-quiz">✨ AI Generate</NavLink>}
        {user && <NavLink to="/my-quizzes">My Quizzes</NavLink>}
        {user && <NavLink to="/scores">Scores</NavLink>}
        {user ? (
          <>
            <img src={user.pictureUrl} alt="" className="avatar" />
            <button className="btn secondary" onClick={logout}>Logout</button>
          </>
        ) : (
          <Link to="/login" className="btn">Login</Link>
          
        )}
      </div>
    </nav>
  )
}