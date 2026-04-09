import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const NAV = [
  { to: '/dashboard', icon: '📊', label: 'Dashboard',    roles: ['USER','IT_STAFF','ADMIN'] },
  { to: '/tickets',   icon: '🎫', label: 'My Tickets',   roles: ['USER','IT_STAFF','ADMIN'] },
  { to: '/chat',      icon: '🤖', label: 'AI Assistant', roles: ['USER','IT_STAFF','ADMIN'] },
  { to: '/kb',        icon: '📚', label: 'Knowledge Base',roles: ['USER','IT_STAFF','ADMIN'] },
  { to: '/staff',     icon: '🔧', label: 'Staff Panel',  roles: ['IT_STAFF','ADMIN'] },
  { to: '/admin',     icon: '⚙️', label: 'Admin Panel',  roles: ['ADMIN'] },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const { pathname } = useLocation()

  const navItems = NAV.filter(n => n.roles.includes(user?.role))

  return (
    <div style={s.sidebar}>
      <div style={s.logo}>
        <span style={s.logoIcon}>🎫</span>
        <span style={s.logoText}>HelpDesk AI</span>
      </div>

      <div style={s.userInfo}>
        <div style={s.avatar}>{user?.name?.[0]?.toUpperCase()}</div>
        <div>
          <div style={s.userName}>{user?.name}</div>
          <div style={s.userRole}>{user?.role}</div>
        </div>
      </div>

      <nav style={s.nav}>
        {navItems.map(item => (
          <Link
            key={item.to}
            to={item.to}
            style={{
              ...s.navItem,
              ...(pathname === item.to ? s.navActive : {})
            }}
          >
            <span style={s.navIcon}>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      <button onClick={logout} style={s.logoutBtn}>
        🚪 Logout
      </button>
    </div>
  )
}

const s = {
  sidebar: {
    width: 240, minHeight: '100vh', background: '#1e293b',
    borderRight: '1px solid #334155', display: 'flex',
    flexDirection: 'column', padding: '0', flexShrink: 0,
    position: 'sticky', top: 0, height: '100vh',
  },
  logo: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '24px 20px 20px', borderBottom: '1px solid #334155',
  },
  logoIcon: { fontSize: 24 },
  logoText: { color: '#f1f5f9', fontSize: 18, fontWeight: 700 },
  userInfo: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '16px 20px', borderBottom: '1px solid #334155',
  },
  avatar: {
    width: 36, height: 36, borderRadius: '50%',
    background: 'linear-gradient(135deg,#3b82f6,#6366f1)',
    color: '#fff', display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontWeight: 700, fontSize: 14, flexShrink: 0,
  },
  userName: { color: '#e2e8f0', fontSize: 13, fontWeight: 600 },
  userRole: { color: '#64748b', fontSize: 11, marginTop: 2 },
  nav: { flex: 1, display: 'flex', flexDirection: 'column', padding: '12px 0' },
  navItem: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '11px 20px', color: '#94a3b8', textDecoration: 'none',
    fontSize: 14, transition: 'all 0.15s', borderLeft: '3px solid transparent',
  },
  navActive: {
    color: '#60a5fa', background: 'rgba(59,130,246,0.1)',
    borderLeft: '3px solid #3b82f6',
  },
  navIcon: { fontSize: 16, width: 20, textAlign: 'center' },
  logoutBtn: {
    margin: '12px 16px 20px', background: 'transparent',
    border: '1px solid #334155', color: '#94a3b8', borderRadius: 8,
    padding: '10px', cursor: 'pointer', fontSize: 13,
    transition: 'all 0.15s',
  },
}
