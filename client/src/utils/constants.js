export const MCA_YEARS = [1, 2, 3];
export const SEMESTERS = [1, 2, 3, 4, 5, 6];
export const YEAR_TO_SEMESTERS = { 1: [1, 2], 2: [3, 4], 3: [5, 6] };

// export const generateBatches = () => {
//   const b = []
//   for (let y = 2019; y <= new Date().getFullYear(); y++)
//     b.push(`${y}-${String(y + 3).slice(2)}`)
//   return b.reverse()
// }
// export const BATCHES = generateBatches()

export const generateBatches = () => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  // Academic cycle rolls forward around mid-year admissions.
  const currentBatchYear = currentMonth >= 6 ? currentYear : currentYear - 1;

  const startYear = currentBatchYear - 3;
  const endYear = currentBatchYear + 1;

  const batches = [];
  for (let y = startYear; y <= endYear; y++) {
    batches.push(`${y}-${String(y + 3).slice(2)}`);
  }

  return batches.reverse();
};

export const BATCHES = generateBatches();

export const DEFAULT_SUBJECTS = {
  1: [
    "Data Structures & Algorithms",
    "Computer Networks",
    "Operating Systems",
    "Database Management",
    "Discrete Mathematics",
    "Programming in C",
    "Software Engineering",
  ],
  2: [
    "Advanced Java",
    "Web Technologies",
    "Machine Learning",
    "Cloud Computing",
    "Mobile App Development",
    "Compiler Design",
    "Information Security",
  ],
  3: [
    "Big Data Analytics",
    "Deep Learning",
    "IoT & Embedded Systems",
    "Project Management",
    "Research Methodology",
    "Elective I",
    "Elective II",
  ],
};

// ── Exam options ────────────────────────────────────────
export const EXAMS = [
  { value: "CT1", label: "CT1" },
  { value: "CT2", label: "CT2" },
  { value: "FAT", label: "FAT" },
  { value: "LabExam", label: "Lab Exam" },
  { value: "General", label: "General" },
];

// ── Material type options ────────────────────────────────
export const MATERIAL_TYPES = [
  { value: "QuestionPaper", label: "Question Paper" },
  { value: "AnswerScript", label: "Answer Script" },
  { value: "Notes", label: "Notes" },
  { value: "LabRecord", label: "Lab Record" },
  { value: "Report", label: "Report" },
  { value: "Presentation", label: "Presentation" },
];

// ── Which material types are valid per exam ──────────────
export const EXAM_MATERIAL_MAP = {
  CT1: ["QuestionPaper", "AnswerScript", "Notes"],
  CT2: ["QuestionPaper", "AnswerScript", "Notes"],
  FAT: ["QuestionPaper", "AnswerScript", "Notes"],
  LabExam: ["QuestionPaper", "AnswerScript", "LabRecord", "Notes"],
  General: ["Notes", "LabRecord", "Report", "Presentation"],
};

// ── Badge CSS classes ────────────────────────────────────
export const EXAM_BADGE = {
  CT1: "badge-ct1",
  CT2: "badge-ct2",
  FAT: "badge-fat",
  LabExam: "badge-lab",
  General: "badge-notes",
};

export const MATERIAL_TYPE_BADGE = {
  QuestionPaper: "badge-qp",
  AnswerScript: "badge-answer",
  Notes: "badge-notes",
  LabRecord: "badge-lab",
  Report: "badge-report",
  Presentation: "badge-report",
};

// Legacy — kept for old materials that still have examType field
export const EXAM_TYPE_BADGE = {
  CT1: "badge-ct1",
  CT2: "badge-ct2",
  FAT: "badge-fat",
  Notes: "badge-notes",
  AnswerScript: "badge-answer",
};

// ── Sort options ─────────────────────────────────────────
export const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "popular", label: "Most downloaded" },
  { value: "upvoted", label: "Most upvoted" },
];

// ── Helpers ──────────────────────────────────────────────
export const formatDate = (d) => {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export const formatMaterialType = (type) => {
  const map = {
    QuestionPaper: "Question Paper",
    AnswerScript: "Answer Script",
    LabRecord: "Lab Record",
    Notes: "Notes",
    Report: "Report",
    Presentation: "Presentation",
  };
  return map[type] || type;
};
