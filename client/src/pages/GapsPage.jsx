import { useState, useMemo } from "react";
import { useMaterialStore } from "../store/materialStore.js";
import { MCA_YEARS } from "../utils/constants.js";
import { useNavigate } from "react-router-dom";

const GAP_UPLOAD_MAP = {
  ct1Paper: { exam: "CT1", materialType: "QuestionPaper" },
  ct1Script: { exam: "CT1", materialType: "AnswerScript" },
  ct2Paper: { exam: "CT2", materialType: "QuestionPaper" },
  ct2Script: { exam: "CT2", materialType: "AnswerScript" },
  fatPaper: { exam: "FAT", materialType: "QuestionPaper" },
  fatScript: { exam: "FAT", materialType: "AnswerScript" },
  notes: { exam: "General", materialType: "Notes" },
};

export default function GapsPage() {
  const { all, loading } = useMaterialStore();
  const navigate = useNavigate();
  const [filterYear, setFilterYear] = useState("");

  const goToPrefilledUpload = (row, gapKey) => {
    const preset = GAP_UPLOAD_MAP[gapKey];
    if (!preset) return;

    navigate("/upload", {
      state: {
        subject: row.subject,
        mcaYear: row.mcaYear,
        semester: row.semester,
        section: row.section,
        exam: preset.exam,
        materialType: preset.materialType,
      },
    });
  };

  const coverage = useMemo(() => {
    const map = {};

    all.forEach((m) => {
      const key = `${m.mcaYear}-${m.semester}-${m.subject}-${m.section || "Common"}`;

      if (!map[key]) {
        map[key] = {
          mcaYear: m.mcaYear,
          semester: m.semester,
          section: m.section || "Common",
          subject: m.subject,
          exams: {},
        };
      }

      const examKey = m.exam || m.examType || "General";
      const typeKey = m.materialType || "QuestionPaper";
      const comboKey = `${examKey}__${typeKey}`;
      map[key].exams[comboKey] = (map[key].exams[comboKey] || 0) + 1;
    });

    return Object.values(map).sort(
      (a, b) =>
        a.mcaYear - b.mcaYear ||
        a.semester - b.semester ||
        a.subject.localeCompare(b.subject) ||
        a.section.localeCompare(b.section),
    );
  }, [all]);

  const filtered = filterYear
    ? coverage.filter((c) => c.mcaYear === Number(filterYear))
    : coverage;

  const SHOW_COMBOS = [
    {
      key: "ct1Paper",
      exam: "CT1",
      materialType: "QuestionPaper",
      label: "CT1 Paper",
    },
    {
      key: "ct1Script",
      exam: "CT1",
      materialType: "AnswerScript",
      label: "CT1 Script",
    },
    {
      key: "ct2Paper",
      exam: "CT2",
      materialType: "QuestionPaper",
      label: "CT2 Paper",
    },
    {
      key: "ct2Script",
      exam: "CT2",
      materialType: "AnswerScript",
      label: "CT2 Script",
    },
    {
      key: "fatPaper",
      exam: "FAT",
      materialType: "QuestionPaper",
      label: "FAT Paper",
    },
    {
      key: "fatScript",
      exam: "FAT",
      materialType: "AnswerScript",
      label: "FAT Script",
    },
    {
      key: "notes",
      exam: "General",
      materialType: "Notes",
      label: "Notes",
    },
  ];

  const totalGaps = filtered.reduce(
    (acc, c) =>
      acc +
      SHOW_COMBOS.filter(
        (combo) => !c.exams[`${combo.exam}__${combo.materialType}`],
      ).length,
    0,
  );

  return (
    <div>
      <div
        style={{
          marginBottom: 24,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>
            Coverage gaps
          </h2>
          <p style={{ color: "var(--text3)", fontSize: 14 }}>
            {loading
              ? "Loading…"
              : `${totalGaps} gap${totalGaps !== 1 ? "s" : ""} found — missing materials highlighted in red`}
          </p>
        </div>

        <select
          value={filterYear}
          onChange={(e) => setFilterYear(e.target.value)}
          style={{ width: "auto", minWidth: 120 }}
        >
          <option value="">All years</option>
          {MCA_YEARS.map((y) => (
            <option key={y} value={y}>
              Year {y}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="spinner" />
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <h3>No data yet</h3>
          <p>Upload materials to see coverage</p>
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table
            style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}
          >
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                <th
                  style={{
                    textAlign: "left",
                    padding: "10px 12px",
                    color: "var(--text3)",
                    fontWeight: 500,
                    fontSize: 12,
                    fontFamily: "var(--font-head)",
                    textTransform: "uppercase",
                    letterSpacing: ".04em",
                    width: "35%",
                  }}
                >
                  Subject
                </th>

                <th
                  style={{
                    textAlign: "center",
                    padding: "10px 8px",
                    color: "var(--text3)",
                    fontWeight: 500,
                    fontSize: 12,
                    fontFamily: "var(--font-head)",
                    textTransform: "uppercase",
                    letterSpacing: ".04em",
                  }}
                >
                  Year/Sem
                </th>

                {SHOW_COMBOS.map((c) => (
                  <th
                    key={`${c.exam}__${c.materialType}`}
                    style={{
                      textAlign: "center",
                      padding: "10px 8px",
                      color: "var(--text3)",
                      fontWeight: 500,
                      fontSize: 11,
                      fontFamily: "var(--font-head)",
                      textTransform: "uppercase",
                      letterSpacing: ".04em",
                    }}
                  >
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {filtered.map((c, i) => (
                <tr
                  key={i}
                  style={{
                    borderBottom: "1px solid var(--border)",
                    transition: "background .12s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "var(--bg3)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <td style={{ padding: "10px 12px", fontWeight: 500 }}>
                    {c.subject}
                  </td>

                  <td
                    style={{
                      padding: "10px 8px",
                      textAlign: "center",
                      color: "var(--text3)",
                      fontSize: 12,
                    }}
                  >
                    Y{c.mcaYear} S{c.semester} ·{" "}
                    {c.section === "A" || c.section === "B"
                      ? `Sec ${c.section}`
                      : "Common"}
                  </td>

                  {SHOW_COMBOS.map((combo) => {
                    const key = `${combo.exam}__${combo.materialType}`;
                    const count = c.exams[key] || 0;

                    return (
                      <td
                        key={key}
                        style={{ padding: "10px 8px", textAlign: "center" }}
                      >
                        {count > 0 ? (
                          <span
                            style={{ color: "var(--green)", fontSize: 16 }}
                            title={`${count} available`}
                          >
                            ✓
                          </span>
                        ) : (
                          <button
                            onClick={() => goToPrefilledUpload(c, combo.key)}
                            style={{
                              background: "var(--red-bg)",
                              color: "var(--red)",
                              border: "1px solid rgba(239,68,68,.2)",
                              borderRadius: 6,
                              padding: "2px 8px",
                              fontSize: 10,
                              cursor: "pointer",
                              fontFamily: "var(--font-body)",
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.background =
                                "rgba(239,68,68,.2)")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.background =
                                "var(--red-bg)")
                            }
                          >
                            Upload
                          </button>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div
        style={{ marginTop: 20, display: "flex", gap: 16, flexWrap: "wrap" }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 13,
            color: "var(--text3)",
          }}
        >
          <span style={{ color: "var(--green)", fontSize: 15 }}>✓</span>
          Available
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 13,
            color: "var(--text3)",
          }}
        >
          <span
            style={{
              background: "var(--red-bg)",
              color: "var(--red)",
              padding: "1px 8px",
              borderRadius: 4,
              fontSize: 11,
            }}
          >
            Upload
          </span>
          Missing — click to contribute
        </div>
      </div>
    </div>
  );
}
