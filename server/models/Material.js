import mongoose from "mongoose";

const materialSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [150, "Title cannot exceed 150 characters"],
    },
    batch: {
      type: String,
      required: [true, "Batch is required"],
    },
    mcaYear: {
      type: Number,
      enum: [1, 2, 3],
      required: [true, "MCA year is required"],
    },
    semester: {
      type: Number,
      min: 1,
      max: 6,
      required: [true, "Semester is required"],
    },
    section: {
      type: String,
      enum: ["A", "B", "Common"],
      default: "Common",
      required: true,
    },

    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
    },
    faculty: {
      type: String,
      trim: true,
    },
    exam: {
      type: String,
      enum: ["CT1", "CT2", "FAT", "LabExam", "General"],
      required: true,
    },
    materialType: {
      type: String,
      enum: [
        "QuestionPaper",
        "AnswerScript",
        "Notes",
        "LabRecord",
        "Report",
        "Presentation",
      ],
      required: true,
    },
    // Keep examType temporarily for migration — remove after running migrate.js
    examType: {
      type: String,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    publicId: {
      type: String, // Cloudinary public ID for deletion
      required: true,
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    description: {
      type: String,
      maxlength: [300, "Description cannot exceed 300 characters"],
      trim: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    downloads: {
      type: Number,
      default: 0,
    },
    upvotes: {
      type: Number,
      default: 0,
    },
    upvotedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    flagged: {
      type: Boolean,
      default: false,
    },
    flaggedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    flagReason: {
      type: String,
    },
    flagReports: [
      {
        flaggedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        reason: {
          type: String,
          trim: true,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

// Compound index for fast filtered queries

materialSchema.index({
  batch: 1,
  mcaYear: 1,
  semester: 1,
  section: 1,
  subject: 1,
  exam: 1,
  materialType: 1,
});

// Full-text search index
materialSchema.index({
  title: "text",
  tags: "text",
  description: "text",
  subject: "text",
});
// Sort by recent / popular
materialSchema.index({ createdAt: -1 });
materialSchema.index({ upvotes: -1 });

// Exclude deleted + flagged from normal queries
materialSchema.pre(/^find/, function (next) {
  if (!this.getOptions().includeDeleted) {
    this.where({ isDeleted: false });
  }
  next();
});

export default mongoose.model("Material", materialSchema);
