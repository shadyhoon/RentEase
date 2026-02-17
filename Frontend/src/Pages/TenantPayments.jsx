import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import * as paymentsApi from '../api/payments'
import Card from '../Components/Card'
import './DashboardLayout.css'

function formatDate(dateString) {
  if (!dateString) return '—'
  const d = new Date(dateString)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function TenantPayments() {
  const { user, token } = useAuth()
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      if (!token || !user?.id) {
        setLoading(false)
        return
      }
      try {
        setLoading(true)
        setError('')
        const res = await paymentsApi.getTenantPayments(user.id, token)
        setPayments(res.data || [])
      } catch (err) {
        setError(err.message || 'Failed to load payments')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [token, user])

  return (
    <section className="dashboard-layout">
      <div className="dashboard-header">
        <div>
          <h1>Payment history</h1>
          <p className="muted">View your recent rent payments</p>
        </div>
      </div>

      {error && (
        <div className="card" style={{ marginBottom: 24, borderColor: 'var(--danger)' }}>
          <p style={{ color: 'var(--danger)' }}>{error}</p>
        </div>
      )}

      {loading ? (
        <div className="card">
          <p className="muted" style={{ padding: 16, margin: 0 }}>Loading…</p>
        </div>
      ) : payments.length === 0 ? (
        <div className="card">
          <div style={{ textAlign: 'center', padding: 28 }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>💳</div>
            <h3 style={{ marginTop: 0, marginBottom: 8 }}>No payments yet</h3>
            <p className="muted" style={{ marginBottom: 0 }}>
              Your payments will appear here after you complete them.
            </p>
          </div>
        </div>
      ) : (
        <div className="col gap-2">
          {payments.map((p) => (
            <Card key={p._id} className="payment-row">
              <div>
                <div style={{ fontWeight: 600 }}>
                  ₹ {p.amount?.toLocaleString?.() || p.amount}
                </div>
                <div className="muted" style={{ fontSize: 12 }}>
                  {p.propertyAddress}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="muted" style={{ fontSize: 12 }}>
                  {formatDate(p.paymentDate)}
                </div>
                <span className="badge success" style={{ marginTop: 4 }}>
                  {p.paymentStatus || 'Success'}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </section>
  )
}

