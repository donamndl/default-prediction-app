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

const APPROVAL_COLORS = {
  'STP (Straight Through Processing)': '#00e5a0',
  'L1 Approval': '#3d6aff',
  'L2 Approval': '#ffb020',
  'L3 / Reject': '#ff4d6a',
}
const APPROVAL_SHORT = {
  'STP (Straight Through Processing)': 'STP',
  'L1 Approval': 'L1',
  'L2 Approval': 'L2',
  'L3 / Reject': 'Reject',
}
 
/* ─── Custom tooltip ─────────────────────────── */
const ChartTooltip = ({ active, payload, label, unit = '' }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="db-tooltip">
      {label && <div className="db-tooltip-label">{label}</div>}
      {payload.map((p, i) => (
        <div key={i} className="db-tooltip-row">
          <span className="db-tooltip-dot" style={{ background: p.color || p.fill }} />
          <span className="db-tooltip-name">{p.name}</span>
          <span className="db-tooltip-val">{p.value}{unit}</span>
        </div>
      ))}
    </div>
  )
}
 
/* ─── Stat card ──────────────────────────────── */
const StatCard = ({ icon, label, value, sub, color }) => (
  <div className="db-stat-card">
    <div className="db-stat-icon-wrap" style={{ background: `${color}15`, color }}>{icon}</div>
    <div className="db-stat-body">
      <div className="db-stat-value" style={{ color }}>{value}</div>
      <div className="db-stat-label">{label}</div>
      {sub && <div className="db-stat-sub">{sub}</div>}
    </div>
  </div>
)
 
/* ─── Chart empty state ──────────────────────── */
const ChartEmpty = ({ msg }) => (
  <div className="db-chart-empty">
    <svg viewBox="0 0 48 48" fill="none" style={{width:40,height:40,color:'var(--border)',marginBottom:8}}>
      <rect x="4"  y="28" width="8" height="16" rx="2" fill="currentColor"/>
      <rect x="16" y="18" width="8" height="26" rx="2" fill="currentColor" opacity=".6"/>
      <rect x="28" y="8"  width="8" height="36" rx="2" fill="currentColor" opacity=".3"/>
      <rect x="40" y="22" width="8" height="22" rx="2" fill="currentColor" opacity=".15"/>
    </svg>
    <p>{msg || 'Run your first assessment to see data here.'}</p>
  </div>
)
 
/* ─── Build chart data from API response ─────── */
const buildCharts = (stats, allApps) => {
  const approvalPie = Object.entries(stats?.approval_dist || {}).map(([k, v]) => ({
    name: APPROVAL_SHORT[k] || k, value: v, color: APPROVAL_COLORS[k] || '#8a96b0', full: k,
  }))
 
  const daily = (stats?.daily_counts || []).slice(-14).map(d => ({
    date: d.date?.slice(5) || '', count: d.count,
  }))
 
  const buckets = { '0–40': 0, '40–60': 0, '60–80': 0, '80–100': 0 }
  ;(allApps || []).forEach(app => {
    const pct = app.scorecard?.score_percentage ?? app.meta?.score_pct ?? 0
    if (pct < 40)      buckets['0–40']++
    else if (pct < 60) buckets['40–60']++
    else if (pct < 80) buckets['60–80']++
    else               buckets['80–100']++
  })
  const scoreBars = Object.entries(buckets).map(([range, count]) => ({ range, count }))
  const scoreBarColors = ['#ff4d6a', '#ffb020', '#3d6aff', '#00e5a0']
 
  const mlSplit = [
    { name: 'No Default', value: Number(stats?.ml_dist?.['0'] ?? 0), color: '#00e5a0' },
    { name: 'Default',    value: Number(stats?.ml_dist?.['1'] ?? 0), color: '#ff4d6a' },
  ].filter(d => d.value > 0)
 
  return { approvalPie, daily, scoreBars, scoreBarColors, mlSplit }
}
 
