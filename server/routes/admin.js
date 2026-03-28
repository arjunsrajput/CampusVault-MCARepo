import express from "express";
import Material from "../models/Material.js";
import User from "../models/User.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();

// GET /api/admin/stats
router.get("/stats", protect, adminOnly, async (req, res) => {
  try {
    const [totalMaterials, totalUsers, flagged, byType] = await Promise.all([
      Material.countDocuments(),
      User.countDocuments(),
      Material.countDocuments({ flagged: true }),
      Material.aggregate([
        {
          $group: {
            _id: { exam: "$exam", materialType: "$materialType" },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.exam": 1, "_id.materialType": 1 } },
      ]),
    ]);
    res.json({ totalMaterials, totalUsers, flagged, byType });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/flagged
router.get("/flagged", protect, adminOnly, async (req, res) => {
  try {
    const materials = await Material.find(
      { flagged: true },
      { includeDeleted: true },
    )
      .populate("uploadedBy", "name email")
      .sort({ createdAt: -1 });
    res.json({ materials });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/admin/unflag/:id
router.patch("/unflag/:id", protect, adminOnly, async (req, res) => {
  try {
    await Material.findByIdAndUpdate(req.params.id, {
      flagged: false,
      flagReason: "",
      flaggedBy: [],
    });
    res.json({ message: "Material unflagged." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/users
router.get("/users", protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find().sort({ uploadCount: -1 });
    res.json({ users });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/admin/users/:id/role
router.patch("/users/:id/role", protect, adminOnly, async (req, res) => {
  try {
    const { role } = req.body;
    if (!["student", "admin"].includes(role)) {
      return res.status(400).json({ error: "Invalid role." });
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true },
    );
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
