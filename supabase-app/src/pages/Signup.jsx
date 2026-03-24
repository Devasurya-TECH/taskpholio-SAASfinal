import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { RiStackLine, RiMailLine, RiLockPasswordLine, RiUserLine, RiLoginBoxLine } from 'react-icons/ri'
import { useAuth } from '../context/AuthContext'
import '../styles/auth.css'

export default function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState('ceo')
  const [team, setTeam] = useState('Technical Team')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    setLoading(true)
    try {
      const { error: err } = await signUp(email, password, { full_name: fullName, role, team })
      if (err) { setError(err.message); return }
      navigate('/')
    } catch (err) {
      console.error('Signup exception:', err)
      setError(err instanceof Error ? err.message : 'An unexpected network error occurred.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        
        <div className="auth-left">
          <div className="auth-left-logo">
            <RiStackLine size={24} color="var(--accent)" />
            Taskpholio
          </div>
          <div className="auth-left-tagline">
            Build your<br/>workspace <span>today</span>.
          </div>
          <div className="auth-left-features">
            {['Role-based access control', 'Real-time task updates', 'Team collaboration tools', 'Secure & private workspace'].map(f => (
              <div key={f} className="auth-feature">
                <div className="auth-feature-dot" /> {f}
              </div>
            ))}
          </div>
        </div>

        <div className="auth-right" style={{ padding: '32px 40px' }}>
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Set up your workspace credentials</p>

          {error && <div className="auth-error">{error}</div>}

          <form className="auth-form" onSubmit={handleSubmit} style={{ gap: 14 }}>
            <div className="auth-form-group">
              <label className="input-label"><RiUserLine size={13} /> Full Name</label>
              <input className="input-field" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Jane Doe" required />
            </div>

            <div className="auth-form-group">
              <label className="input-label"><RiMailLine size={13} /> Email address</label>
              <input className="input-field" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="jane@company.com" required />
            </div>

            <div className="auth-form-group">
              <label className="input-label"><RiLockPasswordLine size={13} /> Password</label>
              <input className="input-field" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 6 characters" minLength={6} required />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="auth-form-group">
                <label className="input-label">Role</label>
                <select className="input-field" value={role} onChange={e => setRole(e.target.value)}>
                  <option value="ceo">CEO</option>
                  <option value="cto">CTO</option>
                  <option value="member">Member</option>
                </select>
              </div>
              <div className="auth-form-group">
                <label className="input-label">Initial Team</label>
                <select className="input-field" value={team} onChange={e => setTeam(e.target.value)}>
                  <option value="Technical Team">Technical</option>
                  <option value="Cybersecurity Team">Cybersecurity</option>
                  <option value="Social Media Team">Social Media</option>
                </select>
              </div>
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading} style={{ marginTop: 4 }}>
              {loading ? 'Creating...' : 'Create Account'}
            </button>
          </form>

          <p className="auth-footer" style={{ marginTop: 18 }}>
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
