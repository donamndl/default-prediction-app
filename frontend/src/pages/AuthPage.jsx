import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../App'

/* ─── Input Field ──────────────────────────────────────────────────── */
const AuthInput = ({ label, type = 'text', value, onChange, placeholder, error, icon }) => (
  <div className="auth-field">
    <label className="auth-field-label">{label}</label>
    <div className="auth-input-wrap">
      <span className="auth-input-icon">{icon}</span>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={`auth-input ${error ? 'auth-input-error' : ''}`}
        autoComplete={type === 'password' ? 'current-password' : type === 'email' ? 'email' : 'name'}
      />
    </div>
    {error && <span className="auth-field-error">{error}</span>}
  </div>
)

/* ─── Login Form ───────────────────────────────────────────────────── */
const LoginForm = ({ onSwitch }) => {
  const { login } = useAuth()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors]     = useState({})
  const [loading, setLoading]   = useState(false)
  const [apiError, setApiError] = useState('')

  const validate = () => {
    const e = {}
    if (!email)                        e.email    = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Enter a valid email'
    if (!password)                     e.password = 'Password is required'
    return e
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setErrors({})
    setApiError('')
    setLoading(true)
    try {
      await login({ email, password })
      // AuthContext updates user → App re-renders → redirect handled by route
    } catch (err) {
      setApiError(err?.response?.data?.message || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <div className="auth-form-header">
        <h2 className="auth-form-title">Welcome back</h2>
        <p className="auth-form-subtitle">Sign in to your CreditSense account</p>
      </div>

      {apiError && (
        <div className="auth-api-error">
          <svg viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.2"/><path d="M8 5v4M8 10.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          {apiError}
        </div>
      )}

      <div className="auth-fields">
        <AuthInput
          label="Email address"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="you@example.com"
          error={errors.email}
          icon={
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
            </svg>
          }
        />
        <AuthInput
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="Enter your password"
          error={errors.password}
          icon={
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"/>
            </svg>
          }
        />
      </div>

      <button type="submit" className="auth-submit-btn" disabled={loading}>
        {loading ? <><span className="auth-spinner" /> Signing in...</> : 'Sign In →'}
      </button>

      <p className="auth-switch-text">
        Don't have an account?{' '}
        <button type="button" className="auth-switch-link" onClick={onSwitch}>
          Create one
        </button>
      </p>
    </form>
  )
}

/* ─── Register Form ────────────────────────────────────────────────── */
const RegisterForm = ({ onSwitch }) => {
  const { register } = useAuth()
  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [errors, setErrors]     = useState({})
  const [loading, setLoading]   = useState(false)
  const [apiError, setApiError] = useState('')

  const validate = () => {
    const e = {}
    if (!name.trim())                      e.name     = 'Full name is required'
    if (!email)                            e.email    = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(email))  e.email    = 'Enter a valid email'
    if (!password)                         e.password = 'Password is required'
    else if (password.length < 6)          e.password = 'Password must be at least 6 characters'
    if (!confirm)                          e.confirm  = 'Please confirm your password'
    else if (confirm !== password)         e.confirm  = 'Passwords do not match'
    return e
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setErrors({})
    setApiError('')
    setLoading(true)
    try {
      await register({ name, email, password })
    } catch (err) {
      setApiError(err?.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const strength = password.length === 0 ? 0
    : password.length < 6  ? 1
    : password.length < 10 ? 2
    : 3

  const strengthLabel = ['', 'Weak', 'Good', 'Strong']
  const strengthColor = ['', '#ff4d6a', '#ffb020', '#00e5a0']

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <div className="auth-form-header">
        <h2 className="auth-form-title">Create account</h2>
        <p className="auth-form-subtitle">Start assessing credit applications today</p>
      </div>

      {apiError && (
        <div className="auth-api-error">
          <svg viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.2"/><path d="M8 5v4M8 10.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          {apiError}
        </div>
      )}

      <div className="auth-fields">
        <AuthInput
          label="Full name"
          value={name}
          onChange={setName}
          placeholder="John Doe"
          error={errors.name}
          icon={
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"/>
            </svg>
          }
        />
        <AuthInput
          label="Email address"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="you@example.com"
          error={errors.email}
          icon={
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
            </svg>
          }
        />
        <AuthInput
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="Min. 6 characters"
          error={errors.password}
          icon={
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"/>
            </svg>
          }
        />

        {/* Password strength bar */}
        {password.length > 0 && (
          <div className="auth-strength">
            <div className="auth-strength-bars">
              {[1, 2, 3].map(i => (
                <div
                  key={i}
                  className="auth-strength-bar"
                  style={{ background: i <= strength ? strengthColor[strength] : 'var(--border)' }}
                />
              ))}
            </div>
            <span className="auth-strength-label" style={{ color: strengthColor[strength] }}>
              {strengthLabel[strength]}
            </span>
          </div>
        )}

        <AuthInput
          label="Confirm password"
          type="password"
          value={confirm}
          onChange={setConfirm}
          placeholder="Re-enter your password"
          error={errors.confirm}
          icon={
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
            </svg>
          }
        />
      </div>

      <button type="submit" className="auth-submit-btn" disabled={loading}>
        {loading ? <><span className="auth-spinner" /> Creating account...</> : 'Create Account →'}
      </button>

      <p className="auth-switch-text">
        Already have an account?{' '}
        <button type="button" className="auth-switch-link" onClick={onSwitch}>
          Sign in
        </button>
      </p>
    </form>
  )
}

/* ─── Main AuthPage ────────────────────────────────────────────────── */
const AuthPage = () => {
  const [mode, setMode] = useState('login')   // 'login' | 'register'
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="auth-page">

      {/* Theme toggle top-right */}
      <button className="auth-theme-btn" onClick={toggleTheme} title="Toggle theme">
        {theme === 'dark' ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <circle cx="12" cy="12" r="4"/>
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
          </svg>
        )}
      </button>

      {/* Left panel — branding */}
      <div className="auth-left">
        <div className="auth-left-content">
          <div className="auth-brand">
            <div className="auth-brand-logo">
              <svg viewBox="0 0 40 40" fill="none">
                <rect width="40" height="40" rx="10" fill="url(#authLogoGrad)"/>
                <path d="M10 28l7-12 5 7 4-5 6 10" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                <defs>
                  <linearGradient id="authLogoGrad" x1="0" y1="0" x2="40" y2="40">
                    <stop offset="0%" stopColor="#3d6aff"/>
                    <stop offset="100%" stopColor="#00d4ff"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div>
              <div className="auth-brand-name">CreditSense</div>
              <div className="auth-brand-tag">Retail Scorecard Platform</div>
            </div>
          </div>

          <div className="auth-hero">
            <h1 className="auth-hero-title">
              Smart credit<br />
              decisions,<br />
              <span className="auth-hero-accent">faster.</span>
            </h1>
            <p className="auth-hero-desc">
              ML-powered credit risk assessment combining a 350-point scorecard with predictive analytics — built for modern lenders.
            </p>
          </div>

          <div className="auth-stats">
            {[
              { value: '350', label: 'Scorecard Points' },
              { value: '51',  label: 'Risk Variables'   },
              { value: '4',   label: 'Approval Levels'  },
            ].map(s => (
              <div key={s.label} className="auth-stat">
                <div className="auth-stat-value">{s.value}</div>
                <div className="auth-stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Decorative grid lines */}
          <div className="auth-grid-decoration" aria-hidden="true">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="auth-grid-line" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="auth-right">
        <div className="auth-card">

          {/* Tab switcher */}
          <div className="auth-tabs">
            <button
              type="button"
              className={`auth-tab ${mode === 'login' ? 'auth-tab-active' : ''}`}
              onClick={() => setMode('login')}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`auth-tab ${mode === 'register' ? 'auth-tab-active' : ''}`}
              onClick={() => setMode('register')}
            >
              Register
            </button>
            <div
              className="auth-tab-indicator"
              style={{ transform: mode === 'register' ? 'translateX(100%)' : 'translateX(0)' }}
            />
          </div>

          {/* Form */}
          <div className="auth-form-wrap">
            {mode === 'login'
              ? <LoginForm    key="login"    onSwitch={() => setMode('register')} />
              : <RegisterForm key="register" onSwitch={() => setMode('login')}    />
            }
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthPage