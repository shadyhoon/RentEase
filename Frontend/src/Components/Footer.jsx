import React from 'react'

export default function Footer(){
  return (
    <footer className="footer">
      <div style={{marginBottom:12}}>© {new Date().getFullYear()} RentEase — Smart Rental Management System</div>
      <div style={{fontSize:12,color:'var(--muted-dark)'}}>Making rent tracking and property management simple for everyone</div>
    </footer>
  )
}
