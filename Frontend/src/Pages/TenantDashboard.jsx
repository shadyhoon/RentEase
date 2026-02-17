import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Card from '../Components/Card'
import { FiLogOut, FiDollarSign, FiFileText, FiTool } from 'react-icons/fi'
import './DashboardLayout.css'
import * as tenantApi from '../api/tenant'
import * as agreementsApi from '../api/agreements'

export default function TenantDashboard() {
  const { user, logout, token } = useAuth()
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [loadingNotifs, setLoadingNotifs] = useState(true)
  const [notifError, setNotifError] = useState('')
  const [approvingId, setApprovingId] = useState(null)

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const stats = [
    { label: 'Rent due this month', value: '₹ 12,000', icon: FiDollarSign },
    { label: 'Last paid', value: 'Dec 1, 2024', icon: FiFileText },
    { label: 'Open tickets', value: '1', icon: FiTool }
  ]

  const pendingAgreementNotifs = useMemo(() => {
    return (notifications || []).filter((n) => n.type === 'AGREEMENT_SENT' && n.status === 'PENDING')
  }, [notifications])

  const loadNotifications = async () => {
    if (!token) return
    try {
      setLoadingNotifs(true)
      setNotifError('')
      const res = await tenantApi.getMyNotifications(token)
      setNotifications(res.data || [])
    } catch (err) {
      setNotifError(err.message || 'Failed to load notifications')
    } finally {
      setLoadingNotifs(false)
    }
  }

  useEffect(() => {
    loadNotifications()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  const handleApprove = async (agreementId) => {
    if (!agreementId) return
    try {
      setApprovingId(agreementId)
      await agreementsApi.approveAgreement(agreementId, token)
      await loadNotifications()
    } catch (err) {
      setNotifError(err.message || 'Failed to approve agreement')
    } finally {
      setApprovingId(null)
    }
  }

  return (
    <section className="dashboard-layout">
      <div className="dashboard-header">
        <div>
          <h1>Tenant Dashboard</h1>
          <p className="muted">Welcome back, {user?.email}</p>
        </div>
        <button type="button" className="btn btn-ghost" onClick={handleLogout}>
          <FiLogOut /> Log out
        </button>
      </div>

      <div className="grid grid-3" style={{ marginBottom: 32 }}>
        {stats.map((s, i) => (
          <Card key={i}>
            <s.icon className="stat-icon" style={{ fontSize: 22, color: 'var(--accent)', marginBottom: 8 }} />
            <div className="muted" style={{ fontSize: 13 }}>{s.label}</div>
            <div style={{ fontSize: 20, fontWeight: 700, marginTop: 6 }}>{s.value}</div>
          </Card>
        ))}
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ marginBottom: 12, marginTop: 0 }}>Notifications</h3>
        {notifError && <p style={{ color: 'var(--danger)', fontSize: 13, marginTop: 8 }}>{notifError}</p>}
        {loadingNotifs ? (
          <p className="muted" style={{ margin: 0 }}>Loading…</p>
        ) : pendingAgreementNotifs.length === 0 ? (
          <p className="muted" style={{ margin: 0 }}>No pending agreement requests.</p>
        ) : (
          <div className="col gap-2">
            {pendingAgreementNotifs.map((n) => (
              <div
                key={n._id}
                style={{
                  padding: 12,
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid var(--border)',
                  borderRadius: 10,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: 12,
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ minWidth: 220 }}>
                  <div style={{ fontWeight: 700, marginBottom: 4 }}>{n.title}</div>
                  <div className="muted" style={{ fontSize: 13 }}>{n.message}</div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => handleApprove(n.agreementId)}
                    disabled={approvingId === n.agreementId}
                    style={{ justifyContent: 'center' }}
                  >
                    {approvingId === n.agreementId ? 'Approving…' : 'Approve / Confirm'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-2">
        <div className="card">
          <h3 style={{ marginBottom: 16, marginTop: 0 }}>Quick actions</h3>
          <div className="col gap-2">
            <a className="btn btn-primary" href="/agreements" style={{ width: '100%', justifyContent: 'center' }}>View agreements</a>
            <a className="btn btn-ghost" href="/tickets" style={{ width: '100%', justifyContent: 'center' }}>Raise maintenance ticket</a>
          </div>
        </div>
        <div className="card">
          <h3 style={{ marginBottom: 12, marginTop: 0 }}>Next payment</h3>
          <p className="muted" style={{ marginBottom: 8 }}>Rent due Jan 1, 2025</p>
          <div style={{ fontSize: 24, fontWeight: 700 }}>₹ 12,000</div>
        </div>
      </div>
    </section>
  )
}
