import React, {useState} from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Card from '../Components/Card'

export default function Agreement(){
  const navigate = useNavigate()
  const { user } = useAuth()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    tenantName: '',
    landlordName: '',
    propertyAddress: '',
    rentAmount: '',
    duration: '12',
    startDate: ''
  })
  const [signed, setSigned] = useState(false)

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value})
  }

  const handleSign = () => {
    setSigned(true)
    setStep(3)
  }

  return (
    <section>
      <div style={{marginBottom:32}}>
        <h2 style={{fontSize:28,marginBottom:6}}>Rental Agreement</h2>
        <p className="muted">Create and e-sign rental agreements instantly</p>
      </div>

      {/* Steps */}
      <div style={{display:'flex',gap:12,marginBottom:32}}>
        {[1,2,3].map(s => (
          <div key={s} style={{flex:1,cursor:'pointer',padding:12,borderRadius:10,background:step>=s?'rgba(139,92,246,0.15)':'rgba(255,255,255,0.02)',border:`1px solid ${step>=s?'rgba(139,92,246,0.3)':'var(--border)'}`,textAlign:'center',fontWeight:600}} onClick={()=>setStep(s)}>
            Step {s}
          </div>
        ))}
      </div>

      {/* Step 1: Details */}
      {step === 1 && (
        <div className="card" style={{marginBottom:28}}>
          <h3 style={{marginBottom:18,marginTop:0}}>📋 Agreement Details</h3>
          <div className="col gap-3">
            <div>
              <label style={{display:'block',marginBottom:8,fontWeight:600}}>Landlord Name</label>
              <input type="text" className="input" name="landlordName" placeholder="Full name" value={formData.landlordName} onChange={handleChange} />
            </div>
            <div>
              <label style={{display:'block',marginBottom:8,fontWeight:600}}>Tenant Name</label>
              <input type="text" className="input" name="tenantName" placeholder="Full name" value={formData.tenantName} onChange={handleChange} />
            </div>
            <div>
              <label style={{display:'block',marginBottom:8,fontWeight:600}}>Property Address</label>
              <textarea className="input" rows={2} name="propertyAddress" placeholder="Complete address" value={formData.propertyAddress} onChange={handleChange}></textarea>
            </div>
            <div className="row">
              <div style={{flex:1}}>
                <label style={{display:'block',marginBottom:8,fontWeight:600}}>Monthly Rent (₹)</label>
                <input type="number" className="input" name="rentAmount" placeholder="Enter amount" value={formData.rentAmount} onChange={handleChange} />
              </div>
              <div style={{flex:1}}>
                <label style={{display:'block',marginBottom:8,fontWeight:600}}>Duration (months)</label>
                <select className="input" name="duration" value={formData.duration} onChange={handleChange} style={{cursor:'pointer'}}>
                  <option>6</option>
                  <option>12</option>
                  <option>24</option>
                  <option>36</option>
                </select>
              </div>
            </div>
            <div>
              <label style={{display:'block',marginBottom:8,fontWeight:600}}>Start Date</label>
              <input type="date" className="input" name="startDate" value={formData.startDate} onChange={handleChange} />
            </div>
            <button className="btn btn-primary" onClick={() => setStep(2)} style={{width:'100%',justifyContent:'center'}}>Continue →</button>
          </div>
        </div>
      )}

      {/* Step 2: Preview */}
      {step === 2 && (
        <div className="card" style={{marginBottom:28}}>
          <h3 style={{marginBottom:16,marginTop:0}}>👁️ Preview Agreement</h3>
          <div style={{padding:24,background:'rgba(255,255,255,0.01)',border:'1px solid var(--border)',borderRadius:10,marginBottom:18,maxHeight:400,overflow:'auto'}}>
            <h4 style={{textAlign:'center',marginBottom:16}}>RENTAL AGREEMENT</h4>
            <p><strong>Landlord:</strong> {formData.landlordName || '[Name not provided]'}</p>
            <p><strong>Tenant:</strong> {formData.tenantName || '[Name not provided]'}</p>
            <p><strong>Property:</strong> {formData.propertyAddress || '[Address not provided]'}</p>
            <p><strong>Monthly Rent:</strong> ₹{formData.rentAmount || '0'}</p>
            <p><strong>Duration:</strong> {formData.duration} months starting {formData.startDate || 'TBD'}</p>
            <hr style={{border:'1px solid var(--border)',margin:'16px 0'}} />
            <p style={{fontSize:12,color:'var(--muted)'}}>This is a template agreement. Customize as needed. Both parties must sign to finalize.</p>
          </div>
          <div className="row" style={{justifyContent:'space-between'}}>
            <button className="btn btn-ghost" onClick={() => setStep(1)}>← Back</button>
            <button className="btn btn-primary" onClick={() => setStep(3)}>Sign Agreement →</button>
          </div>
        </div>
      )}

      {/* Step 3: Sign */}
      {step === 3 && (
        <div className="card">
          <h3 style={{marginBottom:16,marginTop:0}}>✍️ E-Signature</h3>
          {!signed ? (
            <div className="col gap-3">
              <div style={{padding:16,background:'rgba(139,92,246,0.08)',borderRadius:10,borderLeft:'3px solid var(--accent)'}}>
                <div style={{fontWeight:600,marginBottom:4}}>Ready to sign?</div>
                <div className="muted">By signing, you agree to the terms and conditions of this rental agreement.</div>
              </div>
              <div>
                <label style={{display:'flex',gap:8,cursor:'pointer',alignItems:'center'}}>
                  <input type="checkbox" required />
                  <span style={{fontSize:14}}>I acknowledge and agree to the terms</span>
                </label>
              </div>
              <button className="btn btn-primary" onClick={handleSign} style={{width:'100%',justifyContent:'center'}}>🔐 Sign Now</button>
            </div>
          ) : (
            <div style={{padding:18,background:'rgba(16,185,129,0.08)',borderRadius:10,border:'1px solid rgba(16,185,129,0.3)'}}>
              <div style={{textAlign:'center',marginBottom:16}}>
                <div style={{fontSize:32,marginBottom:8}}>✅</div>
                <div style={{fontWeight:700,marginBottom:4}}>Agreement Signed Successfully!</div>
                <div className="muted">Signature timestamp: {new Date().toLocaleString()}</div>
              </div>
              <div style={{padding:12,background:'rgba(255,255,255,0.02)',borderRadius:8,marginBottom:16,textAlign:'center'}}>
                <div style={{fontSize:12,color:'var(--muted-dark)'}}>Signed by: {formData.tenantName || 'Tenant'}</div>
              </div>
              <button 
                className="btn btn-primary" 
                onClick={() => {
                  if (user) {
                    navigate(user.role === 'landlord' ? '/landlord-dashboard' : '/tenant-dashboard')
                  } else {
                    navigate('/login')
                  }
                }} 
                style={{width:'100%',justifyContent:'center'}}
              >
                ← Back to Dashboard
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
