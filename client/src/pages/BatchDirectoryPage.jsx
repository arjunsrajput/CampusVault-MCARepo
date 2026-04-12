import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getDirectoryBatch } from "../api/index.js";

const formatBatch = (batch) => {
  const [start, end] = String(batch).split("-");
  if (!start || !end) return batch;
  const fullEnd = end.length === 2 ? `${start.slice(0, 2)}${end}` : end;
  return `${start}-${fullEnd}`;
};

const getInitials = (name) =>
  String(name || "")
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

function VerificationBadge({ isVerified }) {
  if (!isVerified) return null;

  return (
    <span
      className="badge badge-notes"
      style={{ display: "inline-flex", alignItems: "center", gap: 4 }}
    >
      Verified
    </span>
  );
}

export default function BatchDirectoryPage() {
  const { batch = "" } = useParams();
  const decodedBatch = decodeURIComponent(batch);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    setLoading(true);
    getDirectoryBatch(decodedBatch)
      .then((res) => setMembers(res.data.members || []))
      .finally(() => setLoading(false));
  }, [decodedBatch]);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Link
          to="/directory"
          style={{ color: "var(--accent2)", fontSize: 13, display: "inline-block", marginBottom: 10 }}
        >
          ← Back to batches
        </Link>
        <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>
          <span
            style={{
              fontFamily: "var(--font-head)",
              fontWeight: 700,
              letterSpacing: "-0.03em",
            }}
          >
            Batch {formatBatch(decodedBatch)}
          </span>
        </h2>
        <p style={{ color: "var(--text3)", fontSize: 14 }}>
          {/* Members are sorted by roll number in ascending order. */}
        </p>
      </div>

      {loading ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))",
            gap: 12,
          }}
        >
          {[...Array(6)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 196 }} />
          ))}
        </div>
      ) : members.length === 0 ? (
        <div className="empty-state">
          <h3>No members found</h3>
          <p>This batch does not have any visible directory profiles yet.</p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))",
            gap: 12,
          }}
        >
          {members.map((member) => (
            <button
              key={member.id}
              type="button"
              className="card fade-in"
              onClick={() => setSelected(member)}
              style={{
                padding: 18,
                textAlign: "left",
                display: "flex",
                flexDirection: "column",
                gap: 14,
                background: "var(--card)",
                border: "1px solid var(--border)",
              }}
            >
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <div
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "var(--accent-bg)",
                    color: "var(--accent2)",
                    fontWeight: 800,
                    fontFamily: "var(--font-head)",
                    flexShrink: 0,
                  }}
                >
                  {getInitials(member.name)}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      fontFamily: "var(--font-head)",
                      lineHeight: 1.25,
                      color: "var(--text)",
                    }}
                  >
                    {member.name}
                  </div>
                  <div style={{ color: "var(--text3)", fontSize: 12, marginTop: 2 }}>
                    {member.rollNumber}
                  </div>
                  <div style={{ marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <span className="badge badge-answer">
                      {member.isAlumni ? "Alumni" : `Year ${member.currentYear}`}
                    </span>
                    <VerificationBadge isVerified={member.isVerified} />
                  </div>
                </div>
              </div>

              <div style={{ color: "var(--text2)", fontSize: 13, minHeight: 42 }}>
                {member.company
                  ? `${member.jobTitle || "Professional"}${member.company ? ` @ ${member.company}` : ""}`
                  : "Academic profile"}
              </div>

              <div style={{ display: "flex", gap: 14, color: "var(--text3)", fontSize: 12, flexWrap: "wrap" }}>
                <span>{member.uploadCount} uploads</span>
                <span>▲ {member.upvotesReceived} upvotes</span>
                {member.city && <span>{member.city}</span>}
              </div>
            </button>
          ))}
        </div>
      )}

      {selected && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelected(null);
          }}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.65)",
            backdropFilter: "blur(4px)",
            padding: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 120,
          }}
        >
          <div
            className="card"
            style={{
              width: "100%",
              maxWidth: 560,
              maxHeight: "85vh",
              overflowY: "auto",
              padding: 24,
            }}
          >
            <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 18 }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "var(--accent-bg)",
                  color: "var(--accent2)",
                  fontWeight: 800,
                  fontSize: 20,
                  fontFamily: "var(--font-head)",
                  flexShrink: 0,
                }}
              >
                {getInitials(selected.name)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 22, fontWeight: 800, fontFamily: "var(--font-head)" }}>
                  {selected.name}
                </div>
                <div style={{ fontSize: 13, color: "var(--text3)", marginTop: 2 }}>
                  {selected.rollNumber} · Batch {formatBatch(selected.batch)}
                </div>
                <div style={{ marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <span className="badge badge-answer">
                    {selected.isAlumni ? "Alumni" : `Year ${selected.currentYear}`}
                  </span>
                  <VerificationBadge isVerified={selected.isVerified} />
                </div>
              </div>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setSelected(null)}>
                Close
              </button>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
                marginBottom: 16,
              }}
            >
              <div className="card" style={{ padding: 14 }}>
                <div style={{ fontSize: 11, color: "var(--text3)", textTransform: "uppercase", letterSpacing: ".05em" }}>
                  Uploads
                </div>
                <div style={{ fontSize: 20, fontWeight: 800, fontFamily: "var(--font-head)", color: "var(--accent2)" }}>
                  {selected.uploadCount}
                </div>
              </div>
              <div className="card" style={{ padding: 14 }}>
                <div style={{ fontSize: 11, color: "var(--text3)", textTransform: "uppercase", letterSpacing: ".05em" }}>
                  Upvotes Received
                </div>
                <div style={{ fontSize: 20, fontWeight: 800, fontFamily: "var(--font-head)", color: "var(--green)" }}>
                  {selected.upvotesReceived}
                </div>
              </div>
            </div>

            {(selected.company || selected.jobTitle || selected.city || selected.graduationYear) && (
              <div style={{ marginBottom: 16 }}>
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--text3)",
                    textTransform: "uppercase",
                    letterSpacing: ".05em",
                    marginBottom: 8,
                    fontFamily: "var(--font-head)",
                  }}
                >
                  Profile
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 10,
                  }}
                >
                  {selected.company && <div className="card" style={{ padding: 14 }}>Company: {selected.company}</div>}
                  {selected.jobTitle && <div className="card" style={{ padding: 14 }}>Role: {selected.jobTitle}</div>}
                  {selected.city && <div className="card" style={{ padding: 14 }}>City: {selected.city}</div>}
                  {selected.graduationYear && (
                    <div className="card" style={{ padding: 14 }}>
                      Graduation: {selected.graduationYear}
                    </div>
                  )}
                </div>
              </div>
            )}

            {selected.bio && (
              <div style={{ marginBottom: 16 }}>
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--text3)",
                    textTransform: "uppercase",
                    letterSpacing: ".05em",
                    marginBottom: 8,
                    fontFamily: "var(--font-head)",
                  }}
                >
                  Message
                </div>
                <div className="card" style={{ padding: 14, color: "var(--text2)" }}>
                  {selected.bio}
                </div>
              </div>
            )}

            {(selected.linkedinUrl || selected.personalEmail) && (
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {selected.linkedinUrl && (
                  <a
                    href={selected.linkedinUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-ghost btn-sm"
                  >
                    LinkedIn ↗
                  </a>
                )}
                {selected.personalEmail && (
                  <a href={`mailto:${selected.personalEmail}`} className="btn btn-ghost btn-sm">
                    Email →
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
