import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getMaterial,
  upvoteMaterial,
  flagMaterial,
  deleteMaterial,
  saveMaterial,
} from "../api/index.js";
import { useAuthStore } from "../store/authStore.js";
import { useMaterialStore } from "../store/materialStore.js";
import { EXAM_BADGE, EXAM_TYPE_BADGE, formatDate } from "../utils/constants.js";
import toast from "react-hot-toast";

export default function MaterialPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { removeMaterial } = useMaterialStore();
  const [material, setMaterial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [flagReason, setFlagReason] = useState("");
  const [showFlag, setShowFlag] = useState(false);
  const userId = user?._id || user?.id || "";
  const [upvoted, setUpvoted] = useState(false);

  useEffect(() => {
    getMaterial(id)
      .then((r) => {
        setMaterial(r.data.material);
        setUpvoted(
          r.data.material.upvotedBy?.some(
            (x) => (x?._id || x)?.toString() === userId,
          ),
        );
      })
      .catch(() => toast.error("Material not found"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDownload = () => {
    window.open(material.fileUrl, "_blank");
  };

  const handleUpvote = async () => {
    try {
      const res = await upvoteMaterial(id);
      setUpvoted(res.data.upvoted);
      setMaterial((p) => ({ ...p, upvotes: res.data.upvotes }));
    } catch {
      toast.error("Failed");
    }
  };

  const handleSave = async () => {
    try {
      const res = await saveMaterial(id);
      toast.success(res.data.saved ? "Saved!" : "Removed from saved");
    } catch {
      toast.error("Failed");
    }
  };

  const handleFlag = async () => {
    if (!flagReason.trim()) return toast.error("Please give a reason");
    try {
      await flagMaterial(id, flagReason);
      toast.success("Flagged for review");
      setShowFlag(false);
    } catch {
      toast.error("Failed");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this material permanently?")) return;
    try {
      await deleteMaterial(id);
      removeMaterial(id);
      toast.success("Deleted");
      navigate("/");
    } catch {
      toast.error("Failed to delete");
    }
  };

  if (loading) return <div className="spinner" />;
  if (!material)
    return (
      <div className="empty-state">
        <h3>Material not found</h3>
      </div>
    );

  const badgeClass =
    EXAM_BADGE[material.exam] ||
    EXAM_TYPE_BADGE[material.examType] ||
    "badge-notes";

  const isOwner =
    material.uploadedBy?._id?.toString() === userId ||
    material.uploadedBy?.toString() === userId;
  const isAdmin = user?.role === "admin";

  return (
    <div style={{ maxWidth: 700, margin: "0 auto" }}>
      <button
        onClick={() => navigate(-1)}
        className="btn btn-ghost btn-sm"
        style={{ marginBottom: 20 }}
      >
        ← Back
      </button>

      <div className="card" style={{ marginBottom: 16, padding: "24px" }}>
        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            marginBottom: 14,
          }}
        >
          <span className={`badge ${badgeClass}`}>
            {material.exam || material.examType}
          </span>

          <span
            style={{
              background: "var(--accent-bg)",
              color: "var(--accent2)",
              padding: "3px 10px",
              borderRadius: 20,
              fontSize: 11,
              fontWeight: 500,
            }}
          >
            {material.subject}
          </span>
        </div>

        <h1
          style={{
            fontSize: 22,
            fontWeight: 800,
            fontFamily: "var(--font-head)",
            marginBottom: 10,
            lineHeight: 1.3,
          }}
        >
          {material.title}
        </h1>

        {material.description && (
          <p
            style={{
              color: "var(--text2)",
              fontSize: 14,
              marginBottom: 14,
              lineHeight: 1.6,
            }}
          >
            {material.description}
          </p>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))",
            gap: 10,
            marginBottom: 16,
          }}
        >
          {[
            { label: "Batch", value: material.batch },
            { label: "MCA Year", value: `Year ${material.mcaYear}` },
            { label: "Semester", value: `Semester ${material.semester}` },
            {
              label: "Section",
              value:
                material.section === "A" || material.section === "B"
                  ? `Section ${material.section}`
                  : "Common",
            },
            { label: "Uploaded", value: formatDate(material.createdAt) },
            { label: "Faculty", value: material.faculty || "Not specified" },
            {
              label: "By",
              value: material.uploadedBy?.name
                ? `${material.uploadedBy.name}${material.uploadedBy.rollNumber ? ` · ${material.uploadedBy.rollNumber}` : ""}`
                : "Unknown",
            },
          ].map(({ label, value }) => (
            <div
              key={label}
              style={{
                background: "var(--bg3)",
                borderRadius: "var(--radius)",
                padding: "10px 12px",
              }}
            >
              <p
                style={{
                  fontSize: 11,
                  color: "var(--text3)",
                  fontFamily: "var(--font-head)",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: ".04em",
                  marginBottom: 3,
                }}
              >
                {label}
              </p>
              <p style={{ fontSize: 13, fontWeight: 500 }}>{value}</p>
            </div>
          ))}
        </div>

        {material.tags?.length > 0 && (
          <div
            style={{
              display: "flex",
              gap: 6,
              flexWrap: "wrap",
              marginBottom: 16,
            }}
          >
            {material.tags.map((tag) => (
              <span
                key={tag}
                style={{
                  background: "var(--bg)",
                  border: "1px solid var(--border)",
                  color: "var(--text3)",
                  fontSize: 12,
                  padding: "3px 10px",
                  borderRadius: 20,
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            borderTop: "1px solid var(--border)",
            paddingTop: 16,
          }}
        >
          <button className="btn btn-primary" onClick={handleDownload}>
            ↓ Download · {material.downloads || 0}
          </button>

          <button
            onClick={handleUpvote}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "9px 16px",
              borderRadius: "var(--radius)",
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
              fontFamily: "var(--font-body)",
              transition: "all .15s",
              background: upvoted ? "var(--accent-dim)" : "transparent",
              color: upvoted ? "var(--accent2)" : "var(--text2)",
              border: `1px solid ${upvoted ? "var(--accent)" : "var(--border)"}`,
            }}
          >
            ▲ Upvote · {material.upvotes || 0}
          </button>

          <button className="btn btn-ghost" onClick={handleSave}>
            ♡ Save
          </button>

          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setShowFlag((p) => !p)}
            >
              ⚑ Flag
            </button>
            {(isOwner || isAdmin) && (
              <button className="btn btn-danger btn-sm" onClick={handleDelete}>
                ✕ Delete
              </button>
            )}
          </div>
        </div>

        {showFlag && (
          <div
            style={{
              marginTop: 14,
              padding: 14,
              background: "var(--red-bg)",
              borderRadius: "var(--radius)",
              border: "1px solid rgba(239,68,68,.2)",
            }}
          >
            <p
              style={{
                fontSize: 13,
                color: "var(--red)",
                marginBottom: 8,
                fontWeight: 500,
              }}
            >
              Report this material
            </p>
            <input
              placeholder="Reason (wrong file, duplicate, incorrect info…)"
              value={flagReason}
              onChange={(e) => setFlagReason(e.target.value)}
              style={{ marginBottom: 8 }}
            />
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn btn-danger btn-sm" onClick={handleFlag}>
                Submit report
              </button>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setShowFlag(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div
          style={{
            padding: "12px 18px",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <p
            style={{
              fontSize: 13,
              fontWeight: 600,
              fontFamily: "var(--font-head)",
            }}
          >
            Preview
          </p>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => window.open(material.fileUrl, "_blank")}
          >
            Open PDF ↗
          </button>
        </div>

        <iframe
          src={`https://docs.google.com/viewer?url=${encodeURIComponent(material.fileUrl)}&embedded=true`}
          style={{
            width: "100%",
            height: 650,
            border: "none",
            background: "#1a1a1d",
          }}
          title="PDF Preview"
          key={material._id}
        />
      </div>
    </div>
  );
}
