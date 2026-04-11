import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../App'

/* ─────────────────────────────────────────────
   TYPEWRITER HOOK
   Cycles through phrases, fading each in/out.
   No cursor shown.
───────────────────────────────────────────── */
const useTypewriter = (phrases, typingSpeed = 70, pauseMs = 2200, deleteSpeed = 40) => {
  const [displayed, setDisplayed] = useState('')
  const [phraseIdx, setPhraseIdx] = useState(0)
  const [phase, setPhase]         = useState('typing')  // 'typing' | 'pausing' | 'deleting'

  useEffect(() => {
    const current = phrases[phraseIdx]
    let timeout

    if (phase === 'typing') {
      if (displayed.length < current.length) {
        timeout = setTimeout(() => {
          setDisplayed(current.slice(0, displayed.length + 1))
        }, typingSpeed)
      } else {
        timeout = setTimeout(() => setPhase('deleting'), pauseMs)
      }
    } else if (phase === 'deleting') {
      if (displayed.length > 0) {
        timeout = setTimeout(() => {
          setDisplayed(displayed.slice(0, -1))
        }, deleteSpeed)
      } else {
        setPhraseIdx(i => (i + 1) % phrases.length)
        setPhase('typing')
      }
    }

    return () => clearTimeout(timeout)
  }, [displayed, phase, phraseIdx, phrases, typingSpeed, pauseMs, deleteSpeed])

  return displayed
}

/* ─────────────────────────────────────────────
   SHARED INPUT
───────────────────────────────────────────── */
const AuthInput = ({ label, type = 'text', value, onChange, placeholder, error, icon }) => (
  <div className="lp-field">
    <label className="lp-field-label">{label}</label>
    <div className="lp-input-wrap">
      <span className="lp-input-icon">{icon}</span>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={`lp-input ${error ? 'lp-input-error' : ''}`}
        autoComplete={type === 'password' ? 'current-password' : type === 'email' ? 'email' : 'name'}
      />
    </div>
    {error && <span className="lp-field-error">⚠ {error}</span>}
  </div>
)

const IcoEmail = () => <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/></svg>
const IcoLock = () => <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"/></svg>
const IcoUser = () => <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"/></svg>

/* ─────────────────────────────────────────────
   LOGIN FORM
───────────────────────────────────────────── */
const LoginForm = ({ onSwitch }) => {
  const { login } = useAuth()
  const navigate  = useNavigate()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors]     = useState({})
  const [loading, setLoading]   = useState(false)
  const [apiError, setApiError] = useState('')

  const validate = () => {
    const e = {}
    if (!email)                           e.email    = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(email)) e.email    = 'Enter a valid email'
    if (!password)                        e.password = 'Password is required'
    return e
  }

  const handleSubmit = async ev => {
    ev.preventDefault()
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setErrors({}); setApiError(''); setLoading(true)
    try {
      await login({ email, password })
      navigate('/', { replace: true })
    } catch (err) {
      setApiError(err?.response?.data?.message || 'Invalid email or password')
    } finally { setLoading(false) }
  }

  return (
    <form className="modal-form" onSubmit={handleSubmit} noValidate>
      <div className="modal-form-header">
        <h2 className="modal-form-title">Welcome back</h2>
        <p className="modal-form-sub">Sign in to your CreditSense account</p>
      </div>
      {apiError && <div className="modal-api-error">{apiError}</div>}
      <div className="modal-fields">
        <AuthInput label="Email address" type="email" value={email} onChange={setEmail}
          placeholder="you@example.com" error={errors.email} icon={<IcoEmail />} />
        <AuthInput label="Password" type="password" value={password} onChange={setPassword}
          placeholder="Enter your password" error={errors.password} icon={<IcoLock />} />
      </div>
      <button type="submit" className="modal-submit-btn" disabled={loading}>
        {loading ? <><span className="modal-spinner" /> Signing in…</> : 'Sign In →'}
      </button>
      <p className="modal-switch-text">
        No account?{' '}
        <button type="button" className="modal-switch-link" onClick={onSwitch}>Register free</button>
      </p>
    </form>
  )
}

