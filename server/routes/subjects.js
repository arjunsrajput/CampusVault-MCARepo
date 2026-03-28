import express from 'express'
import Subject from '../models/Subject.js'
import { protect, adminOnly } from '../middleware/auth.js'

const router = express.Router()

// GET /api/subjects?year=2&sem=3
router.get('/', protect, async (req, res) => {
  try {
    const filter = {}
    const q = req.query.q?.trim()
    if (req.query.year) filter.mcaYear  = Number(req.query.year)
    if (req.query.sem)  filter.semester = Number(req.query.sem)
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { code: { $regex: q, $options: 'i' } }
      ]
    }
    const subjects = await Subject.find(filter).sort({ semester: 1, name: 1 })
    res.json({ subjects })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/subjects — admin only
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { name, code, mcaYear, semester, type } = req.body
    if (!name || !mcaYear || !semester) {
      return res.status(400).json({ error: 'name, mcaYear and semester are required.' })
    }
    const subject = await Subject.create({ name, code, mcaYear, semester, type, addedBy: req.user._id })
    res.status(201).json({ subject })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// DELETE /api/subjects/:id — admin only
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Subject.findByIdAndDelete(req.params.id)
    res.json({ message: 'Subject deleted.' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
