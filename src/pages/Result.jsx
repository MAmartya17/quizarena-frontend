import { useState, useEffect } from 'react'
import { useLocation, Link } from 'react-router-dom'
import api from '../api/axiosClient'
import StarRating from '../components/StarRating'

export default function Result() {
  const { state } = useLocation()
  const result = state?.result
  const quizTitle = state?.quizTitle
  const quizId = state?.quizId
  const [submitted, setSubmitted] = useState(false)
  const [slides, setSlides] = useState([])
  const [showSlides, setShowSlides] = useState(false)
  const [loadingSlides, setLoadingSlides] = useState(false)

  useEffect(() => {
    if (quizId) {
      api.get(`/api/ai/knowledge-slide/quiz/${quizId}`)
        .then(r => setSlides(r.data))
        .catch(() => setSlides([]))
    }
  }, [quizId])

  const rate = async (stars) => {
    if (!quizId) {
      alert('Could not identify the quiz. Please rate from the Browse page.')
      return
    }
    try {
      await api.post(`/api/ratings/${quizId}`, { stars })
      setSubmitted(true)
    } catch (e) {
      alert(e.response?.data?.error || 'Could not submit rating')
    }
  }

  if (!result) {
    return (
      <div className="container">
        <p className="muted mt-lg">No result to display. <Link to="/quizzes">Go back to browse</Link></p>
      </div>
    )
  }

  const percent = Math.round((result.score / result.maxScore) * 100)

  return (
    <div className="container" style={{ maxWidth: 640 }}>
      <h2 className="mt-lg">Result: {quizTitle || 'Quiz'}</h2>

      <div className="card mt-lg" style={{ textAlign: 'center', padding: 32 }}>
        <div style={{
          width: 140, height: 140, borderRadius: '50%',
          background: `conic-gradient(#009B8E ${percent}%, rgba(255,255,255,0.1) 0)`,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 28, fontWeight: 700
        }}>
          {percent}%
        </div>
        <p className="mt" style={{ fontSize: 20 }}>
          {result.score} / {result.maxScore} points
        </p>
        <p className="muted">
          {result.correctCount} / {result.totalQuestions} correct
        </p>
      </div>

      {/* Study Knowledge Slides Section */}
      {slides.length > 0 && (
        <div className="card mt-lg">
          <div className="space-between" style={{ alignItems: 'center' }}>
            <div>
              <h3>🧠 Knowledge Slides & Explanations</h3>
              <p className="muted" style={{ fontSize: 13 }}>Review key concepts and explanations for this quiz ({slides.length} slides)</p>
            </div>
            <button className="btn secondary" onClick={() => setShowSlides(!showSlides)} style={{ fontSize: 13 }}>
              {showSlides ? 'Hide Slides ▲' : 'View Slides ▼'}
            </button>
          </div>

          {showSlides && (
            <div className="grid mt-lg" style={{ gridTemplateColumns: '1fr', gap: 14 }}>
              {slides.map((slide, idx) => (
                <div key={slide.id || idx} style={{
                  padding: 16, borderRadius: 8,
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)'
                }}>
                  <div className="space-between">
                    <span className="badge-grounded" style={{
                      background: slide.sourceGrounded ? 'rgba(0,155,142,0.2)' : 'rgba(255,182,39,0.2)',
                      color: slide.sourceGrounded ? '#2ec4b6' : '#FFB627',
                      padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600
                    }}>
                      {slide.sourceGrounded ? '📄 Source-Grounded' : '🤖 AI Generated'}
                    </span>
                    {slide.sourceReference && (
                      <span className="muted" style={{ fontSize: 11 }}>📌 {slide.sourceReference}</span>
                    )}
                  </div>
                  <h4 className="mt" style={{ fontSize: 15, margin: '8px 0 6px' }}>{slide.title}</h4>
                  <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.5, fontSize: 13, color: '#e0e0e0' }}>
                    {slide.content}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {quizId && (
        <div className="card mt-lg" style={{ textAlign: 'center', padding: 24 }}>
          <h3 style={{ marginBottom: 12 }}>Rate this quiz</h3>
          {submitted
            ? <p className="muted">⭐ Thanks for rating!</p>
            : <StarRating size={32} onChange={rate} />}
        </div>
      )}

      <div className="row mt-lg" style={{ gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        {quizId && <Link to={`/quiz/${quizId}/leaderboard`} className="btn">🏆 Leaderboard</Link>}
        <Link to="/quizzes" className="btn secondary">Browse More</Link>
        <Link to="/scores" className="btn btn-primary">My Scores</Link>
      </div>
    </div>
  )
}