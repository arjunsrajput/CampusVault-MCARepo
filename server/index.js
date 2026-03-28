import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import { connectDB } from './config/db.js'
import authRoutes from './routes/auth.js'
import materialRoutes from './routes/materials.js'
import subjectRoutes from './routes/subjects.js'
import adminRoutes from './routes/admin.js'
import userRoutes from './routes/users.js'

const app = express()

app.use(helmet())
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}))
app.use(express.json({ limit: '10kb' }))
app.use(morgan('dev'))

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: 'Too many requests, please try again later.' }
})
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many auth attempts, please try again later.' }
})

app.use('/api', globalLimiter)
app.use('/api/auth', authLimiter)

app.use('/api/auth',      authRoutes)
app.use('/api/materials', materialRoutes)
app.use('/api/subjects',  subjectRoutes)
app.use('/api/admin',     adminRoutes)
app.use('/api/users',     userRoutes)

app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }))

app.use((err, req, res, next) => {
  console.error('Error:', err.message)
  const status = err.statusCode || 500
  res.status(status).json({ error: err.message || 'Internal server error' })
})

const PORT = process.env.PORT || 5000

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
})
