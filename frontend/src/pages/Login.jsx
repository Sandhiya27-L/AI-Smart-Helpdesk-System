import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { login as loginApi } from '../api/authApi'
import toast from 'react-hot-toast'

export default function Login() {
  const [form, setForm]     = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate  = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await loginApi(form)
      login(res.data)
      toast.success('Welcome back!')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.header}>
          <div style={s.logoIcon}>🎫</div>
          <h1 style={s.title}>HelpDesk AI</h1>
          <p style={s.subtitle}>Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} style={s.form}>
          <div style={s.field}>
            <label style={s.label}>Email Address</label>
            <input
              type="email" required
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              style={s.input}
              placeholder="you@company.com"
            />
          </div>
          <div style={s.field}>
            <label style={s.label}>Password</label>
            <input
              type="password" required
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              style={s.input}
              placeholder="••••••••"
            />
          </div>
          <button type="submit" style={s.btn} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={s.footer}>
          Don't have an account?{' '}
          <Link to="/signup" style={s.link}>Create one</Link>
        </p>
      </div>
    </div>
  )
}

const s = {
  page: {
    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'linear-gradient(135deg,#0f172a 0%,#1e293b 50%,#0f172a 100%)',
    fontFamily: "'Segoe UI', sans-serif", padding: 20,
  },
  card: {
    background: '#1e293b', border: '1px solid #334155', borderRadius: 16,
    padding: '40px 36px', width: '100%', maxWidth: 400,
    boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
  },
  header: { textAlign: 'center', marginBottom: 32 },
  logoIcon: { fontSize: 48, marginBottom: 12 },
  title: { color: '#f1f5f9', fontSize: 26, fontWeight: 700, margin: '0 0 6px' },
  subtitle: { color: '#94a3b8', fontSize: 14, margin: 0 },
  form: { display: 'flex', flexDirection: 'column', gap: 18 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { color: '#94a3b8', fontSize: 13, fontWeight: 500 },
  input: {
    background: '#0f172a', border: '1px solid #334155', borderRadius: 8,
    padding: '12px 14px', color: '#f1f5f9', fontSize: 14, outline: 'none',
    transition: 'border-color 0.2s',
  },
  btn: {
    background: 'linear-gradient(135deg,#3b82f6,#6366f1)', color: '#fff',
    border: 'none', borderRadius: 8, padding: '13px', fontSize: 15,
    fontWeight: 600, cursor: 'pointer', marginTop: 4,
    opacity: 1, transition: 'opacity 0.2s',
  },
  footer: { textAlign: 'center', color: '#94a3b8', marginTop: 22, fontSize: 14 },
  link: { color: '#60a5fa', textDecoration: 'none', fontWeight: 500 },
}
