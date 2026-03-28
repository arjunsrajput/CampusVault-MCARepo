import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const normalizeName = (value) =>
  value?.trim().replace(/\s+/g, " ").toUpperCase();
const normalizeOptional = (value) => {
  if (value === undefined || value === null) return "";
  return String(value).trim();
};

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      set: normalizeName,
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    rollNumber: {
      type: String,
      trim: true,
      sparse: true, // allows multiple users without roll number (old accounts)
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    batch: {
      type: String,
      required: [true, "Batch is required"],
      trim: true,
    },
    currentYear: {
      type: Number,
      enum: [1, 2, 3],
      required: [true, "Current year is required"],
    },
    role: {
      type: String,
      enum: ["student", "admin"],
      default: "student",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
    verificationTokenHash: {
      type: String,
      default: null,
    },
    verificationTokenExpires: {
      type: Date,
      default: null,
    },
    passwordResetTokenHash: {
      type: String,
      default: null,
    },
    passwordResetTokenExpires: {
      type: Date,
      default: null,
    },
    uploadCount: {
      type: Number,
      default: 0,
    },
    savedMaterials: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Material",
      },
    ],
    isAlumni: {
      type: Boolean,
      default: false,
    },
    graduationYear: {
      type: Number,
      default: null,
    },
    company: {
      type: String,
      set: normalizeOptional,
      maxlength: [80, "Company cannot exceed 80 characters"],
      default: "",
    },
    jobTitle: {
      type: String,
      set: normalizeOptional,
      maxlength: [80, "Job title cannot exceed 80 characters"],
      default: "",
    },
    city: {
      type: String,
      set: normalizeOptional,
      maxlength: [80, "City cannot exceed 80 characters"],
      default: "",
    },
    linkedinUrl: {
      type: String,
      set: normalizeOptional,
      maxlength: [200, "LinkedIn URL cannot exceed 200 characters"],
      default: "",
    },
    personalEmail: {
      type: String,
      set: normalizeOptional,
      lowercase: true,
      maxlength: [120, "Personal email cannot exceed 120 characters"],
      default: "",
    },
    bio: {
      type: String,
      set: normalizeOptional,
      maxlength: [250, "Bio cannot exceed 250 characters"],
      default: "",
    },
    directoryVisibility: {
      type: String,
      enum: ["hidden", "all", "same_batch"],
      default: "all",
    },
    showEmail: {
      type: Boolean,
      default: false,
    },
    showLinkedin: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

// Hash password before save
userSchema.pre("save", async function (next) {
  if (!this.isModified("passwordHash")) return next();
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
  next();
});

userSchema.methods.comparePassword = async function (plain) {
  return bcrypt.compare(plain, this.passwordHash);
};

userSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.passwordHash;
    return ret;
  },
});

export default mongoose.model("User", userSchema);
