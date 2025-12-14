import React, { useEffect, useState } from 'react'
import Navbar from './Components/Navbar'
import Footer from './Components/Footer'
import Landing from './Pages/Landing'
import Dashboard from './Pages/Dashboard'
import Tickets from './Pages/Tickets'
import Agreement from './Pages/Agreement'
import NotFound from './Pages/NotFound'

const App = () => {
  const [route, setRoute] = useState(() => window.location.hash.slice(1) || 'home')

  useEffect(() => {
    const onHash = () => setRoute(window.location.hash.slice(1) || 'home')
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const renderPage = () => {
    switch (route) {
      case 'home':
        return <Landing />
      case 'dashboard':
        return <Dashboard />
      case 'tickets':
        return <Tickets />
      case 'agreement':
        return <Agreement />
      default:
        return <NotFound />
    }
  }

  return (
    <div className="app-root">
      <Navbar active={route} />
      <main className="app-main">{renderPage()}</main>
      <Footer />
    </div>
  )
}

export default App
