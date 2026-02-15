import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './Components/Navbar'
import Footer from './Components/foot'
import Landing from './Pages/Landing'
import Login from './Pages/Login'
import Register from './Pages/Register'
import Dashboard from './Pages/Dashboard'
import TenantDashboard from './Pages/TenantDashboard'
import LandlordDashboard from './Pages/LandlordDashboard'
import Tickets from './Pages/Tickets'
import Agreement from './Pages/Agreement'
import NotFound from './Pages/NotFound'
import ProtectedRoute from './Components/ProtectedRoute'
import './App.css'

const App = () => {
  return (
    <div className="app-root">
      <Navbar />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/tenant-dashboard" element={<ProtectedRoute allowedRoles={['tenant']}><TenantDashboard /></ProtectedRoute>} />
          <Route path="/landlord-dashboard" element={<ProtectedRoute allowedRoles={['landlord']}><LandlordDashboard /></ProtectedRoute>} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/tickets" element={<Tickets />} />
          <Route path="/agreement" element={<Agreement />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
