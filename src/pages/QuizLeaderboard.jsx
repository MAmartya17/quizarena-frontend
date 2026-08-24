import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axiosClient";
import Leaderboard from "../components/Leaderboard";

export default function QuizLeaderboard() {
  const { id } = useParams();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`/api/quizzes/${id}/leaderboard`, { params: { limit: 20 } })
      .then((r) => setEntries(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="container" style={{ maxWidth: 640 }}>
      <h2 className="mt-lg">🏆 Leaderboard</h2>
      <p className="muted">Top 20 — best score per player.</p>
      <div className="mt-lg">
        <Leaderboard entries={entries} loading={loading} />
      </div>
      <div className="mt-lg">
        <Link to={`/quiz/${id}`} className="btn">Back to quiz</Link>
      </div>
    </div>
  );
}