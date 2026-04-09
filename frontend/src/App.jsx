import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import TicketPage from './pages/TicketPage'
import ChatbotPage from './pages/ChatbotPage'
import AdminDashboard from './pages/AdminDashboard'
import ITStaffDashboard from './pages/ITStaffDashboard'
import KnowledgeBasePage from './pages/KnowledgeBasePage'
import ProtectedRoute from './components/common/ProtectedRoute'

function AppRoutes() {
  const { user } = useAuth()
  return (
    <Routes>
      <Route path="/login"  element={!user ? <Login />  : <Navigate to="/dashboard" />} />
      <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/dashboard" />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/tickets"   element={<TicketPage />} />
        <Route path="/chat"      element={<ChatbotPage />} />
        <Route path="/kb"        element={<KnowledgeBasePage />} />
      </Route>

      <Route element={<ProtectedRoute requiredRole="ADMIN" />}>
        <Route path="/admin" element={<AdminDashboard />} />
      </Route>

      <Route element={<ProtectedRoute requiredRole="IT_STAFF" />}>
        <Route path="/staff" element={<ITStaffDashboard />} />
      </Route>

      <Route path="*" element={<Navigate to={user ? '/dashboard' : '/login'} />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster position="top-right" />
      </BrowserRouter>
    </AuthProvider>
  )
}
