import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { SparkleIcon, BookIcon, TrophyIcon, FireIcon, RocketIcon, LotusIcon } from '../components/Icons'

export default function Home() {
  const { user } = useAuth()
  return (
    <>
      {/* ── Hero ── */}
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

      {/* ── AI Showcase Banner ── */}
      <div className="container">
        <div className="ai-showcase">
          {/* Animated background blobs */}
          <div className="ai-showcase-blob ai-blob-1" />
          <div className="ai-showcase-blob ai-blob-2" />

          <div className="ai-showcase-left">
            <div className="ai-showcase-badge">
              <SparkleIcon size={14} color="#FF6B35" />
              Powered by Gemini AI
            </div>
            <h2 className="ai-showcase-title">
              Generate quizzes<br />
              <span className="ai-gradient-text">from any PDF</span>
            </h2>
            <p className="ai-showcase-desc">
              Upload lecture notes, research papers, or textbooks — our AI reads the content,
              understands concepts, and generates high‑quality MCQs instantly.
              Review, customize, and publish in minutes.
            </p>
            <ul className="ai-feature-list">
              <li>
                <span className="ai-feature-icon">📄</span>
                <div>
                  <strong>PDF to Quiz in seconds</strong>
                  <p>Drop any PDF; AI extracts key concepts automatically</p>
                </div>
              </li>
              <li>
                <span className="ai-feature-icon">🎯</span>
                <div>
                  <strong>Difficulty control</strong>
                  <p>Choose Easy, Medium, or Hard — AI adapts accordingly</p>
                </div>
              </li>
              <li>
                <span className="ai-feature-icon">✏️</span>
                <div>
                  <strong>Review & edit before publish</strong>
                  <p>Inspect every question, swap options, remove any you dislike</p>
                </div>
              </li>
            </ul>
            {user ? (
              <Link to="/ai-quiz" className="btn ai-showcase-cta">
                <SparkleIcon size={16} color="white" />
                Try AI Quiz Builder →
              </Link>
            ) : (
              <Link to="/login" className="btn ai-showcase-cta">
                <SparkleIcon size={16} color="white" />
                Sign in to Try for Free →
              </Link>
            )}
          </div>

          <div className="ai-showcase-right">
            {/* Animated mock quiz card */}
            <div className="ai-mock-card">
              <div className="ai-mock-header">
                <div className="ai-mock-dot red" /><div className="ai-mock-dot yellow" /><div className="ai-mock-dot green" />
                <span className="ai-mock-title">AI Quiz Builder</span>
              </div>
              <div className="ai-mock-body">
                <div className="ai-mock-step ai-mock-step-done">
                  <span className="ai-mock-step-icon">✓</span>
                  <span>PDF uploaded — <em>chapter3.pdf</em></span>
                </div>
                <div className="ai-mock-progress-wrap">
                  <div className="ai-mock-progress-label">
                    <SparkleIcon size={12} color="#FF6B35" /> Generating questions…
                  </div>
                  <div className="ai-mock-progress-bar">
                    <div className="ai-mock-progress-fill" />
                  </div>
                </div>
                <div className="ai-mock-question">
                  <div className="ai-mock-q-label">Q3 of 10</div>
                  <div className="ai-mock-q-text">
                    What is the primary function of mitochondria in eukaryotic cells?
                  </div>
                  <div className="ai-mock-options">
                    {['Protein synthesis', 'Energy production (ATP)', 'DNA replication', 'Lipid storage'].map((opt, i) => (
                      <div key={i} className={`ai-mock-option${i === 1 ? ' ai-mock-option-correct' : ''}`}>
                        <span className="ai-mock-opt-key">{String.fromCharCode(65+i)}</span>
                        {opt}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="ai-mock-footer">
                  <span className="ai-badge"><SparkleIcon size={10} color="#FF8C61" /> AI Generated</span>
                  <span className="diff-badge medium">Medium</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Feature strip ── */}
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