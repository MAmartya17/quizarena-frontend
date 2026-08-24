import { useState, useEffect } from 'react'
import { useLocation, Link, useNavigate } from 'react-router-dom'
import api from '../api/axiosClient'
import StarRating from '../components/StarRating'

export default function Result() {
  const { state } = useLocation()
  const nav = useNavigate()
  const result = state?.result
  const quizTitle = state?.quizTitle
  const quizId = state?.quizId

  const [submittedRating, setSubmittedRating] = useState(false)
  const [activeTab, setActiveTab] = useState('weak') // 'weak' | 'all' | 'mastered' | 'deck'
  const [deckIndex, setDeckIndex] = useState(0)
  const [standaloneSlides, setStandaloneSlides] = useState([])

  // If questionResults is present in result
  const questionResults = result?.questionResults || []
  const incorrectQuestions = questionResults.filter(q => !q.isCorrect)
  const correctQuestions = questionResults.filter(q => q.isCorrect)

  // Collect all available knowledge slides from questionResults
  const allSlides = questionResults
    .filter(q => q.knowledgeSlide)
    .map(q => ({
      ...q.knowledgeSlide,
      questionText: q.text,
      isCorrect: q.isCorrect
    }))

  // If no slides in result, fetch standalone
  useEffect(() => {
    if (quizId && allSlides.length === 0) {
      api.get(`/api/ai/knowledge-slide/quiz/${quizId}`)
        .then(r => setStandaloneSlides(r.data))
        .catch(() => {})
    }
  }, [quizId, allSlides.length])

  // Set initial tab: if user got 100%, show 'mastered' or 'deck', otherwise show 'weak'
  useEffect(() => {
    if (incorrectQuestions.length === 0 && correctQuestions.length > 0) {
      setActiveTab('mastered')
    } else {
      setActiveTab('weak')
    }
  }, [incorrectQuestions.length, correctQuestions.length])

  const rate = async (stars) => {
    if (!quizId) return
    try {
      await api.post(`/api/ratings/${quizId}`, { stars })
      setSubmittedRating(true)
    } catch (e) {
      alert(e.response?.data?.error || 'Could not submit rating')
    }
  }

  if (!result) {
    return (
      <div className="container" style={{ maxWidth: 640 }}>
        <div className="card mt-lg" style={{ textAlign: 'center', padding: 40 }}>
          <h2>No Recent Results Found</h2>
          <p className="muted mt">Take a quiz first to see your diagnostic performance summary and knowledge slides.</p>
          <div className="row mt" style={{ justifyContent: 'center' }}>
            <Link to="/quizzes" className="btn btn-primary">Browse Quizzes</Link>
          </div>
        </div>
      </div>
    )
  }

  const percent = result.maxScore > 0 ? Math.round((result.score / result.maxScore) * 100) : 0
  const scoreColor = percent >= 75 ? '#009B8E' : percent >= 50 ? '#FFB627' : '#E63946'
  const activeDeckList = allSlides.length > 0 ? allSlides : standaloneSlides

  return (
    <div className="container" style={{ maxWidth: 880 }}>
      {/* ─── Top Header & Summary Card ────────────────────────────── */}
      <div className="card mt-lg" style={{
        background: 'linear-gradient(145deg, rgba(20, 24, 33, 0.9), rgba(11, 14, 20, 0.95))',
        border: '1px solid rgba(255,255,255,0.08)',
        padding: 32
      }}>
        <div className="row" style={{ alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24 }}>
          {/* Circular Score Gauge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <div style={{
              width: 120, height: 120, borderRadius: '50%',
              background: `conic-gradient(${scoreColor} ${percent}%, rgba(255,255,255,0.08) 0)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 0 20px ${scoreColor}33`,
              flexShrink: 0
            }}>
              <div style={{
                width: 96, height: 96, borderRadius: '50%', background: '#0b0e14',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
              }}>
                <span style={{ fontSize: 24, fontWeight: 800, color: scoreColor }}>{percent}%</span>
                <span style={{ fontSize: 10, color: '#888', textTransform: 'uppercase', letterSpacing: 1 }}>Score</span>
              </div>
            </div>

            <div>
              <span style={{
                display: 'inline-block',
                background: `${scoreColor}22`,
                color: scoreColor,
                border: `1px solid ${scoreColor}55`,
                padding: '3px 10px',
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 700,
                marginBottom: 6
              }}>
                {result.performanceTier || (percent >= 75 ? '🌟 Mastered' : percent >= 50 ? '📈 Developing' : '💡 Needs Core Review')}
              </span>
              <h2 style={{ margin: '0 0 4px 0', fontSize: 22 }}>{quizTitle || 'Quiz Completed!'}</h2>
              <p className="muted" style={{ margin: 0, fontSize: 14 }}>
                Earned <strong>{result.score}</strong> / {result.maxScore} pts • <strong>{result.correctCount}</strong> / {result.totalQuestions} correct
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="row" style={{ gap: 10, flexWrap: 'wrap' }}>
            {quizId && (
              <button className="btn secondary" onClick={() => nav(`/quiz/${quizId}/play`)} style={{ fontSize: 13 }}>
                🔄 Retake
              </button>
            )}
            {quizId && (
              <Link to={`/quiz/${quizId}/leaderboard`} className="btn secondary" style={{ fontSize: 13 }}>
                🏆 Leaderboard
              </Link>
            )}
            <Link to="/quizzes" className="btn btn-primary" style={{ fontSize: 13 }}>
              Explore Quizzes
            </Link>
          </div>
        </div>

        {/* Diagnostic & Improvement Summary Banner */}
        <div style={{
          marginTop: 24,
          padding: '16px 20px',
          borderRadius: 10,
          background: 'rgba(0, 155, 142, 0.08)',
          border: '1px solid rgba(0, 155, 142, 0.25)',
          display: 'flex',
          gap: 14,
          alignItems: 'flex-start'
        }}>
          <div style={{ fontSize: 24, lineHeight: 1 }}>💡</div>
          <div style={{ flex: 1 }}>
            <h4 style={{ margin: '0 0 4px 0', color: '#2ec4b6', fontSize: 15 }}>
              Diagnostic Improvement Summary
            </h4>
            <p style={{ margin: 0, fontSize: 13.5, color: '#e0e0e0', lineHeight: 1.5 }}>
              {result.improvementSummary || `Review the knowledge slides below to master the questions you missed.`}
            </p>
          </div>
        </div>
      </div>

      {/* ─── Navigation Tabs for Review ─────────────────────────── */}
      <div className="row mt-lg" style={{
        gap: 8, borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 12, flexWrap: 'wrap'
      }}>
        {incorrectQuestions.length > 0 && (
          <button
            className={`btn ${activeTab === 'weak' ? 'btn-primary' : 'secondary'}`}
            onClick={() => setActiveTab('weak')}
            style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <span>🔴 Where to Improve</span>
            <span style={{
              background: activeTab === 'weak' ? '#fff' : '#E63946',
              color: activeTab === 'weak' ? '#000' : '#fff',
              padding: '1px 7px', borderRadius: 10, fontSize: 11, fontWeight: 700
            }}>
              {incorrectQuestions.length}
            </span>
          </button>
        )}

        <button
          className={`btn ${activeTab === 'all' ? 'btn-primary' : 'secondary'}`}
          onClick={() => setActiveTab('all')}
          style={{ fontSize: 13 }}
        >
          📑 All Questions ({questionResults.length || result.totalQuestions})
        </button>

        {correctQuestions.length > 0 && (
          <button
            className={`btn ${activeTab === 'mastered' ? 'btn-primary' : 'secondary'}`}
            onClick={() => setActiveTab('mastered')}
            style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <span>🟢 Mastered</span>
            <span style={{
              background: activeTab === 'mastered' ? '#fff' : '#009B8E',
              color: activeTab === 'mastered' ? '#000' : '#fff',
              padding: '1px 7px', borderRadius: 10, fontSize: 11, fontWeight: 700
            }}>
              {correctQuestions.length}
            </span>
          </button>
        )}

        {activeDeckList.length > 0 && (
          <button
            className={`btn ${activeTab === 'deck' ? 'btn-primary' : 'secondary'}`}
            onClick={() => setActiveTab('deck')}
            style={{ fontSize: 13, marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <span>🧠 Study Slide Deck</span>
            <span style={{ background: 'rgba(255,255,255,0.2)', padding: '1px 6px', borderRadius: 10, fontSize: 11 }}>
              {activeDeckList.length}
            </span>
          </button>
        )}
      </div>

      {/* ─── TAB 1: Where to Improve (Incorrect Questions + Slides) ─── */}
      {activeTab === 'weak' && (
        <div className="mt-lg">
          <div style={{ marginBottom: 16 }}>
            <h3 style={{ margin: '0 0 4px 0' }}>🎯 Focused Improvement Plan</h3>
            <p className="muted" style={{ fontSize: 13 }}>
              Here are the questions you missed with their targeted Knowledge Slides. Study the concept to avoid making this mistake again!
            </p>
          </div>

          <div className="grid" style={{ gridTemplateColumns: '1fr', gap: 18 }}>
            {incorrectQuestions.map((q, idx) => (
              <QuestionReviewCard key={q.questionId || idx} q={q} defaultOpenSlide={true} />
            ))}
          </div>
        </div>
      )}

      {/* ─── TAB 2: All Questions ─────────────────────────────────── */}
      {activeTab === 'all' && (
        <div className="mt-lg">
          <div style={{ marginBottom: 16 }}>
            <h3 style={{ margin: '0 0 4px 0' }}>📑 Complete Quiz Review</h3>
            <p className="muted" style={{ fontSize: 13 }}>
              Review all questions, your answers, correct solutions, and grounded knowledge slides.
            </p>
          </div>

          <div className="grid" style={{ gridTemplateColumns: '1fr', gap: 18 }}>
            {questionResults.map((q, idx) => (
              <QuestionReviewCard key={q.questionId || idx} q={q} defaultOpenSlide={!q.isCorrect} />
            ))}
          </div>
        </div>
      )}

      {/* ─── TAB 3: Mastered Concepts ─────────────────────────────── */}
      {activeTab === 'mastered' && (
        <div className="mt-lg">
          <div style={{ marginBottom: 16 }}>
            <h3 style={{ margin: '0 0 4px 0' }}>🟢 Mastered Concepts ({correctQuestions.length})</h3>
            <p className="muted" style={{ fontSize: 13 }}>
              Great job! You answered these questions correctly. Expand any question to review its knowledge slide.
            </p>
          </div>

          <div className="grid" style={{ gridTemplateColumns: '1fr', gap: 18 }}>
            {correctQuestions.map((q, idx) => (
              <QuestionReviewCard key={q.questionId || idx} q={q} defaultOpenSlide={false} />
            ))}
          </div>
        </div>
      )}

      {/* ─── TAB 4: Interactive Slide Deck Mode ─────────────────────── */}
      {activeTab === 'deck' && activeDeckList.length > 0 && (
        <div className="mt-lg">
          <div className="card" style={{
            background: 'linear-gradient(145deg, rgba(20, 26, 38, 0.95), rgba(12, 16, 25, 0.98))',
            border: '1px solid rgba(0, 155, 142, 0.3)',
            padding: 30,
            borderRadius: 12
          }}>
            {/* Slide Navigation Header */}
            <div className="space-between" style={{ alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 16 }}>
              <div>
                <span className="badge-grounded" style={{
                  background: activeDeckList[deckIndex]?.sourceGrounded ? 'rgba(0,155,142,0.25)' : 'rgba(255,182,39,0.25)',
                  color: activeDeckList[deckIndex]?.sourceGrounded ? '#2ec4b6' : '#FFB627',
                  padding: '3px 10px', borderRadius: 4, fontSize: 12, fontWeight: 700
                }}>
                  {activeDeckList[deckIndex]?.sourceGrounded ? '📄 Source-Verified Concept' : '🤖 AI Explanatory Slide'}
                </span>
                <span className="muted" style={{ marginLeft: 12, fontSize: 13 }}>
                  Slide <strong>{deckIndex + 1}</strong> of <strong>{activeDeckList.length}</strong>
                </span>
              </div>
              <div className="row" style={{ gap: 8 }}>
                <button
                  className="btn secondary"
                  style={{ fontSize: 12, padding: '5px 12px' }}
                  disabled={deckIndex === 0}
                  onClick={() => setDeckIndex(i => Math.max(0, i - 1))}
                >
                  ← Previous
                </button>
                <button
                  className="btn secondary"
                  style={{ fontSize: 12, padding: '5px 12px' }}
                  disabled={deckIndex === activeDeckList.length - 1}
                  onClick={() => setDeckIndex(i => Math.min(activeDeckList.length - 1, i + 1))}
                >
                  Next →
                </button>
              </div>
            </div>

            {/* Slide Content */}
            <div className="mt-lg">
              <h2 style={{ fontSize: 20, color: '#fff', margin: '0 0 12px 0' }}>
                {activeDeckList[deckIndex]?.title}
              </h2>
              {activeDeckList[deckIndex]?.sourceReference && (
                <p className="muted" style={{ fontSize: 13, marginBottom: 16 }}>
                  📌 Grounded in: <strong>{activeDeckList[deckIndex]?.sourceReference}</strong>
                </p>
              )}
              <div style={{
                whiteSpace: 'pre-wrap',
                lineHeight: 1.7,
                fontSize: 14.5,
                color: '#e2e8f0',
                background: 'rgba(0,0,0,0.35)',
                padding: 20,
                borderRadius: 8,
                border: '1px solid rgba(255,255,255,0.06)'
              }}>
                {activeDeckList[deckIndex]?.content}
              </div>
            </div>

            {/* Progress bar */}
            <div style={{
              marginTop: 20,
              height: 4,
              background: 'rgba(255,255,255,0.08)',
              borderRadius: 2,
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                width: `${((deckIndex + 1) / activeDeckList.length) * 100}%`,
                background: '#009B8E',
                transition: 'width 0.3s ease'
              }} />
            </div>
          </div>
        </div>
      )}

      {/* ─── Bottom Rating & Quick Links ─────────────────────────── */}
      {quizId && (
        <div className="card mt-xl" style={{ textAlign: 'center', padding: 24, border: '1px solid rgba(255,255,255,0.06)' }}>
          <h3 style={{ marginBottom: 10, fontSize: 16 }}>How was this quiz experience?</h3>
          {submittedRating ? (
            <p className="muted" style={{ color: '#2ec4b6', fontWeight: 600 }}>⭐ Thanks for your rating!</p>
          ) : (
            <StarRating size={28} onChange={rate} />
          )}
        </div>
      )}

      <div className="row mt-lg" style={{ gap: 12, justifyContent: 'center', paddingBottom: 40 }}>
        <Link to="/quizzes" className="btn secondary">Browse More Quizzes</Link>
        <Link to="/scores" className="btn btn-primary">View My Scores</Link>
      </div>
    </div>
  )
}

/** Component for rendering a single question with user answer vs correct option + Knowledge Slide */
function QuestionReviewCard({ q, defaultOpenSlide = false }) {
  const [showSlide, setShowSlide] = useState(defaultOpenSlide)
  const isCorrect = q.isCorrect
  const slide = q.knowledgeSlide

  return (
    <div className="card" style={{
      padding: 22,
      border: isCorrect ? '1px solid rgba(0, 155, 142, 0.2)' : '1px solid rgba(230, 57, 70, 0.3)',
      background: isCorrect ? 'rgba(0, 155, 142, 0.02)' : 'rgba(230, 57, 70, 0.02)',
      borderRadius: 10
    }}>
      {/* Header with status badge */}
      <div className="space-between" style={{ alignItems: 'flex-start' }}>
        <div style={{ flex: 1, paddingRight: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{
              background: isCorrect ? 'rgba(0,155,142,0.2)' : 'rgba(230,57,70,0.2)',
              color: isCorrect ? '#2ec4b6' : '#ff6b6b',
              padding: '2px 8px', borderRadius: 4, fontSize: 12, fontWeight: 700
            }}>
              {isCorrect ? '✅ Correct (+1 pt)' : '❌ Incorrect (0 pt)'}
            </span>
          </div>
          <h4 style={{ margin: 0, fontSize: 16, lineHeight: 1.4, color: '#f1f5f9' }}>
            {q.text}
          </h4>
        </div>

        {slide && (
          <button
            className="btn secondary"
            style={{ fontSize: 12, padding: '4px 10px', whiteSpace: 'nowrap' }}
            onClick={() => setShowSlide(!showSlide)}
          >
            {showSlide ? 'Hide Slide ▲' : '🧠 Knowledge Slide ▼'}
          </button>
        )}
      </div>

      {/* Options grid */}
      <div className="grid mt" style={{ gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 13.5 }}>
        {['A', 'B', 'C', 'D'].map(opt => {
          const isUserChoice = q.userOption === opt
          const isCorrectChoice = q.correctOption === opt

          let bg = 'rgba(255,255,255,0.03)'
          let border = '1px solid rgba(255,255,255,0.08)'
          let textCol = 'inherit'

          if (isCorrectChoice) {
            bg = 'rgba(0, 155, 142, 0.2)'
            border = '1px solid #009B8E'
            textCol = '#2ec4b6'
          } else if (isUserChoice && !isCorrect) {
            bg = 'rgba(230, 57, 70, 0.18)'
            border = '1px solid #E63946'
            textCol = '#ff6b6b'
          }

          return (
            <div key={opt} style={{
              padding: '8px 12px',
              borderRadius: 6,
              background: bg,
              border: border,
              color: textCol,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <strong>{opt}:</strong> {q['option' + opt]}
              </div>
              <div style={{ fontSize: 12, fontWeight: 700 }}>
                {isCorrectChoice && <span title="Correct Answer"> ✓ Correct</span>}
                {isUserChoice && !isCorrectChoice && <span title="Your Choice"> ✗ Your choice</span>}
              </div>
            </div>
          )
        })}
      </div>

      {/* Explanation text */}
      {q.explanation && (
        <div className="mt" style={{
          background: 'rgba(255,255,255,0.03)',
          padding: '8px 12px',
          borderRadius: 6,
          fontSize: 13,
          color: '#cbd5e1',
          borderLeft: '3px solid #009B8E'
        }}>
          💡 <strong>Explanation:</strong> {q.explanation}
        </div>
      )}

      {/* Embedded Knowledge Slide (Expandable) */}
      {slide && showSlide && (
        <div className="mt" style={{
          background: 'linear-gradient(145deg, rgba(16, 22, 34, 0.9), rgba(10, 14, 22, 0.95))',
          border: '1px solid rgba(0, 155, 142, 0.35)',
          borderRadius: 8,
          padding: 16
        }}>
          <div className="space-between" style={{ alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 16 }}>🧠</span>
              <h5 style={{ margin: 0, fontSize: 14, color: '#2ec4b6', fontWeight: 700 }}>
                {slide.title || 'Knowledge Slide'}
              </h5>
            </div>
            {slide.sourceReference && (
              <span className="muted" style={{ fontSize: 11 }}>📌 {slide.sourceReference}</span>
            )}
          </div>
          <div style={{
            marginTop: 10,
            whiteSpace: 'pre-wrap',
            lineHeight: 1.6,
            fontSize: 13,
            color: '#e2e8f0'
          }}>
            {slide.content}
          </div>
        </div>
      )}
    </div>
  )
}