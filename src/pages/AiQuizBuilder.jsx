import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axiosClient'
import { SparkleIcon } from '../components/Icons'

const STEPS = ['Upload', 'Configure', 'Generate', 'Review', 'Save']

export default function AiQuizBuilder() {
  const nav = useNavigate()
  const [step, setStep] = useState(0)

  // Step 1 — Source
  const [sourceMode, setSourceMode] = useState('pdf') // 'pdf' | 'text'
  const [file, setFile] = useState(null)
  const [textContent, setTextContent] = useState('')
  const [textTitle, setTextTitle] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [source, setSource] = useState(null)
  const fileRef = useRef()

  // Step 2 — Config
  const [config, setConfig] = useState({
    questionCount: 10,
    difficulty: 'MIXED',
    selectionMode: 'AUTO',
    topicFocus: ''
  })
  const [topics, setTopics] = useState([])

  // Step 3 — Generation
  const [session, setSession] = useState(null)
  const [polling, setPolling] = useState(false)

  // Step 4 — Review
  const [questions, setQuestions] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({})

  // Step 5 — Save
  const [quizMeta, setQuizMeta] = useState({ title: '', description: '', category: '', durationMinutes: 30 })
  const [saving, setSaving] = useState(false)
  const [savedQuiz, setSavedQuiz] = useState(null)

  // ─── Step 1: Upload ────────────────────────────────────────

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped && dropped.name.toLowerCase().endsWith('.pdf')) {
      setFile(dropped)
    } else {
      alert('Only PDF files are supported.')
    }
  }

  const handleFileSelect = (e) => {
    const selected = e.target.files[0]
    if (selected) setFile(selected)
  }

  const uploadSource = async () => {
    setUploading(true)
    try {
      let res
      if (sourceMode === 'pdf') {
        if (!file) return alert('Please select a PDF file.')
        const formData = new FormData()
        formData.append('file', file)
        res = await api.post('/api/ai/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      } else {
        if (!textContent.trim()) return alert('Please enter some text.')
        res = await api.post('/api/ai/upload/text', {
          text: textContent,
          title: textTitle || 'Pasted Text'
        })
      }
      setSource(res.data)
      // Start polling for processing status
      pollSourceStatus(res.data.id)
    } catch (e) {
      alert('Upload failed: ' + (e.response?.data?.error || e.message))
      setUploading(false)
    }
  }

  const pollSourceStatus = useCallback((sourceId) => {
    const interval = setInterval(async () => {
      try {
        const { data } = await api.get(`/api/ai/sources/${sourceId}/status`)
        if (data.status === 'READY') {
          clearInterval(interval)
          // Fetch full source details
          const full = await api.get(`/api/ai/sources/${sourceId}`)
          setSource(full.data)
          setUploading(false)
          // Parse topics if available
          if (full.data.detectedTopics) {
            try {
              setTopics(JSON.parse(full.data.detectedTopics))
            } catch (e) { /* ignore parse errors */ }
          }
          setStep(1) // auto-advance to config
        } else if (data.status === 'FAILED') {
          clearInterval(interval)
          setUploading(false)
          alert('Processing failed: ' + (data.errorMessage || 'Unknown error'))
        }
      } catch (e) {
        clearInterval(interval)
        setUploading(false)
      }
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  // ─── Step 2: Configure ─────────────────────────────────────

  const startGeneration = async () => {
    try {
      const { data } = await api.post('/api/ai/generate', {
        sourceId: source.id,
        questionCount: config.questionCount,
        difficulty: config.difficulty,
        selectionMode: config.selectionMode,
        topicFocus: config.topicFocus
      })
      setSession(data)
      setStep(2) // move to generation progress
      setPolling(true)
    } catch (e) {
      alert('Failed to start generation: ' + (e.response?.data?.error || e.message))
    }
  }

  // ─── Step 3: Poll Generation Progress ──────────────────────

  useEffect(() => {
    if (!polling || !session) return
    const interval = setInterval(async () => {
      try {
        const { data } = await api.get(`/api/ai/sessions/${session.id}`)
        setSession(data)
        if (data.status === 'READY' || data.status === 'SAVED') {
          clearInterval(interval)
          setPolling(false)
          // Load questions
          const qRes = await api.get(`/api/ai/sessions/${session.id}/questions`)
          setQuestions(qRes.data)
          setStep(3) // move to review
        } else if (data.status === 'FAILED') {
          clearInterval(interval)
          setPolling(false)
          alert('Generation failed: ' + data.progressMessage)
        }
      } catch (e) {
        clearInterval(interval)
        setPolling(false)
      }
    }, 2500)
    return () => clearInterval(interval)
  }, [polling, session])

  // ─── Step 4: Review Actions ────────────────────────────────

  const toggleSelect = async (qId) => {
    const updated = questions.map(q =>
      q.id === qId ? { ...q, selected: !q.selected } : q
    )
    setQuestions(updated)
    const selectedIds = updated.filter(q => q.selected).map(q => q.id)
    await api.put(`/api/ai/sessions/${session.id}/select`, { selectedIds })
  }

  const selectAll = async () => {
    const all = questions.map(q => ({ ...q, selected: true }))
    setQuestions(all)
    await api.put(`/api/ai/sessions/${session.id}/select`, {
      selectedIds: all.map(q => q.id)
    })
  }

  const deselectAll = async () => {
    const none = questions.map(q => ({ ...q, selected: false }))
    setQuestions(none)
    await api.put(`/api/ai/sessions/${session.id}/select`, { selectedIds: [] })
  }

  const startEdit = (q) => {
    setEditingId(q.id)
    setEditForm({
      questionText: q.questionText,
      optionA: q.optionA, optionB: q.optionB,
      optionC: q.optionC, optionD: q.optionD,
      correctOption: q.correctOption,
      explanation: q.explanation
    })
  }

  const saveEdit = async (qId) => {
    try {
      const { data } = await api.put(
        `/api/ai/sessions/${session.id}/questions/${qId}`, editForm
      )
      setQuestions(questions.map(q => q.id === qId ? data : q))
      setEditingId(null)
    } catch (e) {
      alert('Save failed: ' + (e.response?.data?.error || e.message))
    }
  }

  const regenerateQuestion = async (qId) => {
    try {
      const { data } = await api.post(
        `/api/ai/sessions/${session.id}/questions/${qId}/regenerate`
      )
      setQuestions(questions.map(q => q.id === qId ? data : q))
    } catch (e) {
      alert('Regeneration failed: ' + (e.response?.data?.error || e.message))
    }
  }

  const deleteQuestion = (qId) => {
    setQuestions(questions.filter(q => q.id !== qId))
  }

  // ─── Step 5: Save Quiz ─────────────────────────────────────

  const saveQuiz = async () => {
    if (!quizMeta.title.trim()) return alert('Quiz title is required.')
    setSaving(true)
    try {
      const { data } = await api.post(`/api/ai/sessions/${session.id}/save`, quizMeta)
      setSavedQuiz(data)
      setStep(4)
    } catch (e) {
      alert('Save failed: ' + (e.response?.data?.error || e.message))
    } finally {
      setSaving(false)
    }
  }

  // ─── Quality helpers ───────────────────────────────────────

  const qualityLevel = (score) => {
    if (score >= 0.8) return 'high'
    if (score >= 0.5) return 'medium'
    return 'low'
  }

  const selectedCount = questions.filter(q => q.selected).length
  const validCount = questions.filter(q => q.passedValidation).length

  // ─── Render ────────────────────────────────────────────────

  return (
    <div className="container" style={{ maxWidth: 840 }}>
      <h2 className="mt-lg" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <SparkleIcon size={24} color="#FFB627" />
        Generate Quiz with AI
      </h2>
      <p className="muted">Upload study material and let AI create high-quality quiz questions.</p>

      {/* Stepper */}
      <div className="stepper">
        {STEPS.map((label, i) => (
          <div className="stepper-step" key={label}>
            {i > 0 && <div className={`step-line ${i <= step ? 'completed' : ''}`} />}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div className={`step-circle ${i === step ? 'active' : i < step ? 'completed' : ''}`}>
                {i < step ? '✓' : i + 1}
              </div>
              <span className={`step-label ${i === step ? 'active' : ''}`}>{label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ═══ STEP 1: Upload ═══ */}
      {step === 0 && (
        <div className="wizard-step">
          <div className="card mt-lg">
            <div className="tab-group">
              <button className={`tab-item ${sourceMode === 'pdf' ? 'active' : ''}`}
                      onClick={() => setSourceMode('pdf')}>📄 Upload PDF</button>
              <button className={`tab-item ${sourceMode === 'text' ? 'active' : ''}`}
                      onClick={() => setSourceMode('text')}>📝 Paste Text</button>
            </div>

            {sourceMode === 'pdf' ? (
              <div
                className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
                onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
              >
                <input ref={fileRef} type="file" accept=".pdf"
                       style={{ display: 'none' }} onChange={handleFileSelect} />
                <div className="upload-icon">📄</div>
                <h3>{file ? file.name : 'Drop your PDF here'}</h3>
                <p>{file
                  ? `${(file.size / 1024 / 1024).toFixed(1)} MB — Ready to upload`
                  : 'or click to browse. Max 20 MB.'}</p>
                {file && (
                  <div className="file-info">
                    ✓ {file.name}
                  </div>
                )}
              </div>
            ) : (
              <div>
                <div className="field">
                  <label>Title (optional)</label>
                  <input className="input" placeholder="e.g. Chapter 3 — Computer Networks"
                         value={textTitle} onChange={e => setTextTitle(e.target.value)} />
                </div>
                <div className="field">
                  <label>Paste your study material</label>
                  <textarea className="textarea" rows="10" placeholder="Paste your text content here..."
                            value={textContent} onChange={e => setTextContent(e.target.value)} />
                </div>
                <p className="muted">{textContent.length.toLocaleString()} / 50,000 characters</p>
              </div>
            )}

            {uploading && (
              <div className="progress-container">
                <div className="progress-bar-track">
                  <div className="progress-bar-fill" style={{ width: source?.status === 'PROCESSING' ? '60%' : '30%' }} />
                </div>
                <p className="progress-status">
                  <span className="emoji">🧠</span>
                  {source?.status === 'PROCESSING' ? 'Building knowledge base...' : 'Uploading and extracting text...'}
                </p>
              </div>
            )}

            {!uploading && (
              <div className="wizard-actions">
                <button className="btn" onClick={uploadSource}
                        disabled={sourceMode === 'pdf' ? !file : !textContent.trim()}>
                  Analyze Material →
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══ STEP 2: Configure ═══ */}
      {step === 1 && source && (
        <div className="wizard-step">
          <div className="card mt-lg">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div className="file-info">📄 {source.fileName}</div>
              {source.totalPages && <span className="muted">{source.totalPages} pages</span>}
              {source.totalChunks && <span className="muted">{source.totalChunks} knowledge chunks</span>}
            </div>

            <div className="field">
              <label>Number of Questions</label>
              <div className="chip-group">
                {[5, 10, 15, 20, 30].map(n => (
                  <button key={n} className={`chip ${config.questionCount === n ? 'active' : ''}`}
                          onClick={() => setConfig({ ...config, questionCount: n })}>
                    {n} questions
                  </button>
                ))}
              </div>
            </div>

            <div className="field">
              <label>Difficulty Level</label>
              <div className="chip-group">
                {['EASY', 'MEDIUM', 'HARD', 'MIXED'].map(d => (
                  <button key={d} className={`chip ${config.difficulty === d ? 'active' : ''}`}
                          onClick={() => setConfig({ ...config, difficulty: d })}>
                    {d === 'MIXED' ? '🎯 Mixed' : d === 'EASY' ? '🟢 Easy' : d === 'MEDIUM' ? '🟡 Medium' : '🔴 Hard'}
                  </button>
                ))}
              </div>
            </div>

            <div className="field">
              <label>Selection Mode</label>
              <div className="chip-group">
                <button className={`chip ${config.selectionMode === 'AUTO' ? 'active' : ''}`}
                        onClick={() => setConfig({ ...config, selectionMode: 'AUTO' })}>
                  ✨ AI Auto-Select Best
                </button>
                <button className={`chip ${config.selectionMode === 'MANUAL' ? 'active' : ''}`}
                        onClick={() => setConfig({ ...config, selectionMode: 'MANUAL' })}>
                  👩‍🏫 I'll Pick from Pool
                </button>
              </div>
            </div>

            {topics.length > 0 && (
              <div className="field">
                <label>Focus on Topics (optional)</label>
                <div className="chip-group">
                  {topics.map((t, i) => (
                    <button key={i} className={`chip ${config.topicFocus.includes(t.name) ? 'active' : ''}`}
                            onClick={() => {
                              const current = config.topicFocus ? config.topicFocus.split(',').filter(Boolean) : []
                              const updated = current.includes(t.name)
                                ? current.filter(x => x !== t.name)
                                : [...current, t.name]
                              setConfig({ ...config, topicFocus: updated.join(',') })
                            }}>
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="wizard-actions">
            <button className="btn secondary" onClick={() => setStep(0)}>← Back</button>
            <button className="btn" onClick={startGeneration}>
              ✨ Generate {config.questionCount} Questions
            </button>
          </div>
        </div>
      )}

      {/* ═══ STEP 3: Generation Progress ═══ */}
      {step === 2 && session && (
        <div className="wizard-step">
          <div className="card mt-lg">
            <div className="progress-container">
              <h3 style={{ color: 'var(--marigold-light)', marginBottom: 8 }}>
                {session.status === 'GENERATING' ? '✨ Generating Questions...' :
                 session.status === 'VALIDATING' ? '🔍 Validating Quality...' :
                 '⏳ Preparing...'}
              </h3>
              <div className="progress-bar-track">
                <div className="progress-bar-fill" style={{
                  width: session.status === 'GENERATING'
                    ? `${Math.min(80, ((session.generatedCount || 0) / (session.requestedCount || 1)) * 80)}%`
                    : session.status === 'VALIDATING' ? '90%' : '10%'
                }} />
              </div>
              <p className="progress-status">
                {session.progressMessage || 'Working on it...'}
              </p>
              {session.generatedCount > 0 && (
                <p className="muted mt">
                  {session.generatedCount} questions generated so far
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══ STEP 4: Review Questions ═══ */}
      {step === 3 && questions.length > 0 && (
        <div className="wizard-step">
          {/* Summary bar */}
          <div className="summary-bar">
            <div>
              <span className="count">{selectedCount}</span> of {questions.length} selected
              {validCount < questions.length && (
                <span className="muted" style={{ marginLeft: 12 }}>
                  ({questions.length - validCount} flagged)
                </span>
              )}
            </div>
            <div className="row" style={{ gap: 8 }}>
              <button className="btn secondary" style={{ padding: '6px 14px', fontSize: 12 }}
                      onClick={selectAll}>Select All</button>
              <button className="btn secondary" style={{ padding: '6px 14px', fontSize: 12 }}
                      onClick={deselectAll}>Deselect All</button>
            </div>
          </div>

          {session?.progressMessage && validCount < session.requestedCount && (
            <div className="warning-banner">
              <span className="emoji">ℹ️</span>
              <span>{session.progressMessage}</span>
            </div>
          )}

          {/* Question cards */}
          {questions.map((q, idx) => (
            <div key={q.id} className={`q-review-card ${q.selected ? 'selected' : ''}`}>
              <div className="q-review-header">
                <input type="checkbox" className="q-review-checkbox"
                       checked={q.selected || false}
                       onChange={() => toggleSelect(q.id)} />
                <div style={{ flex: 1 }}>
                  {editingId === q.id ? (
                    <div className="inline-edit">
                      <textarea className="textarea" rows="2" value={editForm.questionText}
                                onChange={e => setEditForm({ ...editForm, questionText: e.target.value })} />
                      {['A', 'B', 'C', 'D'].map(k => (
                        <div className="field" key={k} style={{ marginTop: 8 }}>
                          <label>Option {k}</label>
                          <input className="input" value={editForm[`option${k}`]}
                                 onChange={e => setEditForm({ ...editForm, [`option${k}`]: e.target.value })} />
                        </div>
                      ))}
                      <div className="field" style={{ marginTop: 8 }}>
                        <label>Correct Option</label>
                        <select className="input" value={editForm.correctOption}
                                onChange={e => setEditForm({ ...editForm, correctOption: e.target.value })}>
                          <option>A</option><option>B</option><option>C</option><option>D</option>
                        </select>
                      </div>
                      <div className="field" style={{ marginTop: 8 }}>
                        <label>Explanation</label>
                        <textarea className="textarea" rows="2" value={editForm.explanation || ''}
                                  onChange={e => setEditForm({ ...editForm, explanation: e.target.value })} />
                      </div>
                      <div className="row mt" style={{ gap: 8 }}>
                        <button className="btn success" style={{ padding: '6px 14px', fontSize: 12 }}
                                onClick={() => saveEdit(q.id)}>Save</button>
                        <button className="btn secondary" style={{ padding: '6px 14px', fontSize: 12 }}
                                onClick={() => setEditingId(null)}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h4 style={{ margin: 0, fontSize: 15 }}>
                        <span className="muted" style={{ fontSize: 13 }}>Q{idx + 1}.</span> {q.questionText}
                      </h4>

                      <div className="badge-row">
                        {q.difficulty && (
                          <span className={`diff-badge ${q.difficulty.toLowerCase()}`}>{q.difficulty}</span>
                        )}
                        {q.topic && <span className="topic-badge">{q.topic}</span>}
                        <span className="quality-indicator">
                          <span className={`quality-dot ${qualityLevel(q.qualityScore)}`} />
                          {Math.round((q.qualityScore || 0) * 100)}%
                        </span>
                        {!q.passedValidation && (
                          <span className="diff-badge hard">⚠ Flagged</span>
                        )}
                      </div>

                      {/* Options */}
                      <div style={{ marginTop: 10 }}>
                        {['A', 'B', 'C', 'D'].map(k => (
                          <div key={k} className={`option-display ${q.correctOption === k ? 'correct' : ''}`}>
                            <span className="opt-key">{k}</span>
                            <span>{q[`option${k}`]}</span>
                          </div>
                        ))}
                      </div>

                      {/* Explanation */}
                      {q.explanation && (
                        <CollapsibleSection label="💡 Explanation">
                          <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>{q.explanation}</p>
                        </CollapsibleSection>
                      )}

                      {/* Source */}
                      {q.sourceReference && (
                        <CollapsibleSection label="📄 View Source">
                          <div className="source-ref">
                            <strong>Source:</strong> {q.sourceReference}
                          </div>
                        </CollapsibleSection>
                      )}

                      {/* Actions */}
                      <div className="row mt" style={{ gap: 8 }}>
                        <button className="btn secondary" style={{ padding: '5px 12px', fontSize: 12 }}
                                onClick={() => startEdit(q)}>✏️ Edit</button>
                        <button className="btn secondary" style={{ padding: '5px 12px', fontSize: 12 }}
                                onClick={() => regenerateQuestion(q.id)}>🔄 Regenerate</button>
                        <button className="btn danger" style={{ padding: '5px 12px', fontSize: 12 }}
                                onClick={() => deleteQuestion(q.id)}>🗑️</button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}

          <div className="wizard-actions">
            <button className="btn secondary" onClick={() => setStep(1)}>← Configure</button>
            <button className="btn" onClick={() => setStep(4)} disabled={selectedCount === 0}>
              Save {selectedCount} Questions as Quiz →
            </button>
          </div>
        </div>
      )}

      {/* ═══ STEP 5: Save Quiz ═══ */}
      {step === 4 && !savedQuiz && (
        <div className="wizard-step">
          <div className="card mt-lg">
            <h3 style={{ marginBottom: 16 }}>Save as Quiz Arena Quiz</h3>
            <p className="muted" style={{ marginBottom: 20 }}>
              {selectedCount} questions selected. Fill in the quiz details below.
            </p>
            <div className="field">
              <label>Quiz Title</label>
              <input className="input" placeholder="e.g. Computer Networks Midterm"
                     value={quizMeta.title}
                     onChange={e => setQuizMeta({ ...quizMeta, title: e.target.value })} />
            </div>
            <div className="field">
              <label>Description</label>
              <textarea className="textarea" rows="3" placeholder="Brief description of this quiz..."
                        value={quizMeta.description}
                        onChange={e => setQuizMeta({ ...quizMeta, description: e.target.value })} />
            </div>
            <div className="row">
              <div className="field" style={{ flex: 1 }}>
                <label>Category</label>
                <input className="input" placeholder="e.g. Computer Science"
                       value={quizMeta.category}
                       onChange={e => setQuizMeta({ ...quizMeta, category: e.target.value })} />
              </div>
              <div className="field" style={{ flex: 1 }}>
                <label>Duration (minutes)</label>
                <input className="input" type="number" min="1"
                       value={quizMeta.durationMinutes}
                       onChange={e => setQuizMeta({ ...quizMeta, durationMinutes: Number(e.target.value) })} />
              </div>
            </div>
          </div>
          <div className="wizard-actions">
            <button className="btn secondary" onClick={() => setStep(3)}>← Review</button>
            <button className="btn success" onClick={saveQuiz} disabled={saving || !quizMeta.title.trim()}>
              {saving ? 'Saving...' : '✨ Create Quiz'}
            </button>
          </div>
        </div>
      )}

      {/* ═══ Success Screen ═══ */}
      {step === 4 && savedQuiz && (
        <div className="wizard-step">
          <div className="card mt-lg" style={{ textAlign: 'center', padding: 40 }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
            <h2>Quiz Created Successfully!</h2>
            <p className="muted mt">
              <strong>{savedQuiz.title}</strong> — {savedQuiz.questionCount} questions
            </p>
            <div className="row mt-lg" style={{ justifyContent: 'center', gap: 12 }}>
              <button className="btn" onClick={() => nav(`/quiz/${savedQuiz.id}`)}>
                Take Quiz
              </button>
              <button className="btn secondary" onClick={() => nav('/my-quizzes')}>
                My Quizzes
              </button>
              <button className="btn secondary" onClick={() => nav('/contests/new')}>
                🏆 Create Contest
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Collapsible Section Component ───────────────────────────

function CollapsibleSection({ label, children }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ marginTop: 8 }}>
      <button className="collapsible-trigger" onClick={() => setOpen(!open)}>
        {open ? '▾' : '▸'} {label}
      </button>
      <div className={`collapsible-content ${open ? 'open' : ''}`}>
        {children}
      </div>
    </div>
  )
}
