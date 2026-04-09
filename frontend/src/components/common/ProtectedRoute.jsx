import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function ProtectedRoute({ requiredRole }) {
  const { user, loading, isAdmin, isStaff } = useAuth()

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'#0f172a' }}>
      <div style={{ color:'#60a5fa', fontSize:18 }}>Loading...</div>
    </div>
  )

  if (!user) return <Navigate to="/login" replace />
  if (requiredRole === 'ADMIN'    && !isAdmin()) return <Navigate to="/dashboard" replace />
  if (requiredRole === 'IT_STAFF' && !isStaff()) return <Navigate to="/dashboard" replace />

  return <Outlet />
}
