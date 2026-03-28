import crypto from "crypto";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { sendEmail } from "../utils/mailer.js";

const signToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "7d" });

const normalizeName = (name) => name?.trim().replace(/\s+/g, " ").toUpperCase();
const normalizeEmail = (email) => email?.trim().toLowerCase();
const normalizeRollNumber = (rollNumber) => rollNumber?.trim();
const buildCollegeEmail = (rollNumber) => `${rollNumber}@nitt.edu`;
const tokenTtlMs = 24 * 60 * 60 * 1000;
const resetTtlMs = 15 * 60 * 1000;

const createTokenPair = () => {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  return { rawToken, tokenHash };
};

const buildUrl = (path, token) =>
  `${process.env.CLIENT_URL}${path}?token=${encodeURIComponent(token)}`;

const buildUserPayload = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  rollNumber: user.rollNumber,
  batch: user.batch,
  currentYear: user.currentYear,
  role: user.role,
  isAlumni: user.isAlumni,
  graduationYear: user.graduationYear,
  company: user.company,
  jobTitle: user.jobTitle,
  city: user.city,
  linkedinUrl: user.linkedinUrl,
  personalEmail: user.personalEmail,
  bio: user.bio,
  directoryVisibility: user.directoryVisibility,
  showEmail: user.showEmail,
  showLinkedin: user.showLinkedin,
  uploadCount: user.uploadCount,
});

const sendVerificationEmail = async (user, rawToken) => {
  const verificationUrl = buildUrl("/verify-email", rawToken);
  await sendEmail({
    to: user.email,
    subject: "Verify your MCA Repo account",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
        <h2>Verify your account</h2>
        <p>Hello ${user.name},</p>
        <p>Click the link below to verify your email address and activate your MCA Repo account.</p>
        <p><a href="${verificationUrl}">Verify email</a></p>
        <p>This link expires in 24 hours.</p>
      </div>
    `,
  });
};

const sendPasswordResetEmail = async (user, rawToken) => {
  const resetUrl = buildUrl("/reset-password", rawToken);
  await sendEmail({
    to: user.email,
    subject: "Reset your MCA Repo password",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
        <h2>Reset your password</h2>
        <p>Hello ${user.name},</p>
        <p>Click the link below to set a new password for your MCA Repo account.</p>
        <p><a href="${resetUrl}">Reset password</a></p>
        <p>This link expires in 15 minutes.</p>
      </div>
    `,
  });
};

export const register = async (req, res) => {
  try {
    const password = req.body.password;
    const name = normalizeName(req.body.name);
    const rollNumber = normalizeRollNumber(req.body.rollNumber);
    const { batch, currentYear } = req.body;

    if (!name || !password || !batch || !currentYear || !rollNumber) {
      return res.status(400).json({ error: "All fields are required." });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters." });
    }
    if (!/^\d{9}$/.test(rollNumber)) {
      return res.status(400).json({ error: "Roll number must be a valid 9-digit value." });
    }
    const email = normalizeEmail(buildCollegeEmail(rollNumber));

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: "Email already registered." });
    }

    const existingRollNumber = await User.findOne({ rollNumber });
    if (existingRollNumber) {
      return res.status(400).json({ error: "Roll number already registered." });
    }

    const { rawToken, tokenHash } = createTokenPair();
    const user = await User.create({
      name,
      email,
      passwordHash: password,
      batch,
      currentYear: Number(currentYear),
      rollNumber,
      verificationTokenHash: tokenHash,
      verificationTokenExpires: new Date(Date.now() + tokenTtlMs),
    });

    await sendVerificationEmail(user, rawToken);

    res.status(201).json({
      message: "Account created. Please verify your email before logging in.",
      email: user.email,
    });
  } catch (err) {
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors)
        .map((e) => e.message)
        .join(", ");
      return res.status(400).json({ error: messages });
    }
    if (err.code === 11000) {
      return res.status(400).json({ error: "Email already registered." });
    }
    res.status(500).json({ error: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const password = req.body.password
    const email = normalizeEmail(req.body.email)
    const rollNumber = normalizeRollNumber(req.body.rollNumber)

    if (!password || (!email && !rollNumber)) {
      return res.status(400).json({ error: 'Email or roll number and password are required.' })
    }

    let user
    if (email) {
      user = await User.findOne({ email }).select('+passwordHash')
    } else {
      const matches = await User.find({ rollNumber }).sort({ createdAt: -1 }).limit(2).select('+passwordHash')
      if (matches.length > 1) {
        return res.status(409).json({
          error: 'Multiple accounts use this roll number. Please sign in with your email or contact an admin.'
        })
      }
      user = matches[0]
    }

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials.' })
    }

    if (!user.isVerified) {
      return res.status(403).json({
        error: "Please verify your email before logging in.",
        code: "EMAIL_NOT_VERIFIED",
        email: user.email,
      });
    }

    const token = signToken(user._id, user.role)
    res.json({
      token,
      user: buildUserPayload(user)
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export const verifyEmail = async (req, res) => {
  try {
    const rawToken = req.body.token || req.query.token;
    if (!rawToken) {
      return res.status(400).json({ error: "Verification token is required." });
    }

    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const user = await User.findOne({
      verificationTokenHash: tokenHash,
      verificationTokenExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ error: "Verification link is invalid or expired." });
    }

    user.isVerified = true;
    user.verifiedAt = new Date();
    user.verificationTokenHash = null;
    user.verificationTokenExpires = null;
    await user.save();

    res.json({ message: "Email verified successfully. You can log in now." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const resendVerification = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    if (!email) {
      return res.status(400).json({ error: "Email is required." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ message: "If an account exists, a verification email has been sent." });
    }
    if (user.isVerified) {
      return res.json({ message: "This email is already verified." });
    }

    const { rawToken, tokenHash } = createTokenPair();
    user.verificationTokenHash = tokenHash;
    user.verificationTokenExpires = new Date(Date.now() + tokenTtlMs);
    await user.save();

    await sendVerificationEmail(user, rawToken);
    res.json({ message: "Verification email sent." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    if (!email) {
      return res.status(400).json({ error: "Email is required." });
    }

    const user = await User.findOne({ email });
    if (!user || !user.isVerified) {
      return res.json({ message: "If that email exists, a password reset link has been sent." });
    }

    const { rawToken, tokenHash } = createTokenPair();
    user.passwordResetTokenHash = tokenHash;
    user.passwordResetTokenExpires = new Date(Date.now() + resetTtlMs);
    await user.save();

    await sendPasswordResetEmail(user, rawToken);
    res.json({ message: "If that email exists, a password reset link has been sent." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ error: "Token and new password are required." });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters." });
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      passwordResetTokenHash: tokenHash,
      passwordResetTokenExpires: { $gt: new Date() },
    }).select("+passwordHash");

    if (!user) {
      return res.status(400).json({ error: "Reset link is invalid or expired." });
    }

    user.passwordHash = password;
    user.passwordResetTokenHash = null;
    user.passwordResetTokenExpires = null;
    await user.save();

    res.json({ message: "Password reset successfully. You can log in now." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getMe = async (req, res) => {
  res.json({ user: req.user });
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Both fields are required." });
    }
    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ error: "New password must be at least 6 characters." });
    }

    const user = await User.findById(req.user._id).select("+passwordHash");
    if (!(await user.comparePassword(currentPassword))) {
      return res.status(401).json({ error: "Current password is incorrect." });
    }

    user.passwordHash = newPassword;
    await user.save();
    res.json({ message: "Password updated successfully." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
