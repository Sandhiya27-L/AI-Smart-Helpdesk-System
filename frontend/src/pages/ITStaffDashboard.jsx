import { useState, useEffect } from 'react'
import Layout from '../components/layout/Layout'
import { getAllTickets, updateTicket } from '../api/ticketApi'
import { getItStaff } from '../api/adminApi'
import toast from 'react-hot-toast'

const PRIORITY_COLOR = { LOW:'#22c55e', MEDIUM:'#f59e0b', HIGH:'#ef4444', CRITICAL:'#dc2626' }
const STATUS_OPTS    = ['OPEN','IN_PROGRESS','RESOLVED','CLOSED','ESCALATED']

export default function ITStaffDashboard() {
  const [tickets, setTickets] = useState([])
  const [staff, setStaff]     = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter]   = useState('ALL')

  useEffect(() => {
    Promise.all([getAllTickets(), getItStaff()])
      .then(([t, st]) => {
        setTickets(t.data.content || [])
        setStaff(st.data)
      })
      .catch(() => toast.error('Failed to load data'))
      .finally(() => setLoading(false))
  }, [])

  const handleStatus = async (ticketId, status) => {
    try {
      await updateTicket(ticketId, status, null)
      setTickets(tickets.map(t => t.id === ticketId ? { ...t, status } : t))
      toast.success('Status updated')
    } catch { toast.error('Failed to update status') }
  }

  const handleAssign = async (ticketId, staffId) => {
    if (!staffId) return
    try {
      await updateTicket(ticketId, null, staffId)
      const staffMember = staff.find(s => s.id === Number(staffId))
      setTickets(tickets.map(t => t.id === ticketId ? { ...t, assignedToName: staffMember?.name } : t))
      toast.success('Ticket assigned')
    } catch { toast.error('Failed to assign ticket') }
  }

  const filtered = filter === 'ALL' ? tickets : tickets.filter(t => t.status === filter)

  const stats = [
    { label:'Total',       value: tickets.length,                                            color:'#3b82f6' },
    { label:'Open',        value: tickets.filter(t=>t.status==='OPEN').length,               color:'#f59e0b' },
    { label:'In Progress', value: tickets.filter(t=>t.status==='IN_PROGRESS').length,        color:'#a855f7' },
    { label:'Resolved',    value: tickets.filter(t=>t.status==='RESOLVED').length,           color:'#22c55e' },
    { label:'Critical',    value: tickets.filter(t=>t.priority==='CRITICAL').length,         color:'#ef4444' },
  ]

  return (
    <Layout>
      <div style={s.main}>
        <h1 style={s.title}>IT Staff Dashboard</h1>
        <p style={s.sub}>Manage and resolve all support tickets</p>

        {/* Stats */}
        <div style={s.statsGrid}>
          {stats.map(st => (
            <div key={st.label} style={{ ...s.statCard, borderTop:`3px solid ${st.color}` }}>
              <div style={{ ...s.statVal, color: st.color }}>{st.value}</div>
              <div style={s.statLabel}>{st.label}</div>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div style={s.filterBar}>
          {['ALL',...STATUS_OPTS].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ ...s.filterBtn, ...(filter===f ? s.filterActive : {}) }}>
              {f.replace('_',' ')}
            </button>
          ))}
        </div>

        {/* Tickets */}
        {loading ? <p style={s.muted}>Loading...</p> : filtered.length === 0 ? (
          <div style={s.empty}>No tickets for this filter.</div>
        ) : (
          <div style={s.grid}>
            {filtered.map(ticket => (
              <div key={ticket.id} style={s.card}>
                <div style={s.cardTop}>
                  <span style={s.tktNum}>{ticket.ticketNumber}</span>
                  <span style={{ ...s.badge, background: PRIORITY_COLOR[ticket.priority]+'22', color: PRIORITY_COLOR[ticket.priority] }}>
                    {ticket.priority}
                  </span>
                </div>
                <div style={s.cardTitle}>{ticket.title}</div>
                <div style={s.cardDesc}>{ticket.description.slice(0,120)}...</div>
                <div style={s.cardMeta}>
                  <span>👤 {ticket.createdByName}</span>
                  <span>📁 {ticket.categoryName}</span>
                </div>
                {ticket.assignedToName && (
                  <div style={s.assignedTo}>🔧 Assigned: {ticket.assignedToName}</div>
                )}

                {ticket.aiSuggestedSolution && (
                  <div style={s.aiBox}>
                    <div style={s.aiLabel}>🤖 AI Suggestion ({Math.round((ticket.aiConfidenceScore||0)*100)}% confidence)</div>
                    <div style={s.aiText}>{ticket.aiSuggestedSolution.slice(0,160)}...</div>
                  </div>
                )}

                <div style={s.actions}>
                  <select
                    value={ticket.status}
                    onChange={e => handleStatus(ticket.id, e.target.value)}
                    style={s.select}
                  >
                    {STATUS_OPTS.map(o => <option key={o} value={o}>{o.replace('_',' ')}</option>)}
                  </select>
                  <select
                    defaultValue=""
                    onChange={e => handleAssign(ticket.id, e.target.value)}
                    style={s.select}
                  >
                    <option value="" disabled>Assign to...</option>
                    {staff.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}

const s = {
  main: { padding:'28px', maxWidth:1200 },
  title: { color:'#f1f5f9', fontSize:24, fontWeight:700, margin:0 },
  sub: { color:'#94a3b8', fontSize:13, margin:'4px 0 22px' },
  statsGrid: { display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:14, marginBottom:20 },
  statCard: { background:'#1e293b', border:'1px solid #334155', borderRadius:10, padding:'16px', textAlign:'center' },
  statVal: { fontSize:28, fontWeight:700 },
  statLabel: { color:'#94a3b8', fontSize:12, marginTop:4 },
  filterBar: { display:'flex', gap:8, marginBottom:20, flexWrap:'wrap' },
  filterBtn: { background:'transparent', border:'1px solid #334155', color:'#94a3b8', borderRadius:8, padding:'8px 14px', cursor:'pointer', fontSize:13 },
  filterActive: { background:'#1e293b', color:'#60a5fa', borderColor:'#3b82f6' },
  muted: { color:'#94a3b8', textAlign:'center', padding:40 },
  empty: { color:'#94a3b8', textAlign:'center', padding:60, fontSize:14 },
  grid: { display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(340px,1fr))', gap:16 },
  card: { background:'#1e293b', border:'1px solid #334155', borderRadius:12, padding:18, display:'flex', flexDirection:'column', gap:10 },
  cardTop: { display:'flex', justifyContent:'space-between', alignItems:'center' },
  tktNum: { color:'#60a5fa', fontSize:11, fontWeight:600 },
  badge: { padding:'3px 8px', borderRadius:5, fontSize:11, fontWeight:600 },
  cardTitle: { color:'#f1f5f9', fontWeight:600, fontSize:14 },
  cardDesc: { color:'#94a3b8', fontSize:12, lineHeight:1.5 },
  cardMeta: { display:'flex', gap:14, color:'#64748b', fontSize:11 },
  assignedTo: { color:'#60a5fa', fontSize:12 },
  aiBox: { background:'#0f172a', borderRadius:8, padding:12 },
  aiLabel: { color:'#a855f7', fontSize:11, fontWeight:600, marginBottom:6 },
  aiText: { color:'#c4b5fd', fontSize:12, lineHeight:1.5 },
  actions: { display:'flex', gap:10, marginTop:4 },
  select: { flex:1, background:'#0f172a', border:'1px solid #334155', color:'#e2e8f0', borderRadius:6, padding:'8px 10px', fontSize:12, outline:'none' },
}
