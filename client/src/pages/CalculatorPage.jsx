import { useMemo, useState } from "react";
import toast from "react-hot-toast";

const GRADE_POINTS = {
  S: 10,
  A: 9,
  B: 8,
  C: 7,
  D: 6,
  E: 5,
  F: 0,
};

const makeCourse = () => ({
  id: crypto.randomUUID(),
  credits: "",
  grade: "",
});

export default function CalculatorPage() {
  const [courses, setCourses] = useState([makeCourse()]);

  const updateCourse = (id, field, value) => {
    setCourses((prev) =>
      prev.map((course) =>
        course.id === id ? { ...course, [field]: value } : course,
      ),
    );
  };

  const addCourse = () => {
    setCourses((prev) => [...prev, makeCourse()]);
  };

  const removeCourse = (id) => {
    if (courses.length === 1) {
      toast.error("At least one course row is required");
      return;
    }
    setCourses((prev) => prev.filter((course) => course.id !== id));
  };

  const resetCourses = () => {
    setCourses([makeCourse()]);
  };

  const summary = useMemo(() => {
    const validCourses = courses.filter(
      (course) =>
        Number(course.credits) > 0 &&
        course.grade &&
        GRADE_POINTS[course.grade] !== undefined,
    );

    const totalCredits = validCourses.reduce(
      (sum, course) => sum + Number(course.credits),
      0,
    );

    const totalGradePoints = validCourses.reduce(
      (sum, course) =>
        sum + Number(course.credits) * GRADE_POINTS[course.grade],
      0,
    );

    const gpa = totalCredits ? totalGradePoints / totalCredits : 0;

    return {
      validCourses: validCourses.length,
      totalCredits,
      totalGradePoints,
      gpa,
    };
  }, [courses]);

  return (
    <div style={{ maxWidth: 760, margin: "0 auto" }}>
      <div style={{ marginBottom: 24, textAlign: "center" }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>
          GPA Calculator
        </h2>
        <p style={{ color: "var(--text3)", fontSize: 16 }}>
          (Expected)
        </p>
        <p style={{ color: "var(--text3)", fontSize: 14 }}>
          Calculate semester GPA using the NIT Trichy grade scale.
        </p>
      </div>

      <div className="card" style={{ padding: 20, marginBottom: 18 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr auto",
            gap: 10,
            marginBottom: 12,
            fontSize: 12,
            color: "var(--text3)",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: ".04em",
          }}
        >
          <div>Credits</div>
          <div>Grade</div>
          <div>Action</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {courses.map((course) => (
            <div
              key={course.id}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr auto",
                gap: 10,
              }}
            >
              <input
                type="number"
                min="0"
                value={course.credits}
                onChange={(e) =>
                  updateCourse(course.id, "credits", e.target.value)
                }
                placeholder="Credits"
              />

              <select
                value={course.grade}
                onChange={(e) => updateCourse(course.id, "grade", e.target.value)}
              >
                <option value="">Select</option>
                {Object.keys(GRADE_POINTS).map((grade) => (
                  <option key={grade} value={grade}>
                    {grade}
                  </option>
                ))}
              </select>

              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => removeCourse(course.id)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            gap: 10,
            marginTop: 16,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <button type="button" className="btn btn-primary" onClick={addCourse}>
            + Add Course
          </button>
          <button type="button" className="btn btn-ghost" onClick={resetCourses}>
            Reset
          </button>
        </div>
      </div>

      <div
        className="card"
        style={{
          padding: 20,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 12,
        }}
      >
        <div>
          <p style={{ fontSize: 12, color: "var(--text3)", marginBottom: 4 }}>
            Valid Courses
          </p>
          <p style={{ fontSize: 20, fontWeight: 700 }}>{summary.validCourses}</p>
        </div>

        <div>
          <p style={{ fontSize: 12, color: "var(--text3)", marginBottom: 4 }}>
            Total Credits
          </p>
          <p style={{ fontSize: 20, fontWeight: 700 }}>{summary.totalCredits}</p>
        </div>

        <div>
          <p style={{ fontSize: 12, color: "var(--text3)", marginBottom: 4 }}>
            Grade Points
          </p>
          <p style={{ fontSize: 20, fontWeight: 700 }}>
            {summary.totalGradePoints}
          </p>
        </div>

        <div>
          <p style={{ fontSize: 12, color: "var(--text3)", marginBottom: 4 }}>
            GPA
          </p>
          <p style={{ fontSize: 24, fontWeight: 800, color: "var(--accent2)" }}>
            {summary.totalCredits ? summary.gpa.toFixed(2) : "0.00"}
          </p>
        </div>
      </div>
    </div>
  );
}
