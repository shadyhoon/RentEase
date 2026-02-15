import React from 'react'
import Card from '../Components/Card'

export default function Landing(){
  const features = [
    { icon: '💳', title: 'Rent Tracking', desc: 'Automatic rent schedule, reminders, receipts and payment history.' },
    { icon: '🔧', title: 'Maintenance Tickets', desc: 'Raise issues instantly, track progress and communicate in real-time.' },
    { icon: '📝', title: 'E-sign Agreements', desc: 'Create, customize and sign rental agreements securely online.' },
    { icon: '📊', title: 'Analytics', desc: 'Detailed insights into payments, occupancy and property performance.' },
    { icon: '👥', title: 'Tenant Management', desc: 'Manage multiple tenants, properties and documents effortlessly.' },
    { icon: '🔒', title: 'Secure & Private', desc: 'Bank-grade security with end-to-end encryption for all data.' }
  ]

  return (
    <section>
      <div className="hero" style={{marginBottom:48}}>
        <div>
          <div className="hero-title">Smart Rental Management Made Simple</div>
          <div className="hero-sub">Track rent payments, manage agreements, and resolve maintenance issues — all in one secure platform designed for landlords and tenants.</div>
        </div>
        <div className="row gap-2">
          <a className="btn btn-primary" href="/login" style={{gap:8}}> Get Started</a>
          <a className="btn btn-primary" href="/tickets">Raise Ticket</a>
        </div>
      </div>

      <div style={{textAlign:'center',marginBottom:48}}>
        <h2 style={{fontSize:24,marginBottom:12}}>Powerful Features</h2>
        <p style={{color:'var(--muted)',marginBottom:32}}>Everything you need to manage rentals effectively</p>
      </div>

      <div className="grid grid-3">
        {features.map((f,i) => (
          <Card key={i} title={f.title}>
            <div style={{fontSize:28,marginBottom:12}}>{f.icon}</div>
            <div className="muted">{f.desc}</div>
          </Card>
        ))}
      </div>

      <div style={{marginTop:48,padding:32,borderRadius:14,background:'linear-gradient(135deg, rgba(139,92,246,0.1) 0%, rgba(6,182,212,0.05) 100%)',border:'1px solid rgba(139,92,246,0.2)'}}>
        <div style={{textAlign:'center'}}>
          <h3 style={{marginBottom:12}}>Ready to get started?</h3>
          <p className="muted" style={{marginBottom:18}}>Join thousands of landlords and tenants using RentEase</p>
          <a className="btn btn-primary" href="/login">Launch Dashboard →</a>
        </div>
      </div>
    </section>
  )
}
