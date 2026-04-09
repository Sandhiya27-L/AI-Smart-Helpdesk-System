import { useState, useRef, useEffect } from 'react'
import Layout from '../components/layout/Layout'
import { useAuth } from '../context/AuthContext'
import { queryNlp } from '../api/nlpApi'
import toast from 'react-hot-toast'

const SUGGESTIONS = [
  'My WiFi is not connecting',
  'I forgot my password',
  'My printer is offline',
  'My laptop is very slow',
  'I cannot access my email',
  'My screen is flickering',
  'I need software installed',
  'I suspect a virus on my PC',
]

const PRIORITY_COLOR = { LOW:'#22c55e', MEDIUM:'#f59e0b', HIGH:'#ef4444', CRITICAL:'#dc2626' }

export default function ChatbotPage() {
  const { user } = useAuth()
  const [messages, setMessages] = useState([
    {
      id: 1, role: 'bot',
      text: "Hi! I'm your IT Support AI Assistant 🤖\n\nDescribe your issue in plain language and I'll analyse it, suggest a solution, and raise a support ticket if needed.",
      time: new Date(),
    }
  ])
  const [input, setInput]   = useState('')
  const [loading, setLoading] = useState(false)
  const endRef = useRef(null)

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const send = async (text = input.trim()) => {
    if (!text || loading) return
    setInput('')

    const userMsg = { id: Date.now(), role: 'user', text, time: new Date() }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    try {
      const res  = await queryNlp({ query: text, createTicket: false })
      const data = res.data

      const confPct  = Math.round(data.confidenceScore * 100)
      const prioColor = PRIORITY_COLOR[data.priority] || '#f59e0b'

      const botMsg = {
        id:   Date.now() + 1,
        role: 'bot',
        text: data.solution,
        meta: data,
        confPct,
        prioColor,
        time: new Date(),
      }
      setMessages(prev => [...prev, botMsg])
    } catch {
      toast.error('AI service unavailable. Please try again.')
      setMessages(prev => [...prev, {
        id: Date.now() + 1, role: 'bot',
        text: 'Sorry, I had trouble processing your request. Please try rephrasing or submit a ticket manually.',
        time: new Date(),
      }])
    } finally {
      setLoading(false)
    }
  }

  const raiseTicket = async (query) => {
    setLoading(true)
    try {
      const res = await queryNlp({ query, createTicket: true })
      const tn  = res.data.ticketNumber
      toast.success('Ticket created: ' + tn)
      setMessages(prev => [...prev, {
        id: Date.now(), role: 'bot',
        text: `✅ Ticket **${tn}** has been raised and assigned to our IT team.\nYou'll receive an email confirmation shortly.`,
        time: new Date(),
      }])
    } catch { toast.error('Failed to create ticket') }
    finally  { setLoading(false) }
  }

  return (
    <Layout>
      <div style={s.wrapper}>

        {/* Chat header */}
        <div style={s.header}>
          <div style={s.botAvatar}>🤖</div>
          <div>
            <div style={s.botName}>IT Support AI</div>
            <div style={s.botStatus}>● Online — Built-in NLP Engine</div>
          </div>
        </div>

        {/* Messages */}
        <div style={s.messages}>
          {messages.map(msg => (
            <div key={msg.id} style={{ ...s.row, justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
              {msg.role === 'bot' && <div style={s.smallAvatar}>🤖</div>}

              <div style={{ maxWidth: '75%' }}>
                <div style={{ ...s.bubble, ...(msg.role === 'user' ? s.userBubble : s.botBubble) }}>
                  <pre style={s.msgText}>{msg.text}</pre>

                  {/* Metadata chips */}
                  {msg.meta && (
                    <div style={s.chips}>
                      <span style={s.chip}>📁 {msg.meta.category}</span>
                      <span style={{ ...s.chip, color: msg.prioColor }}>🚨 {msg.meta.priority}</span>
                      <span style={{ ...s.chip, color: msg.confPct >= 70 ? '#22c55e' : '#f59e0b' }}>
                        🎯 {msg.confPct}% confidence
                      </span>
                      {msg.meta.escalatedToHuman && (
                        <span style={{ ...s.chip, color: '#ef4444' }}>⚠️ Escalated</span>
                      )}
                    </div>
                  )}

                  {/* Raise ticket button */}
                  {msg.meta && !msg.meta.escalatedToHuman && (
                    <button
                      onClick={() => raiseTicket(messages.find(m => m.role === 'user')?.text || '')}
                      style={s.raiseBtn}
                    >
                      📩 Raise a Support Ticket
                    </button>
                  )}

                  {msg.meta?.ticketNumber && (
                    <div style={s.ticketPill}>✅ Ticket: {msg.meta.ticketNumber}</div>
                  )}
                </div>
                <div style={{ ...s.msgTime, textAlign: msg.role === 'user' ? 'right' : 'left' }}>
                  {msg.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>

              {msg.role === 'user' && (
                <div style={s.userAvatar}>{user?.name?.[0]?.toUpperCase()}</div>
              )}
            </div>
          ))}

          {loading && (
            <div style={{ ...s.row, justifyContent: 'flex-start' }}>
              <div style={s.smallAvatar}>🤖</div>
              <div style={s.botBubble}>
                <span style={s.typing}>Analysing your issue●●●</span>
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Suggestions */}
        <div style={s.suggestBar}>
          {SUGGESTIONS.map(sg => (
            <button key={sg} onClick={() => send(sg)} style={s.suggestBtn}>{sg}</button>
          ))}
        </div>

        {/* Input bar */}
        <div style={s.inputBar}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
            placeholder="Describe your IT issue in plain language..."
            style={s.input}
            disabled={loading}
          />
          <button onClick={() => send()} style={s.sendBtn} disabled={loading || !input.trim()}>
            ➤
          </button>
        </div>
      </div>
    </Layout>
  )
}

const s = {
  wrapper: { display:'flex', flexDirection:'column', height:'calc(100vh - 0px)', overflow:'hidden' },
  header: { display:'flex', alignItems:'center', gap:14, padding:'14px 24px', background:'#1e293b', borderBottom:'1px solid #334155', flexShrink:0 },
  botAvatar: { fontSize:32, background:'#0f172a', borderRadius:'50%', width:44, height:44, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 },
  botName: { color:'#f1f5f9', fontWeight:700, fontSize:15 },
  botStatus: { color:'#22c55e', fontSize:12, marginTop:2 },
  messages: { flex:1, overflowY:'auto', padding:'20px 24px', display:'flex', flexDirection:'column', gap:16 },
  row: { display:'flex', alignItems:'flex-end', gap:10 },
  smallAvatar: { fontSize:18, background:'#1e293b', borderRadius:'50%', width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 },
  userAvatar: { width:32, height:32, background:'linear-gradient(135deg,#3b82f6,#6366f1)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:700, fontSize:13, flexShrink:0 },
  bubble: { padding:'12px 16px', borderRadius:12, marginBottom:2 },
  botBubble: { background:'#1e293b', border:'1px solid #334155' },
  userBubble: { background:'linear-gradient(135deg,#3b82f6,#6366f1)' },
  msgText: { color:'#e2e8f0', fontSize:13, lineHeight:1.65, whiteSpace:'pre-wrap', fontFamily:'inherit', margin:0 },
  chips: { display:'flex', flexWrap:'wrap', gap:6, marginTop:10 },
  chip: { background:'#0f172a', color:'#94a3b8', padding:'3px 8px', borderRadius:6, fontSize:11, fontWeight:500 },
  raiseBtn: { marginTop:10, background:'#0f172a', border:'1px solid #334155', color:'#94a3b8', borderRadius:6, padding:'6px 12px', cursor:'pointer', fontSize:12, display:'block' },
  ticketPill: { marginTop:8, background:'#14532d', color:'#86efac', borderRadius:6, padding:'4px 10px', fontSize:12, display:'inline-block' },
  msgTime: { color:'#475569', fontSize:11 },
  typing: { color:'#94a3b8', fontSize:13 },
  suggestBar: { display:'flex', gap:8, padding:'8px 24px', overflowX:'auto', borderTop:'1px solid #1e293b', flexShrink:0 },
  suggestBtn: { background:'#1e293b', border:'1px solid #334155', color:'#94a3b8', borderRadius:20, padding:'6px 14px', cursor:'pointer', fontSize:12, whiteSpace:'nowrap', flexShrink:0 },
  inputBar: { display:'flex', gap:12, padding:'14px 24px', background:'#1e293b', borderTop:'1px solid #334155', flexShrink:0 },
  input: { flex:1, background:'#0f172a', border:'1px solid #334155', borderRadius:8, padding:'12px 16px', color:'#f1f5f9', fontSize:14, outline:'none' },
  sendBtn: { background:'linear-gradient(135deg,#3b82f6,#6366f1)', color:'#fff', border:'none', borderRadius:8, width:46, height:46, cursor:'pointer', fontSize:18, flexShrink:0 },
}
