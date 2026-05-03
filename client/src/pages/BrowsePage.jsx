import { useEffect, useMemo, useState } from "react";
import { getMaterials, getSubjects } from "../api/index.js";
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
  const [materials, setMaterials] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [batch, setBatch] = useState("");
  const [year, setYear] = useState("");
  const [semester, setSemester] = useState("");
  const [section, setSection] = useState("");
  const [subject, setSubject] = useState("");
  const [exam, setExam] = useState("");
  const [materialType, setMaterialType] = useState("");
  const [sort, setSort] = useState("newest");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 250);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    getSubjects()
      .then((res) => setSubjects(res.data.subjects || []))
      .catch(() => setSubjects([]));
  }, []);

  useEffect(() => {
    let cancelled = false;

    const params = {
      page,
      sort,
      ...(debouncedSearch && { q: debouncedSearch }),
      ...(batch && { batch }),
      ...(year && { mcaYear: year }),
      ...(semester && { semester }),
      ...(section && { section }),
      ...(subject && { subject }),
      ...(exam && { exam }),
      ...(materialType && { materialType }),
    };

    setLoading(true);
    getMaterials(params)
      .then((res) => {
        if (cancelled) return;
        setMaterials(res.data.materials || []);
        setTotal(res.data.total || 0);
        setPages(Math.max(1, res.data.pages || 1));
      })
      .catch(() => {
        if (cancelled) return;
        setMaterials([]);
        setTotal(0);
        setPages(1);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [
    page,
    sort,
    debouncedSearch,
    batch,
    year,
    semester,
    section,
    subject,
    exam,
    materialType,
  ]);

  const subjectOptions = useMemo(() => {
    const names = new Set(subjects.map((item) => item.name).filter(Boolean));
    materials.forEach((item) => {
      if (item.subject) names.add(item.subject);
    });
    return [...names].sort();
  }, [subjects, materials]);

  const availableSems = year
    ? YEAR_TO_SEMESTERS[Number(year)] || SEMESTERS
    : SEMESTERS;

  const resetToFirstPage = (fn) => {
    setPage(1);
    fn();
  };

  const clearFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setBatch("");
    setYear("");
    setSemester("");
    setSection("");
    setSubject("");
    setExam("");
    setMaterialType("");
    setPage(1);
  };

  const hasFilters =
    batch ||
    year ||
    semester ||
    section ||
    subject ||
    exam ||
    materialType ||
    search;

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>
          Browse materials
        </h2>
        <p style={{ color: "var(--text3)", fontSize: 14 }}>
          {loading ? "Loading…" : `${total} materials found : Search and Filter`}
        </p>
      </div>

      <input
        type="text"
        placeholder="Search by title, subject, tags, description…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ marginBottom: 12, paddingLeft: 14 }}
      />

      <div
        style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}
      >
        <select
          value={batch}
          onChange={(e) => resetToFirstPage(() => setBatch(e.target.value))}
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
          onChange={(e) =>
            resetToFirstPage(() => {
              setYear(e.target.value);
              setSemester("");
            })
          }
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
          onChange={(e) => resetToFirstPage(() => setSemester(e.target.value))}
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
          value={section}
          onChange={(e) => resetToFirstPage(() => setSection(e.target.value))}
          style={{ flex: 1, minWidth: 120 }}
        >
          <option value="">All sections</option>
          <option value="Common">Common</option>
          <option value="A">Section A</option>
          <option value="B">Section B</option>
        </select>

        <select
          value={subject}
          onChange={(e) => resetToFirstPage(() => setSubject(e.target.value))}
          style={{ flex: 1, minWidth: 130 }}
        >
          <option value="">All subjects</option>
          {subjectOptions.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <select
          value={exam}
          onChange={(e) =>
            resetToFirstPage(() => {
              setExam(e.target.value);
              setMaterialType("");
            })
          }
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
          onChange={(e) =>
            resetToFirstPage(() => setMaterialType(e.target.value))
          }
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
          onChange={(e) => resetToFirstPage(() => setSort(e.target.value))}
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
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <p style={{ fontSize: 13, color: "var(--text3)" }}>
          {total === 0
            ? "No results"
            : `Showing ${materials.length} of ${total} result${total !== 1 ? "s" : ""}`}
        </p>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {pages > 1 && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page <= 1 || loading}
              >
                Previous
              </button>
              <span style={{ fontSize: 13, color: "var(--text3)" }}>
                Page {page} of {pages}
              </span>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() =>
                  setPage((current) => Math.min(pages, current + 1))
                }
                disabled={page >= pages || loading}
              >
                Next
              </button>
            </div>
          )}

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
              Clear filters x
            </button>
          )}
        </div>
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
      ) : materials.length === 0 ? (
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
          {materials.map((m) => (
            <div key={m._id} className="fade-in">
              <MaterialCard material={m} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
