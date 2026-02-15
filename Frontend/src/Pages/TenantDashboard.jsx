import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Card from '../Components/Card'
import { FiLogOut, FiDollarSign, FiFileText, FiTool } from 'react-icons/fi'
import './DashboardLayout.css'

export default function TenantDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const stats = [
    { label: 'Rent due this month', value: '₹ 12,000', icon: FiDollarSign },
    { label: 'Last paid', value: 'Dec 1, 2024', icon: FiFileText },
    { label: 'Open tickets', value: '1', icon: FiTool }
  ]

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

      <div className="grid grid-2">
        <div className="card">
          <h3 style={{ marginBottom: 16, marginTop: 0 }}>Quick actions</h3>
          <div className="col gap-2">
            <a className="btn btn-primary" href="/agreement" style={{ width: '100%', justifyContent: 'center' }}>View agreement</a>
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
