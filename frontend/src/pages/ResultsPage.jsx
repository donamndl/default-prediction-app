import React from 'react'
import { useForm } from '../context/FormContext'

const APPROVAL_CONFIG = {
  'STP (Straight Through Processing)': {
    color: '#00e5a0',
    bg: 'rgba(0,229,160,0.08)',
    border: 'rgba(0,229,160,0.25)',
    badge: 'STP',
    desc: 'Straight Through Processing — Auto Approved',
    icon: '✅'
  },
  'L1 Approval': {
    color: '#3d6aff',
    bg: 'rgba(61,106,255,0.08)',
    border: 'rgba(61,106,255,0.25)',
    badge: 'L1',
    desc: 'Level 1 Review Required',
    icon: '🔵'
  },
  'L2 Approval': {
    color: '#ffb020',
    bg: 'rgba(255,176,32,0.08)',
    border: 'rgba(255,176,32,0.25)',
    badge: 'L2',
    desc: 'Level 2 Review Required',
    icon: '🟡'
  },
  'L3 / Reject': {
    color: '#ff4d6a',
    bg: 'rgba(255,77,106,0.08)',
    border: 'rgba(255,77,106,0.25)',
    badge: 'REJECT',
    desc: 'Application Rejected / Level 3 Escalation',
    icon: '❌'
  },
}

