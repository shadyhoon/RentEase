import React from 'react'

const NavLink = ({ href, name, active }) => (
  <a href={href} className={active ? 'active' : ''}>
    {name}
  </a>
)

export default function Navbar({ active = 'home' }) {
  return (
    <header className="nav" role="navigation">
      <div className="brand">🏠 RentEase</div>
      <nav className="row">
        <NavLink href="#home" name="Home" active={active === 'home'} />
        <NavLink href="#dashboard" name="Dashboard" active={active === 'dashboard'} />
        <NavLink href="#tickets" name="Tickets" active={active === 'tickets'} />
        <NavLink href="#agreement" name="Agreements" active={active === 'agreement'} />
        <a href="#" className="btn btn-primary" onClick={(e)=>{e.preventDefault();window.location.hash='dashboard'}}>Get Started</a>
      </nav>
    </header>
  )
}
