import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../App'
import { useForm } from '../context/FormContext'
import ProfileModal, { LogoutConfirmDialog } from '../components/profile/ProfileModal'
import './Dashboard.css'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts'

/* ─── Stat Card ─────────────────────────────── */
const StatCard = ({ icon, label, value, sub, color }) => (
  <div className="db-stat-card">
    <div className="db-stat-icon" style={{ background: `${color}18`, color }}>
      {icon}
    </div>
    <div className="db-stat-body">
      <div className="db-stat-value" style={{ color }}>{value}</div>
      <div className="db-stat-label">{label}</div>
      {sub && <div className="db-stat-sub">{sub}</div>}
    </div>
  </div>
)

/* ─── Quick Action Card ─────────────────────── */
const ActionCard = ({ icon, title, desc, badge, onClick, primary }) => (
  <button className={`db-action-card ${primary ? 'db-action-primary' : ''}`} onClick={onClick}>
    <div className="db-action-top">
      <div className="db-action-icon">{icon}</div>
      {badge && <span className="db-action-badge">{badge}</span>}
    </div>
    <h3 className="db-action-title">{title}</h3>
    <p className="db-action-desc">{desc}</p>
    <div className="db-action-arrow">
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M4 10h12M12 4l6 6-6 6"/>
      </svg>
    </div>
  </button>
)

/* ─── Navbar (same as form) ─────────────────── */
const DashboardNav = ({ user, onProfile, onLogout, theme, toggleTheme }) => (
  <header className="db-nav">
    <div className="db-nav-inner">
      <div className="db-nav-brand">
        <svg viewBox="0 0 32 32" fill="none" style={{width:30,height:30,flexShrink:0}}>
          <rect width="32" height="32" rx="8" fill="url(#dbNG)"/>
          <path d="M8 22l5-9 4 6 3-4 4 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <defs><linearGradient id="dbNG" x1="0" y1="0" x2="32" y2="32"><stop offset="0%" stopColor="#3d6aff"/><stop offset="100%" stopColor="#00d4ff"/></linearGradient></defs>
        </svg>
        <div>
          <div className="db-nav-brand-name">CreditSense</div>
          <div className="db-nav-brand-tag">Dashboard</div>
        </div>
      </div>

      <div className="db-nav-actions">
        <button className="theme-toggle-btn" onClick={toggleTheme} title="Toggle theme">
          {theme === 'dark'
            ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>
            : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
          }
          <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
        </button>

        <div className="topbar-user-chip">
          <button type="button" className="topbar-profile-btn" onClick={onProfile} title="My profile">
            <div className="topbar-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
            <span className="topbar-username">{user?.name}</span>
          </button>
          <button type="button" className="topbar-logout-btn" onClick={onLogout} title="Sign out">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M13 7l3 3m0 0l-3 3m3-3H8m4-7H5a2 2 0 00-2 2v10a2 2 0 002 2h7"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </header>
)

