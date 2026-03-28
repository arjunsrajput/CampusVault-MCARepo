import express from 'express'
import User from '../models/User.js'
import Material from '../models/Material.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()
const normalizeName = (value) => value?.trim().replace(/\s+/g, ' ').toUpperCase()
const trimValue = (value) => value === undefined || value === null ? '' : String(value).trim()
const profileFields = 'name batch rollNumber currentYear role email isAlumni graduationYear company jobTitle city linkedinUrl personalEmail bio directoryVisibility showEmail showLinkedin uploadCount'

const canViewerSeeUser = (viewer, member) => {
  if (member.directoryVisibility === 'hidden') return false
  if (member.directoryVisibility === 'same_batch' && viewer.batch !== member.batch) return false
  return true
}

const sanitizeDirectoryMember = async (viewer, member) => {
  const uploads = await Material.countDocuments({ uploadedBy: member._id })
  const upvoteAgg = await Material.aggregate([
    { $match: { uploadedBy: member._id, isDeleted: false } },
    { $group: { _id: null, total: { $sum: '$upvotes' } } }
  ])
  const upvotesReceived = upvoteAgg[0]?.total || 0

  return {
    id: member._id,
    name: member.name,
    rollNumber: member.rollNumber,
    batch: member.batch,
    currentYear: member.currentYear,
    isAlumni: member.isAlumni,
    graduationYear: member.graduationYear,
    company: member.company,
    jobTitle: member.jobTitle,
    city: member.city,
    bio: member.bio,
    uploadCount: uploads,
    upvotesReceived,
    linkedinUrl: member.showLinkedin ? member.linkedinUrl : '',
    personalEmail: member.showEmail ? member.personalEmail : ''
  }
}

// GET /api/users/leaderboard
router.get('/leaderboard', protect, async (req, res) => {
  try {
    const users = await User.find({ uploadCount: { $gt: 0 } })
      .select('name batch rollNumber uploadCount')
      .sort({ uploadCount: -1 })
      .limit(20)
    res.json({ users })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/users/my-uploads
router.get('/my-uploads', protect, async (req, res) => {
  try {
    const materials = await Material.find({ uploadedBy: req.user._id })
      .sort({ createdAt: -1 })
    res.json({ materials })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/users/directory/batches
router.get('/directory/batches', protect, async (req, res) => {
  try {
    const users = await User.find({ directoryVisibility: { $ne: 'hidden' } })
      .select('batch directoryVisibility')

    const visibleUsers = users.filter((user) => canViewerSeeUser(req.user, user))
    const batchMap = visibleUsers.reduce((acc, user) => {
      acc[user.batch] = (acc[user.batch] || 0) + 1
      return acc
    }, {})

    const batches = Object.keys(batchMap)
      .sort((a, b) => Number(b.split('-')[0]) - Number(a.split('-')[0]))
      .map((batch) => ({ batch, memberCount: batchMap[batch] }))

    res.json({ batches })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/users/directory/batches/:batch
router.get('/directory/batches/:batch', protect, async (req, res) => {
  try {
    const users = await User.find({ batch: req.params.batch })
      .select(profileFields)
      .sort({ rollNumber: 1, name: 1 })

    const visibleUsers = users.filter((user) => canViewerSeeUser(req.user, user))
    const members = await Promise.all(visibleUsers.map((user) => sanitizeDirectoryMember(req.user, user)))

    res.json({
      batch: req.params.batch,
      members
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PATCH /api/users/profile
router.patch('/profile', protect, async (req, res) => {
  try {
    const {
      name,
      batch,
      currentYear,
      isAlumni,
      graduationYear,
      company,
      jobTitle,
      city,
      linkedinUrl,
      personalEmail,
      bio,
      directoryVisibility,
      showEmail,
      showLinkedin
    } = req.body

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        ...(name && { name: normalizeName(name) }),
        ...(batch && { batch }),
        ...(currentYear && { currentYear: Number(currentYear) }),
        ...(isAlumni !== undefined && { isAlumni: Boolean(isAlumni) }),
        ...(graduationYear !== undefined && { graduationYear: graduationYear ? Number(graduationYear) : null }),
        ...(company !== undefined && { company: trimValue(company) }),
        ...(jobTitle !== undefined && { jobTitle: trimValue(jobTitle) }),
        ...(city !== undefined && { city: trimValue(city) }),
        ...(linkedinUrl !== undefined && { linkedinUrl: trimValue(linkedinUrl) }),
        ...(personalEmail !== undefined && { personalEmail: trimValue(personalEmail).toLowerCase() }),
        ...(bio !== undefined && { bio: trimValue(bio) }),
        ...(directoryVisibility !== undefined && { directoryVisibility }),
        ...(showEmail !== undefined && { showEmail: Boolean(showEmail) }),
        ...(showLinkedin !== undefined && { showLinkedin: Boolean(showLinkedin) })
      },
      { new: true, runValidators: true }
    )
    res.json({
      user: {
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
        uploadCount: user.uploadCount
      }
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/users/save/:materialId
router.post('/save/:materialId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    const mid = req.params.materialId
    const alreadySaved = user.savedMaterials.map(id => id.toString()).includes(mid)

    if (alreadySaved) {
      user.savedMaterials.pull(mid)
    } else {
      user.savedMaterials.push(mid)
    }
    await user.save()
    res.json({ saved: !alreadySaved, count: user.savedMaterials.length })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/users/saved
router.get('/saved', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'savedMaterials',
      populate: { path: 'uploadedBy', select: 'name' }
    })
    res.json({ materials: user.savedMaterials })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
