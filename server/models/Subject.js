import mongoose from 'mongoose'

const subjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    trim: true,
    uppercase: true
  },
  type: {
    type: String,
    enum: ['theory', 'lab', 'internship', 'elective', 'project'],
    default: 'theory'
  },
  mcaYear: {
    type: Number,
    enum: [1, 2, 3],
    required: true
  },
  semester: {
    type: Number,
    min: 1,
    max: 6,
    required: true
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true })

subjectSchema.index({ mcaYear: 1, semester: 1 })
subjectSchema.index({ code: 1 }, { unique: true, sparse: true })

export default mongoose.model('Subject', subjectSchema)
