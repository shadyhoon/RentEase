import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Card from '../Components/Card'
import { FiArrowLeft, FiMail, FiHome, FiDollarSign, FiCalendar } from 'react-icons/fi'
import * as landlordApi from '../api/landlord'
import './DashboardLayout.css'

export default function Tenants() {
  const { user, token } = useAuth()
  const navigate = useNavigate()
  const [tenants, setTenants] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user || user.role !== 'landlord') {
      navigate('/landlord-dashboard')
      return
    }
    loadTenants()
  }, [user, navigate])

  const loadTenants = async () => {
    try {
      setLoading(true)
      setError('')
      const res = await landlordApi.getTenants(token)
      setTenants(res.data || [])
    } catch (err) {
      setError(err.message || 'Failed to load tenants')
      console.error('Tenants error:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'active':
        return 'badge success'
      case 'expired':
        return 'badge warning'
      case 'terminated':
        return 'badge danger'
      default:
        return 'badge'
    }
  }

  return (
    <section className="dashboard-layout">
      <div className="dashboard-header">
        <div>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => navigate('/landlord-dashboard')}
            style={{ marginBottom: 12 }}
          >
            <FiArrowLeft /> Back to Dashboard
          </button>
          <h1>Active Tenants</h1>
          <p className="muted">Manage your tenants and their agreements</p>
        </div>
      </div>

      {error && (
        <div className="card" style={{ marginBottom: 24, borderColor: 'var(--danger)' }}>
          <p style={{ color: 'var(--danger)' }}>{error}</p>
        </div>
      )}

      {loading ? (
        <div className="card">
          <p className="muted" style={{ textAlign: 'center', padding: 24 }}>
            Loading tenants...
          </p>
        </div>
      ) : tenants.length === 0 ? (
        <div className="card">
          <div style={{ textAlign: 'center', padding: 32 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>👥</div>
            <h3 style={{ marginBottom: 8 }}>No tenants yet</h3>
            <p className="muted" style={{ marginBottom: 24 }}>
              Create an agreement to add your first tenant
            </p>
            <a className="btn btn-primary" href="/agreement">
              Create Agreement
            </a>
          </div>
        </div>
      ) : (
        <div className="grid grid-1" style={{ gap: 16 }}>
          {tenants.map((tenant) => (
            <Card key={tenant._id || tenant.id} style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <h3 style={{ marginBottom: 12, marginTop: 0 }}>{tenant.name}</h3>
                  <div className="col gap-2">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <FiMail style={{ color: 'var(--muted)', fontSize: 16 }} />
                      <span className="muted">{tenant.email}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <FiHome style={{ color: 'var(--muted)', fontSize: 16 }} />
                      <span className="muted">{tenant.propertyAddress}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <FiDollarSign style={{ color: 'var(--muted)', fontSize: 16 }} />
                      <span style={{ fontWeight: 600 }}>₹{tenant.rentAmount?.toLocaleString()}/month</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <FiCalendar style={{ color: 'var(--muted)', fontSize: 16 }} />
                      <span className="muted">
                        Started: {formatDate(tenant.agreementStartDate)} • Duration: {tenant.agreementDuration} months
                      </span>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                  <span className={getStatusBadgeClass(tenant.agreementStatus)}>
                    {tenant.agreementStatus || 'active'}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </section>
  )
}
