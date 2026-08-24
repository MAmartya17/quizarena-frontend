import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosClient";

export default function CreateContest() {
  const nav = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [form, setForm] = useState({ quizId: "", title: "", startAt: "", endAt: "" });
  const [created, setCreated] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get("/api/quizzes/mine").then((r) => setQuizzes(r.data)).catch(() => {});
  }, []);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    if (!form.quizId || !form.title || !form.startAt || !form.endAt) {
      alert("Please fill all fields");
      return;
    }
    setSaving(true);
    try {
      const { data } = await api.post("/api/contests", {
        quizId: Number(form.quizId),
        title: form.title,
        // datetime-local gives local time; convert to ISO (UTC) for the backend Instant
        startAt: new Date(form.startAt).toISOString(),
        endAt: new Date(form.endAt).toISOString(),
      });
      setCreated(data);
    } catch (e) {
      alert(e.response?.data?.error || "Could not create contest");
    } finally {
      setSaving(false);
    }
  };

  if (created) {
    const link = `${window.location.origin}/contest/${created.code}`;
    return (
      <div className="container" style={{ maxWidth: 560 }}>
        <div className="card mt-lg" style={{ textAlign: "center", padding: 32 }}>
          <h2>Contest created! 🎉</h2>
          <p className="muted">Share this code or link with participants:</p>
          <div style={{ fontSize: 40, fontWeight: 800, letterSpacing: 4, margin: "16px 0", color: "#FF6B35" }}>
            {created.code}
          </div>
          <input className="input" readOnly value={link} onFocus={(e) => e.target.select()} />
          <div className="row mt-lg" style={{ gap: 12, justifyContent: "center" }}>
            <button className="btn" onClick={() => { navigator.clipboard.writeText(link); }}>Copy link</button>
            <button className="btn btn-primary" onClick={() => nav(`/contest/${created.code}`)}>Open contest</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: 560 }}>
      <h2 className="mt-lg">Create a Contest</h2>
      <p className="muted">Pick one of your quizzes and set a time window. Everyone competes during the window.</p>

      <div className="card mt-lg" style={{ display: "flex", flexDirection: "column", gap: 14, padding: 20 }}>
        <label>
          <div className="muted" style={{ marginBottom: 4 }}>Quiz</div>
          <select className="input" value={form.quizId} onChange={set("quizId")}>
            <option value="">— Select a quiz you created —</option>
            {quizzes.map((q) => (
              <option key={q.id} value={q.id}>{q.title} ({q.questionCount} Qs)</option>
            ))}
          </select>
        </label>
        <label>
          <div className="muted" style={{ marginBottom: 4 }}>Contest title</div>
          <input className="input" value={form.title} onChange={set("title")} placeholder="Friday Java Showdown" />
        </label>
        <label>
          <div className="muted" style={{ marginBottom: 4 }}>Starts at</div>
          <input className="input" type="datetime-local" value={form.startAt} onChange={set("startAt")} />
        </label>
        <label>
          <div className="muted" style={{ marginBottom: 4 }}>Ends at</div>
          <input className="input" type="datetime-local" value={form.endAt} onChange={set("endAt")} />
        </label>
        <button className="btn btn-primary" onClick={submit} disabled={saving}>
          {saving ? "Creating…" : "Create contest"}
        </button>
      </div>
    </div>
  );
}