import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { getSubjects, uploadMaterial } from "../api/index.js";
import { useMaterialStore } from "../store/materialStore.js";
import { useAuthStore } from "../store/authStore.js";
import {
  EXAMS,
  MATERIAL_TYPES,
  EXAM_MATERIAL_MAP,
  MCA_YEARS,
  YEAR_TO_SEMESTERS,
  BATCHES,
} from "../utils/constants.js";

export default function UploadPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const preset = location.state;

  const { addMaterial } = useMaterialStore();
  const user = useAuthStore((s) => s.user);
  const [loading, setLoading] = useState(false);
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [file, setFile] = useState(null);
  const [drag, setDrag] = useState(false);
  const [showSubjectList, setShowSubjectList] = useState(false);
  const subjectBoxRef = useRef(null);

  const [form, setForm] = useState({
    title: "",
    batch: user?.batch || "",
    mcaYear: preset?.mcaYear || user?.currentYear || "",
    semester: preset?.semester || "",
    subject: preset?.subject || "",
    exam: preset?.exam || "",
    materialType: preset?.materialType || "",
    faculty: "",
    tags: "",
    description: "",
  });

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const semesters = form.mcaYear
    ? YEAR_TO_SEMESTERS[Number(form.mcaYear)] || []
    : [];

  useEffect(() => {
    getSubjects()
      .then((res) => {
        setAvailableSubjects(res.data.subjects || []);
      })
      .catch(() => {
        setAvailableSubjects([]);
      });
  }, []);

  const suggestedSubjects = useMemo(() => {
    const query = form.subject.trim().toLowerCase();
    const rankedSubjects = [...availableSubjects].sort((a, b) => {
      const aMatchesYear = Number(form.mcaYear) === a.mcaYear;
      const bMatchesYear = Number(form.mcaYear) === b.mcaYear;
      if (aMatchesYear !== bMatchesYear) return aMatchesYear ? -1 : 1;

      const aMatchesSemester = Number(form.semester) === a.semester;
      const bMatchesSemester = Number(form.semester) === b.semester;
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
  }, [availableSubjects, form.mcaYear, form.semester, form.subject]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!subjectBoxRef.current?.contains(event.target)) {
        setShowSubjectList(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDrop = (e) => {
    e.preventDefault();
    setDrag(false);
    const f = e.dataTransfer.files[0];
    if (f?.type === "application/pdf") setFile(f);
    else toast.error("Only PDF files allowed");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return toast.error("Please select a PDF file");
    if (
      !form.title ||
      !form.batch ||
      !form.mcaYear ||
      !form.semester ||
      !form.subject ||
      !form.tags.trim() ||
      !form.exam ||
      !form.materialType
    ) {
      return toast.error("All fields are required");
    }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      Object.entries(form).forEach(([k, v]) => {
        if (v) fd.append(k, v);
      });
      const res = await uploadMaterial(fd);
      addMaterial(res.data.material);
      toast.success("Material uploaded successfully!");

      setFile(null);
      setForm((prev) => ({
        ...prev,
        title: "",
        description: "",
      }));

    } catch (err) {
      const msg = err.response?.data?.error || "Upload failed";
      if (err.response?.status === 409) {
        toast.error(`Duplicate: ${msg}`);
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 640, margin: "0 auto" }}>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>
          Upload material
        </h2>
        <p style={{ color: "var(--text3)", fontSize: 14 }}>
          Share past papers, notes and answer scripts with your batch
        </p>
        {preset && (
          <p style={{ color: "var(--accent2)", fontSize: 13, marginTop: 8 }}>
            Prefilled from gaps contribution
          </p>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: 20 }}
      >
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={handleDrop}
          onClick={() => document.getElementById("file-input").click()}
          style={{
            border: `2px dashed ${drag ? "var(--accent)" : file ? "var(--teal)" : "var(--border2)"}`,
            borderRadius: "var(--radius-lg)",
            padding: "32px 20px",
            textAlign: "center",
            cursor: "pointer",
            transition: "border-color .15s",
            background: file
              ? "var(--teal-bg)"
              : drag
                ? "var(--accent-bg)"
                : "transparent",
          }}
        >
          <input
            id="file-input"
            type="file"
            accept=".pdf"
            style={{ display: "none" }}
            onChange={(e) => {
              const f = e.target.files[0];
              if (f) setFile(f);
            }}
          />
          {file ? (
            <>
              <p
                style={{
                  fontSize: 14,
                  color: "var(--teal)",
                  fontWeight: 600,
                  marginBottom: 4,
                }}
              >
                ✓ {file.name}
              </p>
              <p style={{ fontSize: 12, color: "var(--text3)" }}>
                {(file.size / 1024 / 1024).toFixed(2)} MB · Click to change
              </p>
            </>
          ) : (
            <>
              <p
                style={{ fontSize: 28, marginBottom: 8, color: "var(--text3)" }}
              >
                ↑
              </p>
              <p
                style={{ fontSize: 14, color: "var(--text2)", marginBottom: 4 }}
              >
                Drop PDF here or click to browse
              </p>
              <p style={{ fontSize: 12, color: "var(--text3)" }}>
                Max 20 MB · PDF only
              </p>
            </>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">Title</label>
          <input
            placeholder="e.g. FAT Paper Section A/B"
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            required
          />
          <p style={{ fontSize: 12, color: "var(--text3)", marginTop: 5 }}>
            Example: FAT Paper Section A or CT2 Answer Script Section B, Machine Learning Unit 1 Notes
          </p>
        </div>

        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
        >
          <div className="form-group">
            <label className="form-label">Batch</label>
            <select
              value={form.batch}
              onChange={(e) => set("batch", e.target.value)}
              required
            >
              <option value="">Select batch</option>
              {BATCHES.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">MCA year</label>
            <select
              value={form.mcaYear}
              onChange={(e) => {
                set("mcaYear", e.target.value);
                set("semester", "");
                set("subject", "");
              }}
              required
            >
              <option value="">Select year</option>
              {MCA_YEARS.map((y) => (
                <option key={y} value={y}>
                  Year {y}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }}>
          <div className="form-group">
            <label className="form-label">Semester</label>
            <select
              value={form.semester}
              onChange={(e) => {
                set("semester", e.target.value);
              }}
              required
              disabled={!form.mcaYear}
            >
              <option value="">Select sem</option>
              {semesters.map((s) => (
                <option key={s} value={s}>
                  Semester {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group" ref={subjectBoxRef}>
          <label className="form-label">Subject</label>
          <div style={{ position: "relative" }}>
            <input
              placeholder="Search existing subjects or type a new one"
              value={form.subject}
              onChange={(e) => {
                set("subject", e.target.value);
                setShowSubjectList(true);
              }}
              onFocus={() => setShowSubjectList(true)}
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
                      set("subject", subject.name);
                      setShowSubjectList(false);
                    }}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "10px 12px",
                      borderRadius: 8,
                      background:
                        form.subject === subject.name
                          ? "var(--accent-bg)"
                          : "transparent",
                      color:
                        form.subject === subject.name
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
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--text3)",
                        marginTop: 3,
                      }}
                    >
                      Year {subject.mcaYear} · Semester {subject.semester} ·{" "}
                      {subject.type || "theory"}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          <p style={{ fontSize: 12, color: "var(--text3)", marginTop: 5 }}>
            Search by subject name or code or add a custom/new
            subject, if it not exist (Write full name).
          </p>
        </div>

        <div className="form-group">
          <label className="form-label">Faculty name</label>
          <input
            placeholder="e.g. Dr. Ramesh Kumar"
            value={form.faculty}
            onChange={(e) => set("faculty", e.target.value)}
          />
          <p style={{ fontSize: 12, color: "var(--text3)", marginTop: 5 }}>
            Professor who taught this subject : helps students find relevant
            paper
          </p>
        </div>

        <div className="form-group">
          <label className="form-label">Exam</label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {EXAMS.map((e) => (
              <button
                key={e.value}
                type="button"
                onClick={() => {
                  set("exam", e.value);
                  set("materialType", "");
                }}
                style={{
                  padding: "7px 16px",
                  borderRadius: "var(--radius)",
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all .15s",
                  fontFamily: "var(--font-body)",
                  background:
                    form.exam === e.value ? "var(--accent)" : "var(--bg3)",
                  color: form.exam === e.value ? "#fff" : "var(--text2)",
                  border: `1px solid ${form.exam === e.value ? "var(--accent)" : "var(--border)"}`,
                }}
              >
                {e.label}
              </button>
            ))}
          </div>
        </div>

        {form.exam && (
          <div className="form-group">
            <label className="form-label">Material type</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {(EXAM_MATERIAL_MAP[form.exam] || []).map((mt) => {
                const found = MATERIAL_TYPES.find((m) => m.value === mt);
                return (
                  <button
                    key={mt}
                    type="button"
                    onClick={() => set("materialType", mt)}
                    style={{
                      padding: "7px 16px",
                      borderRadius: "var(--radius)",
                      fontSize: 13,
                      fontWeight: 500,
                      cursor: "pointer",
                      transition: "all .15s",
                      fontFamily: "var(--font-body)",
                      background:
                        form.materialType === mt ? "var(--teal)" : "var(--bg3)",
                      color: form.materialType === mt ? "#fff" : "var(--text2)",
                      border: `1px solid ${form.materialType === mt ? "var(--teal)" : "var(--border)"}`,
                    }}
                  >
                    {found?.label || mt}
                  </button>
                );
              })}
            </div>
            <p style={{ fontSize: 12, color: "var(--text3)", marginTop: 6 }}>
              {form.exam === "CT1" &&
                "Question Paper = actual exam paper · Answer Script = senior's answered copy · Notes = CT1 portion notes"}
              {form.exam === "CT2" &&
                "Question Paper = actual exam paper · Answer Script = senior's answered copy · Notes = CT2 portion notes"}
              {form.exam === "FAT" &&
                "Question Paper = actual FAT paper · Answer Script = senior's answered copy · Notes = full subject notes"}
              {form.exam === "LabExam" &&
                "Question Paper = lab exam question · Answer Script = lab answer · Lab Record = your lab file"}
              {form.exam === "General" &&
                "Notes = general study material · Lab Record = lab file · Report = project/internship report"}
            </p>
          </div>
        )}

        <div className="form-group">
          <label className="form-label">
            Tags{" "}
            <span
              style={{
                color: "var(--text3)",
                fontWeight: 400,
                textTransform: "none",
              }}
            >
              (required, comma separated)
            </span>
          </label>
          <input
            placeholder=" Section A/B, CT1/CT2/FAT, Question Paper/AnswerScript/Notes, Jan 2025 (Exam Month)"
            value={form.tags}
            onChange={(e) => set("tags", e.target.value)}
            required
          />
          <p style={{ fontSize: 12, color: "var(--text3)", marginTop: 5 }}>
            Example: Section A/B, CT1/CT2/FAT, Question Paper/AnswerScript/Notes,
            Jan 2025 (Exam Month), Topic Name, Unit No.
          </p>
        </div>

        <div className="form-group">
          <label className="form-label">
            Description{" "}
            <span
              style={{
                color: "var(--text3)",
                fontWeight: 400,
                textTransform: "none",
              }}
            >
              (optional)
            </span>
          </label>
          <textarea
            rows={2}
            placeholder="Any notes about this material…"
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            style={{ resize: "vertical" }}
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          style={{ justifyContent: "center", padding: "12px" }}
          disabled={loading}
        >
          {loading ? "Uploading…" : "Upload material →"}
        </button>
      </form>
    </div>
  );
}
