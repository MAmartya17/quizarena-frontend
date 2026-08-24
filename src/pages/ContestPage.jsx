import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axiosClient";
import Leaderboard from "../components/Leaderboard";

export default function ContestPage() {
  const { code } = useParams();
  const [contest, setContest] = useState(null);
  const [board, setBoard] = useState([]);
  const [boardLoading, setBoardLoading] = useState(true);

  // play state
  const [questions, setQuestions] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);

  const loadContest = useCallback(() => {
    api.get(`/api/contests/${code}`).then((r) => setContest(r.data)).catch(() => {});
  }, [code]);

  const loadBoard = useCallback(() => {
    setBoardLoading(true);
    api.get(`/api/contests/${code}/leaderboard`)
      .then((r) => setBoard(r.data))
      .catch(() => {})
      .finally(() => setBoardLoading(false));
  }, [code]);

  useEffect(() => { loadContest(); loadBoard(); }, [loadContest, loadBoard]);

  const startQuiz = async () => {
    try {
      const { data } = await api.get(`/api/contests/${code}/play`);
      setQuestions(data.questions);
      setAnswers({});
      setResult(null);
    } catch (e) {
      alert(e.response?.data?.error || "Cannot start yet");
    }
  };

  const submit = async () => {
    setBusy(true);
    try {
      const { data } = await api.post(`/api/contests/${code}/submit`, { answers });
      setResult(data);
      setQuestions(null);
      loadContest();
      loadBoard();
    } catch (e) {
      alert(e.response?.data?.error || "Submit failed");
    } finally {
      setBusy(false);
    }
  };

  if (!contest) return <div className="container"><p className="muted mt-lg">Loading…</p></div>;

  const statusBadge = {
    SCHEDULED: { text: "Starts soon", color: "#FFB627" },
    ACTIVE: { text: "● LIVE NOW", color: "#009B8E" },
    ENDED: { text: "Ended (practice only)", color: "#6B7280" },
  }[contest.status];

  return (
    <div className="container" style={{ maxWidth: 680 }}>
      <h2 className="mt-lg">{contest.title}</h2>
      <p className="muted">
        Quiz: <b>{contest.quizTitle}</b> · {contest.questionCount} questions · code <b>{contest.code}</b>
      </p>
      <div style={{ display: "inline-block", padding: "4px 12px", borderRadius: 20,
                    border: `1px solid ${statusBadge.color}`, color: statusBadge.color, fontWeight: 700 }}>
        {statusBadge.text}
      </div>
      <p className="muted mt" style={{ fontSize: 13 }}>
        Window: {new Date(contest.startAt).toLocaleString()} → {new Date(contest.endAt).toLocaleString()}
      </p>

      {/* RESULT */}
      {result && (
        <div className="card mt-lg" style={{ textAlign: "center", padding: 24 }}>
          <h3>Your score: {result.score}/{result.maxScore} ({result.percentage}%)</h3>
          <p className="muted">
            {result.countedOnLeaderboard
              ? "✅ Counted on the contest leaderboard."
              : "ℹ️ Practice run — the contest has ended, so this isn't on the leaderboard."}
          </p>
        </div>
      )}

      {/* PLAY */}
      {questions && (
        <div className="mt-lg">
          {questions.map((q, idx) => (
            <div key={q.id} className="card mt" style={{ padding: 16 }}>
              <h4>{idx + 1}. {q.text}</h4>
              {["A", "B", "C", "D"].map((opt) => (
                <label key={opt} className="row" style={{ gap: 8, marginTop: 6, cursor: "pointer" }}>
                  <input type="radio" name={`q${q.id}`} checked={answers[q.id] === opt}
                         onChange={() => setAnswers((a) => ({ ...a, [q.id]: opt }))} />
                  <span>{opt}. {q[`option${opt}`]}</span>
                </label>
              ))}
            </div>
          ))}
          <button className="btn btn-primary mt-lg" onClick={submit} disabled={busy}>
            {busy ? "Submitting…" : "Submit answers"}
          </button>
        </div>
      )}

      {/* START BUTTON */}
      {!questions && !result && contest.status !== "SCHEDULED" && (
        <div className="mt-lg">
          <button className="btn btn-primary" onClick={startQuiz}>
            {contest.status === "ACTIVE" ? "Enter contest" : "Take as practice"}
          </button>
        </div>
      )}
      {contest.status === "SCHEDULED" && (
        <p className="muted mt-lg">This contest hasn't started yet. Check back at the start time.</p>
      )}

      {/* LEADERBOARD */}
      <h3 className="mt-lg">🏆 Contest Leaderboard</h3>
      <Leaderboard entries={board} loading={boardLoading} emptyText="No submissions yet." />
    </div>
  );
}