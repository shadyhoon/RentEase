import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Card from '../Components/Card'
import { FiLogOut, FiDollarSign, FiUsers, FiHome, FiAlertCircle } from 'react-icons/fi'
import * as landlordApi from '../api/landlord'
import './DashboardLayout.css'

export default function LandlordDashboard() {
  const { user, logout, token, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    activeTenants: 0,
    properties: 0,
    totalCollected: 0,
    pendingIssues: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    // Wait for auth to load before making API call
    if (!authLoading && token) {
      loadDashboardStats()
    } else if (!authLoading && !token) {
      setError('Not authenticated. Please log in.')
      setLoading(false)
    }
  }, [authLoading, token])

  const loadDashboardStats = async () => {
    if (!token) {
      setError('Not authenticated. Please log in again.')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError('')
      console.log('Fetching dashboard stats with token:', token ? 'Token present' : 'No token')
      const res = await landlordApi.getDashboardStats(token)
      console.log('Dashboard stats response:', res)
      if (res && res.data) {
        setStats(res.data)
      } else {
        setError('Invalid response from server')
      }
    } catch (err) {
      console.error('Dashboard stats error:', err)
      const errorMessage = err.message || err.data?.message || 'Failed to load dashboard stats'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const handleTenantsClick = () => {
    navigate('/tenants')
  }

  const statsCards = [
    {
      label: 'Total collected',
      value: `₹ ${stats.totalCollected.toLocaleString()}`,
      icon: FiDollarSign,
    },
    {
      label: 'Active tenants',
      value: stats.activeTenants.toString(),
      icon: FiUsers,
      onClick: handleTenantsClick,
      clickable: true,
    },
    {
      label: 'Properties',
      value: stats.properties.toString(),
      icon: FiHome,
    },
    {
      label: 'Pending issues',
      value: stats.pendingIssues.toString(),
      icon: FiAlertCircle,
    },
  ]

  return (
    <section className="dashboard-layout">
      <div className="dashboard-header">
        <div>
          <h1>Landlord Dashboard</h1>
          <p className="muted">Welcome back, {user?.email}</p>
        </div>
        <button type="button" className="btn btn-ghost" onClick={handleLogout}>
          <FiLogOut /> Log out
        </button>
      </div>

      {error && (
        <div className="card" style={{ marginBottom: 24, borderColor: 'var(--danger)' }}>
          <p style={{ color: 'var(--danger)' }}>{error}</p>
        </div>
      )}

      <div className="grid grid-4" style={{ marginBottom: 32 }}>
        {statsCards.map((s, i) => (
          <Card
            key={i}
            onClick={s.onClick}
            style={s.clickable ? { cursor: 'pointer', transition: 'all 0.2s' } : {}}
            onMouseEnter={(e) => {
              if (s.clickable) e.currentTarget.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={(e) => {
              if (s.clickable) e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            <s.icon
              className="stat-icon"
              style={{ fontSize: 22, color: 'var(--accent)', marginBottom: 8 }}
            />
            <div className="muted" style={{ fontSize: 13 }}>
              {s.label}
            </div>
            {loading ? (
              <div style={{ fontSize: 20, fontWeight: 700, marginTop: 6 }}>...</div>
            ) : (
              <div style={{ fontSize: 20, fontWeight: 700, marginTop: 6 }}>{s.value}</div>
            )}
            {s.clickable && (
              <div className="muted" style={{ fontSize: 11, marginTop: 4 }}>
                Click to view →
              </div>
            )}
          </Card>
        ))}
      </div>

      <div className="grid grid-2">
        <div className="card">
          <h3 style={{ marginBottom: 16, marginTop: 0 }}>Quick actions</h3>
          <div className="col gap-2">
            <a
              className="btn btn-primary"
              href="/agreement"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              Create agreement
            </a>
            <a
              className="btn btn-ghost"
              href="/tickets"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              View tickets
            </a>
            <button
              className="btn btn-ghost"
              onClick={handleTenantsClick}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              View tenants
            </button>
          </div>
        </div>
        <div className="card">
          <h3 style={{ marginBottom: 12, marginTop: 0 }}>Info</h3>
          <p className="muted" style={{ marginBottom: 8 }}>
            Create agreements to add tenants and track rent collection.
          </p>
          <p className="muted" style={{ fontSize: 12 }}>
            Dashboard updates automatically when you create new agreements.
          </p>
        </div>
      </div>
    </section>
  )
}
