import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { register } from '../api/authApi'
import toast from 'react-hot-toast'

export default function Signup() {
  const [form, setForm] = useState({ name: '', email: '', password: '', department: '', role: 'USER' })
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate  = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await register(form)
      login(res.data)
      toast.success('Account created successfully!')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed.')
    } finally {
      setLoading(false)
    }
  }

  const fields = [
    { key: 'name',       label: 'Full Name',   type: 'text',     placeholder: 'John Doe',         required: true },
    { key: 'email',      label: 'Email',        type: 'email',    placeholder: 'you@company.com',  required: true },
    { key: 'password',   label: 'Password',     type: 'password', placeholder: '••••••••',         required: true },
    { key: 'department', label: 'Department',   type: 'text',     placeholder: 'Engineering',      required: false },
  ]

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.header}>
          <div style={s.logoIcon}>🎫</div>
          <h1 style={s.title}>Create Account</h1>
          <p style={s.subtitle}>Join the IT HelpDesk platform</p>
        </div>

        <form onSubmit={handleSubmit} style={s.form}>
          {fields.map(f => (
            <div key={f.key} style={s.field}>
              <label style={s.label}>{f.label}</label>
              <input
                type={f.type} required={f.required}
                value={form[f.key]}
                placeholder={f.placeholder}
                onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                style={s.input}
              />
            </div>
          ))}

          <div style={s.field}>
            <label style={s.label}>Account Role</label>
            <select
              value={form.role}
              onChange={e => setForm({ ...form, role: e.target.value })}
              style={s.input}
            >
              <option value="USER">End User (Student / Employee)</option>
              <option value="IT_STAFF">IT Support Staff</option>
              <option value="ADMIN">Administrator</option>
            </select>
          </div>

          <button type="submit" style={s.btn} disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p style={s.footer}>
          Already have an account?{' '}
          <Link to="/login" style={s.link}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}

const s = {
  page: {
    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'linear-gradient(135deg,#0f172a 0%,#1e293b 50%,#0f172a 100%)',
    fontFamily: "'Segoe UI', sans-serif", padding: '20px',
  },
  card: {
    background: '#1e293b', border: '1px solid #334155', borderRadius: 16,
    padding: '36px', width: '100%', maxWidth: 420,
    boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
  },
  header: { textAlign: 'center', marginBottom: 28 },
  logoIcon: { fontSize: 40, marginBottom: 10 },
  title: { color: '#f1f5f9', fontSize: 24, fontWeight: 700, margin: '0 0 6px' },
  subtitle: { color: '#94a3b8', fontSize: 14, margin: 0 },
  form: { display: 'flex', flexDirection: 'column', gap: 16 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { color: '#94a3b8', fontSize: 13, fontWeight: 500 },
  input: {
    background: '#0f172a', border: '1px solid #334155', borderRadius: 8,
    padding: '11px 14px', color: '#f1f5f9', fontSize: 14, outline: 'none',
  },
  btn: {
    background: 'linear-gradient(135deg,#3b82f6,#6366f1)', color: '#fff',
    border: 'none', borderRadius: 8, padding: '13px', fontSize: 15,
    fontWeight: 600, cursor: 'pointer', marginTop: 4,
  },
  footer: { textAlign: 'center', color: '#94a3b8', marginTop: 20, fontSize: 14 },
  link: { color: '#60a5fa', textDecoration: 'none', fontWeight: 500 },
}
