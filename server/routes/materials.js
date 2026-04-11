import express from 'express'
import https from 'https'
import http from 'http'
import jwt from 'jsonwebtoken'
import { protect } from '../middleware/auth.js'
import { upload } from '../config/cloudinary.js'
import Material from '../models/Material.js'
import {
  getAllMaterials,
  getMaterials,
  getMaterial,
  createMaterial,
  updateMaterial,
  trackDownload,
  upvoteMaterial,
  flagMaterial,
  deleteMaterial,
  getGaps
} from '../controllers/materialController.js'

const router = express.Router()

router.get('/all',            protect, getAllMaterials)
router.get('/gaps',           protect, getGaps)
router.get('/',               protect, getMaterials)
router.get('/:id',            protect, getMaterial)
router.post('/',              protect, upload.single('file'), createMaterial)
router.patch('/:id',          protect, updateMaterial)
router.patch('/:id/download', protect, trackDownload)
router.patch('/:id/upvote',   protect, upvoteMaterial)
router.post('/:id/flag',      protect, flagMaterial)
router.delete('/:id',         protect, deleteMaterial)

// Serve PDF through backend — accepts token as query param for iframe use
router.get('/:id/serve', async (req, res) => {
  try {
    // Get token from query string (iframe) or Authorization header (API calls)
    const token = req.query.token || req.headers.authorization?.split(' ')[1]
    if (!token) {
      return res.status(401).json({ error: 'Not authenticated. Please log in.' })
    }

    // Verify token
    let decoded
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET)
    } catch {
      return res.status(401).json({ error: 'Invalid or expired token.' })
    }

    const material = await Material.findById(req.params.id)
    if (!material) return res.status(404).json({ error: 'Material not found.' })

    // Increment download count
    await Material.findByIdAndUpdate(req.params.id, { $inc: { downloads: 1 } })

    // Set headers so browser renders PDF inline
    const filename = `${material.title.replace(/[^a-z0-9]/gi, '_')}.pdf`
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`)
    res.setHeader('Access-Control-Allow-Origin', '*')

    // Fetch from Cloudinary and pipe to client
    const fileUrl = material.fileUrl
    const protocol = fileUrl.startsWith('https') ? https : http

    protocol.get(fileUrl, (stream) => {
      if (stream.statusCode !== 200) {
        return res.status(502).json({ error: 'Failed to fetch file from storage.' })
      }
      stream.pipe(res)
    }).on('error', (err) => {
      console.error('Pipe error:', err.message)
      res.status(500).json({ error: 'File streaming failed.' })
    })

  } catch (err) {
    console.error('Serve error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

export default router
