import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { login, resendVerification } from '../api/index.js'
import { useAuthStore } from '../store/authStore.js'

export default function LoginPage() {
  const location = useLocation()
  const [form, setForm] = useState({
    identifier: location.state?.pendingEmail || '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState(location.state?.pendingEmail || '')
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  const isRollNumber = (v) => /^\d{9}$/.test(v)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = {
        password: form.password,
        ...(isRollNumber(form.identifier)
          ? { rollNumber: form.identifier }
          : { email: form.identifier })
      }
      const res = await login(payload)
      setAuth(res.data.token, res.data.user)
      toast.success(`Welcome back, ${res.data.user.name.split(' ')[0]}!`)
      navigate('/')
    } catch (err) {
      if (err.response?.data?.code === 'EMAIL_NOT_VERIFIED') {
        setPendingVerificationEmail(err.response.data.email || form.identifier)
      }
      toast.error(err.response?.data?.error || 'Login failed')
    } finally { setLoading(false) }
  }

  const handleResendVerification = async () => {
    if (!pendingVerificationEmail) return
    setResending(true)
    try {
      const res = await resendVerification(pendingVerificationEmail)
      toast.success(res.data.message || 'Verification email sent.')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to resend verification email')
    } finally {
      setResending(false)
    }
  }

  return (
    <div style={{
      minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
      background:'var(--bg)',
      backgroundImage:'radial-gradient(ellipse at 60% 20%, rgba(6,182,212,0.09) 0%, transparent 65%)'
    }}>
      <div style={{width:'100%', maxWidth:400, padding:'0 24px'}}>
        <div style={{marginBottom:36, textAlign:'center'}}>
          <h1 style={{fontSize:36, fontWeight:800, marginBottom:8, letterSpacing:'-0.03em'}}>
            MCA<span style={{color:'var(--accent2)'}}>Repo</span>
          </h1>
          <p style={{color:'var(--text2)', fontSize:15}}>Sign in to access</p>
          {location.state?.notice && (
            <p style={{color:'var(--green)', fontSize:13, marginTop:10}}>
              {location.state.notice}
            </p>
          )}
        </div>

        <div className="card" style={{padding:'28px 24px'}}>
          <form onSubmit={handleSubmit} style={{display:'flex', flexDirection:'column', gap:18}}>
            <div className="form-group">
              <label className="form-label">Email or roll number</label>
              <input
                placeholder="205124019@nitt.edu or 205124019"
                value={form.identifier}
                onChange={e => setForm(p => ({...p, identifier: e.target.value}))}
                required
              />
              {/* Show which mode is active */}
              {form.identifier.length > 0 && (
                <p style={{fontSize:11, marginTop:5, color: isRollNumber(form.identifier) ? 'var(--green)' : 'var(--accent2)'}}>
                  {isRollNumber(form.identifier) ? 'Using roll number' : 'Using email'}
                </p>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input type="password" placeholder="••••••••"
                value={form.password}
                onChange={e => setForm(p => ({...p, password: e.target.value}))}
                required />
            </div>

            <button type="submit" className="btn btn-primary"
              style={{justifyContent:'center', marginTop:4}}
              disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in →'}
            </button>
          </form>
        </div>

        {pendingVerificationEmail && (
          <div className="card" style={{marginTop:14, padding:'16px 18px'}}>
            <p style={{fontSize:13, color:'var(--text2)', marginBottom:10}}>
              This account is not verified yet. Resend the verification email to <strong>{pendingVerificationEmail}</strong>.
            </p>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={handleResendVerification}
              disabled={resending}
            >
              {resending ? 'Sending…' : 'Resend verification email'}
            </button>
          </div>
        )}

        <p style={{marginTop:20, textAlign:'center', fontSize:14, color:'var(--text3)'}}>
          No account?{' '}
          <Link to="/register" style={{color:'var(--accent2)'}}>Register here</Link>
        </p>
        <p style={{marginTop:8, textAlign:'center', fontSize:14, color:'var(--text3)'}}>
          Forgot password?{' '}
          <Link to="/forgot-password" style={{color:'var(--accent2)'}}>Reset it here</Link>
        </p>
      </div>
    </div>
  )
}
