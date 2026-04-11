import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  deleteMaterial,
  flagMaterial,
  getFaculty,
  getMaterial,
  getSubjects,
  saveMaterial,
  updateMaterial,
  upvoteMaterial,
} from "../api/index.js";
import { useAuthStore } from "../store/authStore.js";
import { useMaterialStore } from "../store/materialStore.js";
import {
  BATCHES,
  EXAM_BADGE,
  EXAMS,
  EXAM_MATERIAL_MAP,
  EXAM_TYPE_BADGE,
  MATERIAL_TYPES,
  MCA_YEARS,
  YEAR_TO_SEMESTERS,
  formatDate,
} from "../utils/constants.js";

const createEditForm = (material) => ({
  title: material.title || "",
  batch: material.batch || "",
  mcaYear: material.mcaYear ? String(material.mcaYear) : "",
  semester: material.semester ? String(material.semester) : "",
  section: material.section || "Common",
  subject: material.subject || "",
  exam: material.exam || "",
  materialType: material.materialType || "",
  faculty: material.faculty || "",
  tags: Array.isArray(material.tags) ? material.tags.join(", ") : "",
  description: material.description || "",
});

export default function MaterialPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { removeMaterial, updateMaterial: syncMaterial } = useMaterialStore();
  const [material, setMaterial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [flagReason, setFlagReason] = useState("");
  const [showFlag, setShowFlag] = useState(false);
  const [upvoted, setUpvoted] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [availableFaculty, setAvailableFaculty] = useState([]);
  const [showSubjectList, setShowSubjectList] = useState(false);
  const [showFacultyList, setShowFacultyList] = useState(false);
  const subjectBoxRef = useRef(null);
  const facultyBoxRef = useRef(null);
  const userId = user?._id || user?.id || "";

  useEffect(() => {
    getMaterial(id)
      .then((r) => {
        setMaterial(r.data.material);
        setEditForm(createEditForm(r.data.material));
        setUpvoted(
          r.data.material.upvotedBy?.some(
            (x) => (x?._id || x)?.toString() === userId,
          ),
        );
      })
      .catch(() => toast.error("Material not found"))
      .finally(() => setLoading(false));
  }, [id, userId]);

  useEffect(() => {
    Promise.all([getSubjects(), getFaculty()])
      .then(([subjectRes, facultyRes]) => {
        setAvailableSubjects(subjectRes.data.subjects || []);
        setAvailableFaculty(facultyRes.data.faculty || []);
      })
      .catch(() => {
        setAvailableSubjects([]);
        setAvailableFaculty([]);
      });
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!subjectBoxRef.current?.contains(event.target)) {
        setShowSubjectList(false);
      }
      if (!facultyBoxRef.current?.contains(event.target)) {
        setShowFacultyList(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDownload = () => {
    window.open(material.fileUrl, "_blank");
  };

  const handleUpvote = async () => {
    try {
      const res = await upvoteMaterial(id);
      setUpvoted(res.data.upvoted);
      setMaterial((prev) => ({ ...prev, upvotes: res.data.upvotes }));
      syncMaterial(id, { upvotes: res.data.upvotes });
    } catch {
      toast.error("Failed");
    }
  };

  const handleSaveMaterial = async () => {
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

  const setEditField = (key, value) =>
    setEditForm((prev) => ({ ...prev, [key]: value }));

  const handleCancelEdit = () => {
    setEditForm(createEditForm(material));
    setEditing(false);
    setShowSubjectList(false);
    setShowFacultyList(false);
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    if (
      !editForm.title.trim() ||
      !editForm.batch ||
      !editForm.mcaYear ||
      !editForm.semester ||
      !editForm.section ||
      !editForm.subject.trim() ||
      !editForm.exam ||
      !editForm.materialType ||
      !editForm.tags.trim()
    ) {
      toast.error("All required fields must be filled");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...editForm,
        title: editForm.title.trim(),
        subject: editForm.subject.trim(),
        faculty: editForm.faculty.trim(),
        description: editForm.description.trim(),
        tags: editForm.tags,
      };

      const res = await updateMaterial(id, payload);
      setMaterial(res.data.material);
      setEditForm(createEditForm(res.data.material));
      syncMaterial(id, res.data.material);
      setEditing(false);
      setShowSubjectList(false);
      setShowFacultyList(false);
      toast.success("Material details updated");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to update material");
    } finally {
      setSaving(false);
    }
  };

  const suggestedSubjects = useMemo(() => {
    const query = editForm?.subject?.trim().toLowerCase() || "";
    const rankedSubjects = [...availableSubjects].sort((a, b) => {
      const aMatchesYear = Number(editForm?.mcaYear) === a.mcaYear;
      const bMatchesYear = Number(editForm?.mcaYear) === b.mcaYear;
      if (aMatchesYear !== bMatchesYear) return aMatchesYear ? -1 : 1;

      const aMatchesSemester = Number(editForm?.semester) === a.semester;
      const bMatchesSemester = Number(editForm?.semester) === b.semester;
      if (aMatchesSemester !== bMatchesSemester)
        return aMatchesSemester ? -1 : 1;

      return a.name.localeCompare(b.name);
    });

    if (!query) return rankedSubjects;

    return rankedSubjects.filter(
      (subject) =>
        subject.name.toLowerCase().includes(query) ||
        subject.code?.toLowerCase().includes(query),
    );
  }, [availableSubjects, editForm?.mcaYear, editForm?.semester, editForm?.subject]);

  const suggestedFaculty = useMemo(() => {
    const query = editForm?.faculty?.trim().toLowerCase() || "";
    const rankedFaculty = [...availableFaculty].sort((a, b) =>
      a.name.localeCompare(b.name),
    );

    if (!query) return rankedFaculty;

    return rankedFaculty.filter((item) =>
      item.name.toLowerCase().includes(query),
    );
  }, [availableFaculty, editForm?.faculty]);

  if (loading) return <div className="spinner" />;
  if (!material) {
    return (
      <div className="empty-state">
        <h3>Material not found</h3>
      </div>
    );
  }

  const badgeClass =
    EXAM_BADGE[material.exam] ||
    EXAM_TYPE_BADGE[material.examType] ||
    "badge-notes";

  const isOwner =
    material.uploadedBy?._id?.toString() === userId ||
    material.uploadedBy?.toString() === userId;
  const isAdmin = user?.role === "admin";
  const canEdit = isOwner || isAdmin;
  const editSemesters = editForm?.mcaYear
    ? YEAR_TO_SEMESTERS[Number(editForm.mcaYear)] || []
    : [];

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
        {!editing ? (
          <>
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
          </>
        ) : (
          <form
            onSubmit={handleSubmitEdit}
            style={{ display: "flex", flexDirection: "column", gap: 16 }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <div>
                <h3
                  style={{
                    fontSize: 18,
                    fontWeight: 800,
                    fontFamily: "var(--font-head)",
                  }}
                >
                  Edit material details
                </h3>
                <p style={{ color: "var(--text3)", fontSize: 13, marginTop: 4 }}>
                  Update the metadata without reuploading the PDF.
                </p>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Title</label>
              <input
                value={editForm.title}
                onChange={(e) => setEditField("title", e.target.value)}
                required
              />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
              }}
            >
              <div className="form-group">
                <label className="form-label">Batch</label>
                <select
                  value={editForm.batch}
                  onChange={(e) => setEditField("batch", e.target.value)}
                >
                  <option value="">Select batch</option>
                  {BATCHES.map((batch) => (
                    <option key={batch} value={batch}>
                      {batch}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">MCA year</label>
                <select
                  value={editForm.mcaYear}
                  onChange={(e) => {
                    setEditField("mcaYear", e.target.value);
                    setEditField("semester", "");
                  }}
                >
                  <option value="">Select year</option>
                  {MCA_YEARS.map((year) => (
                    <option key={year} value={year}>
                      Year {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
              }}
            >
              <div className="form-group">
                <label className="form-label">Semester</label>
                <select
                  value={editForm.semester}
                  onChange={(e) => setEditField("semester", e.target.value)}
                  disabled={!editForm.mcaYear}
                >
                  <option value="">Select semester</option>
                  {editSemesters.map((semester) => (
                    <option key={semester} value={semester}>
                      Semester {semester}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Section</label>
                <select
                  value={editForm.section}
                  onChange={(e) => setEditField("section", e.target.value)}
                >
                  {["Common", "A", "B"].map((section) => (
                    <option key={section} value={section}>
                      {section === "Common"
                        ? "Common"
                        : `Section ${section}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group" ref={subjectBoxRef}>
              <label className="form-label">Subject</label>
              <div style={{ position: "relative" }}>
                <input
                  value={editForm.subject}
                  onChange={(e) => {
                    setEditField("subject", e.target.value);
                    setShowSubjectList(true);
                  }}
                  onFocus={() => setShowSubjectList(true)}
                  placeholder="Search existing subjects or type a new one"
                  required
                />
                {showSubjectList && suggestedSubjects.length > 0 && (
                  <div
                    style={{
                      position: "absolute",
                      top: "calc(100% + 6px)",
                      left: 0,
                      right: 0,
                      background: "var(--card)",
                      border: "1px solid var(--border2)",
                      borderRadius: "var(--radius)",
                      boxShadow: "0 16px 40px rgba(0,0,0,0.35)",
                      maxHeight: 220,
                      overflowY: "auto",
                      zIndex: 20,
                      padding: 6,
                    }}
                  >
                    {suggestedSubjects.map((subject) => (
                      <button
                        key={
                          subject._id ||
                          subject.code ||
                          `${subject.name}-${subject.semester}`
                        }
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          setEditField("subject", subject.name);
                          setShowSubjectList(false);
                        }}
                        style={{
                          width: "100%",
                          textAlign: "left",
                          padding: "10px 12px",
                          borderRadius: 8,
                          background:
                            editForm.subject === subject.name
                              ? "var(--accent-bg)"
                              : "transparent",
                          color:
                            editForm.subject === subject.name
                              ? "var(--accent2)"
                              : "var(--text)",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            gap: 12,
                          }}
                        >
                          <span>{subject.name}</span>
                          <span style={{ color: "var(--text3)", fontSize: 12 }}>
                            {subject.code ||
                              `Y${subject.mcaYear} S${subject.semester}`}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="form-group" ref={facultyBoxRef}>
              <label className="form-label">Faculty name</label>
              <div style={{ position: "relative" }}>
                <input
                  value={editForm.faculty}
                  onChange={(e) => {
                    setEditField("faculty", e.target.value);
                    setShowFacultyList(true);
                  }}
                  onFocus={() => setShowFacultyList(true)}
                  placeholder="Search saved faculty or type a new name"
                />
                {showFacultyList && suggestedFaculty.length > 0 && (
                  <div
                    style={{
                      position: "absolute",
                      top: "calc(100% + 6px)",
                      left: 0,
                      right: 0,
                      background: "var(--card)",
                      border: "1px solid var(--border2)",
                      borderRadius: "var(--radius)",
                      boxShadow: "0 16px 40px rgba(0,0,0,0.35)",
                      maxHeight: 220,
                      overflowY: "auto",
                      zIndex: 20,
                      padding: 6,
                    }}
                  >
                    {suggestedFaculty.map((item) => (
                      <button
                        key={item._id || item.name}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          setEditField("faculty", item.name);
                          setShowFacultyList(false);
                        }}
                        style={{
                          width: "100%",
                          textAlign: "left",
                          padding: "10px 12px",
                          borderRadius: 8,
                          background:
                            editForm.faculty === item.name
                              ? "var(--accent-bg)"
                              : "transparent",
                          color:
                            editForm.faculty === item.name
                              ? "var(--accent2)"
                              : "var(--text)",
                        }}
                      >
                        {item.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Exam</label>
              <select
                value={editForm.exam}
                onChange={(e) => {
                  setEditField("exam", e.target.value);
                  setEditField("materialType", "");
                }}
              >
                <option value="">Select exam</option>
                {EXAMS.map((exam) => (
                  <option key={exam.value} value={exam.value}>
                    {exam.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Material type</label>
              <select
                value={editForm.materialType}
                onChange={(e) => setEditField("materialType", e.target.value)}
                disabled={!editForm.exam}
              >
                <option value="">Select material type</option>
                {(EXAM_MATERIAL_MAP[editForm.exam] || []).map((type) => {
                  const found = MATERIAL_TYPES.find((item) => item.value === type);
                  return (
                    <option key={type} value={type}>
                      {found?.label || type}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Tags</label>
              <input
                value={editForm.tags}
                onChange={(e) => setEditField("tags", e.target.value)}
                placeholder="Comma-separated tags"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                rows="3"
                value={editForm.description}
                onChange={(e) => setEditField("description", e.target.value)}
                placeholder="Optional description"
              />
            </div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button
                type="submit"
                className="btn btn-primary btn-sm"
                disabled={saving}
              >
                {saving ? "Saving..." : "Save changes"}
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={handleCancelEdit}
                disabled={saving}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            borderTop: "1px solid var(--border)",
            paddingTop: 16,
            marginTop: 16,
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

          <button className="btn btn-ghost" onClick={handleSaveMaterial}>
            ♡ Save
          </button>

          <div style={{ marginLeft: "auto", display: "flex", gap: 8, flexWrap: "wrap" }}>
            {canEdit && !editing && (
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setEditing(true)}
              >
                Edit details
              </button>
            )}
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setShowFlag((p) => !p)}
            >
              ⚑ Flag
            </button>
            {canEdit && (
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