/* ═══════════════════════════════════════════════
   MAIN DASHBOARD
═══════════════════════════════════════════════ */
const Dashboard = () => {
  const { user, logout }       = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { resetForm }          = useForm()
  const navigate               = useNavigate()
 
  const [showProfile,       setShowProfile]       = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [recentApps,        setRecentApps]        = useState([])
  const [allApps,           setAllApps]           = useState([])
  const [stats,             setStats]             = useState(null)
  const [loading,           setLoading]           = useState(true)
 
  useEffect(() => {
    const token = (() => { try { return JSON.parse(localStorage.getItem('cs-auth') || '{}').token || '' } catch { return '' } })()
    const hdrs  = { Authorization: `Bearer ${token}` }
    Promise.all([
      fetch('/api/dashboard/stats',        { headers: hdrs }).then(r => r.json()).catch(() => null),
      fetch('/api/applications?per_page=50', { headers: hdrs }).then(r => r.json()).catch(() => null),
    ]).then(([s, a]) => {
      if (s?.status === 'success') setStats(s.stats)
      if (a?.status === 'success') { setAllApps(a.data || []); setRecentApps((a.data || []).slice(0, 8)) }
    }).finally(() => setLoading(false))
  }, [])
 
  const handleStart = () => { resetForm(); navigate('/form') }
 
  const greeting  = () => { const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening' }
  const firstName = user?.name?.split(' ')[0] || 'there'
  const total     = stats?.total ?? 0
  const avgScore  = stats?.avg_score_pct ?? 0
  const stpCount  = stats?.approval_dist?.['STP (Straight Through Processing)'] ?? 0
  const stpRate   = total > 0 ? Math.round((stpCount / total) * 100) : 0
  const defCount  = Number(stats?.ml_dist?.['1'] ?? 0)
  const hasData   = total > 0
 
  const { approvalPie, daily, scoreBars, scoreBarColors, mlSplit } = buildCharts(stats, allApps)
 
  return (
    <div className="db-root">
 
      {/* ──────────── NAV ──────────── */}
      <header className="db-nav">
        <div className="db-nav-inner">
          <div className="db-nav-brand">
            <svg viewBox="0 0 32 32" fill="none" style={{width:30,height:30,flexShrink:0}}>
              <rect width="32" height="32" rx="8" fill="url(#dbG)"/>
              <path d="M8 22l5-9 4 6 3-4 4 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <defs><linearGradient id="dbG" x1="0" y1="0" x2="32" y2="32"><stop offset="0%" stopColor="#3d6aff"/><stop offset="100%" stopColor="#00d4ff"/></linearGradient></defs>
            </svg>
            <div>
              <div className="db-nav-brand-name">CreditSense</div>
              <div className="db-nav-brand-tag">Dashboard</div>
            </div>
          </div>
 
          <div className="db-nav-actions">
            <button className="db-nav-cta" onClick={handleStart}>
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                <path d="M8 2v12M2 8h12"/>
              </svg>
              New Assessment
            </button>
            <button className="theme-toggle-btn" onClick={toggleTheme}>
              {theme === 'dark'
                ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>
                : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
              }
              <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
            </button>
            <div className="topbar-user-chip">
              <button type="button" className="topbar-profile-btn" onClick={() => setShowProfile(true)}>
                <div className="topbar-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
                <span className="topbar-username">{user?.name}</span>
              </button>
              <button type="button" className="topbar-logout-btn" onClick={() => setShowLogoutConfirm(true)}>
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M13 7l3 3m0 0l-3 3m3-3H8m4-7H5a2 2 0 00-2 2v10a2 2 0 002 2h7"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>
 
      <main className="db-main">
 
        {/* ──────────── WELCOME ──────────── */}
        <div className="db-welcome">
          <div className="db-welcome-text">
            <h1 className="db-welcome-title">
              {greeting()}, <span className="db-welcome-name">{firstName}</span> 👋
            </h1>
            <p className="db-welcome-sub">
              {hasData
                ? `${total} assessment${total !== 1 ? 's' : ''} on record · Average score ${avgScore}% · STP rate ${stpRate}%`
                : 'Welcome to your credit risk dashboard. Start an assessment to populate your analytics.'}
            </p>
          </div>
          {!hasData && (
            <button className="db-start-btn" onClick={handleStart}>
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M10 3H5a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-5M15 3l2 2-7 7-3 1 1-3 7-7z"/>
              </svg>
              Start First Assessment
            </button>
          )}
        </div>
 
        {/* ──────────── KPI CARDS ──────────── */}
        <div className="db-stats-grid">
          <StatCard color="#3d6aff" label="Total Assessments" value={loading ? '—' : total} sub="All time"
            icon={<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>}
          />
          <StatCard color="#00e5a0" label="STP Rate" value={loading ? '—' : `${stpRate}%`} sub={`${stpCount} auto-approved`}
            icon={<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}
          />
          <StatCard color="#ffb020" label="Avg Score" value={loading ? '—' : `${avgScore}%`} sub="Scorecard average"
            icon={<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"/></svg>}
          />
          <StatCard color="#ff4d6a" label="Default Flags" value={loading ? '—' : defCount} sub="ML predicted"
            icon={<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>}
          />
        </div>
 
        {/* ──────────── ROW 1: Activity + Approval Mix ──────────── */}
        <div className="db-chart-row">
 
          {/* Area chart — daily activity */}
          <div className="db-chart-card db-chart-wide">
            <div className="db-chart-header">
              <h3 className="db-chart-title">Assessment Activity</h3>
              <span className="db-chart-sub">Past 14 days</span>
            </div>
            {hasData && daily.length > 0 ? (
              <ResponsiveContainer width="100%" height={190}>
                <AreaChart data={daily} margin={{ top: 8, right: 4, bottom: 0, left: -22 }}>
                  <defs>
                    <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#3d6aff" stopOpacity={0.22}/>
                      <stop offset="95%" stopColor="#3d6aff" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false}/>
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false}/>
                  <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} allowDecimals={false}/>
                  <Tooltip content={<ChartTooltip unit=" assessments"/>}/>
                  <Area type="monotone" dataKey="count" name="Assessments" stroke="#3d6aff" strokeWidth={2} fill="url(#ag)" dot={false} activeDot={{ r: 4, fill: '#3d6aff' }}/>
                </AreaChart>
              </ResponsiveContainer>
            ) : <ChartEmpty msg="Daily activity will appear after assessments."/>}
          </div>
 
          {/* Donut — approval distribution */}
          <div className="db-chart-card">
            <div className="db-chart-header">
              <h3 className="db-chart-title">Approval Mix</h3>
              <span className="db-chart-sub">Decision levels</span>
            </div>
            {hasData && approvalPie.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={155}>
                  <PieChart>
                    <Pie data={approvalPie} cx="50%" cy="50%" innerRadius={44} outerRadius={66} paddingAngle={3} dataKey="value">
                      {approvalPie.map((e, i) => <Cell key={i} fill={e.color} stroke="none"/>)}
                    </Pie>
                    <Tooltip formatter={(v, n) => [`${v} apps`, n]} contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}/>
                  </PieChart>
                </ResponsiveContainer>
                <div className="db-pie-legend">
                  {approvalPie.map(d => (
                    <div key={d.name} className="db-pie-row">
                      <span className="db-pie-dot" style={{ background: d.color }}/>
                      <span className="db-pie-lbl">{d.name}</span>
                      <span className="db-pie-val">{d.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : <ChartEmpty msg="Approval data will appear here."/>}
          </div>
        </div>
 
        {/* ──────────── ROW 2: Score Bands + ML Split ──────────── */}
        <div className="db-chart-row">
 
          {/* Bar chart — score distribution */}
          <div className="db-chart-card db-chart-wide">
            <div className="db-chart-header">
              <h3 className="db-chart-title">Score Distribution</h3>
              <span className="db-chart-sub">Assessments per score band</span>
            </div>
            {hasData ? (
              <ResponsiveContainer width="100%" height={190}>
                <BarChart data={scoreBars} margin={{ top: 8, right: 4, bottom: 0, left: -22 }} barSize={40}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false}/>
                  <XAxis dataKey="range" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false}/>
                  <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} allowDecimals={false}/>
                  <Tooltip content={<ChartTooltip unit=" applications"/>}/>
                  <Bar dataKey="count" name="Applications" radius={[5, 5, 0, 0]}>
                    {scoreBars.map((_, i) => <Cell key={i} fill={scoreBarColors[i]} fillOpacity={0.88}/>)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : <ChartEmpty msg="Score bands will populate as you run assessments."/>}
          </div>
 
          {/* Donut — ML default split */}
          <div className="db-chart-card">
            <div className="db-chart-header">
              <h3 className="db-chart-title">ML Prediction Split</h3>
              <span className="db-chart-sub">Default vs no-default</span>
            </div>
            {hasData && mlSplit.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={155}>
                  <PieChart>
                    <Pie data={mlSplit} cx="50%" cy="50%" innerRadius={44} outerRadius={66} startAngle={90} endAngle={-270} paddingAngle={4} dataKey="value">
                      {mlSplit.map((e, i) => <Cell key={i} fill={e.color} stroke="none"/>)}
                    </Pie>
                    <Tooltip formatter={(v, n) => [`${v}`, n]} contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}/>
                  </PieChart>
                </ResponsiveContainer>
                <div className="db-pie-legend">
                  {mlSplit.map(d => (
                    <div key={d.name} className="db-pie-row">
                      <span className="db-pie-dot" style={{ background: d.color }}/>
                      <span className="db-pie-lbl">{d.name}</span>
                      <span className="db-pie-val">{d.value} ({total > 0 ? Math.round((d.value / total) * 100) : 0}%)</span>
                    </div>
                  ))}
                </div>
              </>
            ) : <ChartEmpty msg="ML predictions will appear here."/>}
          </div>
        </div>
 
        {/* ──────────── ASSESSMENTS TABLE ──────────── */}
        <div className="db-table-card">
          <div className="db-table-header">
            <div>
              <h3 className="db-chart-title">Recent Assessments</h3>
              <p className="db-chart-sub">Last {recentApps.length || '—'} credit evaluations</p>
            </div>
            <button className="db-nav-cta" onClick={handleStart}>
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M8 2v12M2 8h12"/></svg>
              New
            </button>
          </div>
 
          {loading ? (
            <div className="db-table-loading">{[1,2,3,4].map(i => <div key={i} className="db-table-skeleton"/>)}</div>
          ) : recentApps.length === 0 ? (
            <div className="db-recent-empty">
              <div className="db-empty-icon">📭</div>
              <p className="db-empty-title">No assessments yet</p>
              <p className="db-empty-sub">Completed assessments will appear here.</p>
              <button className="db-empty-btn" onClick={handleStart}>Start First Assessment →</button>
            </div>
          ) : (
            <div className="db-table-wrap">
              <table className="db-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Date</th>
                    <th>Score</th>
                    <th>Percentage</th>
                    <th>Decision</th>
                    <th>ML Prediction</th>
                    <th>Default Prob.</th>
                  </tr>
                </thead>
                <tbody>
                  {recentApps.map((app, i) => {
                    const level  = app.meta?.approval_level || app.scorecard?.approval_level || '—'
                    const color  = APPROVAL_COLORS[level] || '#8a96b0'
                    const short  = APPROVAL_SHORT[level] || level
                    const score  = app.scorecard?.total_score ?? '—'
                    const pct    = app.scorecard?.score_percentage ?? app.meta?.score_pct ?? 0
                    const mlLbl  = app.prediction?.prediction_label ?? (app.meta?.ml_prediction === 1 ? 'Default' : app.meta?.ml_prediction === 0 ? 'No Default' : '—')
                    const mlProb = app.prediction?.default_probability ?? '—'
                    const date   = app.meta?.created_at
                      ? new Date(app.meta.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                      : '—'
                    return (
                      <tr key={app._id || i}>
                        <td className="db-td-idx">{i + 1}</td>
                        <td className="db-td-date">{date}</td>
                        <td className="db-td-score">{score}<span className="db-td-max">/350</span></td>
                        <td className="db-td-pct">
                          <div className="db-pct-row">
                            <div className="db-pct-track">
                              <div className="db-pct-fill" style={{ width: `${pct}%`, background: color }}/>
                            </div>
                            <span className="db-pct-num">{pct}%</span>
                          </div>
                        </td>
                        <td>
                          <span className="db-td-badge" style={{ color, background: `${color}18` }}>{short}</span>
                        </td>
                        <td>
                          <span className={`db-td-ml ${mlLbl === 'Default' ? 'ml-red' : mlLbl === 'No Default' ? 'ml-green' : ''}`}>
                            {mlLbl}
                          </span>
                        </td>
                        <td className="db-td-prob">{mlProb !== '—' ? `${mlProb}%` : '—'}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
 
      </main>
 
      {showProfile && <ProfileModal onClose={() => setShowProfile(false)}/>}
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