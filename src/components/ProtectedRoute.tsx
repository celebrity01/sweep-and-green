import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { UserRole } from '../lib/supabase'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: UserRole | UserRole[]
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: '#FAF6EE' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 52, height: 52, border: '4px solid #1E3A2F', borderTopColor: '#C9A84C', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
          <p style={{ fontFamily: 'Lato, sans-serif', color: '#1E3A2F', fontWeight: 700 }}>Loading Sweep & Green...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  if (requiredRole && profile) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
    if (!roles.includes(profile.role)) {
      return <Navigate to="/dashboard" replace />
    }
  }

  return <>{children}</>
}
