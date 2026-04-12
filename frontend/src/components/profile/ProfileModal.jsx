import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from "../../context/AuthContext"
import "./Profile.css"

/* ─────────────────────────────────────────────
   SMALL HELPERS
───────────────────────────────────────────── */

const Field = ({ label, name, type = 'text', value, onChange, error, placeholder, disabled, hint }) => (
  <div className="profile-field">
    <label className="profile-field-label">{label}</label>
    {hint && <p className="profile-field-hint">{hint}</p>}
    <input
      type={type}
      value={value}
      onChange={e => onChange(name, e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className={`profile-input ${error ? 'profile-input-err' : ''} ${disabled ? 'profile-input-disabled' : ''}`}
    />
    {error && <span className="profile-err-msg">⚠ {error}</span>}
  </div>
)

/* ─────────────────────────────────────────────
   LOGOUT CONFIRM DIALOG
───────────────────────────────────────────── */
export const LogoutConfirmDialog = ({ onConfirm, onCancel }) => {
  // Close on Escape
  useEffect(() => {
    const fn = e => { if (e.key === 'Escape') onCancel() }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [onCancel])

  return (
    <div className="logout-overlay" onClick={e => { if (e.target === e.currentTarget) onCancel() }}>
      <div className="logout-dialog animate-scale-in">
        {/* Warning icon */}
        <div className="logout-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/>
          </svg>
        </div>

        <h2 className="logout-title">Sign out of CreditSense?</h2>
        <p className="logout-desc">
          You'll need to sign back in to access your assessments. Any unsaved form progress will be lost.
        </p>

        <div className="logout-actions">
          <button className="logout-cancel-btn" onClick={onCancel}>
            Cancel
          </button>
          <button className="logout-confirm-btn" onClick={onConfirm}>
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M13 7l3 3m0 0l-3 3m3-3H8m4-7H5a2 2 0 00-2 2v10a2 2 0 002 2h7"/>
            </svg>
            Yes, sign out
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   PROFILE PANEL
───────────────────────────────────────────── */
const ProfileModal = ({ onClose }) => {
  const { user, updateProfile, updatePassword } = useAuth()

  // ── Profile form state ──
  const [profile, setProfile] = useState({
    name        : user?.name        || '',
    email       : user?.email       || '',
    phone       : user?.phone       || '',
    organisation: user?.organisation || '',
    role        : user?.role        || '',
  })
  const [profileErrors, setProfileErrors]   = useState({})
  const [profileSaving, setProfileSaving]   = useState(false)
  const [profileSuccess, setProfileSuccess] = useState(false)

  // ── Password form state ──
  const [pwd, setPwd] = useState({ current: '', next: '', confirm: '' })
  const [pwdErrors, setPwdErrors]     = useState({})
  const [pwdSaving, setPwdSaving]     = useState(false)
  const [pwdSuccess, setPwdSuccess]   = useState(false)
  const [pwdApiError, setPwdApiError] = useState('')

  // Close on Escape
  useEffect(() => {
    const fn = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', fn)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', fn)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const updateProfileField = (name, value) => {
    setProfile(p => ({ ...p, [name]: value }))
    setProfileErrors(e => ({ ...e, [name]: undefined }))
    setProfileSuccess(false)
  }

  const updatePwdField = (name, value) => {
    setPwd(p => ({ ...p, [name]: value }))
    setPwdErrors(e => ({ ...e, [name]: undefined }))
    setPwdSuccess(false)
    setPwdApiError('')
  }

  // ── Validate profile ──
  const validateProfile = () => {
    const e = {}
    if (!profile.name.trim())                        e.name  = 'Name is required'
    if (!profile.email.trim())                       e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(profile.email))   e.email = 'Enter a valid email'
    if (profile.phone && !/^[\d\s\+\-\(\)]{7,15}$/.test(profile.phone))
      e.phone = 'Enter a valid phone number'
    return e
  }

  // ── Validate password ──
  const validatePwd = () => {
    const e = {}
    if (!pwd.current)           e.current = 'Current password is required'
    if (!pwd.next)              e.next    = 'New password is required'
    else if (pwd.next.length < 6) e.next  = 'Min. 6 characters'
    if (!pwd.confirm)           e.confirm = 'Please confirm your new password'
    else if (pwd.confirm !== pwd.next) e.confirm = 'Passwords do not match'
    return e
  }

  // ── Save profile ──
  const handleProfileSave = async e => {
    e.preventDefault()
    const errs = validateProfile()
    if (Object.keys(errs).length) { setProfileErrors(errs); return }
    setProfileErrors({})
    setProfileSaving(true)
    try {
      await updateProfile(profile)
      setProfileSuccess(true)
      setTimeout(() => setProfileSuccess(false), 3000)
    } catch (err) {
      setProfileErrors({ api: err?.response?.data?.message || 'Failed to save. Please try again.' })
    } finally {
      setProfileSaving(false)
    }
  }

  // ── Change password ──
  const handlePwdSave = async e => {
    e.preventDefault()
    const errs = validatePwd()
    if (Object.keys(errs).length) { setPwdErrors(errs); return }
    setPwdErrors({}); setPwdApiError(''); setPwdSaving(true)
    try {
      await updatePassword({ current_password: pwd.current, new_password: pwd.next })
      setPwdSuccess(true)
      setPwd({ current: '', next: '', confirm: '' })
      setTimeout(() => setPwdSuccess(false), 3000)
    } catch (err) {
      setPwdApiError(err?.response?.data?.message || 'Incorrect current password.')
    } finally {
      setPwdSaving(false)
    }
  }

  const initials = user?.name?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || '?'

  const strength = pwd.next.length === 0 ? 0 : pwd.next.length < 6 ? 1 : pwd.next.length < 10 ? 2 : 3
  const sColor   = ['', '#ff4d6a', '#ffb020', '#00e5a0']
  const sLabel   = ['', 'Weak', 'Good', 'Strong']

  return (
    <>
      {/* Backdrop */}
      <div className="profile-backdrop" onClick={onClose} />

      {/* Slide-in panel */}
      <aside className="profile-panel animate-slide-in-right">

        {/* Panel header */}
        <div className="profile-panel-header">
          <div className="profile-panel-title-row">
            <h2 className="profile-panel-title">My Profile</h2>
            <button className="profile-close-btn" onClick={onClose} aria-label="Close profile">
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M4 4l12 12M16 4L4 16" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          {/* Avatar + name strip */}
          <div className="profile-avatar-strip">
            <div className="profile-avatar-lg">{initials}</div>
            <div>
              <div className="profile-avatar-name">{user?.name}</div>
              <div className="profile-avatar-email">{user?.email}</div>
              <div className="profile-avatar-badge">
                <span className="profile-badge-dot" />
                Active account
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="profile-panel-body">

          {/* ── Personal Information ── */}
          <section className="profile-section">
            <div className="profile-section-header">
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"/>
              </svg>
              <h3>Personal Information</h3>
            </div>

            <form className="profile-form" onSubmit={handleProfileSave} noValidate>
              {profileErrors.api && (
                <div className="profile-api-error">{profileErrors.api}</div>
              )}

              <div className="profile-field-grid">
                <Field
                  label="Full Name" name="name"
                  value={profile.name} onChange={updateProfileField}
                  placeholder="John Doe" error={profileErrors.name}
                />
                <Field
                  label="Email Address" name="email" type="email"
                  value={profile.email} onChange={updateProfileField}
                  placeholder="you@example.com" error={profileErrors.email}
                />
                <Field
                  label="Phone Number" name="phone" type="tel"
                  value={profile.phone} onChange={updateProfileField}
                  placeholder="+91 98765 43210" error={profileErrors.phone}
                  hint="Include country code (e.g. +91 for India)"
                />
                <Field
                  label="Organisation" name="organisation"
                  value={profile.organisation} onChange={updateProfileField}
                  placeholder="Your bank or institution"
                />
                <Field
                  label="Job Role" name="role"
                  value={profile.role} onChange={updateProfileField}
                  placeholder="e.g. Credit Analyst"
                />
              </div>

              <div className="profile-form-footer">
                {profileSuccess && (
                  <div className="profile-success-msg">
                    <svg viewBox="0 0 16 16" fill="none"><path d="M3 8l3.5 3.5L13 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    Profile updated successfully
                  </div>
                )}
                <button type="submit" className="profile-save-btn" disabled={profileSaving}>
                  {profileSaving
                    ? <><span className="profile-spinner" /> Saving…</>
                    : <>
                        <svg viewBox="0 0 16 16" fill="none"><path d="M13 2H5L2 5v9a1 1 0 001 1h10a1 1 0 001-1V3a1 1 0 00-1-1zM5 2v4h6V2M10 10a2 2 0 11-4 0 2 2 0 014 0z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/></svg>
                        Save Changes
                      </>
                  }
                </button>
              </div>
            </form>
          </section>

          {/* ── Change Password ── */}
          <section className="profile-section">
            <div className="profile-section-header">
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"/>
              </svg>
              <h3>Change Password</h3>
            </div>

            <form className="profile-form" onSubmit={handlePwdSave} noValidate>
              {pwdApiError && (
                <div className="profile-api-error">{pwdApiError}</div>
              )}

              <div className="profile-field-grid profile-field-grid-1">
                <Field
                  label="Current Password" name="current" type="password"
                  value={pwd.current} onChange={updatePwdField}
                  placeholder="Enter current password" error={pwdErrors.current}
                />
                <Field
                  label="New Password" name="next" type="password"
                  value={pwd.next} onChange={updatePwdField}
                  placeholder="Min. 6 characters" error={pwdErrors.next}
                />

                {/* Strength indicator */}
                {pwd.next.length > 0 && (
                  <div className="profile-strength">
                    <div className="profile-strength-bars">
                      {[1,2,3].map(i => (
                        <div key={i} className="profile-strength-bar"
                          style={{ background: i <= strength ? sColor[strength] : 'var(--border)' }} />
                      ))}
                    </div>
                    <span style={{ fontSize:11, fontWeight:600, color: sColor[strength] }}>{sLabel[strength]}</span>
                  </div>
                )}

                <Field
                  label="Confirm New Password" name="confirm" type="password"
                  value={pwd.confirm} onChange={updatePwdField}
                  placeholder="Re-enter new password" error={pwdErrors.confirm}
                />
              </div>

              <div className="profile-form-footer">
                {pwdSuccess && (
                  <div className="profile-success-msg">
                    <svg viewBox="0 0 16 16" fill="none"><path d="M3 8l3.5 3.5L13 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    Password changed successfully
                  </div>
                )}
                <button type="submit" className="profile-save-btn" disabled={pwdSaving}>
                  {pwdSaving
                    ? <><span className="profile-spinner" /> Updating…</>
                    : <>
                        <svg viewBox="0 0 16 16" fill="none"><path d="M8 1a4 4 0 00-4 4v2H3a1 1 0 00-1 1v7a1 1 0 001 1h10a1 1 0 001-1V8a1 1 0 00-1-1h-1V5a4 4 0 00-4-4zm-2 4a2 2 0 014 0v2H6V5zm2 6a1 1 0 110-2 1 1 0 010 2z" stroke="currentColor" strokeWidth="1.2" fill="none"/></svg>
                        Update Password
                      </>
                  }
                </button>
              </div>
            </form>
          </section>

          {/* ── Account Info ── */}
          <section className="profile-section profile-section-last">
            <div className="profile-section-header">
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <h3>Account Information</h3>
            </div>
            <div className="profile-info-grid">
              <div className="profile-info-item">
                <span className="profile-info-label">Account ID</span>
                <span className="profile-info-value profile-info-mono">{user?.id?.slice(-8).toUpperCase() || '—'}</span>
              </div>
              <div className="profile-info-item">
                <span className="profile-info-label">Member since</span>
                <span className="profile-info-value">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' }) : '—'}
                </span>
              </div>
              <div className="profile-info-item">
                <span className="profile-info-label">Account status</span>
                <span className="profile-info-value profile-info-active">● Active</span>
              </div>
            </div>
          </section>
        </div>
      </aside>
    </>
  )
}

export default ProfileModal