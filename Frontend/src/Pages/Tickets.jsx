import React, { useEffect, useMemo, useState } from 'react'
import Card from '../Components/Card'
import { useAuth } from '../context/AuthContext'
import * as ticketsApi from '../api/tickets'

export default function Tickets(){
  const { user, token } = useAuth()
  const role = user?.role
  const isTenant = role === 'tenant'
  const isLandlord = role === 'landlord'

  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const [text, setText] = useState('')
  const [priority, setPriority] = useState('Medium')
  const [submitting, setSubmitting] = useState(false)
  const [actionId, setActionId] = useState(null)

  const activeTickets = useMemo(() => {
    if (isLandlord) return (tickets || []).filter((t) => t.status !== 'Closed')
    return tickets || []
  }, [tickets, isLandlord])

  const loadTickets = async () => {
    if (!token) return
    try {
      setLoading(true)
      setError('')
      const res = await ticketsApi.getTickets(token)
      setTickets(res.data || [])
    } catch (err) {
      setError(err.message || 'Failed to load tickets')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTickets()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  const submit = async (e) => {
    e.preventDefault()
    if (!isTenant) {
      setError('Only tenants can create tickets.')
      return
    }
    if (!text || String(text).trim() === '') return

    try {
      setSubmitting(true)
      setError('')
      setMessage('')
      const res = await ticketsApi.createTicket(
        { issueDescription: text, priority },
        token
      )
      setMessage(res.message || 'Ticket created successfully.')
      setText('')
      setPriority('Medium')
      setTickets((prev) => [res.data, ...(prev || [])])
      window.dispatchEvent(new Event('rentease:ticketsUpdated'))
    } catch (err) {
      setError(err.message || 'Failed to create ticket')
    } finally {
      setSubmitting(false)
    }
  }

  const statusBadgeClass = (status) => {
    switch (status) {
      case 'Open':
        return 'warning'
      case 'Resolved':
        return 'success'
      case 'Closed':
        return ''
      default:
        return ''
    }
  }

  const approvalBadgeClass = (approvalStatus) => {
    switch (approvalStatus) {
      case 'Approved':
        return 'success'
      case 'Pending':
        return 'warning'
      default:
        return ''
    }
  }

  const priorityBadgeClass = (p) => {
    switch (p) {
      case 'High':
        return 'danger'
      case 'Medium':
        return 'warning'
      case 'Low':
        return 'success'
      default:
        return ''
    }
  }

  const resolve = async (id) => {
    if (!isLandlord) return
    try {
      setActionId(id)
      setError('')
      setMessage('')
      const res = await ticketsApi.resolveTicket(id, token)
      setMessage(res.message || 'Waiting for Tenant Approval')
      setTickets((prev) => (prev || []).map((t) => (t._id === id ? res.data : t)))
      window.dispatchEvent(new Event('rentease:ticketsUpdated'))
    } catch (err) {
      setError(err.message || 'Failed to resolve ticket')
    } finally {
      setActionId(null)
    }
  }

  const approve = async (id) => {
    if (!isTenant) return
    try {
      setActionId(id)
      setError('')
      setMessage('')
      const res = await ticketsApi.approveTicket(id, token)
      setMessage(res.message || 'Resolution approved.')
      setTickets((prev) => (prev || []).map((t) => (t._id === id ? res.data : t)))
      window.dispatchEvent(new Event('rentease:ticketsUpdated'))
    } catch (err) {
      setError(err.message || 'Failed to approve ticket')
    } finally {
      setActionId(null)
    }
  }

  const clear = async (id) => {
    if (!isLandlord) return
    try {
      setActionId(id)
      setError('')
      setMessage('')
      const res = await ticketsApi.clearTicket(id, token)
      setMessage(res.message || 'Ticket cleared.')
      setTickets((prev) => (prev || []).map((t) => (t._id === id ? res.data : t)))
      window.dispatchEvent(new Event('rentease:ticketsUpdated'))
    } catch (err) {
      setError(err.message || 'Failed to clear ticket')
    } finally {
      setActionId(null)
    }
  }

  return (
    <section>
      <div style={{marginBottom:32}}>
        <h2 style={{fontSize:28,marginBottom:6}}>Maintenance Tickets</h2>
        <p className="muted">Report issues and track resolution progress</p>
      </div>

      {error && (
        <div className="card" style={{ marginBottom: 18, borderColor: 'var(--danger)' }}>
          <p style={{ color: 'var(--danger)', margin: 0 }}>{error}</p>
        </div>
      )}

      {message && !error && (
        <div className="card" style={{ marginBottom: 18, borderColor: 'var(--border)' }}>
          <p style={{ margin: 0 }}>{message}</p>
        </div>
      )}

      {isTenant && (
        <div className="card" style={{marginBottom:28}}>
          <h3 style={{marginBottom:18,marginTop:0}}>📝 New Ticket</h3>
          <form onSubmit={submit} className="col gap-3">
            <div>
              <label style={{display:'block',marginBottom:8,fontWeight:600}}>Issue Description</label>
              <textarea className="input" rows={4} placeholder="Describe the maintenance issue..." value={text} onChange={e=>setText(e.target.value)} />
            </div>
            <div className="row" style={{justifyContent:'space-between', alignItems:'center', gap: 12}}>
              <div style={{display:'flex',gap:8, flexWrap: 'wrap'}}>
                <label style={{display:'flex',alignItems:'center',gap:6,cursor:'pointer'}}>
                  <input type="radio" name="priority" value="Low" checked={priority==='Low'} onChange={e=>setPriority(e.target.value)} />
                  <span style={{fontSize:12}}>Low</span>
                </label>
                <label style={{display:'flex',alignItems:'center',gap:6,cursor:'pointer'}}>
                  <input type="radio" name="priority" value="Medium" checked={priority==='Medium'} onChange={e=>setPriority(e.target.value)} />
                  <span style={{fontSize:12}}>Medium</span>
                </label>
                <label style={{display:'flex',alignItems:'center',gap:6,cursor:'pointer'}}>
                  <input type="radio" name="priority" value="High" checked={priority==='High'} onChange={e=>setPriority(e.target.value)} />
                  <span style={{fontSize:12}}>High</span>
                </label>
              </div>
              <button type="submit" className="btn btn-primary" disabled={!text || submitting}>
                {submitting ? 'Submitting…' : 'Submit Ticket'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div>
        <h3 style={{marginBottom:16}}>📋 Active Tickets</h3>
        {loading ? (
          <Card>Loading…</Card>
        ) : activeTickets.length===0 ? (
          <Card>No tickets yet. {isTenant ? 'Create one using the form above.' : 'No active tickets at the moment.'}</Card>
        ) : null}
        <div className="grid grid-2">
          {activeTickets.map(t=> (
            <div key={t._id} className="card" style={{position:'relative',overflow:'hidden'}}>
              <div style={{position:'absolute',top:0,right:0,bottom:0,width:4,background:`linear-gradient(to bottom, var(--accent), var(--accent-2))`}}></div>
              <div style={{display:'flex',gap:12,alignItems:'flex-start',marginBottom:12}}>
                <div style={{flex:1}}>
                  <div style={{fontWeight:700,marginBottom:4}}>{t.issueDescription}</div>
                  <div className="muted" style={{fontSize:12}}>
                    {t.createdAt ? new Date(t.createdAt).toLocaleString() : ''}
                  </div>
                </div>
              </div>
              {isLandlord && (
                <div className="muted" style={{fontSize:12, marginBottom: 10}}>
                  <div><span style={{fontWeight: 700}}>Tenant:</span> {t.tenantName}</div>
                  <div><span style={{fontWeight: 700}}>Email:</span> {t.tenantEmail}</div>
                </div>
              )}
              <div className="row gap-1">
                <span className={'badge ' + priorityBadgeClass(t.priority)}>{t.priority} Priority</span>
                <span className={'badge ' + statusBadgeClass(t.status)}>{t.status}</span>
                <span className={'badge ' + approvalBadgeClass(t.approvalStatus)}>
                  {t.approvalStatus}
                </span>
              </div>

              {t.status === 'Resolved' && t.approvalStatus !== 'Approved' && (
                <div className="muted" style={{ fontSize: 12, marginTop: 10 }}>
                  Waiting for Tenant Approval
                </div>
              )}

              <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {isLandlord && t.status === 'Open' && (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => resolve(t._id)}
                    disabled={actionId === t._id}
                  >
                    {actionId === t._id ? 'Updating…' : 'Mark as Resolved'}
                  </button>
                )}

                {isTenant && t.status === 'Resolved' && t.approvalStatus !== 'Approved' && (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => approve(t._id)}
                    disabled={actionId === t._id}
                  >
                    {actionId === t._id ? 'Approving…' : 'Approve Resolution'}
                  </button>
                )}

                {isLandlord && t.status === 'Resolved' && t.approvalStatus === 'Approved' && (
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => clear(t._id)}
                    disabled={actionId === t._id}
                  >
                    {actionId === t._id ? 'Clearing…' : 'Clear Ticket'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