/* ─────────────────────────────────────────────
   REGISTER FORM
───────────────────────────────────────────── */
const RegisterForm = ({ onSwitch }) => {
  const { register } = useAuth()
  const navigate     = useNavigate()
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
    else if (password.length < 6)          e.password = 'Min. 6 characters'
    if (!confirm)                          e.confirm  = 'Please confirm your password'
    else if (confirm !== password)         e.confirm  = 'Passwords do not match'
    return e
  }

  const strength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3
  const sLabel   = ['', 'Weak', 'Good', 'Strong']
  const sColor   = ['', '#ff4d6a', '#ffb020', '#00e5a0']

  const handleSubmit = async ev => {
    ev.preventDefault()
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setErrors({}); setApiError(''); setLoading(true)
    try {
      await register({ name, email, password })
      navigate('/', { replace: true })
    } catch (err) {
      setApiError(err?.response?.data?.message || 'Registration failed. Try again.')
    } finally { setLoading(false) }
  }

  return (
    <form className="modal-form" onSubmit={handleSubmit} noValidate>
      <div className="modal-form-header">
        <h2 className="modal-form-title">Create account</h2>
        <p className="modal-form-sub">Start assessing credit applications today</p>
      </div>
      {apiError && <div className="modal-api-error">{apiError}</div>}
      <div className="modal-fields">
        <AuthInput label="Full name" value={name} onChange={setName}
          placeholder="John Doe" error={errors.name} icon={<IcoUser />} />
        <AuthInput label="Email address" type="email" value={email} onChange={setEmail}
          placeholder="you@example.com" error={errors.email} icon={<IcoEmail />} />
        <AuthInput label="Password" type="password" value={password} onChange={setPassword}
          placeholder="Min. 6 characters" error={errors.password} icon={<IcoLock />} />
        {password.length > 0 && (
          <div className="modal-strength">
            <div className="modal-strength-bars">
              {[1,2,3].map(i => (
                <div key={i} className="modal-strength-bar"
                  style={{ background: i <= strength ? sColor[strength] : 'var(--border)' }} />
              ))}
            </div>
            <span style={{ fontSize: 11, fontWeight: 600, color: sColor[strength] }}>{sLabel[strength]}</span>
          </div>
        )}
        <AuthInput label="Confirm password" type="password" value={confirm} onChange={setConfirm}
          placeholder="Re-enter password" error={errors.confirm} icon={<IcoLock />} />
      </div>
      <button type="submit" className="modal-submit-btn" disabled={loading}>
        {loading ? <><span className="modal-spinner" /> Creating account…</> : 'Create Account →'}
      </button>
      <p className="modal-switch-text">
        Already registered?{' '}
        <button type="button" className="modal-switch-link" onClick={onSwitch}>Sign in</button>
      </p>
    </form>
  )
}

