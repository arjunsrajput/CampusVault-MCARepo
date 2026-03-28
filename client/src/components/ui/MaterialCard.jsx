import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  upvoteMaterial,
  saveMaterial,
  trackDownload,
  deleteMaterial,
} from "../../api/index.js";
import { useMaterialStore } from "../../store/materialStore.js";
import { useAuthStore } from "../../store/authStore.js";
import { useSavedStore } from "../../store/savedStore.js";
import {
  EXAM_BADGE,
  MATERIAL_TYPE_BADGE,
  EXAM_TYPE_BADGE,
  formatDate,
} from "../../utils/constants.js";

export default function MaterialCard({ material, showDelete = false }) {
  const user = useAuthStore((s) => s.user);
  const { updateMaterial, removeMaterial } = useMaterialStore();
  const { savedIds, syncSavedMaterial, fetchSaved } = useSavedStore();
  const userId = user?._id || user?.id || "";
  const [upvoted, setUpvoted] = useState(
    material.upvotedBy?.some((id) => (id?._id || id)?.toString() === userId),
  );
  const saved = savedIds.has(material._id);

  const navigate = useNavigate();
  // Support both old (examType) and new (exam + materialType) formats
  const examBadge =
    EXAM_BADGE[material.exam] ||
    EXAM_TYPE_BADGE[material.examType] ||
    "badge-notes";
  const typeBadge = MATERIAL_TYPE_BADGE[material.materialType] || null;
  const uploaderLine = [
    material.uploadedBy?.name,
    material.uploadedBy?.rollNumber,
  ]
    .filter(Boolean)
    .join(" · ");

  const handleUpvote = async (e) => {
    e.stopPropagation();
    try {
      const res = await upvoteMaterial(material._id);
      setUpvoted(res.data.upvoted);
      updateMaterial(material._id, { upvotes: res.data.upvotes });
    } catch {
      toast.error("Failed to upvote");
    }
  };

  const handleSave = async (e) => {
    e.stopPropagation();
    try {
      const res = await saveMaterial(material._id);
      syncSavedMaterial(material, res.data.saved);
      await fetchSaved(true);
      toast.success(res.data.saved ? "Saved!" : "Removed from saved");
    } catch {
      toast.error("Failed");
    }
  };

  const handleDownload = async (e) => {
    e.stopPropagation();
    try {
      const res = await trackDownload(material._id);
      updateMaterial(material._id, { downloads: res.data.downloads });
      window.open(res.data.fileUrl, "_blank");
    } catch {
      toast.error("Failed to open file");
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!confirm("Delete this material?")) return;
    try {
      await deleteMaterial(material._id);
      removeMaterial(material._id);
      toast.success("Deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  return (
    <div
      style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        padding: "16px 18px",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        minHeight: 350,
        transition: "border-color .15s, background .15s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "var(--border2)";
        e.currentTarget.style.background = "var(--bg3)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--border)";
        e.currentTarget.style.background = "var(--card)";
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          flexWrap: "wrap",
          minHeight: 28,
        }}
      >
        <span className={`badge ${examBadge}`}>
          {material.exam || material.examType}
        </span>

        {typeBadge && material.materialType && (
          <span className={`badge ${typeBadge}`}>
            {material.materialType === "QuestionPaper"
              ? "Question Paper"
              : material.materialType === "AnswerScript"
                ? "Answer Script"
                : material.materialType === "LabRecord"
                  ? "Lab Record"
                  : material.materialType}
          </span>
        )}

        <span
          style={{ marginLeft: "auto", fontSize: 11, color: "var(--text3)" }}
        >
          {formatDate(material.createdAt)}
        </span>
      </div>

      <p
        style={{
          fontSize: 15,
          fontWeight: 600,
          color: "var(--accent2)",
          lineHeight: 1.35,
          fontFamily: "var(--font-head)",
          letterSpacing: "-0.02em",
          minHeight: 20,
        }}
      >
        {material.subject}
      </p>

      <h3
        onClick={() => navigate(`/material/${material._id}`)}
        style={{
          fontSize: 14,
          fontWeight: 700,
          color: "var(--text)",
          lineHeight: 1.35,
          fontFamily: "var(--font-head)",
          cursor: "pointer",
          minHeight: 38,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {material.title}
      </h3>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 4,
          minHeight: 42,
        }}
      >
        <p style={{ fontSize: 12, color: "var(--text3)" }}>
          Batch {material.batch} · Year {material.mcaYear} · Sem{" "}
          {material.semester}
        </p>
        <p
          style={{
            fontSize: 12,
            color: uploaderLine ? "var(--text2)" : "var(--text3)",
            minHeight: 18,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {uploaderLine || " "}
        </p>
      </div>

      {material.faculty ? (
        <p
          style={{
            fontSize: 12,
            color: "var(--text3)",
            minHeight: 18,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          <span style={{ color: "var(--text2)" }}>Faculty:</span>{" "}
          {material.faculty}
        </p>
      ) : (
        <div style={{ minHeight: 18 }} />
      )}

      <div style={{ minHeight: 34 }}>
        {material.tags?.length > 0 && (
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
            {material.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                style={{
                  background: "var(--bg)",
                  border: "1px solid var(--border)",
                  color: "var(--text3)",
                  fontSize: 11,
                  padding: "2px 8px",
                  borderRadius: 20,
                  whiteSpace: "nowrap",
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginTop: "auto" }} />

      <div
        style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}
      >
        <button
          onClick={handleUpvote}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            background: upvoted ? "var(--accent-dim)" : "transparent",
            border: `1px solid ${upvoted ? "var(--accent)" : "var(--border)"}`,
            color: upvoted ? "var(--accent2)" : "var(--text3)",
            padding: "5px 10px",
            borderRadius: "var(--radius-sm)",
            fontSize: 12,
            cursor: "pointer",
            fontFamily: "var(--font-body)",
            transition: "all .12s",
          }}
        >
          ▲ {material.upvotes || 0}
        </button>

        <button
          onClick={handleDownload}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            background: "transparent",
            border: "1px solid var(--border)",
            color: "var(--text3)",
            padding: "5px 10px",
            borderRadius: "var(--radius-sm)",
            fontSize: 12,
            cursor: "pointer",
            fontFamily: "var(--font-body)",
            transition: "all .12s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "var(--teal)";
            e.currentTarget.style.borderColor = "var(--teal-dim)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--text3)";
            e.currentTarget.style.borderColor = "var(--border)";
          }}
        >
          ↓ {material.downloads || 0}
        </button>

        <button
          onClick={handleSave}
          style={{
            marginLeft: "auto",
            background: saved ? "var(--amber-bg)" : "transparent",
            border: `1px solid ${saved ? "var(--amber-dim)" : "var(--border)"}`,
            color: saved ? "var(--amber)" : "var(--text3)",
            padding: "5px 10px",
            borderRadius: "var(--radius-sm)",
            fontSize: 12,
            cursor: "pointer",
            fontFamily: "var(--font-body)",
            transition: "all .12s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "var(--amber)";
            e.currentTarget.style.borderColor = "var(--amber-dim)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = saved ? "var(--amber)" : "var(--text3)";
            e.currentTarget.style.borderColor = saved ? "var(--amber-dim)" : "var(--border)";
          }}
        >
          {saved ? "♥ Saved" : "♡ Save"}
        </button>

        {showDelete && (
          <button
            onClick={handleDelete}
            style={{
              background: "transparent",
              border: "1px solid var(--border)",
              color: "var(--text3)",
              padding: "5px 10px",
              borderRadius: "var(--radius-sm)",
              fontSize: 12,
              cursor: "pointer",
              fontFamily: "var(--font-body)",
              transition: "all .12s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--red)";
              e.currentTarget.style.borderColor = "rgba(239,68,68,.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--text3)";
              e.currentTarget.style.borderColor = "var(--border)";
            }}
          >
            ✕ Delete
          </button>
        )}
      </div>
    </div>
  );
}

// Note: import useNavigate at top and wrap title in onClick to navigate to /material/:id
