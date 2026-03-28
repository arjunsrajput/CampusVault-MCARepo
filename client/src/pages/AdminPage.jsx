import { useState, useEffect } from "react";
import {
  adminStats,
  adminFlagged,
  adminUnflag,
  adminUsers,
  adminSetRole,
  deleteMaterial,
} from "../api/index.js";
import toast from "react-hot-toast";
import { formatDate } from "../utils/constants.js";

function StatCard({ label, value, color }) {
  return (
    <div className="card" style={{ textAlign: "center", padding: "18px 14px" }}>
      <p
        style={{
          fontSize: 30,
          fontWeight: 800,
          fontFamily: "var(--font-head)",
          color: color || "var(--accent2)",
        }}
      >
        {value}
      </p>
      <p style={{ fontSize: 12, color: "var(--text3)", marginTop: 4 }}>
        {label}
      </p>
    </div>
  );
}

export default function AdminPage() {
  const [stats, setStats] = useState(null);
  const [flagged, setFlagged] = useState([]);
  const [users, setUsers] = useState([]);
  const [tab, setTab] = useState("stats");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([adminStats(), adminFlagged(), adminUsers()])
      .then(([s, f, u]) => {
        setStats(s.data);
        setFlagged(f.data.materials);
        setUsers(u.data.users);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleUnflag = async (id) => {
    try {
      await adminUnflag(id);
      setFlagged((p) => p.filter((m) => m._id !== id));
      toast.success("Unflagged");
    } catch {
      toast.error("Failed");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Permanently delete this material?")) return;
    try {
      await deleteMaterial(id);
      setFlagged((p) => p.filter((m) => m._id !== id));
      toast.success("Deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  const handleRole = async (id, role) => {
    try {
      await adminSetRole(id, role);
      setUsers((p) => p.map((u) => (u._id === id ? { ...u, role } : u)));
      toast.success(`Role updated to ${role}`);
    } catch {
      toast.error("Failed");
    }
  };

  const tabs = ["stats", "flagged", "users"];

  if (loading) return <div className="spinner" />;

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>
          Admin panel
        </h2>
        <p style={{ color: "var(--text3)", fontSize: 14 }}>
          Manage materials, users and site health
        </p>
      </div>

      {/* Tab nav */}
      <div
        style={{
          display: "flex",
          gap: 6,
          marginBottom: 24,
          borderBottom: "1px solid var(--border)",
          paddingBottom: 12,
        }}
      >
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: "7px 16px",
              borderRadius: "var(--radius)",
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
              fontFamily: "var(--font-body)",
              transition: "all .15s",
              background: tab === t ? "var(--accent-bg)" : "transparent",
              color: tab === t ? "var(--accent2)" : "var(--text2)",
              border: `1px solid ${tab === t ? "var(--accent)" : "var(--border)"}`,
              textTransform: "capitalize",
            }}
          >
            {t}{" "}
            {t === "flagged" && flagged.length > 0 && (
              <span
                style={{
                  background: "var(--red)",
                  color: "#fff",
                  borderRadius: 10,
                  padding: "1px 6px",
                  fontSize: 10,
                  marginLeft: 4,
                }}
              >
                {flagged.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Stats tab */}
      {tab === "stats" && stats && (
        <div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))",
              gap: 12,
              marginBottom: 24,
            }}
          >
            <StatCard label="Total materials" value={stats.totalMaterials} />
            <StatCard
              label="Total users"
              value={stats.totalUsers}
              color="var(--green)"
            />
            <StatCard
              label="Flagged"
              value={stats.flagged}
              color={stats.flagged > 0 ? "var(--red)" : "var(--text2)"}
            />
          </div>
          <h3
            style={{
              fontSize: 15,
              fontWeight: 700,
              marginBottom: 14,
              fontFamily: "var(--font-head)",
            }}
          >
            Materials by type
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {stats.byType?.map((t) => (
              <div
                key={`${t._id.exam}-${t._id.materialType}`}
                style={{ display: "flex", alignItems: "center", gap: 12 }}
              >
                <span
                  style={{
                    width: 160,
                    fontSize: 13,
                    color: "var(--text2)",
                    fontFamily: "var(--font-head)",
                    fontWeight: 600,
                  }}
                >
                  {t._id.exam} ·{" "}
                  {t._id.materialType === "QuestionPaper"
                    ? "Question Paper"
                    : t._id.materialType === "AnswerScript"
                      ? "Answer Script"
                      : t._id.materialType}
                </span>
                <div
                  style={{
                    flex: 1,
                    background: "var(--bg3)",
                    borderRadius: 4,
                    height: 8,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      borderRadius: 4,
                      background: "var(--accent)",
                      width: `${Math.min(100, (t.count / Math.max(stats.totalMaterials, 1)) * 100)}%`,
                      transition: "width .5s",
                    }}
                  />
                </div>
                <span
                  style={{
                    fontSize: 13,
                    color: "var(--text3)",
                    minWidth: 30,
                    textAlign: "right",
                  }}
                >
                  {t.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Flagged tab */}
      {tab === "flagged" && (
        <div>
          {flagged.length === 0 ? (
            <div className="empty-state">
              <h3>No flagged materials</h3>
              <p>All clear!</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {flagged.map((m) => (
                <div
                  key={m._id}
                  className="card"
                  style={{ padding: "14px 18px" }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      gap: 12,
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <p
                        style={{
                          fontWeight: 600,
                          fontSize: 14,
                          marginBottom: 4,
                          fontFamily: "var(--font-head)",
                        }}
                      >
                        {m.title}
                      </p>
                      <p
                        style={{
                          fontSize: 12,
                          color: "var(--text3)",
                          marginBottom: 6,
                        }}
                      >
                        {m.subject} · {m.examType} · {m.batch} · Uploaded by{" "}
                        {m.uploadedBy?.name} · {formatDate(m.createdAt)}
                      </p>
                      {m.flagReason && (
                        <p
                          style={{
                            fontSize: 12,
                            background: "var(--red-bg)",
                            color: "var(--red)",
                            padding: "4px 10px",
                            borderRadius: 6,
                            display: "inline-block",
                          }}
                        >
                          Reason: {m.flagReason}
                        </p>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => handleUnflag(m._id)}
                      >
                        Unflag
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(m._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Users tab */}
      {tab === "users" && (
        <div style={{ overflowX: "auto" }}>
          <table
            style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}
          >
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {[
                  "Name",
                  "Email",
                  "Batch",
                  "Year",
                  "Uploads",
                  "Role",
                  "Action",
                ].map((h) => (
                  <th
                    key={h}
                    style={{
                      textAlign: "left",
                      padding: "10px 12px",
                      color: "var(--text3)",
                      fontWeight: 500,
                      fontSize: 12,
                      fontFamily: "var(--font-head)",
                      textTransform: "uppercase",
                      letterSpacing: ".04em",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr
                  key={u._id}
                  style={{ borderBottom: "1px solid var(--border)" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "var(--bg3)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <td style={{ padding: "10px 12px", fontWeight: 500 }}>
                    {u.name}
                  </td>
                  <td style={{ padding: "10px 12px", color: "var(--text3)" }}>
                    {u.email}
                  </td>
                  <td style={{ padding: "10px 12px", color: "var(--text3)" }}>
                    {u.batch}
                  </td>
                  <td style={{ padding: "10px 12px", color: "var(--text3)" }}>
                    {u.currentYear}
                  </td>
                  <td
                    style={{
                      padding: "10px 12px",
                      color: "var(--accent2)",
                      fontWeight: 700,
                      fontFamily: "var(--font-head)",
                    }}
                  >
                    {u.uploadCount}
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    <span
                      style={{
                        padding: "2px 10px",
                        borderRadius: 20,
                        fontSize: 11,
                        fontWeight: 600,
                        background:
                          u.role === "admin" ? "var(--amber-bg)" : "var(--bg3)",
                        color:
                          u.role === "admin" ? "var(--amber)" : "var(--text3)",
                      }}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    <button
                      onClick={() =>
                        handleRole(
                          u._id,
                          u.role === "admin" ? "student" : "admin",
                        )
                      }
                      className="btn btn-ghost btn-sm"
                      style={{ fontSize: 11, padding: "4px 10px" }}
                    >
                      {u.role === "admin" ? "Demote" : "Make admin"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