/* ─────────────────────────────────────────────
   AUTH MODAL
───────────────────────────────────────────── */
const AuthModal = ({ initialMode, onClose }) => {
  const [mode, setMode] = useState(initialMode || 'login')

  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal-box animate-scale-in">
        <button className="modal-close-btn" onClick={onClose} aria-label="Close">
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M4 4l12 12M16 4L4 16" strokeLinecap="round"/>
          </svg>
        </button>

        <div className="modal-logo">
          <svg viewBox="0 0 28 28" fill="none">
            <rect width="28" height="28" rx="7" fill="url(#mG)"/>
            <path d="M7 19l4-8 3 5 3-4 4 7" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            <defs><linearGradient id="mG" x1="0" y1="0" x2="28" y2="28"><stop offset="0%" stopColor="#3d6aff"/><stop offset="100%" stopColor="#00d4ff"/></linearGradient></defs>
          </svg>
          <span>CreditSense</span>
        </div>

        <div className="modal-tabs">
          {['login','register'].map(m => (
            <button key={m} type="button"
              className={`modal-tab ${mode === m ? 'modal-tab-active' : ''}`}
              onClick={() => setMode(m)}>
              {m === 'login' ? 'Sign In' : 'Register'}
            </button>
          ))}
          <div className="modal-tab-slider" style={{ transform: mode === 'register' ? 'translateX(100%)' : 'translateX(0)' }} />
        </div>

        {mode === 'login'
          ? <LoginForm    key="login"    onSwitch={() => setMode('register')} />
          : <RegisterForm key="register" onSwitch={() => setMode('login')} />
        }
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   CONTACT FORM
───────────────────────────────────────────── */
const ContactForm = () => {
  const [form, setForm]       = useState({ name:'', email:'', subject:'', message:'' })
  const [sent, setSent]       = useState(false)
  const [sending, setSending] = useState(false)
  const [errors, setErrors]   = useState({})

  const validate = () => {
    const e = {}
    if (!form.name.trim())    e.name    = 'Name is required'
    if (!form.email.trim())   e.email   = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email'
    if (!form.subject.trim()) e.subject = 'Subject is required'
    if (!form.message.trim()) e.message = 'Message is required'
    return e
  }

  const handleSubmit = async e => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSending(true)
    await new Promise(r => setTimeout(r, 1200))
    setSending(false); setSent(true)
  }

  if (sent) return (
    <div className="contact-success">
      <div className="contact-success-icon">✓</div>
      <h3>Message sent!</h3>
      <p>We'll get back to you within 24 hours.</p>
      <button className="contact-reset-btn" onClick={() => { setSent(false); setForm({ name:'', email:'', subject:'', message:'' }) }}>
        Send another
      </button>
    </div>
  )

  const f = (k, v) => setForm(p => ({...p, [k]: v}))

  return (
    <form className="contact-form" onSubmit={handleSubmit} noValidate>
      <div className="contact-row">
        <div className="contact-field">
          <label>Your Name</label>
          <input value={form.name} onChange={e => f('name', e.target.value)} placeholder="John Doe" className={errors.name ? 'contact-input-err':''} />
          {errors.name && <span className="contact-err">{errors.name}</span>}
        </div>
        <div className="contact-field">
          <label>Email</label>
          <input type="email" value={form.email} onChange={e => f('email', e.target.value)} placeholder="you@example.com" className={errors.email ? 'contact-input-err':''} />
          {errors.email && <span className="contact-err">{errors.email}</span>}
        </div>
      </div>
      <div className="contact-field">
        <label>Subject</label>
        <input value={form.subject} onChange={e => f('subject', e.target.value)} placeholder="How can we help?" className={errors.subject ? 'contact-input-err':''} />
        {errors.subject && <span className="contact-err">{errors.subject}</span>}
      </div>
      <div className="contact-field">
        <label>Message</label>
        <textarea rows={4} value={form.message} onChange={e => f('message', e.target.value)} placeholder="Describe your issue or question in detail…" className={errors.message ? 'contact-input-err':''} />
        {errors.message && <span className="contact-err">{errors.message}</span>}
      </div>
      <button type="submit" className="contact-submit-btn" disabled={sending}>
        {sending ? <><span className="modal-spinner" /> Sending…</> : 'Send Message →'}
      </button>
    </form>
  )
}

/* ─────────────────────────────────────────────
   MAIN LANDING PAGE
───────────────────────────────────────────── */
const FEATURES = [
  { icon:'📊', title:'350-Point Scorecard', desc:'Seven weighted sections — family, residence, office, banking, bureau, health, caution — every variable mapped precisely.' },
  { icon:'🤖', title:'ML Default Prediction', desc:'Your trained model (.pkl) runs in real-time alongside the scorecard to give a live default probability for every application.' },
  { icon:'⚡', title:'Instant STP Decisions', desc:'Auto-approval at ≥80% score means zero manual intervention for clean profiles. Four approval levels computed in milliseconds.' },
  { icon:'🔒', title:'Secure & Auditable', desc:'Every assessment stored in MongoDB with full field-level breakdown — complete audit trail for compliance and review.' },
  { icon:'🌗', title:'Light & Dark Mode', desc:'Professional UI with a complete dark mode and light mode built on a CSS variable design system.' },
  { icon:'📱', title:'Fully Responsive', desc:'Works on desktop, tablet, and mobile. The 7-step guided form adapts gracefully to any screen size.' },
]

