import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/axiosClient'
import QuizTimer from '../components/QuizTimer'

export default function TakeQuiz() {
  const { id } = useParams()
  const nav = useNavigate()
  const [quiz, setQuiz] = useState(null)
  const [answers, setAnswers] = useState({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    api.get(`/api/quizzes/${id}/play`)
      .then(r => setQuiz(r.data))
      .catch(() => alert('Could not load quiz'))
  }, [id])

  // useCallback so the timer's onTimeUp reference stays stable
  const submit = useCallback(async () => {
    if (submitting) return            // guard against double-submit (manual + auto)
    setSubmitting(true)
    try {
      const { data } = await api.post(`/api/attempts/${id}`, { answers })
      nav('/result', { state: { result: data, quizTitle: quiz.title, quizId: Number(id) } })
    } catch (e) {
      alert('Submit failed: ' + (e.response?.data?.error || e.message))
      setSubmitting(false)            // only reset on error; on success we navigate away
    }
  }, [submitting, id, answers, quiz, nav])

  if (!quiz) return <div className="container"><p className="muted mt-lg">Loading...</p></div>

  return (
    <div className="container">
      <div className="row mt-lg" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2>{quiz.title}</h2>
          <p className="muted">{quiz.description}</p>
        </div>
        {quiz.durationMinutes > 0 && (
          <QuizTimer
            durationMinutes={quiz.durationMinutes}
            running={!submitting}
            onTimeUp={() => {
              alert("Time's up! Submitting your answers.")
              submit()
            }}
          />
        )}
      </div>

      {quiz.questions.map((q, idx) => (
        <div key={q.id} className="card mt-lg">
          <h4>{idx + 1}. {q.text}</h4>
          {['A', 'B', 'C', 'D'].map(opt => (
            <label key={opt} className="row" style={{ alignItems: 'center', gap: 8, marginTop: 8, cursor: 'pointer' }}>
              <input
                type="radio"
                name={`q${q.id}`}
                checked={answers[q.id] === opt}
                onChange={() => setAnswers(prev => ({ ...prev, [q.id]: opt }))}
              />
              <span>{opt}. {q[`option${opt}`]}</span>
            </label>
          ))}
        </div>
      ))}

      <button className="btn btn-primary mt-lg" onClick={submit} disabled={submitting}>
        {submitting ? 'Submitting...' : 'Submit Quiz'}
      </button>
    </div>
  )
}