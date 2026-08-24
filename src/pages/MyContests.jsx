import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axiosClient";

export default function MyContests() {
  const navigate = useNavigate();
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joinCode, setJoinCode] = useState("");

  useEffect(() => {
    api.get("/api/contests/mine")
      .then((r) => setContests(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const join = () => {
    const code = joinCode.trim().toUpperCase();
    if (code.length < 4) {
      alert("Enter a valid contest code");
      return;
    }
    navigate(`/contest/${code}`);
  };

  return (
    <div className="container" style={{ maxWidth: 720 }}>
      <div className="row mt-lg" style={{ justifyContent: "space-between", alignItems: "center" }}>
        <h2>My Contests</h2>
        <Link to="/contests/new" className="btn btn-primary">+ New contest</Link>
      </div>

      {/* Join by code */}
      <div className="card mt-lg" style={{ padding: 16 }}>
        <h4 style={{ marginTop: 0 }}>Join a contest</h4>
        <p className="muted" style={{ fontSize: 13 }}>Got a code from a host? Enter it here.</p>
        <div className="row" style={{ gap: 8 }}>
          <input
            className="input"
            placeholder="e.g. K7P2QX"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === "Enter" && join()}
            style={{ maxWidth: 220, letterSpacing: 2, textTransform: "uppercase" }}
            maxLength={8}
          />
          <button className="btn btn-primary" onClick={join}>Join</button>
        </div>
      </div>

      <h3 className="mt-lg" style={{ marginBottom: 0 }}>Contests you host</h3>

      {loading ? (
        <p className="muted mt-lg">Loading…</p>
      ) : contests.length === 0 ? (
        <p className="muted mt-lg">You haven't hosted any contests yet.</p>
      ) : (
        <div className="mt-lg" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {contests.map((c) => (
            <Link key={c.id} to={`/contest/${c.code}`} className="card"
                  style={{ textDecoration: "none", padding: 16 }}>
              <div className="row" style={{ justifyContent: "space-between" }}>
                <b>{c.title}</b>
                <span className="badge">{c.status}</span>
              </div>
              <p className="muted" style={{ fontSize: 13, marginTop: 4 }}>
                {c.quizTitle} · code {c.code} · ends {new Date(c.endAt).toLocaleString()}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}