const HOW_IT_WORKS = [
  { num:'01', title:'Fill the 7-Step Form', desc:'Applicant details are collected across seven structured sections — family, residence, employment, banking, credit bureau, health, and compliance.' },
  { num:'02', title:'Scorecard + ML Analysis', desc:'Your 350-point scorecard runs instantly. Simultaneously, the trained ML model predicts default probability from all 51 variables.' },
  { num:'03', title:'Instant Decision', desc:'Get STP, L1, L2, or Reject in seconds — with a full field-level breakdown showing exactly where points were gained or lost.' },
]

const TESTIMONIALS = [
  { quote: 'CreditSense reduced our average loan appraisal time from 3 days to under 20 minutes. The STP rate on clean profiles is remarkable.', name: 'Arjun Mehta', role: 'Head of Retail Credit, Finova Bank', initials: 'AM', color: '#3d6aff' },
  { quote: 'The scorecard logic is transparent and explainable — exactly what our compliance team needed. The MongoDB audit trail is a huge bonus.', name: 'Priya Nair', role: 'Risk Analytics Lead, LendRight', initials: 'PN', color: '#00e5a0' },
  { quote: 'Plugging in our own .pkl model was seamless. Within an hour we had our custom default predictor running alongside the scorecard.', name: 'Rohit Sharma', role: 'Data Science Manager, CreditFlow', initials: 'RS', color: '#ffb020' },
]

const TYPEWRITER_PHRASES = [
  'Smart Approvals.',
  'AI-Powered Insights.',
  'Real-Time Analytics.',
]

