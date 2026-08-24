import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axiosClient'

const blank = () => ({ text: '', optionA: '', optionB: '', optionC: '', optionD: '', correctOption: 'A', points: 1 })

export default function CreateQuiz() {
  const [meta, setMeta] = useState({ title: '', description: '', category: '', durationMinutes: 10 })
  const [questions, setQuestions] = useState([blank()])
  const [saving, setSaving] = useState(false)
  const nav = useNavigate()

  const updateQ = (i, field, v) => {
    const next = [...questions]; next[i] = { ...next[i], [field]: v }; setQuestions(next)
  }

  const submit = async () => {
    if (!meta.title.trim()) return alert('Title required')
    for (const q of questions) {
      if (!q.text || !q.optionA || !q.optionB || !q.optionC || !q.optionD)
        return alert('All question fields are required')
    }
    setSaving(true)
    try {
      await api.post('/api/quizzes', { ...meta, questions })
      nav('/my-quizzes')
    } catch (e) { alert('Failed: ' + (e.response?.data?.error || e.message)) }
    finally { setSaving(false) }
  }

  return (
    <div className="container">
      <h2 className="mt-lg">Create a New Quiz</h2>
      <div className="card mt-lg">
        <div className="field"><label>Title</label>
          <input className="input" value={meta.title} onChange={e=>setMeta({...meta,title:e.target.value})}/></div>
        <div className="field"><label>Description</label>
          <textarea className="textarea" rows="3" value={meta.description}
                    onChange={e=>setMeta({...meta,description:e.target.value})}/></div>
        <div className="row">
          <div className="field" style={{ flex: 1 }}><label>Category</label>
            <input className="input" value={meta.category} onChange={e=>setMeta({...meta,category:e.target.value})}/></div>
          <div className="field" style={{ flex: 1 }}><label>Duration (minutes)</label>
            <input className="input" type="number" value={meta.durationMinutes}
                   onChange={e=>setMeta({...meta,durationMinutes:Number(e.target.value)})}/></div>
        </div>
      </div>

      {questions.map((q, i) => (
        <div className="card mt-lg" key={i}>
          <div className="space-between"><strong>Question {i+1}</strong>
            {questions.length > 1 &&
              <button className="btn danger" onClick={()=>setQuestions(questions.filter((_,idx)=>idx!==i))}>Remove</button>}
          </div>
          <div className="field mt"><label>Question text</label>
            <textarea className="textarea" rows="2" value={q.text} onChange={e=>updateQ(i,'text',e.target.value)}/></div>
          {['A','B','C','D'].map(k => (
            <div className="field" key={k}><label>Option {k}</label>
              <input className="input" value={q['option'+k]} onChange={e=>updateQ(i,'option'+k,e.target.value)}/></div>
          ))}
          <div className="row">
            <div className="field" style={{ flex: 1 }}><label>Correct option</label>
              <select className="input" value={q.correctOption} onChange={e=>updateQ(i,'correctOption',e.target.value)}>
                <option>A</option><option>B</option><option>C</option><option>D</option>
              </select></div>
            <div className="field" style={{ flex: 1 }}><label>Points</label>
              <input className="input" type="number" min="1" value={q.points}
                     onChange={e=>updateQ(i,'points',Number(e.target.value))}/></div>
          </div>
        </div>
      ))}

      <div className="row mt-lg">
        <button className="btn secondary" onClick={()=>setQuestions([...questions, blank()])}>+ Add Question</button>
        <button className="btn success" onClick={submit} disabled={saving}>
          {saving ? 'Saving…' : 'Create Quiz'}
        </button>
      </div>
    </div>
  )
}