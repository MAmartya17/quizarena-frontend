import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../api/axiosClient'

export default function ManageQuiz() {
  const { id } = useParams()
  const nav = useNavigate()
  const [quiz, setQuiz] = useState(null)
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState({ text: '', optionA: '', optionB: '', optionC: '', optionD: '',
                               correctOption: 'A', points: 1, explanation: '' })
  const [saving, setSaving] = useState(false)
  const [slides, setSlides] = useState({}) // questionId -> slide object
  const [genAll, setGenAll] = useState(false)
  const [activeSlideModal, setActiveSlideModal] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await api.get(`/api/quizzes/${id}`)
      setQuiz(data)
      // Load slides for this quiz
      try {
        const slidesRes = await api.get(`/api/ai/knowledge-slide/quiz/${id}`)
        const map = {}
        slidesRes.data.forEach(s => {
          map[s.questionId] = s
        })
        setSlides(map)
      } catch (err) { /* slides optional */ }
    } catch (e) {
      alert('Could not load quiz: ' + (e.response?.data?.error || e.message))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [id])

  const add = async () => {
    if (!q.text.trim()) return alert('Please enter question text')
    setSaving(true)
    try {
      await api.post(`/api/quizzes/${id}/questions`, q)
      setQ({ text: '', optionA: '', optionB: '', optionC: '', optionD: '', correctOption: 'A', points: 1, explanation: '' })
      load()
    } catch (e) { alert('Failed: ' + (e.response?.data?.error || e.message)) }
    finally { setSaving(false) }
  }

  const deleteQuestion = async (questionId) => {
    if (!confirm('Are you sure you want to delete this question?')) return
    try {
      await api.delete(`/api/quizzes/${id}/questions/${questionId}`)
      load()
    } catch (e) {
      alert('Failed to delete question: ' + (e.response?.data?.error || e.message))
    }
  }

  const generateSingleSlide = async (questionId) => {
    try {
      const { data } = await api.post(`/api/ai/knowledge-slide/question/${questionId}`)
      setSlides(prev => ({ ...prev, [questionId]: data }))
      setActiveSlideModal(data)
    } catch (e) {
      alert('Failed to generate slide: ' + (e.response?.data?.error || e.message))
    }
  }

  const generateAllSlides = async () => {
    setGenAll(true)
    try {
      const { data } = await api.post(`/api/ai/knowledge-slide/quiz/${id}`)
      const map = {}
      data.forEach(s => { map[s.questionId] = s })
      setSlides(map)
      alert(`Generated ${data.length} knowledge slides!`)
    } catch (e) {
      alert('Failed: ' + (e.response?.data?.error || e.message))
    } finally {
      setGenAll(false)
    }
  }

  if (loading) return <div className="container"><p className="muted mt-lg">Loading quiz details...</p></div>
  if (!quiz) return <div className="container"><p className="muted mt-lg">Quiz not found.</p></div>

  return (
    <div className="container" style={{ maxWidth: 840 }}>
      <div className="space-between mt-lg" style={{ alignItems: 'center' }}>
        <div>
          <Link to="/my-quizzes" className="btn secondary" style={{ fontSize: 12, padding: '4px 10px', marginBottom: 8 }}>
            ← Back to My Quizzes
          </Link>
          <h2 style={{ margin: '4px 0' }}>Manage: {quiz.title}</h2>
          <p className="muted">{quiz.category} • {quiz.questions?.length || 0} Questions</p>
        </div>
        <button className="btn secondary" onClick={generateAllSlides} disabled={genAll}
                style={{ fontSize: 13 }}>
          {genAll ? '⏳ Generating...' : '🧠 Generate All Knowledge Slides'}
        </button>
      </div>

      {/* Existing Questions List */}
      <div className="mt-lg">
        <h3>Questions in this Quiz ({quiz.questions?.length || 0})</h3>
        {quiz.questions?.length === 0 ? (
          <p className="muted mt">No questions yet. Add your first question below!</p>
        ) : (
          <div className="grid mt" style={{ gridTemplateColumns: '1fr', gap: 16 }}>
            {quiz.questions?.map((item, idx) => {
              const slide = slides[item.id]
              return (
                <div key={item.id} className="card" style={{ padding: 20 }}>
                  <div className="space-between" style={{ alignItems: 'flex-start' }}>
                    <div style={{ flex: 1, paddingRight: 12 }}>
                      <h4 style={{ margin: 0, fontSize: 16 }}>
                        <span style={{ color: 'var(--primary, #009B8E)', marginRight: 8 }}>#{idx + 1}</span>
                        {item.text}
                      </h4>
                    </div>
                    <div className="row" style={{ gap: 6 }}>
                      {slide ? (
                        <button className="btn secondary" style={{ fontSize: 12, padding: '4px 8px' }}
                                onClick={() => setActiveSlideModal(slide)}>
                          🧠 View Slide
                        </button>
                      ) : (
                        <button className="btn secondary" style={{ fontSize: 12, padding: '4px 8px' }}
                                onClick={() => generateSingleSlide(item.id)}>
                          + Add Slide
                        </button>
                      )}
                      <button className="btn danger" style={{ fontSize: 12, padding: '4px 8px' }}
                              onClick={() => deleteQuestion(item.id)}>
                        🗑️ Delete
                      </button>
                    </div>
                  </div>

                  {/* Options */}
                  <div className="grid mt" style={{ gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 14 }}>
                    {['A', 'B', 'C', 'D'].map(opt => (
                      <div key={opt} style={{
                        padding: '6px 12px',
                        borderRadius: 6,
                        background: item.correctOption === opt ? 'rgba(0,155,142,0.15)' : 'rgba(255,255,255,0.03)',
                        border: item.correctOption === opt ? '1px solid #009B8E' : '1px solid rgba(255,255,255,0.08)',
                        color: item.correctOption === opt ? '#2ec4b6' : 'inherit'
                      }}>
                        <strong>{opt}:</strong> {item['option' + opt]} {item.correctOption === opt && '✓'}
                      </div>
                    ))}
                  </div>

                  {item.explanation && (
                    <p className="muted mt" style={{ fontSize: 13, background: 'rgba(255,255,255,0.02)', padding: '6px 10px', borderRadius: 4 }}>
                      💡 <strong>Explanation:</strong> {item.explanation}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Add New Question Section */}
      <div className="card mt-xl" style={{ border: '1px solid rgba(0,155,142,0.3)' }}>
        <h3>➕ Add New Question</h3>
        <div className="field mt"><label>Question text</label>
          <textarea className="textarea" rows="2" placeholder="Enter question text..." value={q.text} onChange={e=>setQ({...q,text:e.target.value})}/></div>
        <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {['A','B','C','D'].map(k => (
            <div className="field" key={k}><label>Option {k}</label>
              <input className="input" placeholder={`Option ${k}`} value={q['option'+k]} onChange={e=>setQ({...q,['option'+k]:e.target.value})}/></div>
          ))}
        </div>
        <div className="row mt" style={{ gap: 16 }}>
          <div className="field" style={{ flex: 1 }}><label>Correct option</label>
            <select className="input" value={q.correctOption} onChange={e=>setQ({...q,correctOption:e.target.value})}>
              <option>A</option><option>B</option><option>C</option><option>D</option>
            </select></div>
          <div className="field" style={{ flex: 1 }}><label>Points</label>
            <input className="input" type="number" min="1" value={q.points}
                   onChange={e=>setQ({...q,points:Number(e.target.value)})}/></div>
        </div>
        <div className="field mt"><label>Explanation (Optional)</label>
          <textarea className="textarea" rows="2" placeholder="Why is this answer correct?" value={q.explanation} onChange={e=>setQ({...q,explanation:e.target.value})}/></div>
        <div className="row mt-lg" style={{ justifyContent: 'flex-end', gap: 10 }}>
          <button className="btn success" onClick={add} disabled={saving}>{saving ? 'Saving…' : 'Add Question'}</button>
        </div>
      </div>

      {/* Knowledge Slide Modal */}
      {activeSlideModal && (
        <div className="modal-backdrop" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20
        }} onClick={() => setActiveSlideModal(null)}>
          <div className="card" style={{ maxWidth: 640, width: '100%', maxHeight: '85vh', overflowY: 'auto', padding: 28 }}
               onClick={e => e.stopPropagation()}>
            <div className="space-between" style={{ alignItems: 'flex-start' }}>
              <div>
                <span className="badge-grounded" style={{
                  background: activeSlideModal.sourceGrounded ? 'rgba(0,155,142,0.2)' : 'rgba(255,182,39,0.2)',
                  color: activeSlideModal.sourceGrounded ? '#2ec4b6' : '#FFB627',
                  padding: '3px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600
                }}>
                  {activeSlideModal.sourceGrounded ? '📄 Grounded in Source' : '🤖 AI Generated'}
                </span>
                <h3 className="mt" style={{ margin: '8px 0 4px' }}>{activeSlideModal.title}</h3>
                {activeSlideModal.sourceReference && (
                  <p className="muted" style={{ fontSize: 12 }}>📌 {activeSlideModal.sourceReference}</p>
                )}
              </div>
              <button className="btn secondary" style={{ padding: '4px 10px' }} onClick={() => setActiveSlideModal(null)}>✕</button>
            </div>
            <div className="mt" style={{
              whiteSpace: 'pre-wrap', lineHeight: 1.6, background: 'rgba(255,255,255,0.03)',
              padding: 16, borderRadius: 8, fontSize: 14, border: '1px solid rgba(255,255,255,0.08)'
            }}>
              {activeSlideModal.content}
            </div>
            <div className="row mt-lg" style={{ justifyContent: 'flex-end' }}>
              <button className="btn" onClick={() => setActiveSlideModal(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}