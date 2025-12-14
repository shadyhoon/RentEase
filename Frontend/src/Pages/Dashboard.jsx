import React from 'react'
import Card from '../Components/Card'

export default function Dashboard(){
  const stats = [
    { label: 'Total Rent Due', value: '₹ 85,400', icon: '💳', color: '#8b5cf6' },
    { label: 'Collected', value: '₹ 72,900', icon: '✅', color: '#10b981' },
    { label: 'Active Tenants', value: '12', icon: '👥', color: '#06b6d4' },
    { label: 'Pending Issues', value: '3', icon: '⚠️', color: '#f59e0b' }
  ]

  const recentPayments = [
    { name: 'Paul Kumar', amount: '₹12,000', status: 'Completed', date: 'Dec 10' },
    { name: 'Asha Sharma', amount: '₹9,500', status: 'Completed', date: 'Dec 8' },
    { name: 'Raj Patel', amount: '₹15,000', status: 'Pending', date: 'Due Dec 15' },
  ]

  return (
    <section>
      <div style={{marginBottom:36}}>
        <h2 style={{fontSize:28,marginBottom:6}}>Dashboard</h2>
        <p className="muted">Overview of properties, payments and tenants</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-4" style={{marginBottom:36}}>
        {stats.map((s,i) => (
          <Card key={i}>
            <div style={{fontSize:24,marginBottom:8}}>{s.icon}</div>
            <div className="muted" style={{fontSize:13}}>{s.label}</div>
            <div style={{fontSize:24,fontWeight:700,marginTop:6}}>{s.value}</div>
          </Card>
        ))}
      </div>

      {/* Payment History */}
      <div className="grid grid-2" style={{marginBottom:36}}>
        <div className="card">
          <h3 style={{marginBottom:16,marginTop:0}}>Recent Payments</h3>
          <div className="col gap-1">
            {recentPayments.map((p,i) => (
              <div key={i} style={{padding:12,background:'rgba(255,255,255,0.02)',borderRadius:8,display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                <div>
                  <div style={{fontWeight:600}}>{p.name}</div>
                  <div className="muted" style={{fontSize:12}}>{p.date}</div>
                </div>
                <div style={{textAlign:'right'}}>
                  <div style={{fontWeight:600}}>{p.amount}</div>
                  <span className={'badge ' + (p.status === 'Completed' ? 'success' : 'warning')}>{p.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 style={{marginBottom:16,marginTop:0}}>Quick Actions</h3>
          <div className="col gap-2">
            <a className="btn btn-primary" href="#agreement" style={{width:'100%',justifyContent:'center'}}>📝 Create Agreement</a>
            <a className="btn btn-ghost" href="#tickets" style={{width:'100%',justifyContent:'center'}}>🔧 Raise Ticket</a>
            <a className="btn btn-ghost" href="#" style={{width:'100%',justifyContent:'center'}}>👤 Add Tenant</a>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 style={{marginBottom:12,marginTop:0}}>💡 Pro Tips</h3>
        <div className="col gap-2">
          <div style={{padding:12,background:'rgba(139,92,246,0.08)',borderRadius:8,borderLeft:'3px solid var(--accent)'}}>
            <div style={{fontWeight:600,marginBottom:4}}>Set reminders</div>
            <div className="muted" style={{fontSize:13}}>Enable notifications for upcoming rent due dates</div>
          </div>
        </div>
      </div>
    </section>
  )
}
