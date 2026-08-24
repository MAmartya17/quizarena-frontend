import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { SparkleIcon, BookIcon, TrophyIcon, FireIcon, RocketIcon, LotusIcon } from '../components/Icons'

export default function Home() {
  const { user } = useAuth()
  return (
    <>
      <div className="hero">
        <div className="hero-eyebrow">
          <SparkleIcon size={14} /> &nbsp; Built for curious minds
        </div>
        <h1>Test your knowledge.<br/>Build your own quizzes.</h1>
        <p>
          A vibrant playground for learners and creators. Craft custom quizzes,
          challenge the community, climb leaderboards — all secured with Google.
        </p>
        <div className="hero-cta">
          <Link to="/quizzes" className="btn">
            <BookIcon size={18} color="white" /> Browse Quizzes
          </Link>
          {user
            ? <Link to="/create" className="btn secondary">
                <RocketIcon size={18} /> Create a Quiz
              </Link>
            : <Link to="/login" className="btn secondary">
                <SparkleIcon size={16} /> Sign in to Create
              </Link>}
        </div>
      </div>

      <div className="container">
        <div className="feature-strip">
          <div className="feature-pill">
            <div className="icon-wrap"><BookIcon size={22} color="white" /></div>
            <div>
              <h4>Unlimited Quizzes</h4>
              <p>Create as many as you like, on any topic</p>
            </div>
          </div>
          <div className="feature-pill">
            <div className="icon-wrap" style={{ background: 'linear-gradient(135deg, #009B8E, #3A0CA3)' }}>
              <TrophyIcon size={22} color="white" />
            </div>
            <div>
              <h4>Track Best Scores</h4>
              <p>Every attempt saved, best score highlighted</p>
            </div>
          </div>
          <div className="feature-pill">
            <div className="icon-wrap" style={{ background: 'linear-gradient(135deg, #E5383B, #FF6B35)' }}>
              <FireIcon size={22} color="white" />
            </div>
            <div>
              <h4>Real-time Scoring</h4>
              <p>Instant feedback the moment you submit</p>
            </div>
          </div>
          <div className="feature-pill">
            <div className="icon-wrap" style={{ background: 'linear-gradient(135deg, #FFB627, #FF6B35)' }}>
              <LotusIcon size={22} color="white" />
            </div>
            <div>
              <h4>Secure Login</h4>
              <p>Powered by Google — no passwords to remember</p>
            </div>
          </div>
          <div className="feature-pill">
            <div className="icon-wrap" style={{ background: 'linear-gradient(135deg, #FF6B35, #3A0CA3)' }}>
              <SparkleIcon size={22} color="white" />
            </div>
            <div>
              <h4>AI Quiz Generator</h4>
              <p>Upload a PDF and let AI create your quiz</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}