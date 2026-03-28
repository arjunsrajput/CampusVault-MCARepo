import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getDirectoryBatches } from "../api/index.js";

const formatBatch = (batch) => {
  const [start, end] = String(batch).split("-");
  if (!start || !end) return batch;
  const fullEnd = end.length === 2 ? `${start.slice(0, 2)}${end}` : end;
  return `${start}-${fullEnd}`;
};

export default function DirectoryPage() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDirectoryBatches()
      .then((res) => setBatches(res.data.batches || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>
          Directory
        </h2>
        <p style={{ color: "var(--text3)", fontSize: 14 }}>
          Browse the MCA directory batch by batch.
        </p>
      </div>

      {loading ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))",
            gap: 12,
          }}
        >
          {[...Array(6)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 138 }} />
          ))}
        </div>
      ) : batches.length === 0 ? (
        <div className="empty-state">
          <h3>No batches found</h3>
          <p>No visible directory members are available yet.</p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))",
            gap: 12,
          }}
        >
          {batches.map((item) => (
            <Link
              key={item.batch}
              to={`/directory/${encodeURIComponent(item.batch)}`}
              className="card fade-in"
              style={{
                padding: 20,
                display: "flex",
                flexDirection: "column",
                gap: 14,
                minHeight: 138,
                background:
                  "linear-gradient(180deg, rgba(124,111,255,0.09), rgba(124,111,255,0.02))",
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  letterSpacing: ".08em",
                  textTransform: "uppercase",
                  color: "var(--text3)",
                  fontFamily: "var(--font-head)",
                }}
              >
                Batch
              </div>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  fontFamily: "var(--font-head)",
                  lineHeight: 1.15,
                  letterSpacing: "-0.03em",
                }}
              >
                {formatBatch(item.batch)}
              </div>
              <div style={{ marginTop: "auto", color: "var(--text2)", fontSize: 14 }}>
                {item.memberCount} visible member{item.memberCount === 1 ? "" : "s"}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