/* ─── Main Dashboard ────────────────────────── */
const Dashboard = () => {
  const { user, logout }       = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { resetForm }          = useForm()
  const navigate               = useNavigate()

  const [showProfile, setShowProfile]           = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [recentApps, setRecentApps]              = useState([])
  const [stats, setStats]                        = useState(null)
  const [loadingStats, setLoadingStats]          = useState(true)

  // Fetch dashboard stats on mount
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res  = await fetch('/api/dashboard/stats', {
          headers: { Authorization: `Bearer ${localStorage.getItem('cs-auth') ? JSON.parse(localStorage.getItem('cs-auth')).token : ''}` }
        })
        const data = await res.json()
        if (data.status === 'success') {
          setStats(data.stats)
          setRecentApps((data.stats?.recent || []).slice(0, 5))
        }
      } catch (_) {
        // Stats not critical — show zeros
      } finally {
        setLoadingStats(false)
      }
    }
    fetchStats()
  }, [])

  const handleStartAssessment = () => {
    resetForm()
    navigate('/form')
  }

  const approvalColor = {
    'STP (Straight Through Processing)': '#00e5a0',
    'L1 Approval': '#3d6aff',
    'L2 Approval': '#ffb020',
    'L3 / Reject': '#ff4d6a',
  }

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const firstName = user?.name?.split(' ')[0] || 'there'

  return (
    <div className="db-root">
      <DashboardNav
        user={user} theme={theme} toggleTheme={toggleTheme}
        onProfile={() => setShowProfile(true)}
        onLogout={() => setShowLogoutConfirm(true)}
      />

      <main className="db-main">
        {/* ── Welcome banner ── */}
        <div className="db-welcome">
          <div className="db-welcome-text">
            <h1 className="db-welcome-title">
              {greeting()}, <span className="db-welcome-name">{firstName}</span> 👋
            </h1>
            <p className="db-welcome-sub">
              Here's your credit assessment overview. Start a new assessment or review past results.
            </p>
          </div>
          <button className="db-start-btn" onClick={handleStartAssessment}>
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M10 3H5a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-5M15 3l2 2-7 7-3 1 1-3 7-7z"/>
            </svg>
            New Assessment
          </button>
        </div>

        {/* ── Stats row ── */}
        <div className="db-stats-grid">
          <StatCard
            icon={<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>}
            label="Total Assessments" value={loadingStats ? '—' : (stats?.total ?? 0)}
            sub="All time" color="#3d6aff"
          />
          <StatCard
            icon={<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}
            label="STP Approvals" value={loadingStats ? '—' : (stats?.approval_dist?.['STP (Straight Through Processing)'] ?? 0)}
            sub="Auto-approved" color="#00e5a0"
          />
          <StatCard
            icon={<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}
            label="Avg Score" value={loadingStats ? '—' : `${stats?.avg_score_pct ?? 0}%`}
            sub="Scorecard average" color="#ffb020"
          />
          <StatCard
            icon={<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>}
            label="Default Flags" value={loadingStats ? '—' : (stats?.ml_dist?.['1'] ?? 0)}
            sub="ML predicted" color="#ff4d6a"
          />
        </div>

        {/* ── Quick actions + recent ── */}
        <div className="db-content-grid">
          {/* Quick actions */}
          <div className="db-actions-col">
            <h2 className="db-section-title">Quick Actions</h2>
            <div className="db-actions-grid">
              <ActionCard
                icon="📋" title="New Credit Assessment"
                desc="Start a full 7-step credit evaluation with ML-powered scoring"
                badge="350 pts" primary onClick={handleStartAssessment}
              />
              <ActionCard
                icon="👤" title="My Profile"
                desc="Update your personal details, contact info, and password"
                onClick={() => setShowProfile(true)}
              />
              <ActionCard
                icon="📊" title="Assessment History"
                desc="Review all previous credit assessments and their outcomes"
                onClick={() => navigate('/form')}
              />
              <ActionCard
                icon="⚙️" title="Settings"
                desc="Manage your account preferences and notification settings"
                onClick={() => setShowProfile(true)}
              />
            </div>
          </div>

          {/* Recent assessments */}
          <div className="db-recent-col">
            <div className="db-recent-header">
              <h2 className="db-section-title">Recent Assessments</h2>
              <button className="db-recent-all-btn" onClick={handleStartAssessment}>
                New +
              </button>
            </div>

            {loadingStats ? (
              <div className="db-recent-loading">
                {[1,2,3].map(i => <div key={i} className="db-recent-skeleton" />)}
              </div>
            ) : recentApps.length === 0 ? (
              <div className="db-recent-empty">
                <div className="db-empty-icon">📭</div>
                <p className="db-empty-title">No assessments yet</p>
                <p className="db-empty-sub">Start your first credit assessment to see results here.</p>
                <button className="db-empty-btn" onClick={handleStartAssessment}>
                  Start First Assessment →
                </button>
              </div>
            ) : (
              <div className="db-recent-list">
                {recentApps.map((app, i) => (
                  <div key={app._id || i} className="db-recent-item">
                    <div className="db-recent-num">#{i + 1}</div>
                    <div className="db-recent-info">
                      <div className="db-recent-name">
                        {app.input?.marital_status || 'Applicant'} — {app.scorecard?.score_percentage}%
                      </div>
                      <div className="db-recent-date">
                        {app.meta?.created_at ? new Date(app.meta.created_at).toLocaleDateString('en-IN', {day:'numeric',month:'short',year:'numeric'}) : '—'}
                      </div>
                    </div>
                    <div className="db-recent-badge"
                      style={{ color: approvalColor[app.meta?.approval_level] || '#8a96b0', background: `${approvalColor[app.meta?.approval_level] || '#8a96b0'}18` }}>
                      {app.meta?.approval_level?.split(' ')[0] || '—'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Platform overview ── */}
        <div className="db-platform-strip">
          {[
            { icon: '📊', label: '350-Point Scorecard', desc: '7 sections, 51 variables' },
            { icon: '🤖', label: 'ML Prediction Engine', desc: 'Real-time default probability' },
            { icon: '⚡', label: 'Instant STP', desc: 'Auto-approve ≥80% profiles' },
            { icon: '🔒', label: 'Full Audit Trail', desc: 'MongoDB-backed history' },
          ].map(p => (
            <div key={p.label} className="db-platform-item">
              <span className="db-platform-icon">{p.icon}</span>
              <div>
                <div className="db-platform-label">{p.label}</div>
                <div className="db-platform-desc">{p.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Profile panel */}
      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}

      {/* Logout confirm */}
      {showLogoutConfirm && (
        <LogoutConfirmDialog
          onConfirm={() => { setShowLogoutConfirm(false); logout() }}
          onCancel={() => setShowLogoutConfirm(false)}
        />
      )}
    </div>
  )
}

export default Dashboard