import { v2 as cloudinary } from 'cloudinary'
import multer from 'multer'

const storage = multer.memoryStorage()

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true)
  } else {
    cb(new Error('Only PDF files are allowed'), false)
  }
}

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 }
})

export const uploadToCloudinary = (buffer, originalname) => {
  // Configure here so it runs AFTER dotenv.config() has loaded
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  })

  return new Promise((resolve, reject) => {
    const publicId = `mca-materials/${Date.now()}-${originalname.replace(/\s+/g, '_').replace('.pdf', '')}`
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'raw',
        public_id:     publicId,
        format:        'pdf'
      },
      (error, result) => {
        if (error) reject(error)
        else resolve({ url: result.secure_url, public_id: result.public_id })
      }
    )
    stream.end(buffer)
  })
}

export { cloudinary }