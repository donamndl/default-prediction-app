import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from "../../context/AuthContext"
import "./Profile.css"

/* ─────────────────────────────────────────────
   EYE TOGGLE for password fields
───────────────────────────────────────────── */
const PwdInput = ({ value, onChange, placeholder, error, name, autoComplete = 'current-password' }) => {
  const [show, setShow] = useState(false)
  return (
    <div className="profile-pwd-wrap">
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={e => onChange(name, e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={`profile-input ${error ? 'profile-input-err' : ''}`}
      />
      <button type="button" className="profile-eye-btn" onClick={() => setShow(s => !s)}
        tabIndex={-1} aria-label={show ? 'Hide' : 'Show'}>
        {show
          ? <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 10C3.732 6.943 6.523 5 10 5c3.478 0 6.268 1.943 7.542 5-1.274 3.057-4.064 5-7.542 5-3.477 0-6.268-1.943-7.542-5z"/><path strokeLinecap="round" strokeLinejoin="round" d="M10 12a2 2 0 100-4 2 2 0 000 4z"/></svg>
          : <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 10c1.292 3.068 4.04 5.25 7.5 5.25 1.17 0 2.29-.22 3.32-.617m3.197-2.796A10.33 10.33 0 0018.066 10c-1.292-3.068-4.04-5.25-7.5-5.25a10.357 10.357 0 00-3.38.564M3 3l14 14"/></svg>
        }
      </button>
    </div>
  )
}
 
/* ─────────────────────────────────────────────
   INLINE EDITABLE FIELD
   Shows value as text with a pencil icon.
   Click pencil → becomes an input.
───────────────────────────────────────────── */
const EditableField = ({ label, name, type = 'text', value, onSave, error, placeholder, hint }) => {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft]     = useState(value)
  const [saving, setSaving]   = useState(false)
  const [ok, setOk]           = useState(false)
 
  // Sync draft when external value changes
  useEffect(() => { setDraft(value) }, [value])
 
  const handleSave = async () => {
    setSaving(true)
    await onSave(name, draft)
    setSaving(false)
    setEditing(false)
    setOk(true)
    setTimeout(() => setOk(false), 2000)
  }
 
  const handleCancel = () => {
    setDraft(value)
    setEditing(false)
  }
 
  return (
    <div className={`editable-field ${editing ? 'editable-field-open' : ''}`}>
      <div className="editable-field-header">
        <label className="profile-field-label">{label}</label>
        {ok && !editing && (
          <span className="editable-saved-tag">
            <svg viewBox="0 0 12 12" fill="none"><path d="M2 6l2.5 2.5L10 3.5" stroke="#00e5a0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Saved
          </span>
        )}
        {!editing && (
          <button type="button" className="editable-edit-btn" onClick={() => setEditing(true)} title={`Edit ${label}`}>
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.5 2.5a1.414 1.414 0 012 2L5 13H3v-2L11.5 2.5z"/>
            </svg>
            Edit
          </button>
        )}
      </div>
      {hint && <p className="profile-field-hint">{hint}</p>}
 
      {editing ? (
        <div className="editable-edit-row">
          <input
            type={type}
            value={draft}
            onChange={e => setDraft(e.target.value)}
            placeholder={placeholder}
            autoFocus
            className={`profile-input ${error ? 'profile-input-err' : ''}`}
            onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') handleCancel() }}
          />
          <div className="editable-edit-actions">
            <button type="button" className="editable-save-btn" onClick={handleSave} disabled={saving}>
              {saving ? <span className="profile-spinner"/> : '✓ Save'}
            </button>
            <button type="button" className="editable-cancel-btn" onClick={handleCancel}>✕</button>
          </div>
        </div>
      ) : (
        <div className="editable-value">
          {value || <span className="editable-empty">Not set</span>}
        </div>
      )}
      {error && <span className="profile-err-msg">⚠ {error}</span>}
    </div>
  )
}
 
/* ─────────────────────────────────────────────
   OTP PASSWORD CHANGE
   Steps: idle → choose method → sent → verify+newpwd → done
───────────────────────────────────────────── */
const OtpPasswordSection = ({ user }) => {
  const { updatePassword } = useAuth()
  const [open, setOpen]    = useState(false)
  const [step, setStep]    = useState('choose')   // choose | sent | change | done
  const [method, setMethod] = useState('email')   // email | phone
  const [otp, setOtp]       = useState('')
  const [otpError, setOtpError] = useState('')
  const [newPwd, setNewPwd]   = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')
  const [pwdErrors, setPwdErrors] = useState({})
  const [sending, setSending]   = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [apiError, setApiError]   = useState('')
  const [showNewPwd, setShowNewPwd] = useState(false)
  const [showConfPwd, setShowConfPwd] = useState(false)
 
  const strength = newPwd.length === 0 ? 0 : newPwd.length < 6 ? 1 : newPwd.length < 10 ? 2 : 3
  const sColor   = ['', '#ff4d6a', '#ffb020', '#00e5a0']
  const sLabel   = ['', 'Weak', 'Good', 'Strong']
 
  const reset = () => {
    setStep('choose'); setOtp(''); setNewPwd(''); setConfirmPwd('')
    setOtpError(''); setApiError(''); setPwdErrors({})
  }
 
  const handleSendOtp = async () => {
    setSending(true); setApiError('')
    try {
      // Call your backend OTP endpoint
      await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json',
          Authorization: `Bearer ${JSON.parse(localStorage.getItem('cs-auth')||'{}').token||''}` },
        body: JSON.stringify({ method, contact: method === 'email' ? user?.email : user?.phone })
      })
      setStep('sent')
    } catch (e) {
      setApiError('Failed to send OTP. Please try again.')
    } finally {
      setSending(false)
    }
  }
 
  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 4) { setOtpError('Enter the OTP sent to you'); return }
    setVerifying(true); setOtpError(''); setApiError('')
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json',
          Authorization: `Bearer ${JSON.parse(localStorage.getItem('cs-auth')||'{}').token||''}` },
        body: JSON.stringify({ otp })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Invalid OTP')
      setStep('change')
    } catch (e) {
      setOtpError(e.message || 'Invalid OTP. Please try again.')
    } finally {
      setVerifying(false) }
  }
 
  const handleChangePassword = async () => {
    const e = {}
    if (!newPwd)            e.next    = 'New password is required'
    else if (newPwd.length < 6) e.next = 'Min. 6 characters'
    if (!confirmPwd)        e.confirm = 'Please confirm your password'
    else if (confirmPwd !== newPwd) e.confirm = 'Passwords do not match'
    if (Object.keys(e).length) { setPwdErrors(e); return }
    setPwdErrors({}); setApiError(''); setVerifying(true)
    try {
      // For OTP flow we skip current password check since OTP already verified identity
      await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json',
          Authorization: `Bearer ${JSON.parse(localStorage.getItem('cs-auth')||'{}').token||''}` },
        body: JSON.stringify({ new_password: newPwd, otp })
      })
      setStep('done')
    } catch (e) {
      setApiError('Failed to update password. Please try again.')
    } finally {
      setVerifying(false) }
  }
 
  return (
    <div className="otp-section">
      {/* Collapsed state — just a button to open */}
      {!open ? (
        <button type="button" className="otp-open-btn" onClick={() => { setOpen(true); reset() }}>
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"/>
          </svg>
          Change Password
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="otp-chevron">
            <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      ) : (
        <div className="otp-panel">
          <div className="otp-panel-header">
            <div className="otp-panel-title">
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" style={{width:16,height:16,color:'var(--accent-blue)'}}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"/>
              </svg>
              Change Password
            </div>
            <button type="button" className="otp-close-btn" onClick={() => setOpen(false)}>✕</button>
          </div>
 
          {apiError && <div className="profile-api-error">{apiError}</div>}
 
          {/* STEP: Choose method */}
          {step === 'choose' && (
            <div className="otp-step">
              <p className="otp-step-desc">Choose how you'd like to receive your verification code:</p>
              <div className="otp-method-options">
                <button type="button"
                  className={`otp-method-btn ${method === 'email' ? 'otp-method-active' : ''}`}
                  onClick={() => setMethod('email')}>
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/></svg>
                  <div>
                    <div className="otp-method-label">Email</div>
                    <div className="otp-method-value">{user?.email || 'Not set'}</div>
                  </div>
                  {method === 'email' && <span className="otp-method-check">✓</span>}
                </button>
                <button type="button"
                  className={`otp-method-btn ${method === 'phone' ? 'otp-method-active' : ''}`}
                  onClick={() => setMethod('phone')}>
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/></svg>
                  <div>
                    <div className="otp-method-label">Phone</div>
                    <div className="otp-method-value">{user?.phone || 'Not set'}</div>
                  </div>
                  {method === 'phone' && <span className="otp-method-check">✓</span>}
                </button>
              </div>
              {method === 'phone' && !user?.phone && (
                <p className="otp-warning">⚠ Add a phone number to your profile first to use this option.</p>
              )}
              <button type="button" className="otp-action-btn"
                onClick={handleSendOtp}
                disabled={sending || (method === 'phone' && !user?.phone)}>
                {sending ? <><span className="profile-spinner"/> Sending…</> : `Send OTP via ${method === 'email' ? 'Email' : 'Phone'} →`}
              </button>
            </div>
          )}
 
          {/* STEP: OTP sent — enter code */}
          {step === 'sent' && (
            <div className="otp-step">
              <div className="otp-sent-notice">
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" style={{width:18,height:18,color:'var(--accent-green)',flexShrink:0}}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span>OTP sent to <strong>{method === 'email' ? user?.email : user?.phone}</strong></span>
              </div>
              <p className="otp-step-desc">Enter the 6-digit code below. It expires in 10 minutes.</p>
              <div className="otp-input-row">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={e => { setOtp(e.target.value.replace(/\D/g,'')); setOtpError('') }}
                  placeholder="● ● ● ● ● ●"
                  className={`otp-code-input ${otpError ? 'profile-input-err' : ''}`}
                  autoFocus
                />
              </div>
              {otpError && <p className="profile-err-msg" style={{marginTop:6}}>⚠ {otpError}</p>}
              <div className="otp-step-actions">
                <button type="button" className="otp-back-btn" onClick={() => { setStep('choose'); setOtp('') }}>← Back</button>
                <button type="button" className="otp-action-btn" onClick={handleVerifyOtp} disabled={verifying || otp.length < 4}>
                  {verifying ? <><span className="profile-spinner"/> Verifying…</> : 'Verify OTP →'}
                </button>
              </div>
              <button type="button" className="otp-resend-btn" onClick={handleSendOtp} disabled={sending}>
                {sending ? 'Resending…' : "Didn't receive it? Resend"}
              </button>
            </div>
          )}
 
          {/* STEP: Set new password */}
          {step === 'change' && (
            <div className="otp-step">
              <div className="otp-verified-notice">
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" style={{width:16,height:16}}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                </svg>
                Identity verified — set your new password
              </div>
 
              <div className="profile-field-grid profile-field-grid-1" style={{marginTop:16}}>
                <div className="profile-field">
                  <label className="profile-field-label">New Password</label>
                  <div className="profile-pwd-wrap">
                    <input
                      type={showNewPwd ? 'text' : 'password'}
                      value={newPwd}
                      onChange={e => { setNewPwd(e.target.value); setPwdErrors(p => ({...p,next:undefined})) }}
                      placeholder="Min. 6 characters"
                      autoComplete="new-password"
                      className={`profile-input ${pwdErrors.next ? 'profile-input-err' : ''}`}
                    />
                    <button type="button" className="profile-eye-btn" onClick={() => setShowNewPwd(s=>!s)} tabIndex={-1}>
                      {showNewPwd
                        ?<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 10C3.732 6.943 6.523 5 10 5c3.478 0 6.268 1.943 7.542 5-1.274 3.057-4.064 5-7.542 5-3.477 0-6.268-1.943-7.542-5z"/><path strokeLinecap="round" strokeLinejoin="round" d="M10 12a2 2 0 100-4 2 2 0 000 4z"/></svg>
                        :<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 10c1.292 3.068 4.04 5.25 7.5 5.25 1.17 0 2.29-.22 3.32-.617m3.197-2.796A10.33 10.33 0 0018.066 10c-1.292-3.068-4.04-5.25-7.5-5.25a10.357 10.357 0 00-3.38.564M3 3l14 14"/></svg>
                      }
                    </button>
                  </div>
                  {pwdErrors.next && <span className="profile-err-msg">⚠ {pwdErrors.next}</span>}
                  {newPwd.length > 0 && (
                    <div className="profile-strength" style={{marginTop:6}}>
                      <div className="profile-strength-bars">
                        {[1,2,3].map(i=><div key={i} className="profile-strength-bar" style={{background:i<=strength?sColor[strength]:'var(--border)'}}/>)}
                      </div>
                      <span style={{fontSize:11,fontWeight:600,color:sColor[strength]}}>{sLabel[strength]}</span>
                    </div>
                  )}
                </div>
                <div className="profile-field">
                  <label className="profile-field-label">Confirm New Password</label>
                  <div className="profile-pwd-wrap">
                    <input
                      type={showConfPwd ? 'text' : 'password'}
                      value={confirmPwd}
                      onChange={e => { setConfirmPwd(e.target.value); setPwdErrors(p => ({...p,confirm:undefined})) }}
                      placeholder="Re-enter password"
                      autoComplete="new-password"
                      className={`profile-input ${pwdErrors.confirm ? 'profile-input-err' : ''}`}
                    />
                    <button type="button" className="profile-eye-btn" onClick={() => setShowConfPwd(s=>!s)} tabIndex={-1}>
                      {showConfPwd
                        ?<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 10C3.732 6.943 6.523 5 10 5c3.478 0 6.268 1.943 7.542 5-1.274 3.057-4.064 5-7.542 5-3.477 0-6.268-1.943-7.542-5z"/><path strokeLinecap="round" strokeLinejoin="round" d="M10 12a2 2 0 100-4 2 2 0 000 4z"/></svg>
                        :<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 10c1.292 3.068 4.04 5.25 7.5 5.25 1.17 0 2.29-.22 3.32-.617m3.197-2.796A10.33 10.33 0 0018.066 10c-1.292-3.068-4.04-5.25-7.5-5.25a10.357 10.357 0 00-3.38.564M3 3l14 14"/></svg>
                      }
                    </button>
                  </div>
                  {pwdErrors.confirm && <span className="profile-err-msg">⚠ {pwdErrors.confirm}</span>}
                </div>
              </div>
              <button type="button" className="otp-action-btn" style={{marginTop:16}} onClick={handleChangePassword} disabled={verifying}>
                {verifying ? <><span className="profile-spinner"/> Updating…</> : 'Update Password →'}
              </button>
            </div>
          )}
 
          {/* STEP: Done */}
          {step === 'done' && (
            <div className="otp-done">
              <div className="otp-done-icon">✓</div>
              <p className="otp-done-title">Password changed successfully!</p>
              <p className="otp-done-sub">Your new password is active. Use it next time you sign in.</p>
              <button type="button" className="otp-close-section-btn" onClick={() => setOpen(false)}>Close</button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
 
/* ─────────────────────────────────────────────
   LOGOUT CONFIRM DIALOG (exported)
───────────────────────────────────────────── */
export const LogoutConfirmDialog = ({ onConfirm, onCancel }) => {
  useEffect(() => {
    const fn = e => { if (e.key === 'Escape') onCancel() }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [onCancel])
 
  return (
    <div className="logout-overlay" onClick={e => { if (e.target === e.currentTarget) onCancel() }}>
      <div className="logout-dialog animate-scale-in">
        <div className="logout-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/>
          </svg>
        </div>
        <h2 className="logout-title">Sign out of CreditSense?</h2>
        <p className="logout-desc">You'll need to sign back in to access your assessments. Any unsaved form progress will be lost.</p>
        <div className="logout-actions">
          <button className="logout-cancel-btn" onClick={onCancel}>Cancel</button>
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
  const { user, updateProfile } = useAuth()
  const [fieldErrors, setFieldErrors] = useState({})
  const [apiError, setApiError]       = useState('')
 
  useEffect(() => {
    const fn = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', fn)
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', fn); document.body.style.overflow = '' }
  }, [onClose])
 
  // Called by each EditableField when user saves that single field
  const handleFieldSave = async (name, value) => {
    setApiError('')
    setFieldErrors(e => ({ ...e, [name]: undefined }))
    // Validate individually
    if (name === 'email' && !/\S+@\S+\.\S+/.test(value)) {
      setFieldErrors(e => ({ ...e, email: 'Enter a valid email' }))
      throw new Error('Invalid email')
    }
    if (name === 'phone' && value && !/^[\d\s\+\-\(\)]{7,15}$/.test(value)) {
      setFieldErrors(e => ({ ...e, phone: 'Enter a valid phone number' }))
      throw new Error('Invalid phone')
    }
    try {
      await updateProfile({ ...user, [name]: value })
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to save'
      setFieldErrors(e => ({ ...e, [name]: msg }))
      throw err
    }
  }
 
  const initials = user?.name?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || '?'
 
  return (
    <>
      <div className="profile-backdrop" onClick={onClose} />
      <aside className="profile-panel animate-slide-in-right">
 
        {/* Header */}
        <div className="profile-panel-header">
          <div className="profile-panel-title-row">
            <h2 className="profile-panel-title">My Profile</h2>
            <button className="profile-close-btn" onClick={onClose} aria-label="Close">
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 4l12 12M16 4L4 16" strokeLinecap="round"/></svg>
            </button>
          </div>
          <div className="profile-avatar-strip">
            <div className="profile-avatar-lg">{initials}</div>
            <div>
              <div className="profile-avatar-name">{user?.name}</div>
              <div className="profile-avatar-email">{user?.email}</div>
              <div className="profile-avatar-badge"><span className="profile-badge-dot"/>Active account</div>
            </div>
          </div>
        </div>
 
        <div className="profile-panel-body">
          {apiError && <div className="profile-api-error" style={{margin:'16px 24px 0'}}>{apiError}</div>}
 
          {/* ── Personal Info ── */}
          <section className="profile-section">
            <div className="profile-section-header">
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"/></svg>
              <h3>Personal Information</h3>
            </div>
            <div className="profile-editable-list">
              <EditableField label="Full Name"      name="name"         value={user?.name||''}         onSave={handleFieldSave} error={fieldErrors.name}  placeholder="John Doe" />
              <EditableField label="Email Address"  name="email" type="email" value={user?.email||''}  onSave={handleFieldSave} error={fieldErrors.email} placeholder="you@example.com" />
              <EditableField label="Phone Number"   name="phone" type="tel"   value={user?.phone||''}  onSave={handleFieldSave} error={fieldErrors.phone} placeholder="+91 98765 43210" hint="Include country code" />
              <EditableField label="Organisation"   name="organisation"  value={user?.organisation||''} onSave={handleFieldSave} placeholder="Your bank or institution" />
              <EditableField label="Job Role"       name="role"          value={user?.role||''}          onSave={handleFieldSave} placeholder="e.g. Credit Analyst" />
            </div>
          </section>
 
          {/* ── Change Password (OTP) ── */}
          <section className="profile-section">
            <div className="profile-section-header">
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"/></svg>
              <h3>Security</h3>
            </div>
            <OtpPasswordSection user={user} />
          </section>
 
          {/* ── Account Info ── */}
          <section className="profile-section profile-section-last">
            <div className="profile-section-header">
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              <h3>Account Information</h3>
            </div>
            <div className="profile-info-grid">
              <div className="profile-info-item">
                <span className="profile-info-label">Account ID</span>
                <span className="profile-info-value profile-info-mono">{user?.id?.slice(-8).toUpperCase()||'—'}</span>
              </div>
              <div className="profile-info-item">
                <span className="profile-info-label">Member since</span>
                <span className="profile-info-value">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}) : '—'}
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