const AuthPage = () => {
  const { theme, toggleTheme } = useTheme()
  const [modal, setModal]       = useState(null)
  const [scrolled, setScrolled] = useState(false)
  const contactRef = useRef(null)
  const typedWord  = useTypewriter(TYPEWRITER_PHRASES, 65, 2000, 38)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const scrollToContact = e => {
    e.preventDefault()
    contactRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="lp-root">

      {/* ══ NAVBAR ══════════════════════════════════════════ */}
      <header className={`lp-nav ${scrolled ? 'lp-nav-scrolled' : ''}`}>
        <div className="lp-nav-inner">

          <div className="lp-nav-brand">
            <svg viewBox="0 0 32 32" fill="none" className="lp-nav-logo">
              <rect width="32" height="32" rx="8" fill="url(#nG)"/>
              <path d="M8 22l5-9 4 6 3-4 4 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <defs><linearGradient id="nG" x1="0" y1="0" x2="32" y2="32"><stop offset="0%" stopColor="#3d6aff"/><stop offset="100%" stopColor="#00d4ff"/></linearGradient></defs>
            </svg>
            <span className="lp-nav-name">CreditSense</span>
          </div>

          <nav className="lp-nav-links">
            <a href="#about"    className="lp-nav-link">About</a>
            <a href="#features" className="lp-nav-link">Features</a>
            <a href="#contact"  className="lp-nav-link" onClick={scrollToContact}>Contact Us</a>
          </nav>

          <div className="lp-nav-actions">
            <button className="lp-theme-btn" onClick={toggleTheme} title="Toggle theme">
              {theme === 'dark'
                ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>
                : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
              }
            </button>
            <button className="lp-btn-ghost"   onClick={() => setModal('login')}>Sign In</button>
            <button className="lp-btn-primary"  onClick={() => setModal('register')}>Get Started</button>
          </div>
        </div>
      </header>

      {/* ══ HERO ════════════════════════════════════════════ */}
      <section className="lp-hero" id="about">
        <div className="lp-hero-blobs" aria-hidden="true">
          <div className="lp-blob lp-blob-1" />
          <div className="lp-blob lp-blob-2" />
        </div>

        <div className="lp-hero-inner">
          <div className="lp-hero-badge">
            <span className="lp-badge-dot" />
            V2.4 AI Risk Engine Live
          </div>

          {/* ── Typewriter headline ── */}
          <h1 className="lp-hero-h1">
            <span className="hero-main">
              Precision lending. Intelligent decisions.
            </span>
            <br />
            <span className="lp-typewriter-text">
              {typedWord || '\u00A0'}
            </span>
          </h1>

          <p className="lp-hero-p">
            Deploy high-performance credit models in minutes. Our proprietary 350-point scorecard
            uses predictive ML to automate risk assessment for modern lenders — faster, smarter, and fully auditable.
          </p>

          <div className="lp-hero-btns">
            <button className="lp-btn-primary lp-btn-lg" onClick={() => setModal('register')}>Start Free →</button>
            <button className="lp-btn-ghost lp-btn-lg"  onClick={scrollToContact}>Talk to Us</button>
          </div>

          {/* ── Stats strip ── */}
          <div className="lp-stats-row">
            {[{v:'350',l:'Scorecard Points'},{v:'51',l:'Risk Variables'},{v:'4',l:'Approval Levels'},{v:'7',l:'Form Sections'}].map(s => (
              <div key={s.l} className="lp-stat">
                <div className="lp-stat-v">{s.v}</div>
                <div className="lp-stat-l">{s.l}</div>
              </div>
            ))}
          </div>

          {/* ── Social proof ── */}
          <div className="lp-proof-strip">
            <div className="lp-proof-avatars">
              {[{i:'AM',c:'#3d6aff'},{i:'PN',c:'#00e5a0'},{i:'RS',c:'#ffb020'},{i:'DK',c:'#a855f7'}].map(a => (
                <div key={a.i} className="lp-proof-avatar" style={{ background: a.c }}>{a.i}</div>
              ))}
            </div>
            <span className="lp-proof-stars">★★★★★</span>
            <span>Trusted by 50+ lending teams</span>
          </div>
        </div>
      </section>

      {/* ══ FEATURES ════════════════════════════════════════ */}
      <section className="lp-features" id="features">
        <div className="lp-section-wrap">
          <div className="lp-section-hd">
            <span className="lp-section-tag">Platform Features</span>
            <h2 className="lp-section-h2">Everything you need for credit risk assessment</h2>
            <p className="lp-section-sub">A complete end-to-end solution — from data collection to ML-powered decision.</p>
          </div>
          <div className="lp-features-grid">
            {FEATURES.map(f => (
              <div key={f.title} className="lp-feat-card">
                <div className="lp-feat-icon">{f.icon}</div>
                <h3 className="lp-feat-title">{f.title}</h3>
                <p className="lp-feat-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ════════════════════════════════════ */}
      <section className="lp-how">
        <div className="lp-how-inner">
          <div className="lp-section-hd">
            <span className="lp-section-tag">How It Works</span>
            <h2 className="lp-section-h2">From application to decision in three steps</h2>
            <p className="lp-section-sub">No black boxes. Every score is explainable, every decision is traceable.</p>
          </div>
          <div className="lp-how-steps">
            {HOW_IT_WORKS.map(s => (
              <div key={s.num} className="lp-how-step">
                <div className="lp-how-num">{s.num}</div>
                <h3 className="lp-how-step-title">{s.title}</h3>
                <p className="lp-how-step-desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ TESTIMONIALS ════════════════════════════════════ */}
      <section className="lp-testimonials">
        <div className="lp-testimonials-inner">
          <div className="lp-section-hd">
            <span className="lp-section-tag">What Teams Say</span>
            <h2 className="lp-section-h2">Trusted by credit risk professionals</h2>
          </div>
          <div className="lp-testimonials-grid">
            {TESTIMONIALS.map(t => (
              <div key={t.name} className="lp-testimonial-card">
                <div className="lp-testimonial-stars">★★★★★</div>
                <p className="lp-testimonial-quote">"{t.quote}"</p>
                <div className="lp-testimonial-author">
                  <div className="lp-testimonial-avatar" style={{ background: t.color }}>{t.initials}</div>
                  <div>
                    <div className="lp-testimonial-name">{t.name}</div>
                    <div className="lp-testimonial-role">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA STRIP ═══════════════════════════════════════ */}
      <section className="lp-cta-strip">
        <div className="lp-cta-inner">
          <h2 className="lp-cta-h2">Ready to assess your first application?</h2>
          <p className="lp-cta-p">Create a free account and run a complete credit assessment in under 5 minutes.</p>
          <button className="lp-btn-primary lp-btn-lg" onClick={() => setModal('register')}>Create Free Account →</button>
        </div>
      </section>

      {/* ══ FOOTER ══════════════════════════════════════════ */}
      <footer className="lp-footer" id="contact" ref={contactRef}>
        <div className="lp-footer-grid">

          {/* Contact form */}
          <div className="lp-footer-contact-col">
            <span className="lp-section-tag" style={{marginBottom:12}}>Contact Us</span>
            <h2 className="lp-footer-h2">Get in touch</h2>
            <p className="lp-footer-contact-p">Have a question or issue? Fill out the form and we'll respond within 24 hours.</p>
            <ContactForm />
          </div>

          {/* Info columns */}
          <div className="lp-footer-info-cols">
            {/* Brand */}
            <div className="lp-footer-brand-col">
              <div className="lp-footer-brand-row">
                <svg viewBox="0 0 28 28" fill="none" style={{width:28,height:28}}>
                  <rect width="28" height="28" rx="7" fill="url(#fG)"/>
                  <path d="M7 19l4-8 3 5 3-4 4 7" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  <defs><linearGradient id="fG" x1="0" y1="0" x2="28" y2="28"><stop offset="0%" stopColor="#3d6aff"/><stop offset="100%" stopColor="#00d4ff"/></linearGradient></defs>
                </svg>
                <span className="lp-footer-brand-name">CreditSense</span>
              </div>
              <p className="lp-footer-brand-desc">ML-powered retail credit scorecard platform built for modern lenders who demand speed, accuracy, and transparency.</p>
            </div>

            {/* Nav links */}
            <div className="lp-footer-col">
              <div className="lp-footer-col-hd">Platform</div>
              <a href="#about"    className="lp-footer-lnk">About</a>
              <a href="#features" className="lp-footer-lnk">Features</a>
              <button className="lp-footer-lnk lp-footer-lnk-btn" onClick={() => setModal('login')}>Sign In</button>
              <button className="lp-footer-lnk lp-footer-lnk-btn" onClick={() => setModal('register')}>Register</button>
            </div>

            {/* Socials */}
            <div className="lp-footer-col">
              <div className="lp-footer-col-hd">Connect</div>
              <div className="lp-socials">
                <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="lp-social" title="LinkedIn">
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </a>
                <a href="https://instagram.com" target="_blank" rel="noreferrer" className="lp-social" title="Instagram">
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                </a>
                <a href="https://youtube.com" target="_blank" rel="noreferrer" className="lp-social" title="YouTube">
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.495 6.205a3.007 3.007 0 00-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 00.527 6.205a31.247 31.247 0 00-.522 5.805 31.247 31.247 0 00.522 5.783 3.007 3.007 0 002.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 002.088-2.088 31.247 31.247 0 00.5-5.783 31.247 31.247 0 00-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/></svg>
                </a>
                <a href="mailto:contact@creditsense.io" className="lp-social" title="Email">
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 010 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"/></svg>
                </a>
                <a href="https://github.com" target="_blank" rel="noreferrer" className="lp-social" title="GitHub">
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="lp-footer-bottom">
          <p>© {new Date().getFullYear()} CreditSense. All rights reserved.</p>
          <div className="lp-footer-bottom-links">
            <a href="#">Privacy Policy</a>
            <span>·</span>
            <a href="#">Terms of Service</a>
            <span>·</span>
            <a href="#">Cookie Policy</a>
          </div>
        </div>
      </footer>

      {/* ══ AUTH MODAL ══════════════════════════════════════ */}
      {modal && <AuthModal initialMode={modal} onClose={() => setModal(null)} />}
    </div>
  )
}

export default AuthPage