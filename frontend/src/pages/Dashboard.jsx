import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/layout/Layout'
import { useAuth } from '../context/AuthContext'
import { getMyTickets } from '../api/ticketApi'
import toast from 'react-hot-toast'

const PRIORITY_COLOR = { LOW:'#22c55e', MEDIUM:'#f59e0b', HIGH:'#ef4444', CRITICAL:'#dc2626' }
const STATUS_COLOR   = { OPEN:'#3b82f6', IN_PROGRESS:'#a855f7', RESOLVED:'#22c55e', CLOSED:'#6b7280', ESCALATED:'#ef4444' }

export default function Dashboard() {
  const { user } = useAuth()
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMyTickets()
      .then(r => setTickets(r.data.content || []))
      .catch(() => toast.error('Failed to load tickets'))
      .finally(() => setLoading(false))
  }, [])

  const stats = [
    { label: 'Total',       value: tickets.length,                                            color: '#3b82f6', icon: '📋' },
    { label: 'Open',        value: tickets.filter(t => t.status === 'OPEN').length,           color: '#f59e0b', icon: '🔓' },
    { label: 'In Progress', value: tickets.filter(t => t.status === 'IN_PROGRESS').length,    color: '#a855f7', icon: '⚙️' },
    { label: 'Resolved',    value: tickets.filter(t => t.status === 'RESOLVED').length,       color: '#22c55e', icon: '✅' },
  ]

  return (
    <Layout>
      <div style={s.main}>
        {/* Top bar */}
        <div style={s.topBar}>
          <div>
            <h1 style={s.pageTitle}>Dashboard</h1>
            <p style={s.pageSub}>Welcome back, {user?.name} 👋</p>
          </div>
          <Link to="/tickets" style={s.newBtn}>+ New Ticket</Link>
        </div>

        {/* Stats */}
        <div style={s.statsGrid}>
          {stats.map(st => (
            <div key={st.label} style={{ ...s.statCard, borderTop: `3px solid ${st.color}` }}>
              <div style={s.statIcon}>{st.icon}</div>
              <div style={{ ...s.statVal, color: st.color }}>{st.value}</div>
              <div style={s.statLabel}>{st.label}</div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div style={s.quickGrid}>
          <Link to="/chat" style={{ ...s.qCard, background: 'linear-gradient(135deg,#3b82f6,#6366f1)' }}>
            <span style={s.qIcon}>🤖</span>
            <span style={s.qTitle}>Ask AI Assistant</span>
            <span style={s.qDesc}>Get instant help for common IT issues</span>
          </Link>
          <Link to="/tickets" style={{ ...s.qCard, background: 'linear-gradient(135deg,#8b5cf6,#ec4899)' }}>
            <span style={s.qIcon}>🎫</span>
            <span style={s.qTitle}>Submit a Ticket</span>
            <span style={s.qDesc}>Raise a formal IT support request</span>
          </Link>
          <Link to="/kb" style={{ ...s.qCard, background: 'linear-gradient(135deg,#0ea5e9,#22c55e)' }}>
            <span style={s.qIcon}>📚</span>
            <span style={s.qTitle}>Knowledge Base</span>
            <span style={s.qDesc}>Browse self-service IT guides</span>
          </Link>
        </div>

        {/* Recent Tickets */}
        <div style={s.section}>
          <h2 style={s.sectionTitle}>Recent Tickets</h2>
          {loading ? (
            <p style={s.muted}>Loading...</p>
          ) : tickets.length === 0 ? (
            <div style={s.empty}>
              No tickets yet.{' '}
              <Link to="/tickets" style={{ color: '#60a5fa' }}>Submit your first ticket →</Link>
            </div>
          ) : (
            <div style={s.ticketList}>
              {tickets.slice(0, 6).map(t => (
                <div key={t.id} style={s.ticketRow}>
                  <span style={s.tktNum}>{t.ticketNumber}</span>
                  <span style={s.tktTitle}>{t.title}</span>
                  <span style={{ ...s.badge, background: PRIORITY_COLOR[t.priority] + '22', color: PRIORITY_COLOR[t.priority] }}>
                    {t.priority}
                  </span>
                  <span style={{ ...s.badge, background: STATUS_COLOR[t.status] + '22', color: STATUS_COLOR[t.status] }}>
                    {t.status.replace('_', ' ')}
                  </span>
                  <span style={s.tktDate}>{new Date(t.createdAt).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

const s = {
  main: { padding: '32px', maxWidth: 1100 },
  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 },
  pageTitle: { color: '#f1f5f9', fontSize: 26, fontWeight: 700, margin: 0 },
  pageSub: { color: '#94a3b8', fontSize: 14, margin: '6px 0 0' },
  newBtn: {
    background: 'linear-gradient(135deg,#3b82f6,#6366f1)', color: '#fff',
    textDecoration: 'none', padding: '11px 22px', borderRadius: 8, fontWeight: 600, fontSize: 14,
  },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 },
  statCard: {
    background: '#1e293b', border: '1px solid #334155', borderRadius: 12,
    padding: '20px', textAlign: 'center',
  },
  statIcon: { fontSize: 26, marginBottom: 8 },
  statVal:  { fontSize: 32, fontWeight: 700 },
  statLabel:{ color: '#94a3b8', fontSize: 12, marginTop: 4 },
  quickGrid:{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 28 },
  qCard:    { display: 'flex', flexDirection: 'column', padding: '22px', borderRadius: 12, textDecoration: 'none' },
  qIcon:    { fontSize: 30, marginBottom: 10 },
  qTitle:   { color: '#fff', fontSize: 16, fontWeight: 700, marginBottom: 6 },
  qDesc:    { color: 'rgba(255,255,255,0.7)', fontSize: 12 },
  section:  { background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: '22px' },
  sectionTitle: { color: '#f1f5f9', fontSize: 16, fontWeight: 600, margin: '0 0 18px' },
  muted:    { color: '#94a3b8', textAlign: 'center', padding: 20 },
  empty:    { color: '#94a3b8', textAlign: 'center', padding: 30, fontSize: 14 },
  ticketList: { display: 'flex', flexDirection: 'column', gap: 10 },
  ticketRow: {
    display: 'flex', alignItems: 'center', gap: 14, padding: '12px 14px',
    background: '#0f172a', borderRadius: 8, border: '1px solid #1e293b',
  },
  tktNum:  { color: '#60a5fa', fontWeight: 600, fontSize: 12, minWidth: 110, flexShrink: 0 },
  tktTitle:{ color: '#e2e8f0', flex: 1, fontSize: 13 },
  badge:   { padding: '3px 9px', borderRadius: 5, fontSize: 11, fontWeight: 600, flexShrink: 0 },
  tktDate: { color: '#64748b', fontSize: 12, flexShrink: 0 },
}
