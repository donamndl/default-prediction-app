import React from 'react'

/* ─── Select Field ─── */
export const SelectField = ({ label, name, value, onChange, options, error, hint }) => (
  <div className="field-wrap">
    <label className="field-label" htmlFor={name}>
      {label}
      {hint && <span className="field-hint">{hint}</span>}
    </label>
    <div className="select-wrap">
      <select
        id={name}
        name={name}
        value={value}
        onChange={e => onChange(name, e.target.value)}
        className={`field-select ${error ? 'field-error' : ''} ${value ? 'field-filled' : ''}`}
      >
        <option value="">— Select —</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <svg className="select-arrow" viewBox="0 0 16 16" fill="none">
        <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
    {error && <span className="field-error-msg">{error}</span>}
  </div>
)

/* ─── Number Input Field ─── */
export const NumberField = ({ label, name, value, onChange, min, max, step = 1, error, hint, suffix }) => (
  <div className="field-wrap">
    <label className="field-label" htmlFor={name}>
      {label}
      {hint && <span className="field-hint">{hint}</span>}
    </label>
    <div className="input-wrap">
      <input
        id={name}
        type="number"
        name={name}
        value={value}
        onChange={e => onChange(name, e.target.value)}
        min={min}
        max={max}
        step={step}
        className={`field-input ${error ? 'field-error' : ''} ${suffix ? 'has-suffix' : ''}`}
        placeholder="0"
      />
      {suffix && <span className="input-suffix">{suffix}</span>}
    </div>
    {error && <span className="field-error-msg">{error}</span>}
  </div>
)

/* ─── Yes/No Toggle ─── */
export const YesNoField = ({ label, name, value, onChange, error, hint }) => (
  <div className="field-wrap">
    <label className="field-label">
      {label}
      {hint && <span className="field-hint">{hint}</span>}
    </label>
    <div className="toggle-group">
      {['Yes', 'No'].map(opt => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(name, opt)}
          className={`toggle-btn ${value === opt ? 'toggle-active' : ''}`}
        >
          {opt === 'Yes'
            ? <><svg viewBox="0 0 16 16" fill="none"><path d="M3 8l3.5 3.5L13 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg> Yes</>
            : <><svg viewBox="0 0 16 16" fill="none"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg> No</>
          }
        </button>
      ))}
    </div>
    {error && <span className="field-error-msg">{error}</span>}
  </div>
)

/* ─── Radio Group ─── */
export const RadioField = ({ label, name, value, onChange, options, error, hint }) => (
  <div className="field-wrap">
    <label className="field-label">
      {label}
      {hint && <span className="field-hint">{hint}</span>}
    </label>
    <div className="radio-group">
      {options.map(opt => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(name, opt.value)}
          className={`radio-btn ${value === opt.value ? 'radio-active' : ''}`}
        >
          <span className="radio-dot" />
          {opt.label}
        </button>
      ))}
    </div>
    {error && <span className="field-error-msg">{error}</span>}
  </div>
)

/* ─── Section Header ─── */
export const SectionHeader = ({ icon, title, subtitle }) => (
  <div className="section-header">
    <div className="section-icon">{icon}</div>
    <div>
      <h2 className="section-title">{title}</h2>
      {subtitle && <p className="section-subtitle">{subtitle}</p>}
    </div>
  </div>
)

/* ─── Field Grid ─── */
export const FieldGrid = ({ children, cols = 2 }) => (
  <div className={`field-grid field-grid-${cols}`}>{children}</div>
)