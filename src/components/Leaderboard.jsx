export default function Leaderboard({ entries = [], loading = false, emptyText = "No scores yet — be the first!" }) {
  const medal = (rank) => (rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `#${rank}`);

  if (loading) return <p className="muted">Loading leaderboard…</p>;
  if (!entries.length) return <p className="muted">{emptyText}</p>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {entries.map((e) => (
        <div
          key={e.userId}
          className="card"
          style={{
            display: "flex", alignItems: "center", gap: 12, padding: "10px 14px",
            border: e.rank <= 3 ? "1px solid #FFB627" : undefined,
          }}
        >
          <span style={{ width: 36, textAlign: "center", fontSize: 18, fontWeight: 700 }}>
            {medal(e.rank)}
          </span>
          {e.pictureUrl ? (
            <img src={e.pictureUrl} alt="" width={32} height={32}
                 style={{ borderRadius: "50%" }} />
          ) : (
            <div style={{
              width: 32, height: 32, borderRadius: "50%", background: "#009B8E",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontWeight: 700,
            }}>
              {e.name?.[0]?.toUpperCase() ?? "?"}
            </div>
          )}
          <span style={{ flex: 1, fontWeight: 600 }}>{e.name}</span>
          <span style={{ fontWeight: 700 }}>{e.bestScore}/{e.maxScore}</span>
          <span className="muted" style={{ width: 50, textAlign: "right" }}>{e.percentage}%</span>
        </div>
      ))}
    </div>
  );
}