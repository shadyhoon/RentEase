import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Card from '../Components/Card'
import { FiLogOut, FiDollarSign, FiUsers, FiHome, FiAlertCircle } from 'react-icons/fi'
import './DashboardLayout.css'

export default function LandlordDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const stats = [
    { label: 'Total collected', value: '₹ 72,900', icon: FiDollarSign },
    { label: 'Active tenants', value: '12', icon: FiUsers },
    { label: 'Properties', value: '4', icon: FiHome },
    { label: 'Pending issues', value: '3', icon: FiAlertCircle }
  ]

  const recentPayments = [
    { name: 'Paul Kumar', amount: '₹12,000', status: 'Completed' },
    { name: 'Asha Sharma', amount: '₹9,500', status: 'Completed' },
    { name: 'Raj Patel', amount: '₹15,000', status: 'Pending' }
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

      <div className="grid grid-4" style={{ marginBottom: 32 }}>
        {stats.map((s, i) => (
          <Card key={i}>
            <s.icon className="stat-icon" style={{ fontSize: 22, color: 'var(--accent)', marginBottom: 8 }} />
            <div className="muted" style={{ fontSize: 13 }}>{s.label}</div>
            <div style={{ fontSize: 20, fontWeight: 700, marginTop: 6 }}>{s.value}</div>
          </Card>
        ))}
      </div>

      <div className="grid grid-2">
        <div className="card">
          <h3 style={{ marginBottom: 16, marginTop: 0 }}>Recent payments</h3>
          <div className="col gap-1">
            {recentPayments.map((p, i) => (
              <div key={i} className="payment-row">
                <div>
                  <div style={{ fontWeight: 600 }}>{p.name}</div>
                  <div className="muted" style={{ fontSize: 12 }}>{p.amount}</div>
                </div>
                <span className={'badge ' + (p.status === 'Completed' ? 'success' : 'warning')}>{p.status}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <h3 style={{ marginBottom: 16, marginTop: 0 }}>Quick actions</h3>
          <div className="col gap-2">
            <a className="btn btn-primary" href="/agreement" style={{ width: '100%', justifyContent: 'center' }}>Create agreement</a>
            <a className="btn btn-ghost" href="/tickets" style={{ width: '100%', justifyContent: 'center' }}>View tickets</a>
            <a className="btn btn-ghost" href="/dashboard" style={{ width: '100%', justifyContent: 'center' }}>Add tenant</a>
          </div>
        </div>
      </div>
    </section>
  )
}
