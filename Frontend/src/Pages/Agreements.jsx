import React, { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import * as agreementsApi from '../api/agreements'

function formatDate(d) {
  if (!d) return '—'
  const date = new Date(d)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString()
}

export default function Agreements() {
  const { user, token } = useAuth()
  const [agreements, setAgreements] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const signedAgreements = useMemo(() => {
    return (agreements || []).filter((a) => a.status === 'approved' || a.status === 'signed')
  }, [agreements])

  const load = async () => {
    if (!token) return
    try {
      setLoading(true)
      setError('')

      if (user?.role === 'landlord') {
        const res = await agreementsApi.getLandlordAgreements(token)
        setAgreements(res.data || [])
      } else {
        // Tenant requirement: only show approved/signed in signed section.
        const res = await agreementsApi.getMyAgreements({ status: 'approved' }, token)
        setAgreements(res.data || [])
      }
    } catch (err) {
      setError(err.message || 'Failed to load agreements')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  return (
    <section>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 28, marginBottom: 6 }}>Agreements</h2>
        <p className="muted">
          {user?.role === 'tenant'
            ? 'View your signed/approved rental agreements'
            : 'View your agreements'}
        </p>
      </div>

      {error && (
        <div className="card" style={{ marginBottom: 18, borderColor: 'var(--danger)' }}>
          <p style={{ color: 'var(--danger)' }}>{error}</p>
        </div>
      )}

      {loading ? (
        <div className="card">
          <p className="muted" style={{ margin: 0, padding: 8 }}>Loading…</p>
        </div>
      ) : (user?.role === 'tenant' ? signedAgreements.length === 0 : agreements.length === 0) ? (
        <div className="card">
          <div style={{ textAlign: 'center', padding: 28 }}>
            <div style={{ fontSize: 44, marginBottom: 10 }}>📄</div>
            <h3 style={{ marginBottom: 8, marginTop: 0 }}>
              {user?.role === 'tenant' ? 'No signed agreements' : 'No agreements yet'}
            </h3>
            <p className="muted" style={{ marginBottom: 0 }}>
              {user?.role === 'tenant'
                ? 'Once you approve an agreement sent by your landlord, it will appear here.'
                : 'Create an agreement to start the approval workflow.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-1" style={{ gap: 16 }}>
          {(user?.role === 'tenant' ? signedAgreements : agreements).map((a) => (
            <div key={a._id} className="card" style={{ padding: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ minWidth: 220 }}>
                  <div style={{ fontWeight: 800, marginBottom: 6 }}>
                    {a.status === 'approved' || a.status === 'signed' ? 'Signed Agreement' : 'Agreement'}
                  </div>
                  <div className="muted" style={{ fontSize: 13, marginBottom: 4 }}>
                    Property: {a.propertyAddress}
                  </div>
                  <div className="muted" style={{ fontSize: 13 }}>
                    {a.status === 'approved' || a.status === 'signed'
                      ? `Approved at: ${formatDate(a.tenantApprovalTimestamp)}`
                      : `Status: ${a.status}`}
                  </div>
                </div>
                {(a.status === 'approved' || a.status === 'signed') ? (
                  <span className="badge success" style={{ height: 22, alignSelf: 'flex-start' }}>
                    {a.status === 'signed' ? 'signed' : 'approved'}
                  </span>
                ) : (
                  <span className="badge warning" style={{ height: 22, alignSelf: 'flex-start' }}>
                    {a.status}
                  </span>
                )}
              </div>

              <hr style={{ border: '1px solid var(--border)', margin: '14px 0' }} />

              {/* Minimal "document view" (template summary) */}
              <div style={{ padding: 14, background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border)', borderRadius: 10 }}>
                <h4 style={{ textAlign: 'center', marginTop: 0, marginBottom: 12 }}>RENTAL AGREEMENT</h4>
                <p><strong>Landlord:</strong> {a.landlordName}</p>
                <p><strong>Tenant:</strong> {a.tenantName} ({a.tenantEmail})</p>
                <p><strong>Property:</strong> {a.propertyAddress}</p>
                <p><strong>Monthly Rent:</strong> ₹{a.rentAmount}</p>
                <p><strong>Duration:</strong> {a.duration} months starting {new Date(a.startDate).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

