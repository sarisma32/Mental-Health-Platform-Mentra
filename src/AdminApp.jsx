import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import AdminLogin from './pages/AdminLogin'
import AdminDashboardNew from './pages/AdminDashboardNew'
import './App.css'

function AdminApp() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/admin-login" replace />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminDashboardNew />} />
        <Route path="*" element={<Navigate to="/admin-login" replace />} />
      </Routes>
    </Router>
  )
}

export default AdminApp
