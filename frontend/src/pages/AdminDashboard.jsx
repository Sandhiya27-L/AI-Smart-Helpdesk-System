import { useState, useEffect } from 'react'
import Layout from '../components/layout/Layout'
import { getAnalytics, getAllUsers, toggleUser } from '../api/adminApi'
import toast from 'react-hot-toast'

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null)
  const [users, setUsers]         = useState([])
  const [tab, setTab]             = useState('analytics')

  useEffect(() => {
    getAnalytics().then(r => setAnalytics(r.data)).catch(() => toast.error('Failed to load analytics'))
    getAllUsers().then(r => setUsers(r.data)).catch(() => toast.error('Failed to load users'))
  }, [])

  const handleToggle = async (id) => {
    try {
      await toggleUser(id)
      setUsers(users.map(u => u.id === id ? { ...u, active: !u.active } : u))
      toast.success('User status updated')
    } catch { toast.error('Failed to update') }
  }

  const kpis = analytics ? [
    { label: 'Total Tickets',    value: analytics.totalTickets,       color: '#3b82f6', icon: '📋' },
    { label: 'Open',             value: analytics.openTickets,        color: '#f59e0b', icon: '🔓' },
    { label: 'Resolved',         value: analytics.resolvedTickets,    color: '#22c55e', icon: '✅' },
    { label: 'Resolution Rate',  value: analytics.resolutionRate+'%', color: '#a855f7', icon: '📈' },
    { label: 'Total Users',      value: analytics.totalUsers,         color: '#0ea5e9', icon: '👥' },
    { label: 'NLP Confidence',   value: analytics.nlpAvgConfidence+'%',color:'#6366f1', icon: '🤖' },
    { label: 'NLP Escalated',    value: analytics.nlpEscalatedCount,  color: '#ef4444', icon: '⚠️' },
    { label: 'In Progress',      value: analytics.inProgressTickets,  color: '#f97316', icon: '⚙️' },
  ] : []

  return (
    <Layout>
      <div style={s.main}>
        <h1 style={s.title}>Admin Dashboard</h1>

        {/* Tabs */}
        <div style={s.tabs}>
          {['analytics','users'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{ ...s.tab, ...(tab===t ? s.tabActive : {}) }}>
              {t === 'analytics' ? '📊 Analytics' : '👥 Users'}
            </button>
          ))}
        </div>

        {/* Analytics Tab */}
        {tab === 'analytics' && (
          <>
            <div style={s.kpiGrid}>
              {kpis.map(k => (
                <div key={k.label} style={{ ...s.kpiCard, borderLeft: `4px solid ${k.color}` }}>
                  <div style={s.kpiIcon}>{k.icon}</div>
                  <div style={{ ...s.kpiVal, color: k.color }}>{k.value}</div>
                  <div style={s.kpiLabel}>{k.label}</div>
                </div>
              ))}
            </div>

            {analytics?.ticketsByCategory?.length > 0 && (
              <div style={s.section}>
                <h2 style={s.sectionTitle}>Tickets by Category</h2>
                <div style={s.catGrid}>
                  {analytics.ticketsByCategory.map(c => {
                    const pct = analytics.totalTickets > 0
                      ? Math.round(c.count / analytics.totalTickets * 100) : 0
                    return (
                      <div key={c.name} style={s.catCard}>
                        <div style={s.catName}>{c.name}</div>
                        <div style={s.catCount}>{c.count}</div>
                        <div style={s.barBg}>
                          <div style={{ ...s.barFill, width: pct + '%' }} />
                        </div>
                        <div style={s.catPct}>{pct}%</div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            <div style={s.section}>
              <h2 style={s.sectionTitle}>Ticket Status Breakdown</h2>
              <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
                {[
                  { label:'Open',        value: analytics?.openTickets,       color:'#3b82f6' },
                  { label:'In Progress', value: analytics?.inProgressTickets, color:'#f97316' },
                  { label:'Resolved',    value: analytics?.resolvedTickets,   color:'#22c55e' },
                  { label:'Closed',      value: analytics?.closedTickets,     color:'#6b7280' },
                  { label:'Escalated',   value: analytics?.escalatedTickets,  color:'#ef4444' },
                ].map(item => (
                  <div key={item.label} style={{ background:'#0f172a', borderRadius:8, padding:'14px 20px', border:`1px solid ${item.color}33`, textAlign:'center', minWidth:110 }}>
                    <div style={{ color: item.color, fontSize:28, fontWeight:700 }}>{item.value ?? 0}</div>
                    <div style={{ color:'#94a3b8', fontSize:12, marginTop:4 }}>{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Users Tab */}
        {tab === 'users' && (
          <div style={s.section}>
            <h2 style={s.sectionTitle}>User Management ({users.length} users)</h2>
            <div style={s.tableWrap}>
              <table style={s.table}>
                <thead>
                  <tr>
                    {['Name','Email','Department','Role','Status','Action'].map(h => (
                      <th key={h} style={s.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} style={s.tr}>
                      <td style={s.td}>{u.name}</td>
                      <td style={s.td}>{u.email}</td>
                      <td style={s.td}>{u.department || '—'}</td>
                      <td style={s.td}>
                        <span style={{ ...s.chip, background:'#1e3a5f', color:'#93c5fd' }}>{u.role?.name}</span>
                      </td>
                      <td style={s.td}>
                        <span style={{ ...s.chip, background: u.active ? '#14532d' : '#7f1d1d', color: u.active ? '#86efac' : '#fca5a5' }}>
                          {u.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={s.td}>
                        <button onClick={() => handleToggle(u.id)} style={s.toggleBtn}>
                          {u.active ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

const s = {
  main: { padding:'28px', maxWidth:1100 },
  title: { color:'#f1f5f9', fontSize:24, fontWeight:700, margin:'0 0 20px' },
  tabs: { display:'flex', gap:8, marginBottom:24 },
  tab: { background:'transparent', border:'1px solid #334155', color:'#94a3b8', borderRadius:8, padding:'9px 18px', cursor:'pointer', fontSize:14 },
  tabActive: { background:'#1e293b', color:'#60a5fa', borderColor:'#3b82f6' },
  kpiGrid: { display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:24 },
  kpiCard: { background:'#1e293b', border:'1px solid #334155', borderRadius:10, padding:'18px' },
  kpiIcon: { fontSize:24, marginBottom:8 },
  kpiVal: { fontSize:28, fontWeight:700 },
  kpiLabel: { color:'#94a3b8', fontSize:12, marginTop:4 },
  section: { background:'#1e293b', border:'1px solid #334155', borderRadius:12, padding:'22px', marginBottom:20 },
  sectionTitle: { color:'#f1f5f9', fontSize:16, fontWeight:600, margin:'0 0 18px' },
  catGrid: { display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:14 },
  catCard: { background:'#0f172a', borderRadius:8, padding:14 },
  catName: { color:'#94a3b8', fontSize:12, marginBottom:4 },
  catCount: { color:'#f1f5f9', fontSize:24, fontWeight:700, marginBottom:8 },
  barBg: { background:'#1e293b', borderRadius:4, height:4, marginBottom:4 },
  barFill: { background:'linear-gradient(90deg,#3b82f6,#6366f1)', height:4, borderRadius:4 },
  catPct: { color:'#64748b', fontSize:11 },
  tableWrap: { overflowX:'auto' },
  table: { width:'100%', borderCollapse:'collapse' },
  th: { color:'#64748b', fontSize:11, fontWeight:600, padding:'10px 12px', textAlign:'left', borderBottom:'1px solid #334155', textTransform:'uppercase', whiteSpace:'nowrap' },
  tr: { borderBottom:'1px solid #1e293b' },
  td: { color:'#e2e8f0', fontSize:13, padding:'12px', verticalAlign:'middle' },
  chip: { padding:'3px 8px', borderRadius:5, fontSize:11, fontWeight:600 },
  toggleBtn: { background:'#334155', border:'none', color:'#94a3b8', borderRadius:6, padding:'6px 12px', cursor:'pointer', fontSize:12 },
}
