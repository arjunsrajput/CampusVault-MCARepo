/**
 * One-time migration: converts old examType → exam + materialType
 * Run once: node utils/migrate.js
 * Delete this file after running.
 */
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import Material from '../models/Material.js'
// dotenv.config()
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname  = dirname(__filename)

dotenv.config({ path: join(__dirname, '../.env') })

const map = {
  CT1:          { exam: 'CT1',     materialType: 'QuestionPaper'  },
  CT2:          { exam: 'CT2',     materialType: 'QuestionPaper'  },
  FAT:          { exam: 'FAT',     materialType: 'QuestionPaper'  },
  Notes:        { exam: 'General', materialType: 'Notes'          },
  AnswerScript: { exam: 'CT1',     materialType: 'AnswerScript'   },
  LabRecord:    { exam: 'General', materialType: 'LabRecord'      },
  LabExam:      { exam: 'LabExam', materialType: 'QuestionPaper'  },
  VivaNotes:    { exam: 'LabExam', materialType: 'Notes'          },
  Report:       { exam: 'General', materialType: 'Report'         },
  Presentation: { exam: 'General', materialType: 'Presentation'   },
}

async function migrate() {
  await mongoose.connect(process.env.MONGO_URI)
  console.log('Connected')

  const materials = await Material.find({ examType: { $exists: true } })
  console.log(`Found ${materials.length} materials to migrate`)

  let updated = 0
  for (const m of materials) {
    const mapped = map[m.examType]
    if (mapped && !m.exam) {
      m.exam         = mapped.exam
      m.materialType = mapped.materialType
      await m.save()
      updated++
    }
  }

  console.log(`Migrated ${updated} materials`)
  process.exit(0)
}

migrate().catch(e => { console.error(e); process.exit(1) })