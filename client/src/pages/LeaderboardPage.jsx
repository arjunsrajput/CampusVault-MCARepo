import { useState, useEffect } from "react";
import { getLeaderboard } from "../api/index.js";

export default function LeaderboardPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLeaderboard()
      .then((r) => setUsers(r.data.users))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div style={{ maxWidth: 600, margin: "0 auto" }}>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>
          Contribution leaders
        </h2>
        <p style={{ color: "var(--text3)", fontSize: 14 }}>
          Students who have uploaded the most materials
        </p>
      </div>

      {loading ? (
        <div className="spinner" />
      ) : users.length === 0 ? (
        <div className="empty-state">
          <h3>No uploads yet</h3>
          <p>Be the first to upload!</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {users.map((u, i) => (
            <div
              key={u._id}
              className="card fade-in"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "14px 18px",
              }}
            >
              <span
                style={{
                  fontSize: i < 3 ? 22 : 14,
                  minWidth: 32,
                  textAlign: "center",
                  color: "var(--text3)",
                  fontFamily: "var(--font-head)",
                  fontWeight: 700,
                }}
              >
                {i < 3 ? medals[i] : `#${i + 1}`}
              </span>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: "50%",
                  background: "var(--accent-bg)",
                  color: "var(--accent2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 13,
                  fontWeight: 700,
                  fontFamily: "var(--font-head)",
                  flexShrink: 0,
                }}
              >
                {u.name
                  ?.split(" ")
                  .map((w) => w[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
              </div>
              <div style={{ flex: 1 }}>
                {/* <p style={{fontWeight:600,fontSize:14,fontFamily:'var(--font-head)'}}>{u.name}</p>
                <p style={{fontSize:12,color:'var(--text3)'}}>Batch {u.batch}</p> */}
                <p
                  style={{
                    fontWeight: 600,
                    fontSize: 14,
                    fontFamily: "var(--font-head)",
                  }}
                >
                  {u.name}
                </p>
                <p style={{ fontSize: 12, color: "var(--text3)" }}>
                  {u.rollNumber && <span>{u.rollNumber} · </span>}Batch{" "}
                  {u.batch}
                </p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p
                  style={{
                    fontSize: 18,
                    fontWeight: 800,
                    color: "var(--accent2)",
                    fontFamily: "var(--font-head)",
                  }}
                >
                  {u.uploadCount}
                </p>
                <p style={{ fontSize: 11, color: "var(--text3)" }}>uploads</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
