import mongoose from "mongoose";

const normalizeName = (value) =>
  value?.trim().replace(/\s+/g, " ");

const facultySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Faculty name is required"],
      trim: true,
      set: normalizeName,
      maxlength: [120, "Faculty name cannot exceed 120 characters"],
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

facultySchema.index({ name: 1 }, { unique: true });

export default mongoose.model("Faculty", facultySchema);