/* ─── Pure SVG Semi-Circle Gauge ─────────────────────────────────────────
   Draws a 180° arc from left to right.
   - r=80, viewBox 200×120 so the flat edge sits at the bottom
   - Text is positioned at the mathematical centre of the arc (cx, cy)
   - No Recharts, no overflow issues
──────────────────────────────────────────────────────────────────────── */
const SemiCircleGauge = ({ pct, color, score, max }) => {
  const cx = 100, cy = 100, r = 78
  const circumference = Math.PI * r          // half-circle arc length ≈ 245
  const filled = (pct / 100) * circumference // how much arc to draw

  return (
    <div className="svg-gauge-wrap">
      <svg viewBox="0 0 200 108" xmlns="http://www.w3.org/2000/svg" className="svg-gauge">
        {/* Track arc */}
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none"
          stroke="rgba(255,255,255,0.07)"
          strokeWidth="10"
          strokeLinecap="round"
        />
        {/* Filled arc — uses stroke-dasharray trick on the same semicircle path */}
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${filled} ${circumference}`}
          style={{ filter: `drop-shadow(0 0 6px ${color}88)`, transition: 'stroke-dasharray 0.8s ease' }}
        />
        {/* Percentage — centred inside the arc */}
        <text x={cx} y={cy - 12} textAnchor="middle" dominantBaseline="auto"
          fontSize="28" fontWeight="800" fontFamily="DM Sans, sans-serif" fill={color}>
          {pct}%
        </text>
        {/* Score label */}
        <text x={cx} y={cy + 10} textAnchor="middle" dominantBaseline="auto"
          fontSize="11" fontFamily="DM Sans, sans-serif" fill="rgba(138,150,176,0.9)">
          {score}/{max}
        </text>
      </svg>
    </div>
  )
}

const ResultsPage = () => {
  const { result, resetForm, formData } = useForm()
  const approval = APPROVAL_CONFIG[result?.approval_level] || APPROVAL_CONFIG['L3 / Reject']
  const isDefault = result?.ml_prediction === 1
  const pct = result?.score_percentage || 0

  return (
    <div className="results-page animate-fade-in">
      {/* Header */}
      <div className="results-header">
        <div className="results-badge" style={{ background: approval.bg, borderColor: approval.border, color: approval.color }}>
          <span>{approval.badge}</span>
        </div>
        <h1 className="results-title">Assessment Complete</h1>
        <p className="results-subtitle">Here's the detailed credit risk analysis</p>
      </div>

      {/* Main Score Card */}
      <div className="results-main-card" style={{ borderColor: approval.border, boxShadow: `0 0 40px ${approval.color}18` }}>
        <div className="score-gauge-wrap">
          <SemiCircleGauge pct={pct} color={approval.color} score={result?.scorecard_score} max={result?.scorecard_max} />
        </div>

        <div className="score-meta">
          <div className="approval-level-display" style={{ background: approval.bg, borderColor: approval.border }}>
            <span style={{ color: approval.color }}>{approval.icon} {approval.desc}</span>
          </div>

          <div className="score-breakdown-row">
            <div className="score-breakdown-item">
              <div className="sbi-label">Scorecard Score</div>
              <div className="sbi-value" style={{ color: approval.color }}>{result?.scorecard_score}</div>
              <div className="sbi-sub">out of 350</div>
            </div>
            <div className="sbi-divider" />
            <div className="score-breakdown-item">
              <div className="sbi-label">ML Prediction</div>
              <div className="sbi-value" style={{ color: isDefault ? '#ff4d6a' : '#00e5a0' }}>
                {isDefault ? 'Default' : 'No Default'}
              </div>
              <div className="sbi-sub">{result?.default_probability}% default prob.</div>
            </div>
            <div className="sbi-divider" />
            <div className="score-breakdown-item">
              <div className="sbi-label">Decision</div>
              <div className="sbi-value" style={{ color: approval.color }}>{approval.badge}</div>
              <div className="sbi-sub">{result?.approval_level}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ML Prediction Card */}
      <div className={`ml-prediction-card ${isDefault ? 'ml-default' : 'ml-no-default'}`}>
        <div className="ml-icon">{isDefault ? '⚠️' : '🛡️'}</div>
        <div className="ml-content">
          <div className="ml-title">Machine Learning Prediction</div>
          <div className="ml-result" style={{ color: isDefault ? '#ff4d6a' : '#00e5a0' }}>
            {isDefault ? 'High Default Risk' : 'Low Default Risk'}
          </div>
          <div className="ml-desc">
            {isDefault
              ? `The model predicts a ${result?.default_probability}% probability of default. The applicant presents elevated credit risk.`
              : `The model predicts a ${result?.default_probability}% probability of default. The applicant presents acceptable credit risk.`
            }
          </div>
        </div>
        <div className="ml-prob-circle" style={{ '--prob-color': isDefault ? '#ff4d6a' : '#00e5a0' }}>
          <svg viewBox="0 0 64 64">
            <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4"/>
            <circle
              cx="32" cy="32" r="28"
              fill="none"
              stroke={isDefault ? '#ff4d6a' : '#00e5a0'}
              strokeWidth="4"
              strokeDasharray={`${(result?.default_probability / 100) * 175.9} 175.9`}
              strokeLinecap="round"
              transform="rotate(-90 32 32)"
            />
          </svg>
          <span>{result?.default_probability}%</span>
        </div>
      </div>

      {/* Score Bands Reference */}
      <div className="score-bands-card">
        <h3 className="bands-title">Approval Level Reference</h3>
        <div className="bands-list">
          {[
            { label: 'STP', range: '≥ 80%', desc: 'Auto Approved', color: '#00e5a0', active: pct >= 80 },
            { label: 'L1', range: '60–79%', desc: 'Level 1 Review', color: '#3d6aff', active: pct >= 60 && pct < 80 },
            { label: 'L2', range: '40–59%', desc: 'Level 2 Review', color: '#ffb020', active: pct >= 40 && pct < 60 },
            { label: 'L3/Reject', range: '< 40%', desc: 'Reject / Escalate', color: '#ff4d6a', active: pct < 40 },
          ].map(band => (
            <div key={band.label} className={`band-row ${band.active ? 'band-active' : ''}`} style={band.active ? { borderColor: band.color, background: `${band.color}0d` } : {}}>
              <div className="band-dot" style={{ background: band.color }} />
              <div className="band-label" style={band.active ? { color: band.color } : {}}>{band.label}</div>
              <div className="band-range">{band.range}</div>
              <div className="band-desc">{band.desc}</div>
              {band.active && <div className="band-current-tag" style={{ background: band.color }}>Current</div>}
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="results-actions">
        <button className="btn-new-assessment" onClick={resetForm}>
          <svg viewBox="0 0 20 20" fill="none">
            <path d="M4 10a6 6 0 1112 0M4 10l-2-2m2 2l2-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          New Assessment
        </button>
        <button className="btn-print" onClick={() => window.print()}>
          <svg viewBox="0 0 20 20" fill="none">
            <path d="M5 4v3H3a2 2 0 00-2 2v5a2 2 0 002 2h2v1a2 2 0 002 2h6a2 2 0 002-2v-1h2a2 2 0 002-2V9a2 2 0 00-2-2h-2V4a2 2 0 00-2-2H7a2 2 0 00-2 2z" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
          Print Report
        </button>
      </div>
    </div>
  )
}

export default ResultsPage