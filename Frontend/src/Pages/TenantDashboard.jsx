import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Card from '../Components/Card'
import { FiLogOut, FiDollarSign, FiFileText, FiTool } from 'react-icons/fi'
import './DashboardLayout.css'
import * as tenantApi from '../api/tenant'
import * as agreementsApi from '../api/agreements'
import * as paymentsApi from '../api/payments'
import * as ticketsApi from '../api/tickets'

export default function TenantDashboard() {
  const { user, logout, token } = useAuth()
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [loadingNotifs, setLoadingNotifs] = useState(true)
  const [notifError, setNotifError] = useState('')
  const [approvingId, setApprovingId] = useState(null)
  const [activeAgreement, setActiveAgreement] = useState(null)
  const [loadingAgreement, setLoadingAgreement] = useState(true)
  const [paymentError, setPaymentError] = useState('')
  const [paying, setPaying] = useState(false)
  const [payments, setPayments] = useState([])
  const [openTicketsCount, setOpenTicketsCount] = useState(0)

  const monthlyRent = useMemo(() => {
    const amt = Number(activeAgreement?.rentAmount || 0)
    return Number.isFinite(amt) && amt > 0 ? amt : 0
  }, [activeAgreement])

  const currentMonthPaid = useMemo(() => {
    const now = new Date()
    const m = now.getMonth()
    const y = now.getFullYear()
    return (payments || []).some((p) => {
      if (p?.paymentStatus !== 'Success') return false
      if (!p?.paymentDate) return false
      const d = new Date(p.paymentDate)
      if (Number.isNaN(d.getTime())) return false
      return d.getMonth() === m && d.getFullYear() === y
    })
  }, [payments])

  const rentDue = useMemo(() => {
    const due = currentMonthPaid ? 0 : monthlyRent
    return due < 0 ? 0 : due
  }, [currentMonthPaid, monthlyRent])

  const nextBillingLabel = useMemo(() => {
    const now = new Date()
    const next = new Date(now.getFullYear(), now.getMonth() + 1, 1)
    return next.toLocaleString('en-IN', { month: 'short', year: 'numeric' })
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const stats = [
    { label: 'Rent due this month', value: `₹ ${rentDue.toLocaleString()}`, icon: FiDollarSign },
    { label: 'Last paid', value: 'Dec 1, 2024', icon: FiFileText },
    { label: 'Open tickets', value: openTicketsCount.toString(), icon: FiTool, badgeCount: openTicketsCount }
  ]

  const loadOpenTicketsCount = async () => {
    if (!token) return
    try {
      const res = await ticketsApi.getTickets(token)
      const list = res.data || []
      const count = list.filter((t) => {
        if (t.status === 'Open') return true
        if (t.status === 'Resolved' && t.approvalStatus === 'Pending') return true
        return false
      }).length
      setOpenTicketsCount(count)
    } catch (_) {
      setOpenTicketsCount(0)
    }
  }

  const loadPayments = async () => {
    if (!token || !user?.id) return
    try {
      const res = await paymentsApi.getTenantPayments(user.id, token)
      setPayments(res.data || [])
    } catch (_) {
      setPayments([])
    }
  }

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

  const loadActiveAgreement = async () => {
    if (!token) return
    try {
      setLoadingAgreement(true)
      setPaymentError('')
      const res = await agreementsApi.getMyAgreements({ status: 'approved' }, token)
      const list = res.data || []
      setActiveAgreement(list[0] || null)
    } catch (err) {
      setPaymentError(err.message || 'Failed to load agreement')
    } finally {
      setLoadingAgreement(false)
    }
  }

  useEffect(() => {
    loadNotifications()
    loadActiveAgreement()
    loadPayments()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  useEffect(() => {
    loadOpenTicketsCount()
    const onTicketsUpdated = () => loadOpenTicketsCount()
    window.addEventListener('rentease:ticketsUpdated', onTicketsUpdated)
    return () => window.removeEventListener('rentease:ticketsUpdated', onTicketsUpdated)
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

  const loadRazorpayScript = () => {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') {
        reject(new Error('Window is not available'))
        return
      }
      if (window.Razorpay) {
        resolve(true)
        return
      }
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve(true)
      script.onerror = () => reject(new Error('Failed to load Razorpay SDK'))
      document.body.appendChild(script)
    })
  }

  const handlePayNow = async () => {
    if (!activeAgreement) {
      setPaymentError('No active agreement found to pay against.')
      return
    }
    try {
      setPaying(true)
      setPaymentError('')

      await loadRazorpayScript()

      const orderRes = await paymentsApi.createOrder(
        { agreementId: activeAgreement._id },
        token
      )
      const { orderId, amount, currency, keyId } = orderRes.data

      const options = {
        key: keyId,
        amount,
        currency,
        name: 'RentEase',
        description: `Rent for ${activeAgreement.propertyAddress}`,
        order_id: orderId,
        prefill: {
          name: user?.name || activeAgreement.tenantName,
          email: user?.email,
        },
        notes: {
          agreementId: activeAgreement._id,
        },
        handler: async function (response) {
          try {
            await paymentsApi.verifyPayment(
              {
                razorpayPaymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id,
                razorpaySignature: response.razorpay_signature,
              },
              token
            )
            // Optionally refresh dashboard stats or show toast – for now, just reload agreement info
            await loadActiveAgreement()
            await loadPayments()
          } catch (err) {
            setPaymentError(err.message || 'Payment verification failed')
          }
        },
        theme: {
          color: '#8b5cf6',
        },
      }

      // eslint-disable-next-line no-undef
      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (err) {
      setPaymentError(err.message || 'Failed to start payment')
    } finally {
      setPaying(false)
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
          <Card key={i} style={s.label === 'Open tickets' ? { position: 'relative' } : {}}>
            {s.label === 'Open tickets' && s.badgeCount > 0 && (
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
            <a className="btn btn-ghost" href="/payments" style={{ width: '100%', justifyContent: 'center' }}>View payments</a>
            <a className="btn btn-ghost" href="/tickets" style={{ width: '100%', justifyContent: 'center' }}>Raise maintenance ticket</a>
          </div>
        </div>
        <div className="card">
          <h3 style={{ marginBottom: 12, marginTop: 0 }}>Next payment</h3>
          {paymentError && (
            <p style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 8 }}>{paymentError}</p>
          )}
          {loadingAgreement ? (
            <p className="muted" style={{ marginBottom: 0 }}>Loading…</p>
          ) : !activeAgreement ? (
            <p className="muted" style={{ marginBottom: 0 }}>No active agreement available.</p>
          ) : (
            <>
              <p className="muted" style={{ marginBottom: 8 }}>
                {rentDue === 0 ? `Next billing cycle: ${nextBillingLabel}` : `Rent for ${activeAgreement.propertyAddress}`}
              </p>
              <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>
                ₹ {monthlyRent.toLocaleString()}
              </div>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handlePayNow}
                disabled={paying}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                {paying ? 'Processing…' : 'Pay Now'}
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
