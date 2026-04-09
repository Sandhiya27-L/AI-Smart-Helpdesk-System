import { useState, useEffect } from 'react'
import Layout from '../components/layout/Layout'
import api from '../api/axios'
import toast from 'react-hot-toast'

export default function KnowledgeBasePage() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [selected, setSelected] = useState(null)

  useEffect(() => { loadArticles() }, [])

  const loadArticles = () => {
    setLoading(true)
    api.get('/kb/public')
      .then(r => setArticles(r.data))
      .catch(() => toast.error('Failed to load knowledge base'))
      .finally(() => setLoading(false))
  }

  const handleSearch = async () => {
    if (!search.trim()) { loadArticles(); return }
    setLoading(true)
    api.get(`/kb/public/search?keyword=${search}`)
      .then(r => setArticles(r.data))
      .catch(() => toast.error('Search failed'))
      .finally(() => setLoading(false))
  }

  const openArticle = (article) => {
    api.get(`/kb/public/${article.id}`)
      .then(r => setSelected(r.data))
      .catch(() => setSelected(article))
  }

  if (selected) return (
    <Layout>
      <div style={s.main}>
        <button onClick={() => setSelected(null)} style={s.backBtn}>← Back to Knowledge Base</button>
        <div style={s.articleCard}>
          <h1 style={s.articleTitle}>{selected.title}</h1>
          <div style={s.articleMeta}>
            {selected.category?.name && <span style={s.catBadge}>{selected.category.name}</span>}
            <span style={s.viewCount}>👁 {selected.viewCount} views</span>
          </div>
          {selected.tags && (
            <div style={s.tags}>
              {selected.tags.split(',').map(tag => (
                <span key={tag} style={s.tag}>{tag.trim()}</span>
              ))}
            </div>
          )}
          <pre style={s.articleContent}>{selected.content}</pre>
        </div>
      </div>
    </Layout>
  )

  return (
    <Layout>
      <div style={s.main}>
        <div style={s.topBar}>
          <div>
            <h1 style={s.title}>Knowledge Base</h1>
            <p style={s.sub}>Self-service IT guides and solutions</p>
          </div>
        </div>

        {/* Search */}
        <div style={s.searchRow}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="🔍  Search articles..."
            style={s.searchInput}
          />
          <button onClick={handleSearch} style={s.searchBtn}>Search</button>
          {search && <button onClick={() => { setSearch(''); loadArticles() }} style={s.clearBtn}>Clear</button>}
        </div>

        {loading ? (
          <p style={s.muted}>Loading articles...</p>
        ) : articles.length === 0 ? (
          <div style={s.empty}>No articles found.</div>
        ) : (
          <div style={s.grid}>
            {articles.map(a => (
              <div key={a.id} style={s.card} onClick={() => openArticle(a)}>
                <div style={s.cardHeader}>
                  {a.category?.name && <span style={s.catBadge}>{a.category.name}</span>}
                  <span style={s.viewCount}>👁 {a.viewCount}</span>
                </div>
                <h3 style={s.cardTitle}>{a.title}</h3>
                <p style={s.cardPreview}>{a.content.slice(0, 100)}...</p>
                {a.tags && (
                  <div style={s.tags}>
                    {a.tags.split(',').slice(0,3).map(tag => (
                      <span key={tag} style={s.tag}>{tag.trim()}</span>
                    ))}
                  </div>
                )}
                <div style={s.readMore}>Read article →</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}

const s = {
  main: { padding:'28px', maxWidth:1100 },
  topBar: { marginBottom:20 },
  title: { color:'#f1f5f9', fontSize:24, fontWeight:700, margin:0 },
  sub: { color:'#94a3b8', fontSize:13, margin:'4px 0 0' },
  searchRow: { display:'flex', gap:10, marginBottom:24 },
  searchInput: { flex:1, background:'#1e293b', border:'1px solid #334155', borderRadius:8, padding:'11px 16px', color:'#f1f5f9', fontSize:14, outline:'none' },
  searchBtn: { background:'linear-gradient(135deg,#3b82f6,#6366f1)', color:'#fff', border:'none', borderRadius:8, padding:'11px 20px', fontWeight:600, fontSize:14, cursor:'pointer' },
  clearBtn: { background:'transparent', border:'1px solid #334155', color:'#94a3b8', borderRadius:8, padding:'11px 16px', fontSize:14, cursor:'pointer' },
  muted: { color:'#94a3b8', textAlign:'center', padding:40 },
  empty: { color:'#94a3b8', textAlign:'center', padding:60, fontSize:14 },
  grid: { display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:16 },
  card: { background:'#1e293b', border:'1px solid #334155', borderRadius:12, padding:20, cursor:'pointer', display:'flex', flexDirection:'column', gap:10, transition:'border-color 0.2s' },
  cardHeader: { display:'flex', justifyContent:'space-between', alignItems:'center' },
  catBadge: { background:'#334155', color:'#94a3b8', padding:'3px 10px', borderRadius:5, fontSize:11 },
  viewCount: { color:'#64748b', fontSize:11 },
  cardTitle: { color:'#f1f5f9', fontSize:15, fontWeight:600, margin:0 },
  cardPreview: { color:'#94a3b8', fontSize:13, lineHeight:1.5, margin:0 },
  tags: { display:'flex', flexWrap:'wrap', gap:6 },
  tag: { background:'#0f172a', color:'#60a5fa', padding:'2px 8px', borderRadius:5, fontSize:11 },
  readMore: { color:'#3b82f6', fontSize:13, fontWeight:500, marginTop:'auto' },
  backBtn: { background:'transparent', border:'none', color:'#60a5fa', cursor:'pointer', fontSize:14, marginBottom:20, padding:0 },
  articleCard: { background:'#1e293b', border:'1px solid #334155', borderRadius:12, padding:32 },
  articleTitle: { color:'#f1f5f9', fontSize:22, fontWeight:700, margin:'0 0 12px' },
  articleMeta: { display:'flex', gap:12, alignItems:'center', marginBottom:12 },
  articleContent: { color:'#e2e8f0', fontSize:14, lineHeight:1.8, whiteSpace:'pre-wrap', fontFamily:'inherit', margin:'16px 0 0' },
}
