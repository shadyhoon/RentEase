import React, {useState} from 'react'
import Card from '../Components/Card'

export default function Tickets(){
  const [tickets,setTickets] = useState([
    { id: 1, text: 'Kitchen sink is leaking', status: 'open', priority: 'high', created: 'Dec 12', icon: '💧' },
    { id: 2, text: 'AC not cooling properly', status: 'in-progress', priority: 'high', created: 'Dec 10', icon: '❄️' }
  ])
  const [text,setText] = useState('')
  const [priority, setPriority] = useState('medium')

  const submit = (e)=>{
    e.preventDefault()
    if(!text) return
    setTickets([{id:Date.now(),text,status:'open',priority,created:'Today',icon:'🔧'},...tickets])
    setText('')
    setPriority('medium')
  }

  const getIcon = (status) => {
    switch(status) {
      case 'open': return '🟡'
      case 'in-progress': return '🔵'
      case 'resolved': return '✅'
      default: return '🔘'
    }
  }

  return (
    <section>
      <div style={{marginBottom:32}}>
        <h2 style={{fontSize:28,marginBottom:6}}>Maintenance Tickets</h2>
        <p className="muted">Report issues and track resolution progress</p>
      </div>

      <div className="card" style={{marginBottom:28}}>
        <h3 style={{marginBottom:18,marginTop:0}}>📝 New Ticket</h3>
        <form onSubmit={submit} className="col gap-3">
          <div>
            <label style={{display:'block',marginBottom:8,fontWeight:600}}>Issue Description</label>
            <textarea className="input" rows={4} placeholder="Describe the maintenance issue..." value={text} onChange={e=>setText(e.target.value)} />
          </div>
          <div className="row" style={{justifyContent:'space-between'}}>
            <div style={{display:'flex',gap:8}}>
              <label style={{display:'flex',alignItems:'center',gap:6,cursor:'pointer'}}>
                <input type="radio" name="priority" value="low" checked={priority==='low'} onChange={e=>setPriority(e.target.value)} />
                <span style={{fontSize:12}}>Low</span>
              </label>
              <label style={{display:'flex',alignItems:'center',gap:6,cursor:'pointer'}}>
                <input type="radio" name="priority" value="medium" checked={priority==='medium'} onChange={e=>setPriority(e.target.value)} />
                <span style={{fontSize:12}}>Medium</span>
              </label>
              <label style={{display:'flex',alignItems:'center',gap:6,cursor:'pointer'}}>
                <input type="radio" name="priority" value="high" checked={priority==='high'} onChange={e=>setPriority(e.target.value)} />
                <span style={{fontSize:12}}>High</span>
              </label>
            </div>
            <button type="submit" className="btn btn-primary" disabled={!text}>Submit Ticket</button>
          </div>
        </form>
      </div>

      <div>
        <h3 style={{marginBottom:16}}>📋 Active Tickets</h3>
        {tickets.length===0 && <Card>No tickets yet. Create one using the form above.</Card>}
        <div className="grid grid-2">
          {tickets.map(t=> (
            <div key={t.id} className="card" style={{position:'relative',overflow:'hidden'}}>
              <div style={{position:'absolute',top:0,right:0,bottom:0,width:4,background:`linear-gradient(to bottom, var(--accent), var(--accent-2))`}}></div>
              <div style={{display:'flex',gap:12,alignItems:'flex-start',marginBottom:12}}>
                <div style={{fontSize:24}}>{getIcon(t.status)}</div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:700,marginBottom:4}}>{t.text}</div>
                  <div className="muted" style={{fontSize:12}}>{t.created}</div>
                </div>
              </div>
              <div className="row gap-1">
                <span className={'badge ' + (t.priority === 'high' ? 'danger' : t.priority === 'medium' ? 'warning' : 'success')}>{t.priority.charAt(0).toUpperCase() + t.priority.slice(1)} Priority</span>
                <span className="badge">{t.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
