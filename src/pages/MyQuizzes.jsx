import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axiosClient'

export default function MyQuizzes() {
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [genSlides, setGenSlides] = useState({}) // quizId -> loading state
  const [viewSlidesQuiz, setViewSlidesQuiz] = useState(null) // quiz object for slides modal
  const [quizSlides, setQuizSlides] = useState([])
  const [loadingSlides, setLoadingSlides] = useState(false)

  const load = () => {
    setLoading(true)
    api.get('/api/quizzes/mine')
      .then(r => setQuizzes(r.data))
      .catch(e => console.error(e))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const del = async (id) => {
    if (!confirm('Are you sure you want to delete this quiz? All questions, attempts, ratings, and knowledge slides will be deleted.')) return
    try {
      await api.delete(`/api/quizzes/${id}`)
      load()
    } catch (e) {
      alert('Failed to delete quiz: ' + (e.response?.data?.error || e.message))
    }
  }

  const openKnowledgeSlides = async (quiz) => {
    setViewSlidesQuiz(quiz)
    setLoadingSlides(true)
    try {
      const { data } = await api.get(`/api/ai/knowledge-slide/quiz/${quiz.id}`)
      setQuizSlides(data)
    } catch (e) {
      setQuizSlides([])
    } finally {
      setLoadingSlides(false)
    }
  }

  const generateKnowledge = async (quizId) => {
    setGenSlides(s => ({ ...s, [quizId]: true }))
    try {
      const { data } = await api.post(`/api/ai/knowledge-slide/quiz/${quizId}`)
      alert(`Generated ${data.length} knowledge slides!`)
      if (viewSlidesQuiz?.id === quizId) {
        setQuizSlides(data)
      }
    } catch (e) {
      alert('Failed: ' + (e.response?.data?.error || e.message))
    } finally {
      setGenSlides(s => ({ ...s, [quizId]: false }))
    }
  }

  return (
    <div className="container">
      <div className="space-between mt-lg">
        <div>
          <h2>My Quizzes</h2>
          <p className="muted">Manage your quizzes, questions, and AI knowledge slides</p>
        </div>
        <div className="row" style={{ gap: 8 }}>
          <Link to="/ai-quiz" className="btn">✨ AI Generate</Link>
          <Link to="/create" className="btn secondary">+ New Quiz</Link>
        </div>
      </div>

      {loading ? (
        <p className="muted mt-lg">Loading your quizzes...</p>
      ) : (
        <div className="grid mt-lg">
          {quizzes.map(q => (
            <div key={q.id} className="card">
              <div className="space-between">
                <span className="tag">{q.category || 'General'}</span>
                {q.locked && <span style={{ fontSize: 11, color: '#FFB627', fontWeight: 600 }}>🔒 In Contest</span>}
              </div>
              <h3 className="mt">{q.title}</h3>
              <p className="muted mt" style={{ fontSize: 13 }}>{q.description || 'No description'}</p>
              <p className="muted mt" style={{ fontSize: 13 }}>
                📊 {q.questionCount} Questions • ⭐ {q.avgRating ? q.avgRating.toFixed(1) : 'No ratings'}
              </p>
              <div className="row mt-lg" style={{ gap: 8, flexWrap: 'wrap' }}>
                <Link to={`/manage/${q.id}`} className="btn secondary" style={{ fontSize: 12 }}>
                  ✏️ Edit / Questions
                </Link>
                <button className="btn secondary" onClick={() => openKnowledgeSlides(q)}
                        style={{ fontSize: 12 }}>
                  🧠 Knowledge Slides
                </button>
                <button className="btn danger" onClick={() => del(q.id)} style={{ fontSize: 12 }}>
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
          {quizzes.length === 0 && (
            <div className="card mt-lg" style={{ textAlign: 'center', padding: 40, gridColumn: '1 / -1' }}>
              <p className="muted">You haven't created any quizzes yet.</p>
              <div className="row mt" style={{ justifyContent: 'center', gap: 12 }}>
                <Link to="/ai-quiz" className="btn">✨ Generate with AI</Link>
                <Link to="/create" className="btn secondary">Create Manually</Link>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Knowledge Slides Modal */}
      {viewSlidesQuiz && (
        <div className="modal-backdrop" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20
        }} onClick={() => setViewSlidesQuiz(null)}>
          <div className="card" style={{ maxWidth: 760, width: '100%', maxHeight: '85vh', overflowY: 'auto', padding: 28 }}
               onClick={e => e.stopPropagation()}>
            <div className="space-between" style={{ alignItems: 'flex-start' }}>
              <div>
                <h2>🧠 Knowledge Slides</h2>
                <p className="muted">{viewSlidesQuiz.title} • {quizSlides.length} Slide(s)</p>
              </div>
              <div className="row" style={{ gap: 8 }}>
                <button className="btn secondary" style={{ fontSize: 12 }}
                        disabled={genSlides[viewSlidesQuiz.id]}
                        onClick={() => generateKnowledge(viewSlidesQuiz.id)}>
                  {genSlides[viewSlidesQuiz.id] ? '⏳ Generating...' : '⚡ Re-generate All'}
                </button>
                <button className="btn secondary" style={{ padding: '4px 10px' }} onClick={() => setViewSlidesQuiz(null)}>✕</button>
              </div>
            </div>

            {loadingSlides ? (
              <p className="muted mt-lg">Loading knowledge slides...</p>
            ) : quizSlides.length === 0 ? (
              <div className="card mt-lg" style={{ textAlign: 'center', padding: 32, background: 'rgba(255,255,255,0.02)' }}>
                <p className="muted">No knowledge slides generated yet for this quiz.</p>
                <button className="btn mt" disabled={genSlides[viewSlidesQuiz.id]}
                        onClick={() => generateKnowledge(viewSlidesQuiz.id)}>
                  {genSlides[viewSlidesQuiz.id] ? '⏳ Generating...' : '🧠 Generate Knowledge Slides Now'}
                </button>
              </div>
            ) : (
              <div className="grid mt-lg" style={{ gridTemplateColumns: '1fr', gap: 16 }}>
                {quizSlides.map((slide, idx) => (
                  <div key={slide.id || idx} className="card" style={{ padding: 18, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div className="space-between" style={{ alignItems: 'center' }}>
                      <span className="badge-grounded" style={{
                        background: slide.sourceGrounded ? 'rgba(0,155,142,0.2)' : 'rgba(255,182,39,0.2)',
                        color: slide.sourceGrounded ? '#2ec4b6' : '#FFB627',
                        padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600
                      }}>
                        {slide.sourceGrounded ? '📄 Source-Grounded' : '🤖 AI Generated'}
                      </span>
                      {slide.sourceReference && (
                        <span className="muted" style={{ fontSize: 12 }}>📌 {slide.sourceReference}</span>
                      )}
                    </div>
                    <h4 className="mt" style={{ fontSize: 16 }}>{slide.title}</h4>
                    <div className="mt" style={{
                      whiteSpace: 'pre-wrap', lineHeight: 1.6, fontSize: 13,
                      background: 'rgba(0,0,0,0.2)', padding: 14, borderRadius: 6
                    }}>
                      {slide.content}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="row mt-lg" style={{ justifyContent: 'flex-end' }}>
              <button className="btn" onClick={() => setViewSlidesQuiz(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}