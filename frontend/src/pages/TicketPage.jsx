import { useState, useEffect } from 'react'
import Layout from '../components/layout/Layout'
import { getMyTickets, createTicket, addComment, getComments } from '../api/ticketApi'
import toast from 'react-hot-toast'

const PRIORITY_COLOR = { LOW:'#22c55e', MEDIUM:'#f59e0b', HIGH:'#ef4444', CRITICAL:'#dc2626' }
const STATUS_COLOR   = { OPEN:'#3b82f6', IN_PROGRESS:'#a855f7', RESOLVED:'#22c55e', CLOSED:'#6b7280', ESCALATED:'#ef4444' }

const CATEGORIES = [
  { id:'1',name:'Hardware' },{ id:'2',name:'Software' },{ id:'3',name:'Network' },
  { id:'4',name:'Security' },{ id:'5',name:'Email' },{ id:'6',name:'Printer' },
  { id:'7',name:'Access' },{ id:'8',name:'Other' },
]

export default function TicketPage() {
  const [tickets, setTickets]       = useState([])
  const [loading, setLoading]       = useState(true)
  const [showForm, setShowForm]     = useState(false)
  const [selected, setSelected]     = useState(null)
  const [comments, setComments]     = useState([])
  const [commentText, setCommentText] = useState('')
  const [search, setSearch]         = useState('')
  const [form, setForm] = useState({ title: '', description: '', categoryId: '', priority: 'MEDIUM' })

  useEffect(() => { loadTickets() }, [])

  const loadTickets = () => {
    setLoading(true)
    getMyTickets()
      .then(r => setTickets(r.data.content || []))
      .catch(() => toast.error('Failed to load tickets'))
      .finally(() => setLoading(false))
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      await createTicket(form)
      toast.success('Ticket created!')
      setShowForm(false)
      setForm({ title: '', description: '', categoryId: '', priority: 'MEDIUM' })
      loadTickets()
    } catch { toast.error('Failed to create ticket') }
  }

  const openTicket = async (ticket) => {
    setSelected(ticket)
    const res = await getComments(ticket.id)
    setComments(res.data)
  }

  const handleComment = async () => {
    if (!commentText.trim()) return
    try {
      await addComment(selected.id, { content: commentText, isInternal: false })
      setCommentText('')
      const res = await getComments(selected.id)
      setComments(res.data)
      toast.success('Comment added')
    } catch { toast.error('Failed to add comment') }
  }

  const filtered = tickets.filter(t =>
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.ticketNumber.toLowerCase().includes(search.toLowerCase())
  )

  // ── Detail view ──────────────────────────────────────────────
  if (selected) return (
    <Layout>
      <div style={s.main}>
        <button onClick={() => setSelected(null)} style={s.backBtn}>← Back to Tickets</button>

        <div style={s.detailCard}>
          <div style={s.detailTop}>
            <div>
              <span style={s.tktNum}>{selected.ticketNumber}</span>
              <h2 style={s.detailTitle}>{selected.title}</h2>
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <span style={{ ...s.badge, background: PRIORITY_COLOR[selected.priority]+'22', color: PRIORITY_COLOR[selected.priority] }}>{selected.priority}</span>
              <span style={{ ...s.badge, background: STATUS_COLOR[selected.status]+'22', color: STATUS_COLOR[selected.status] }}>{selected.status.replace('_',' ')}</span>
            </div>
          </div>
          <p style={s.detailDesc}>{selected.description}</p>
          <div style={s.detailMeta}>
            <span>📁 {selected.categoryName}</span>
            <span>👤 {selected.createdByName}</span>
            <span>📅 {new Date(selected.createdAt).toLocaleString()}</span>
          </div>

          {selected.aiSuggestedSolution && (
            <div style={s.aiBox}>
              <div style={s.aiLabel}>🤖 AI Suggested Solution</div>
              <pre style={s.aiText}>{selected.aiSuggestedSolution}</pre>
              {selected.aiConfidenceScore && (
                <div style={s.aiConf}>Confidence: {Math.round(selected.aiConfidenceScore * 100)}%</div>
              )}
            </div>
          )}
        </div>

        {/* Comments */}
        <div style={s.section}>
          <h3 style={s.sectionTitle}>Comments ({comments.length})</h3>
          <div style={s.commentList}>
            {comments.length === 0 && <p style={s.muted}>No comments yet.</p>}
            {comments.map(c => (
              <div key={c.id} style={s.commentCard}>
                <div style={s.commentMeta}>
                  <span style={s.commentAuthor}>{c.user?.name}</span>
                  <span style={s.commentDate}>{new Date(c.createdAt).toLocaleString()}</span>
                </div>
                <p style={s.commentText}>{c.content}</p>
              </div>
            ))}
          </div>
          <div style={s.commentInput}>
            <textarea
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              placeholder="Add a comment..."
              style={s.textarea}
              rows={3}
            />
            <button onClick={handleComment} style={s.sendBtn}>Send Comment</button>
          </div>
        </div>
      </div>
    </Layout>
  )

  // ── List view ────────────────────────────────────────────────
  return (
    <Layout>
      <div style={s.main}>
        <div style={s.topBar}>
          <div>
            <h1 style={s.pageTitle}>My Tickets</h1>
            <p style={s.pageSub}>{tickets.length} total tickets</p>
          </div>
          <button onClick={() => setShowForm(true)} style={s.newBtn}>+ New Ticket</button>
        </div>

        {/* Search */}
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="🔍  Search tickets..."
          style={s.searchInput}
        />

        {/* Create form modal */}
        {showForm && (
          <div style={s.modalOverlay}>
            <div style={s.modal}>
              <h2 style={s.modalTitle}>Create New Ticket</h2>
              <form onSubmit={handleCreate} style={s.form}>
                <div style={s.field}>
                  <label style={s.label}>Title *</label>
                  <input required value={form.title} onChange={e => setForm({...form, title: e.target.value})} style={s.input} placeholder="Brief description of your issue" />
                </div>
                <div style={s.field}>
                  <label style={s.label}>Description *</label>
                  <textarea required rows={4} value={form.description} onChange={e => setForm({...form, description: e.target.value})} style={{...s.input, resize:'vertical'}} placeholder="Describe your issue in detail..." />
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                  <div style={s.field}>
                    <label style={s.label}>Category</label>
                    <select value={form.categoryId} onChange={e => setForm({...form, categoryId: e.target.value})} style={s.input}>
                      <option value="">Select category</option>
                      {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div style={s.field}>
                    <label style={s.label}>Priority</label>
                    <select value={form.priority} onChange={e => setForm({...form, priority: e.target.value})} style={s.input}>
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="CRITICAL">Critical</option>
                    </select>
                  </div>
                </div>
                <div style={s.modalActions}>
                  <button type="button" onClick={() => setShowForm(false)} style={s.cancelBtn}>Cancel</button>
                  <button type="submit" style={s.newBtn}>Create Ticket</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Ticket list */}
        {loading ? <p style={s.muted}>Loading...</p> : filtered.length === 0 ? (
          <div style={s.empty}>No tickets found.</div>
        ) : (
          <div style={s.ticketGrid}>
            {filtered.map(t => (
              <div key={t.id} style={s.ticketCard} onClick={() => openTicket(t)}>
                <div style={s.cardTop}>
                  <span style={s.tktNum}>{t.ticketNumber}</span>
                  <span style={{ ...s.badge, background: PRIORITY_COLOR[t.priority]+'22', color: PRIORITY_COLOR[t.priority] }}>{t.priority}</span>
                </div>
                <div style={s.cardTitle}>{t.title}</div>
                <div style={s.cardDesc}>{t.description.slice(0, 100)}...</div>
                <div style={s.cardBottom}>
                  <span style={s.catChip}>{t.categoryName}</span>
                  <span style={{ ...s.badge, background: STATUS_COLOR[t.status]+'22', color: STATUS_COLOR[t.status] }}>{t.status.replace('_',' ')}</span>
                </div>
                <div style={s.cardDate}>{new Date(t.createdAt).toLocaleDateString()}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}

const s = {
  main: { padding: '28px', maxWidth: 1100 },
  topBar: { display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20 },
  pageTitle: { color:'#f1f5f9', fontSize:24, fontWeight:700, margin:0 },
  pageSub: { color:'#94a3b8', fontSize:13, margin:'4px 0 0' },
  newBtn: { background:'linear-gradient(135deg,#3b82f6,#6366f1)', color:'#fff', border:'none', borderRadius:8, padding:'11px 20px', fontWeight:600, fontSize:14, cursor:'pointer', textDecoration:'none' },
  searchInput: { width:'100%', background:'#1e293b', border:'1px solid #334155', borderRadius:8, padding:'11px 16px', color:'#f1f5f9', fontSize:14, outline:'none', marginBottom:20 },
  ticketGrid: { display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:16 },
  ticketCard: { background:'#1e293b', border:'1px solid #334155', borderRadius:12, padding:'18px', cursor:'pointer', transition:'border-color 0.2s' },
  cardTop: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 },
  tktNum: { color:'#60a5fa', fontSize:11, fontWeight:600 },
  badge: { padding:'3px 8px', borderRadius:5, fontSize:11, fontWeight:600 },
  cardTitle: { color:'#f1f5f9', fontWeight:600, fontSize:14, marginBottom:6 },
  cardDesc: { color:'#94a3b8', fontSize:12, lineHeight:1.5, marginBottom:10 },
  cardBottom: { display:'flex', justifyContent:'space-between', alignItems:'center' },
  catChip: { background:'#334155', color:'#94a3b8', padding:'3px 8px', borderRadius:5, fontSize:11 },
  cardDate: { color:'#64748b', fontSize:11, marginTop:8 },
  muted: { color:'#94a3b8', textAlign:'center', padding:40 },
  empty: { color:'#94a3b8', textAlign:'center', padding:60, fontSize:14 },
  modalOverlay: { position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 },
  modal: { background:'#1e293b', border:'1px solid #334155', borderRadius:16, padding:32, width:'90%', maxWidth:560, maxHeight:'90vh', overflowY:'auto' },
  modalTitle: { color:'#f1f5f9', fontSize:20, fontWeight:700, margin:'0 0 24px' },
  form: { display:'flex', flexDirection:'column', gap:16 },
  field: { display:'flex', flexDirection:'column', gap:6 },
  label: { color:'#94a3b8', fontSize:13, fontWeight:500 },
  input: { background:'#0f172a', border:'1px solid #334155', borderRadius:8, padding:'11px 14px', color:'#f1f5f9', fontSize:14, outline:'none' },
  modalActions: { display:'flex', gap:12, justifyContent:'flex-end', marginTop:8 },
  cancelBtn: { background:'transparent', border:'1px solid #334155', color:'#94a3b8', borderRadius:8, padding:'11px 20px', cursor:'pointer', fontSize:14 },
  backBtn: { background:'transparent', border:'none', color:'#60a5fa', cursor:'pointer', fontSize:14, marginBottom:20, padding:0 },
  detailCard: { background:'#1e293b', border:'1px solid #334155', borderRadius:12, padding:24, marginBottom:20 },
  detailTop: { display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 },
  detailTitle: { color:'#f1f5f9', fontSize:20, fontWeight:700, margin:'6px 0 0' },
  detailDesc: { color:'#94a3b8', fontSize:14, lineHeight:1.6, marginBottom:14 },
  detailMeta: { display:'flex', gap:20, color:'#64748b', fontSize:12 },
  aiBox: { background:'#0f172a', border:'1px solid #334155', borderRadius:8, padding:16, marginTop:16 },
  aiLabel: { color:'#a855f7', fontSize:12, fontWeight:600, marginBottom:8 },
  aiText: { color:'#c4b5fd', fontSize:13, lineHeight:1.6, whiteSpace:'pre-wrap', fontFamily:'inherit' },
  aiConf: { color:'#64748b', fontSize:11, marginTop:8 },
  section: { background:'#1e293b', border:'1px solid #334155', borderRadius:12, padding:22 },
  sectionTitle: { color:'#f1f5f9', fontSize:16, fontWeight:600, margin:'0 0 16px' },
  commentList: { display:'flex', flexDirection:'column', gap:12, marginBottom:16 },
  commentCard: { background:'#0f172a', borderRadius:8, padding:14 },
  commentMeta: { display:'flex', justifyContent:'space-between', marginBottom:6 },
  commentAuthor: { color:'#60a5fa', fontSize:13, fontWeight:600 },
  commentDate: { color:'#64748b', fontSize:11 },
  commentText: { color:'#e2e8f0', fontSize:13, lineHeight:1.5 },
  commentInput: { display:'flex', flexDirection:'column', gap:10 },
  textarea: { background:'#0f172a', border:'1px solid #334155', borderRadius:8, padding:'11px 14px', color:'#f1f5f9', fontSize:14, outline:'none', resize:'vertical' },
  sendBtn: { background:'linear-gradient(135deg,#3b82f6,#6366f1)', color:'#fff', border:'none', borderRadius:8, padding:'10px 20px', fontWeight:600, fontSize:14, cursor:'pointer', alignSelf:'flex-end' },
}
