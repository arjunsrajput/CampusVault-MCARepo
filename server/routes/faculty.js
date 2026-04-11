import express from "express";
import Faculty from "../models/Faculty.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();

router.get("/", protect, async (req, res) => {
  try {
    const q = req.query.q?.trim();
    const filter = q ? { name: { $regex: q, $options: "i" } } : {};
    const faculty = await Faculty.find(filter).sort({ name: 1 });
    res.json({ faculty });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", protect, adminOnly, async (req, res) => {
  try {
    const name = req.body.name?.trim();
    if (!name) {
      return res.status(400).json({ error: "Faculty name is required." });
    }

    const faculty = await Faculty.create({
      name,
      addedBy: req.user._id,
    });
    res.status(201).json({ faculty });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: "Faculty already exists." });
    }
    if (err.name === "ValidationError") {
      const message = Object.values(err.errors)
        .map((item) => item.message)
        .join(", ");
      return res.status(400).json({ error: message });
    }
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    await Faculty.findByIdAndDelete(req.params.id);
    res.json({ message: "Faculty deleted." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
