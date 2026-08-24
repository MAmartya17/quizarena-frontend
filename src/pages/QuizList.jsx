import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axiosClient'
import StarRating from '../components/StarRating'

export default function QuizList() {
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('')
  const [sort, setSort] = useState('recent')

  const load = async () => {
    setLoading(true)
    try {
      const params = {}
      if (category) params.category = category
      if (sort) params.sort = sort
      const { data } = await api.get('/api/quizzes/public', { params })
      setQuizzes(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [category, sort])

  // Shared inner content for both locked and unlocked cards
  const cardBody = (q) => (
    <>
      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <h3 style={{ margin: 0 }}>{q.title}</h3>
        {q.locked && (
          <span style={{
            display: 'inline-block', padding: '3px 10px', borderRadius: 12,
            background: '#78350F', color: '#FCD34D', fontSize: 12, fontWeight: 700,
            whiteSpace: 'nowrap'
          }}>
            🔒 In Contest
          </span>
        )}
      </div>
      <p className="muted">{q.description}</p>
      <div className="row mt" style={{ alignItems: 'center', gap: 8 }}>
        <StarRating value={Math.round(q.avgRating || 0)} readOnly size={16} />
        <span className="muted" style={{ fontSize: 12 }}>
          {q.ratingCount > 0
            ? `${q.avgRating.toFixed(1)} (${q.ratingCount})`
            : 'No ratings yet'}
        </span>
      </div>
      <div className="row mt" style={{ justifyContent: 'space-between' }}>
        <span className="badge">{q.category}</span>
        <span className="muted" style={{ fontSize: 12 }}>
          {q.questionCount} questions · {q.durationMinutes} min
        </span>
      </div>
      {q.locked ? (
        <p className="muted mt" style={{ fontSize: 12 }}>
          Part of a live contest — can't be played directly right now.
        </p>
      ) : (
        <p className="muted mt" style={{ fontSize: 12 }}>by {q.creatorName}</p>
      )}
    </>
  )

  return (
    <div className="container">
      <h2 className="mt-lg">Browse Quizzes</h2>

      <div className="row mt" style={{ gap: 12, flexWrap: 'wrap' }}>
        <input
          className="input"
          style={{ maxWidth: 240 }}
          placeholder="Filter by category..."
          value={category}
          onChange={e => setCategory(e.target.value)}
        />
        <select
          className="input"
          style={{ maxWidth: 200 }}
          value={sort}
          onChange={e => setSort(e.target.value)}
        >
          <option value="recent">Most Recent</option>
          <option value="rating">Highest Rated</option>
        </select>
      </div>

      {loading ? (
        <p className="muted mt-lg">Loading quizzes...</p>
      ) : quizzes.length === 0 ? (
        <p className="muted mt-lg">No quizzes found.</p>
      ) : (
        <div className="grid mt-lg">
          {quizzes.map(q =>
            q.locked ? (
              // Locked: not clickable, greyed out
              <div
                key={q.id}
                className="card"
                style={{ textDecoration: 'none', opacity: 0.6, cursor: 'not-allowed' }}
                title="This quiz is part of a live contest"
              >
                {cardBody(q)}
              </div>
            ) : (
              // Unlocked: normal clickable card
              <Link
                key={q.id}
                to={`/quiz/${q.id}`}
                className="card"
                style={{ textDecoration: 'none' }}
              >
                {cardBody(q)}
              </Link>
            )
          )}
        </div>
      )}
    </div>
  )
}