import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Card from '../Components/Card'
import { FiLogOut, FiDollarSign, FiUsers, FiHome, FiAlertCircle } from 'react-icons/fi'
import * as landlordApi from '../api/landlord'
import * as paymentsApi from '../api/payments'
import * as ticketsApi from '../api/tickets'
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
  const [payments, setPayments] = useState([])
  const [paymentsLoading, setPaymentsLoading] = useState(true)
  const [pendingTicketsCount, setPendingTicketsCount] = useState(0)

  useEffect(() => {
    // Wait for auth to load before making API call
    if (!authLoading && token && user) {
      loadDashboardStats()
      loadRecentPayments()
      loadPendingTicketsCount()
    } else if (!authLoading && !token) {
      setError('Not authenticated. Please log in.')
      setLoading(false)
    }
  }, [authLoading, token, user])

  useEffect(() => {
    if (authLoading || !token) return
    const onTicketsUpdated = () => loadPendingTicketsCount()
    window.addEventListener('rentease:ticketsUpdated', onTicketsUpdated)
    return () => window.removeEventListener('rentease:ticketsUpdated', onTicketsUpdated)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, token])

  const loadPendingTicketsCount = async () => {
    if (!token) return
    try {
      const res = await ticketsApi.getTickets(token)
      const list = res.data || []
      const count = list.filter((t) => t.status !== 'Closed').length
      setPendingTicketsCount(count)
    } catch (_) {
      setPendingTicketsCount(0)
    }
  }

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

  const loadRecentPayments = async () => {
    if (!token || !user?.id) {
      setPaymentsLoading(false)
      return
    }
    try {
      setPaymentsLoading(true)
      const res = await paymentsApi.getLandlordPayments(user.id, token)
      setPayments(res.data || [])
    } catch (err) {
      console.error('Recent payments error:', err)
    } finally {
      setPaymentsLoading(false)
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
      value: pendingTicketsCount.toString(),
      icon: FiAlertCircle,
      badgeCount: pendingTicketsCount,
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
            style={{
              ...(s.clickable ? { cursor: 'pointer', transition: 'all 0.2s' } : {}),
              ...(s.label === 'Pending issues' ? { position: 'relative' } : {}),
            }}
            onMouseEnter={(e) => {
              if (s.clickable) e.currentTarget.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={(e) => {
              if (s.clickable) e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            {s.label === 'Pending issues' && s.badgeCount > 0 && (
              <span
                className="badge danger"
                style={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  padding: '4px 8px',
                  fontSize: 11,
                  borderRadius: 999,
                  transition: 'transform 0.2s ease',
                }}
              >
                {s.badgeCount}
              </span>
            )}
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
          <h3 style={{ marginBottom: 12, marginTop: 0 }}>Recent payments</h3>
          {paymentsLoading ? (
            <p className="muted" style={{ marginBottom: 0 }}>Loading…</p>
          ) : payments.length === 0 ? (
            <p className="muted" style={{ marginBottom: 0 }}>No payments recorded yet.</p>
          ) : (
            <div className="col gap-2">
              {payments.slice(0, 5).map((p) => (
                <div key={p._id} className="payment-row">
                  <div>
                    <div style={{ fontWeight: 600 }}>{p.tenantName}</div>
                    <div className="muted" style={{ fontSize: 12 }}>
                      {p.propertyAddress}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700 }}>₹ {p.amount?.toLocaleString()}</div>
                    <div className="muted" style={{ fontSize: 12 }}>
                      {p.paymentDate ? new Date(p.paymentDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : ''}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
