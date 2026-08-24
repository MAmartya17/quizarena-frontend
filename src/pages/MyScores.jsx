import { useEffect, useState } from 'react'
import api from '../api/axiosClient'

export default function MyScores() {
  const [rows, setRows] = useState([])
  useEffect(() => { api.get('/api/attempts/me').then(r => setRows(r.data)) }, [])

  // Group by quiz to find best
  const best = {}
  for (const r of rows) {
    if (!best[r.quizId] || r.score > best[r.quizId].score) best[r.quizId] = r
  }

  return (
    <div className="container">
      <h2 className="mt-lg">My Scores</h2>
      <div className="card mt-lg">
        <h3>Best Score per Quiz</h3>
        <table className="mt">
          <thead><tr><th>Quiz</th><th>Best</th><th>Out of</th><th>%</th></tr></thead>
          <tbody>
            {Object.values(best).map(r => (
              <tr key={r.quizId}>
                <td>{r.quizTitle}</td><td>{r.score}</td><td>{r.maxScore}</td>
                <td>{Math.round((r.score / r.maxScore) * 100)}%</td>
              </tr>
            ))}
            {Object.keys(best).length === 0 && <tr><td colSpan="4" className="muted">No attempts yet.</td></tr>}
          </tbody>
        </table>
      </div>

      <div className="card mt-lg">
        <h3>All Attempts</h3>
        <table className="mt">
          <thead><tr><th>Quiz</th><th>Score</th><th>Correct</th><th>When</th></tr></thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.attemptId}>
                <td>{r.quizTitle}</td>
                <td>{r.score} / {r.maxScore}</td>
                <td>{r.correctCount} / {r.totalQuestions}</td>
                <td>{new Date(r.attemptedAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}