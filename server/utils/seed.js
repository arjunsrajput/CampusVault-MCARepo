import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import mongoose from 'mongoose'
import Subject from '../models/Subject.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname  = dirname(__filename)
dotenv.config({ path: join(__dirname, '../.env') })

const SUBJECTS = [
  // ── SEMESTER 1 ──────────────────────────────────
  { name:'Problem Solving and Programming',              code:'CA711', mcaYear:1, semester:1, type:'theory'     },
  { name:'Mathematical Foundations of Computer Appl.',  code:'CA713', mcaYear:1, semester:1, type:'theory'     },
  { name:'Digital Logic and Computer Organization',     code:'CA715', mcaYear:1, semester:1, type:'theory'     },
  { name:'Data Structures and Applications',            code:'CA717', mcaYear:1, semester:1, type:'theory'     },
  { name:'Operating Systems',                           code:'CA719', mcaYear:1, semester:1, type:'theory'     },
  { name:'Problem Solving Lab using Python',            code:'CA701', mcaYear:1, semester:1, type:'lab'        },
  { name:'Data Structures Lab using C',                 code:'CA703', mcaYear:1, semester:1, type:'lab'        },

  // ── SEMESTER 2 ──────────────────────────────────
  { name:'Design and Analysis of Algorithms',           code:'CA710', mcaYear:1, semester:2, type:'theory'     },
  { name:'Database Management Systems',                 code:'CA712', mcaYear:1, semester:2, type:'theory'     },
  { name:'Probability and Statistical Methods',         code:'CA714', mcaYear:1, semester:2, type:'theory'     },
  { name:'Object-oriented Programming',                 code:'CA716', mcaYear:1, semester:2, type:'theory'     },
  { name:'Computer Networks',                           code:'CA718', mcaYear:1, semester:2, type:'theory'     },
  { name:'DBMS Lab',                                    code:'CA702', mcaYear:1, semester:2, type:'lab'        },
  { name:'Computer Networks Lab',                       code:'CA704', mcaYear:1, semester:2, type:'lab'        },
  { name:'Internship',                                  code:'INT2',  mcaYear:1, semester:2, type:'internship' },

  // ── SEMESTER 3 ──────────────────────────────────
  { name:'Machine Learning Techniques',                 code:'CA721', mcaYear:2, semester:3, type:'theory'     },
  { name:'Computational Intelligence',                  code:'CA723', mcaYear:2, semester:3, type:'theory'     },
  { name:'Software Engineering',                        code:'CA725', mcaYear:2, semester:3, type:'theory'     },
  { name:'Accounting and Financial Management',         code:'CA727', mcaYear:2, semester:3, type:'theory'     },
  { name:'Machine Learning Lab',                        code:'CA705', mcaYear:2, semester:3, type:'lab'        },
  { name:'Business Communication',                      code:'CA707', mcaYear:2, semester:3, type:'theory'     },
  { name:'Computational Intelligence Lab',              code:'CA709', mcaYear:2, semester:3, type:'lab'        },
  // Elective I options (Group A)
  { name:'Data Science',                                code:'CA7A1', mcaYear:2, semester:3, type:'elective'   },
  { name:'Social Network Analysis',                     code:'CA7A2', mcaYear:2, semester:3, type:'elective'   },
  { name:'Advanced Database Technology',                code:'CA7A3', mcaYear:2, semester:3, type:'elective'   },
  { name:'Data Mining and Warehousing',                 code:'CA7A4', mcaYear:2, semester:3, type:'elective'   },
  { name:'Resource Management Techniques',              code:'CA7A5', mcaYear:2, semester:3, type:'elective'   },
  { name:'Image Processing',                            code:'CA7A6', mcaYear:2, semester:3, type:'elective'   },

  // ── SEMESTER 4 ──────────────────────────────────
  { name:'Deep Learning and Its Applications',          code:'CA720', mcaYear:2, semester:4, type:'theory'     },
  { name:'Web Technology and Its Applications',         code:'CA722', mcaYear:2, semester:4, type:'theory'     },
  { name:'Distributed and Cloud Computing',             code:'CA724', mcaYear:2, semester:4, type:'theory'     },
  { name:'Deep Learning Lab',                           code:'CA706', mcaYear:2, semester:4, type:'lab'        },
  { name:'Distributed and Cloud Computing Lab',         code:'CA708', mcaYear:2, semester:4, type:'lab'        },
  { name:'Internship',                                  code:'INT4',  mcaYear:2, semester:4, type:'internship' },
  // Elective II options (Group B)
  { name:'Software Architecture and Project Mgmt',      code:'CA7B1', mcaYear:2, semester:4, type:'elective'   },
  { name:'Service Oriented Architecture',               code:'CA7B2', mcaYear:2, semester:4, type:'elective'   },
  { name:'Agile Technology',                            code:'CA7B3', mcaYear:2, semester:4, type:'elective'   },
  { name:'Marketing Management',                        code:'CA7B4', mcaYear:2, semester:4, type:'elective'   },

  // ── SEMESTER 5 ──────────────────────────────────
  { name:'Cyber Security',                              code:'CA731', mcaYear:3, semester:5, type:'theory'     },
  { name:'Mobile Applications Development',             code:'CA733', mcaYear:3, semester:5, type:'theory'     },
  { name:'Organizational Behavior',                     code:'CA735', mcaYear:3, semester:5, type:'theory'     },
  { name:'Cyber Security Lab',                          code:'CA70A', mcaYear:3, semester:5, type:'lab'        },
  { name:'Mobile Applications Development Lab',         code:'CA70B', mcaYear:3, semester:5, type:'lab'        },
  { name:'Project Work Phase I',                        code:'CA749', mcaYear:3, semester:5, type:'project'    },
  // Elective III options (Group C)
  { name:'Bioinformatics',                              code:'CA7C1', mcaYear:3, semester:5, type:'elective'   },
  { name:'Evolutionary Computing',                      code:'CA7C2', mcaYear:3, semester:5, type:'elective'   },
  { name:'Modelling and Computer Simulation',           code:'CA7C3', mcaYear:3, semester:5, type:'elective'   },
  { name:'Natural Language Processing',                 code:'CA7C4', mcaYear:3, semester:5, type:'elective'   },
  { name:'DevOps',                                      code:'CA7C5', mcaYear:3, semester:5, type:'elective'   },
  { name:'Mobile Computing',                            code:'CA7C6', mcaYear:3, semester:5, type:'elective'   },
  { name:'Block Chain Technology',                      code:'CA7C7', mcaYear:3, semester:5, type:'elective'   },
  { name:'Business Ethics',                             code:'CA7C8', mcaYear:3, semester:5, type:'elective'   },
  // Elective IV options (Group D)
  { name:'Big Data Management',                         code:'CA7D1', mcaYear:3, semester:5, type:'elective'   },
  { name:'Green Computing',                             code:'CA7D2', mcaYear:3, semester:5, type:'elective'   },
  { name:'Internet of Things',                          code:'CA7D3', mcaYear:3, semester:5, type:'elective'   },
  { name:'Human Computer Interaction',                  code:'CA7D4', mcaYear:3, semester:5, type:'elective'   },
  { name:'Multi-core Programming',                      code:'CA7D5', mcaYear:3, semester:5, type:'elective'   },
  { name:'MEAN Stack Development',                      code:'CA7D6', mcaYear:3, semester:5, type:'elective'   },
  { name:'Computer Vision',                             code:'CA7D7', mcaYear:3, semester:5, type:'elective'   },
  { name:'Business Intelligence',                       code:'CA7D8', mcaYear:3, semester:5, type:'elective'   },

  // ── SEMESTER 6 ──────────────────────────────────
  { name:'Project Work Phase II',                       code:'CA750', mcaYear:3, semester:6, type:'project'    },
]

async function seed() {
  await mongoose.connect(process.env.MONGO_URI)
  console.log('Connected to MongoDB')
  await Subject.deleteMany({})
  await Subject.insertMany(SUBJECTS)
  console.log(`Seeded ${SUBJECTS.length} subjects across 6 semesters`)
  process.exit(0)
}

seed().catch(e => { console.error(e); process.exit(1) })