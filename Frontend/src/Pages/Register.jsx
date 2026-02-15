import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { FiMail, FiLock, FiUser, FiHome } from 'react-icons/fi'
import './Login.css'

const ROLES = [
  { id: 'tenant', label: 'Tenant', icon: FiUser, desc: 'Pay rent, raise tickets, view agreements' },
  { id: 'landlord', label: 'Landlord', icon: FiHome, desc: 'Manage properties, tenants & payments' }
]

export default function Register() {
  const navigate = useNavigate()
  const { user, register } = useAuth()
  useEffect(() => {
    if (user) {
      navigate(user.role === 'tenant' ? '/tenant-dashboard' : '/landlord-dashboard', { replace: true })
    }
  }, [user, navigate])
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('tenant')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!name.trim()) {
      setError('Please enter your name')
      return
    }
    if (!email.trim()) {
      setError('Please enter your email')
      return
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    setSubmitting(true)
    try {
      const user = await register(name.trim(), email.trim(), password, role)
      if (user.role === 'tenant') navigate('/tenant-dashboard', { replace: true })
      else navigate('/landlord-dashboard', { replace: true })
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <h1>Create account</h1>
          <p className="login-sub">Join RentEase as a tenant or landlord</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-field">
            <label htmlFor="name">Name</label>
            <div className="input-wrap">
              <FiUser className="input-icon" />
              <input
                id="name"
                type="text"
                className="input"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
            </div>
          </div>

          <div className="login-field">
            <label htmlFor="email">Email</label>
            <div className="input-wrap">
              <FiMail className="input-icon" />
              <input
                id="email"
                type="email"
                className="input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
          </div>

          <div className="login-field">
            <label htmlFor="password">Password (min 6 characters)</label>
            <div className="input-wrap">
              <FiLock className="input-icon" />
              <input
                id="password"
                type="password"
                className="input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>
          </div>

          <div className="login-field">
            <label>I am a</label>
            <div className="role-tabs">
              {ROLES.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  className={`role-tab ${role === r.id ? 'active' : ''}`}
                  onClick={() => setRole(r.id)}
                >
                  <r.icon className="role-icon" />
                  <span className="role-label">{r.label}</span>
                  <span className="role-desc">{r.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {error && <p className="login-error">{error}</p>}

          <button type="submit" className="btn btn-primary login-submit" disabled={submitting}>
            {submitting ? 'Creating account…' : 'Register'}
          </button>
        </form>

        <p className="login-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
