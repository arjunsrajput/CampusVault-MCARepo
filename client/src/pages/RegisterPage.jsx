import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { register } from '../api/index.js'

const parseRollNumber = (roll) => {
  if (!roll || roll.length !== 9) return null
  const dept    = roll.substring(1, 4)
  const admYear = roll.substring(4, 6)
  const rollNo  = roll.substring(6, 9)
  if (dept !== '051') return null
  const admissionYear = 2000 + parseInt(admYear)
  const now           = new Date()
  const month         = now.getMonth() + 1
  const academicYear  = month >= 8 ? now.getFullYear() : now.getFullYear() - 1
  const currentYear   = Math.min(3, Math.max(1, academicYear - admissionYear + 1))
  const batch         = `${admissionYear}-${String(admissionYear + 3).slice(2)}`
  return { admissionYear, currentYear, batch, rollNo }
}

export default function RegisterPage() {
  const [form, setForm] = useState({ name:'', rollNumber:'', password:'' })
  const [parsed, setParsed] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const set = (k, v) => setForm(p => ({...p, [k]: v}))
  const generatedEmail = form.rollNumber.length === 9 ? `${form.rollNumber}@nitt.edu` : ''

  const handleRollChange = (v) => {
    const clean = v.replace(/\D/g, '')
    set('rollNumber', clean)
    if (clean.length === 9) {
      const result = parseRollNumber(clean)
      if (result) setParsed(result)
      else { setParsed(null); toast.error('Invalid roll number or not an MCA student') }
    } else {
      setParsed(null)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!parsed) return toast.error('Please enter a valid 9-digit roll number')
    setLoading(true)
    try {
      const res = await register({
        name:        form.name,
        rollNumber:  form.rollNumber,
        password:    form.password,
        batch:       parsed.batch,
        currentYear: parsed.currentYear
      })
      toast.success(res.data.message || 'Account created. Please verify your email.')
      navigate('/login', {
        state: {
          pendingEmail: generatedEmail,
          notice: 'Check your email and verify your account before logging in.'
        }
      })
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed')
    } finally { setLoading(false) }
  }

  return (
    <div style={{
      minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
      background:'var(--bg)',
      backgroundImage:'radial-gradient(ellipse at 40% 70%, rgba(6,182,212,0.07) 0%, transparent 60%)'
    }}>
      <div style={{width:'100%', maxWidth:440, padding:'0 24px'}}>
        <div style={{marginBottom:32, textAlign:'center'}}>
          <h1 style={{fontSize:28, fontWeight:800, marginBottom:8, letterSpacing:'-0.02em'}}>Create account</h1>
          <p style={{color:'var(--text2)', fontSize:14}}>Join the MCA Central Repository</p>
        </div>

        <div className="card" style={{padding:'28px 24px'}}>
          <form onSubmit={handleSubmit} style={{display:'flex', flexDirection:'column', gap:16}}>

            {/* 1. Full Name */}
            <div className="form-group">
              <label className="form-label">Full name</label>
              <input placeholder="Arjun Singh Rajput" value={form.name}
                onChange={e => set('name', e.target.value)} required />
            </div>

            {/* 2. Roll Number */}
            <div className="form-group">
              <label className="form-label">Roll number</label>
              <input
                placeholder="e.g. 205124019"
                value={form.rollNumber}
                onChange={e => handleRollChange(e.target.value)}
                maxLength={9}
                required
              />
              <p style={{fontSize:12, color:'var(--text3)', marginTop:5}}>
              
              </p>
            </div>

            {/* Auto detected info */}
            {parsed && (
              <div style={{
                background:'var(--green-bg)', border:'1px solid rgba(34,197,94,0.2)',
                borderRadius:'var(--radius)', padding:'12px 14px'
              }}>
                <p style={{fontSize:12, color:'var(--green)', fontWeight:600, marginBottom:8}}>✓ Detected</p>
                <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8}}>
                  <div>
                    <p style={{fontSize:11, color:'var(--text3)'}}>Batch</p>
                    <p style={{fontSize:13, fontWeight:600}}>{parsed.batch}</p>
                  </div>
                  <div>
                    <p style={{fontSize:11, color:'var(--text3)'}}>Year</p>
                    <p style={{fontSize:13, fontWeight:600}}>Year {parsed.currentYear}</p>
                  </div>
                  <div>
                    <p style={{fontSize:11, color:'var(--text3)'}}>Roll</p>
                    <p style={{fontSize:13, fontWeight:600}}>#{parsed.rollNo}</p>
                  </div>
                </div>
              </div>
            )}

            {/* 3. College Email */}
            <div className="form-group">
              <label className="form-label">College email</label>
              <input
                value={generatedEmail}
                placeholder="205124019@nitt.edu"
                disabled
              />
              <p style={{fontSize:12, color:'var(--text3)', marginTop:5}}>
                Your verification email will be sent only to your NITT webmail address.
              </p>
            </div>

            {/* 4. Password */}
            <div className="form-group">
              <label className="form-label">Password</label>
              <input type="password" placeholder="Min. 6 characters" value={form.password}
                onChange={e => set('password', e.target.value)} required />
            </div>

            <button type="submit" className="btn btn-primary"
              style={{justifyContent:'center', marginTop:4}}
              disabled={loading || !parsed}>
              {loading ? 'Creating account…' : 'Create account →'}
            </button>
          </form>
        </div>

        <p style={{marginTop:20, textAlign:'center', fontSize:14, color:'var(--text3)'}}>
          Already have an account?{' '}
          <Link to="/login" style={{color:'var(--accent2)'}}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}
