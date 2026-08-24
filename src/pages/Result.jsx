import { useState } from 'react'
import { useLocation, Link } from 'react-router-dom'
import api from '../api/axiosClient'
import StarRating from '../components/StarRating'

export default function Result() {
  const { state } = useLocation()
  const result = state?.result
  const quizTitle = state?.quizTitle
  const quizId = state?.quizId
  const [submitted, setSubmitted] = useState(false)

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
    <div className="container" style={{ maxWidth: 600 }}>
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

      {quizId && (
        <div className="card mt-lg" style={{ textAlign: 'center', padding: 24 }}>
          <h3 style={{ marginBottom: 12 }}>Rate this quiz</h3>
          {submitted
            ? <p className="muted">⭐ Thanks for rating!</p>
            : <StarRating size={32} onChange={rate} />}
        </div>
      )}
      {quizId && <Link to={`/quiz/${quizId}/leaderboard`} className="btn">🏆 Leaderboard</Link>}

      <div className="row mt-lg" style={{ gap: 12, justifyContent: 'center' }}>
        <Link to="/quizzes" className="btn">Browse more</Link>
        <Link to="/scores" className="btn btn-primary">My Scores</Link>
      </div>
    </div>
  )
}