import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axiosClient'

export default function MyQuizzes() {
  const [quizzes, setQuizzes] = useState([])
  const [genSlides, setGenSlides] = useState({}) // quizId -> loading state
  const load = () => api.get('/api/quizzes/mine').then(r => setQuizzes(r.data))
  useEffect(() => { load() }, [])

  const del = async (id) => {
    if (!confirm('Delete this quiz?')) return
    await api.delete(`/api/quizzes/${id}`); load()
  }

  const generateKnowledge = async (quizId) => {
    setGenSlides(s => ({ ...s, [quizId]: true }))
    try {
      const { data } = await api.post(`/api/ai/knowledge-slide/quiz/${quizId}`)
      alert(`Generated ${data.length} knowledge slides!`)
    } catch (e) {
      alert('Failed: ' + (e.response?.data?.error || e.message))
    } finally {
      setGenSlides(s => ({ ...s, [quizId]: false }))
    }
  }

  return (
    <div className="container">
      <div className="space-between mt-lg">
        <h2>My Quizzes</h2>
        <div className="row" style={{ gap: 8 }}>
          <Link to="/ai-quiz" className="btn">✨ AI Generate</Link>
          <Link to="/create" className="btn secondary">+ New Quiz</Link>
        </div>
      </div>
      <div className="grid mt-lg">
        {quizzes.map(q => (
          <div key={q.id} className="card">
            <span className="tag">{q.category || 'General'}</span>
            <h3 className="mt">{q.title}</h3>
            <p className="muted mt">{q.questionCount} questions</p>
            <div className="row mt-lg" style={{ gap: 8, flexWrap: 'wrap' }}>
              <Link to={`/manage/${q.id}`} className="btn secondary">Add Questions</Link>
              <button className="btn secondary" onClick={() => generateKnowledge(q.id)}
                      disabled={genSlides[q.id]} style={{ fontSize: 12 }}>
                {genSlides[q.id] ? '⏳ Generating...' : '🧠 Knowledge Slides'}
              </button>
              <button className="btn danger" onClick={() => del(q.id)}>Delete</button>
            </div>
          </div>
        ))}
        {quizzes.length === 0 && <p className="muted">You haven't created any quizzes yet.</p>}
      </div>
    </div>
  )
}