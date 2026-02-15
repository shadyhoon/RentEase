import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * Protects routes: redirect to login if not authenticated.
 * If allowedRoles is set (e.g. ['tenant']), redirect to the correct dashboard when role does not match.
 */
export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="app-main" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <p className="muted">Loading…</p>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    const redirectTo = user.role === 'tenant' ? '/tenant-dashboard' : '/landlord-dashboard'
    return <Navigate to={redirectTo} replace />
  }

  return children
}
