import { useState, useEffect } from "react";
import {
  adminStats,
  adminFlagged,
  adminUnflag,
  adminUsers,
  adminSetRole,
  deleteMaterial,
  getSubjects,
  createSubject,
  deleteSubject,
  getFaculty,
  createFaculty,
  deleteFaculty,
} from "../api/index.js";
import toast from "react-hot-toast";
import {
  formatDate,
  MCA_YEARS,
  SEMESTERS,
  YEAR_TO_SEMESTERS,
} from "../utils/constants.js";

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
  const [subjects, setSubjects] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [tab, setTab] = useState("stats");
  const [loading, setLoading] = useState(true);
  const [subjectLoading, setSubjectLoading] = useState(false);
  const [facultyLoading, setFacultyLoading] = useState(false);
  const [subjectFilters, setSubjectFilters] = useState({
    q: "",
    year: "",
    semester: "",
    type: "",
  });
  const [facultySearch, setFacultySearch] = useState("");
  const [subjectForm, setSubjectForm] = useState({
    name: "",
    code: "",
    mcaYear: "",
    semester: "",
    type: "theory",
  });
  const [facultyForm, setFacultyForm] = useState({
    name: "",
  });

  useEffect(() => {
    Promise.all([
      adminStats(),
      adminFlagged(),
      adminUsers(),
      getSubjects(),
      getFaculty(),
    ])
      .then(([s, f, u, sub, fac]) => {
        setStats(s.data);
        setFlagged(f.data.materials);
        setUsers(u.data.users);
        setSubjects(sub.data.subjects || []);
        setFaculty(fac.data.faculty || []);
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

  const handleSubjectField = (key, value) => {
    setSubjectForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "mcaYear") next.semester = "";
      return next;
    });
  };

  const handleCreateSubject = async (e) => {
    e.preventDefault();
    if (
      !subjectForm.name.trim() ||
      !subjectForm.mcaYear ||
      !subjectForm.semester
    ) {
      toast.error("Name, year and semester are required");
      return;
    }

    setSubjectLoading(true);
    try {
      const res = await createSubject({
        ...subjectForm,
        name: subjectForm.name.trim(),
        code: subjectForm.code.trim(),
      });
      setSubjects((prev) =>
        [...prev, res.data.subject].sort(
          (a, b) =>
            a.semester - b.semester ||
            a.name.localeCompare(b.name),
        ),
      );
      setSubjectForm({
        name: "",
        code: "",
        mcaYear: "",
        semester: "",
        type: "theory",
      });
      toast.success("Subject created");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to create subject");
    } finally {
      setSubjectLoading(false);
    }
  };

  const handleDeleteSubject = async (id) => {
    if (!confirm("Delete this subject?")) return;

    try {
      await deleteSubject(id);
      setSubjects((prev) => prev.filter((subject) => subject._id !== id));
      toast.success("Subject deleted");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to delete subject");
    }
  };

  const handleCreateFaculty = async (e) => {
    e.preventDefault();
    if (!facultyForm.name.trim()) {
      toast.error("Faculty name is required");
      return;
    }

    setFacultyLoading(true);
    try {
      const res = await createFaculty({ name: facultyForm.name.trim() });
      setFaculty((prev) =>
        [...prev, res.data.faculty].sort((a, b) =>
          a.name.localeCompare(b.name),
        ),
      );
      setFacultyForm({ name: "" });
      toast.success("Faculty added");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to add faculty");
    } finally {
      setFacultyLoading(false);
    }
  };

  const handleDeleteFaculty = async (id) => {
    if (!confirm("Delete this faculty name?")) return;

    try {
      await deleteFaculty(id);
      setFaculty((prev) => prev.filter((item) => item._id !== id));
      toast.success("Faculty deleted");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to delete faculty");
    }
  };

  const filteredSubjects = subjects.filter((subject) => {
    const q = subjectFilters.q.trim().toLowerCase();
    if (
      q &&
      !subject.name.toLowerCase().includes(q) &&
      !subject.code?.toLowerCase().includes(q)
    ) {
      return false;
    }
    if (
      subjectFilters.year &&
      subject.mcaYear !== Number(subjectFilters.year)
    ) {
      return false;
    }
    if (
      subjectFilters.semester &&
      subject.semester !== Number(subjectFilters.semester)
    ) {
      return false;
    }
    if (subjectFilters.type && subject.type !== subjectFilters.type) {
      return false;
    }
    return true;
  });

  const filteredFaculty = faculty.filter((item) =>
    item.name.toLowerCase().includes(facultySearch.trim().toLowerCase()),
  );

  const tabs = ["stats", "flagged", "users", "subjects", "faculty"];
  const subjectFormSemesters = subjectForm.mcaYear
    ? YEAR_TO_SEMESTERS[Number(subjectForm.mcaYear)] || SEMESTERS
    : SEMESTERS;
  const subjectFilterSemesters = subjectFilters.year
    ? YEAR_TO_SEMESTERS[Number(subjectFilters.year)] || SEMESTERS
    : SEMESTERS;

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

      {tab === "subjects" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(280px, 360px) 1fr",
              gap: 20,
            }}
          >
            <div className="card">
              <h3
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  marginBottom: 16,
                  fontFamily: "var(--font-head)",
                }}
              >
                Add subject
              </h3>

              <form
                onSubmit={handleCreateSubject}
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                <div className="form-group">
                  <label className="form-label">Name</label>
                  <input
                    value={subjectForm.name}
                    onChange={(e) => handleSubjectField("name", e.target.value)}
                    placeholder="e.g. Machine Learning Techniques"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Code</label>
                  <input
                    value={subjectForm.code}
                    onChange={(e) => handleSubjectField("code", e.target.value)}
                    placeholder="e.g. CA721"
                  />
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 10,
                  }}
                >
                  <div className="form-group">
                    <label className="form-label">Year</label>
                    <select
                      value={subjectForm.mcaYear}
                      onChange={(e) =>
                        handleSubjectField("mcaYear", e.target.value)
                      }
                    >
                      <option value="">Select year</option>
                      {MCA_YEARS.map((year) => (
                        <option key={year} value={year}>
                          Year {year}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Semester</label>
                    <select
                      value={subjectForm.semester}
                      onChange={(e) =>
                        handleSubjectField("semester", e.target.value)
                      }
                    >
                      <option value="">Select semester</option>
                      {subjectFormSemesters.map((semester) => (
                        <option key={semester} value={semester}>
                          Semester {semester}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Type</label>
                  <select
                    value={subjectForm.type}
                    onChange={(e) => handleSubjectField("type", e.target.value)}
                  >
                    {[
                      "theory",
                      "lab",
                      "internship",
                      "elective",
                      "project",
                    ].map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={subjectLoading}
                >
                  {subjectLoading ? "Creating..." : "Add subject"}
                </button>
              </form>
            </div>

            <div className="card">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  flexWrap: "wrap",
                  marginBottom: 16,
                }}
              >
                <div>
                  <h3
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                      fontFamily: "var(--font-head)",
                    }}
                  >
                    Subjects
                  </h3>
                  <p style={{ fontSize: 13, color: "var(--text3)", marginTop: 4 }}>
                    {filteredSubjects.length} subject
                    {filteredSubjects.length !== 1 ? "s" : ""} found
                  </p>
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))",
                  gap: 10,
                  marginBottom: 16,
                }}
              >
                <input
                  placeholder="Search name or code"
                  value={subjectFilters.q}
                  onChange={(e) =>
                    setSubjectFilters((prev) => ({
                      ...prev,
                      q: e.target.value,
                    }))
                  }
                />

                <select
                  value={subjectFilters.year}
                  onChange={(e) =>
                    setSubjectFilters((prev) => ({
                      ...prev,
                      year: e.target.value,
                      semester: "",
                    }))
                  }
                >
                  <option value="">All years</option>
                  {MCA_YEARS.map((year) => (
                    <option key={year} value={year}>
                      Year {year}
                    </option>
                  ))}
                </select>

                <select
                  value={subjectFilters.semester}
                  onChange={(e) =>
                    setSubjectFilters((prev) => ({
                      ...prev,
                      semester: e.target.value,
                    }))
                  }
                >
                  <option value="">All semesters</option>
                  {subjectFilterSemesters.map((semester) => (
                    <option key={semester} value={semester}>
                      Semester {semester}
                    </option>
                  ))}
                </select>

                <select
                  value={subjectFilters.type}
                  onChange={(e) =>
                    setSubjectFilters((prev) => ({
                      ...prev,
                      type: e.target.value,
                    }))
                  }
                >
                  <option value="">All types</option>
                  {[
                    "theory",
                    "lab",
                    "internship",
                    "elective",
                    "project",
                  ].map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {filteredSubjects.length === 0 ? (
                <div className="empty-state" style={{ padding: "40px 20px" }}>
                  <h3>No subjects found</h3>
                  <p>Try changing the filters or add a new subject.</p>
                </div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      fontSize: 13,
                    }}
                  >
                    <thead>
                      <tr style={{ borderBottom: "1px solid var(--border)" }}>
                        {["Name", "Code", "Year", "Semester", "Type", "Action"].map(
                          (heading) => (
                            <th
                              key={heading}
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
                              {heading}
                            </th>
                          ),
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSubjects.map((subject) => (
                        <tr
                          key={subject._id}
                          style={{ borderBottom: "1px solid var(--border)" }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background = "var(--bg3)")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.background = "transparent")
                          }
                        >
                          <td style={{ padding: "10px 12px", fontWeight: 500 }}>
                            {subject.name}
                          </td>
                          <td
                            style={{ padding: "10px 12px", color: "var(--text3)" }}
                          >
                            {subject.code || "—"}
                          </td>
                          <td
                            style={{ padding: "10px 12px", color: "var(--text3)" }}
                          >
                            {subject.mcaYear}
                          </td>
                          <td
                            style={{ padding: "10px 12px", color: "var(--text3)" }}
                          >
                            {subject.semester}
                          </td>
                          <td style={{ padding: "10px 12px" }}>
                            <span
                              style={{
                                padding: "2px 10px",
                                borderRadius: 20,
                                fontSize: 11,
                                fontWeight: 600,
                                background: "var(--bg3)",
                                color: "var(--text2)",
                                textTransform: "capitalize",
                              }}
                            >
                              {subject.type || "theory"}
                            </span>
                          </td>
                          <td style={{ padding: "10px 12px" }}>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleDeleteSubject(subject._id)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {tab === "faculty" && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(280px, 360px) 1fr",
            gap: 20,
          }}
        >
          <div className="card">
            <h3
              style={{
                fontSize: 15,
                fontWeight: 700,
                marginBottom: 16,
                fontFamily: "var(--font-head)",
              }}
            >
              Add faculty
            </h3>

            <form
              onSubmit={handleCreateFaculty}
              style={{ display: "flex", flexDirection: "column", gap: 12 }}
            >
              <div className="form-group">
                <label className="form-label">Faculty name</label>
                <input
                  value={facultyForm.name}
                  onChange={(e) => setFacultyForm({ name: e.target.value })}
                  placeholder="e.g. Dr. Ramesh Kumar"
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-sm"
                disabled={facultyLoading}
              >
                {facultyLoading ? "Adding..." : "Add faculty"}
              </button>
            </form>
          </div>

          <div className="card">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                flexWrap: "wrap",
                marginBottom: 16,
              }}
            >
              <div>
                <h3
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    fontFamily: "var(--font-head)",
                  }}
                >
                  Faculty
                </h3>
                <p style={{ fontSize: 13, color: "var(--text3)", marginTop: 4 }}>
                  {filteredFaculty.length} faculty name
                  {filteredFaculty.length !== 1 ? "s" : ""} found
                </p>
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <input
                placeholder="Search faculty name"
                value={facultySearch}
                onChange={(e) => setFacultySearch(e.target.value)}
              />
            </div>

            {filteredFaculty.length === 0 ? (
              <div className="empty-state" style={{ padding: "40px 20px" }}>
                <h3>No faculty found</h3>
                <p>Try a different search or add a new faculty name.</p>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: 13,
                  }}
                >
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--border)" }}>
                      {["Faculty Name", "Action"].map((heading) => (
                        <th
                          key={heading}
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
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFaculty.map((item) => (
                      <tr
                        key={item._id}
                        style={{ borderBottom: "1px solid var(--border)" }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = "var(--bg3)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "transparent")
                        }
                      >
                        <td style={{ padding: "10px 12px", fontWeight: 500 }}>
                          {item.name}
                        </td>
                        <td style={{ padding: "10px 12px" }}>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDeleteFaculty(item._id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
