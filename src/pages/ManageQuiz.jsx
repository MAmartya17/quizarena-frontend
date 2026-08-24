import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/axiosClient'

export default function ManageQuiz() {
  const { id } = useParams()
  const nav = useNavigate()
  const [q, setQ] = useState({ text: '', optionA: '', optionB: '', optionC: '', optionD: '',
                               correctOption: 'A', points: 1 })
  const [saving, setSaving] = useState(false)
  const [slides, setSlides] = useState([])
  const [genAll, setGenAll] = useState(false)

  useEffect(() => {
    // Load existing slides for this quiz
    loadSlides()
  }, [id])

  const loadSlides = async () => {
    try {
      // This will use the quiz's questions to check for slides
    } catch (e) { /* ignore */ }
  }

  const add = async () => {
    setSaving(true)
    try {
      await api.post(`/api/quizzes/${id}/questions`, q)
      alert('Question added!')
      setQ({ text: '', optionA: '', optionB: '', optionC: '', optionD: '', correctOption: 'A', points: 1 })
    } catch (e) { alert('Failed: ' + (e.response?.data?.error || e.message)) }
    finally { setSaving(false) }
  }

  const generateAllSlides = async () => {
    setGenAll(true)
    try {
      const { data } = await api.post(`/api/ai/knowledge-slide/quiz/${id}`)
      alert(`Generated ${data.length} knowledge slides!`)
    } catch (e) {
      alert('Failed: ' + (e.response?.data?.error || e.message))
    } finally {
      setGenAll(false)
    }
  }

  return (
    <div className="container" style={{ maxWidth: 720 }}>
      <div className="space-between mt-lg">
        <h2>Add Question</h2>
        <button className="btn secondary" onClick={generateAllSlides} disabled={genAll}
                style={{ fontSize: 13 }}>
          {genAll ? '⏳ Generating...' : '🧠 Generate All Knowledge Slides'}
        </button>
      </div>
      <div className="card mt-lg">
        <div className="field"><label>Question text</label>
          <textarea className="textarea" rows="2" value={q.text} onChange={e=>setQ({...q,text:e.target.value})}/></div>
        {['A','B','C','D'].map(k => (
          <div className="field" key={k}><label>Option {k}</label>
            <input className="input" value={q['option'+k]} onChange={e=>setQ({...q,['option'+k]:e.target.value})}/></div>
        ))}
        <div className="row">
          <div className="field" style={{ flex: 1 }}><label>Correct option</label>
            <select className="input" value={q.correctOption} onChange={e=>setQ({...q,correctOption:e.target.value})}>
              <option>A</option><option>B</option><option>C</option><option>D</option>
            </select></div>
          <div className="field" style={{ flex: 1 }}><label>Points</label>
            <input className="input" type="number" min="1" value={q.points}
                   onChange={e=>setQ({...q,points:Number(e.target.value)})}/></div>
        </div>
        <div className="row mt-lg">
          <button className="btn success" onClick={add} disabled={saving}>{saving ? 'Saving…' : 'Add Question'}</button>
          <button className="btn secondary" onClick={() => nav('/my-quizzes')}>Done</button>
        </div>
      </div>
    </div>
  )
}