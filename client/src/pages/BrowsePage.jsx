import { useState, useMemo, useEffect } from "react";
import { useMaterialStore } from "../store/materialStore.js";
import { useAuthStore } from "../store/authStore.js";
import MaterialCard from "../components/ui/MaterialCard.jsx";
import {
  EXAMS,
  MATERIAL_TYPES,
  MCA_YEARS,
  SEMESTERS,
  BATCHES,
  YEAR_TO_SEMESTERS,
} from "../utils/constants.js";

export default function BrowsePage() {
  const { all, loading } = useMaterialStore();
  const user = useAuthStore((s) => s.user);
  const [search, setSearch] = useState("");
  const [batch, setBatch] = useState("");
  const [year, setYear] = useState("");
  const [semester, setSemester] = useState("");
  const [subject, setSubject] = useState("");
  const [exam, setExam] = useState("");
  const [materialType, setMaterialType] = useState("");
  const [sort, setSort] = useState("newest");

  // useEffect(() => {
  //   if (user?.currentYear) setYear(String(user.currentYear))
  //   if (user?.batch)       setBatch(user.batch)
  // }, [user])

  const subjects = useMemo(
    () => [...new Set(all.map((m) => m.subject))].sort(),
    [all],
  );
  const availableSems = year
    ? YEAR_TO_SEMESTERS[Number(year)] || SEMESTERS
    : SEMESTERS;

  const filtered = useMemo(() => {
    let list = all;
    if (batch) list = list.filter((m) => m.batch === batch);
    if (year) list = list.filter((m) => m.mcaYear === Number(year));
    if (semester) list = list.filter((m) => m.semester === Number(semester));
    if (subject) list = list.filter((m) => m.subject === subject);
    if (exam) list = list.filter((m) => m.exam === exam);
    if (materialType)
      list = list.filter((m) => m.materialType === materialType);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.subject.toLowerCase().includes(q) ||
          m.tags?.some((t) => t.includes(q)) ||
          m.description?.toLowerCase().includes(q) ||
          m.uploadedBy?.name?.toLowerCase().includes(q),
      );
    }
    const fns = {
      newest: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      oldest: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      popular: (a, b) => (b.downloads || 0) - (a.downloads || 0),
      upvoted: (a, b) => (b.upvotes || 0) - (a.upvotes || 0),
    };
    return [...list].sort(fns[sort] || fns.newest);
  }, [all, batch, year, semester, subject, exam, materialType, search, sort]);

  const clearFilters = () => {
    setSearch("");
    setBatch("");
    setYear("");
    setSemester("");
    setSubject("");
    setExam("");
    setMaterialType("");
  };
  const hasFilters =
    batch || year || semester || subject || exam || materialType || search;

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>
          Browse materials
        </h2>
        <p style={{ color: "var(--text3)", fontSize: 14 }}>
          {loading
            ? "Loading…"
            : `${all.length} materials loaded — search and filter instantly`}
        </p>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search by title, subject, tags, uploader…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ marginBottom: 12, paddingLeft: 14 }}
      />

      {/* Filters */}
      <div
        style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}
      >
        <select
          value={batch}
          onChange={(e) => setBatch(e.target.value)}
          style={{ flex: 1, minWidth: 110 }}
        >
          <option value="">All batches</option>
          {BATCHES.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
        <select
          value={year}
          onChange={(e) => {
            setYear(e.target.value);
            setSemester("");
          }}
          style={{ flex: 1, minWidth: 90 }}
        >
          <option value="">All years</option>
          {MCA_YEARS.map((y) => (
            <option key={y} value={y}>
              Year {y}
            </option>
          ))}
        </select>
        <select
          value={semester}
          onChange={(e) => setSemester(e.target.value)}
          style={{ flex: 1, minWidth: 90 }}
        >
          <option value="">All sems</option>
          {availableSems.map((s) => (
            <option key={s} value={s}>
              Sem {s}
            </option>
          ))}
        </select>
        <select
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          style={{ flex: 1, minWidth: 130 }}
        >
          <option value="">All subjects</option>
          {subjects.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          value={exam}
          onChange={(e) => {
            setExam(e.target.value);
            setMaterialType("");
          }}
          style={{ flex: 1, minWidth: 100 }}
        >
          <option value="">All exams</option>
          {EXAMS.map((e) => (
            <option key={e.value} value={e.value}>
              {e.label}
            </option>
          ))}
        </select>

        <select
          value={materialType}
          onChange={(e) => setMaterialType(e.target.value)}
          style={{ flex: 1, minWidth: 130 }}
        >
          <option value="">All types</option>
          {MATERIAL_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          style={{ flex: 1, minWidth: 130 }}
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="popular">Most downloaded</option>
          <option value="upvoted">Most upvoted</option>
        </select>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 20,
          minHeight: 28,
        }}
      >
        <p style={{ fontSize: 13, color: "var(--text3)" }}>
          {filtered.length === all.length
            ? `Showing all ${all.length} materials`
            : `${filtered.length} result${filtered.length !== 1 ? "s" : ""} of ${all.length}`}
        </p>
        {hasFilters && (
          <button
            onClick={clearFilters}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--accent2)",
              fontSize: 13,
              cursor: "pointer",
              fontFamily: "var(--font-body)",
            }}
          >
            Clear filters ×
          </button>
        )}
      </div>

      {loading ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))",
            gap: 12,
          }}
        >
          {[...Array(6)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 200 }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <h3>No materials found</h3>
          <p>Try different filters or upload the first one!</p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))",
            gap: 12,
          }}
        >
          {filtered.map((m) => (
            <div key={m._id} className="fade-in">
              <MaterialCard material={m} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
