import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import MentraLanding from './pages/MentraLanding'
import SignupPage from './pages/SignupPage'
import UserRegister from './pages/UserRegister'
import UserLogin from './pages/UserLogin'
import Dashboard from './pages/Dashboard'
import DoctorDashboardNew from './pages/DoctorDashboardNew'
import ProfessionalRegister from './pages/ProfessionalRegister'
import DoctorPendingStatus from './pages/DoctorPendingStatus'
import ServicesPage from './pages/ServicesPage'
import AboutUsPage from './pages/AboutUsPage'
import ProfessionalsPage from './pages/ProfessionalsPage'
import BookAppointmentPage from './pages/BookAppointmentPage'
import AppointmentConfirmationPage from './pages/AppointmentConfirmationPage'
import ForgotPassword from './pages/ForgotPassword'
import VerifyOTP from './pages/VerifyOTP'
import ResetPassword from './pages/ResetPassword'
import AccountDeactivated from './pages/AccountDeactivated'
import DoctorProfilePage from './pages/DoctorProfilePage'
import ChatbotPage from './chatbot/ChatbotPage.jsx'
import TermsAndConditions from './pages/TermsAndConditions'
import PrivacyPolicy from './pages/PrivacyPolicy'
import './App.css'

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<MentraLanding />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/register-user" element={<UserRegister />} />
          <Route path="/login" element={<UserLogin />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/doctor-dashboard" element={<DoctorDashboardNew />} />
          <Route path="/register-professional" element={<ProfessionalRegister />} />
          <Route path="/doctor-pending" element={<DoctorPendingStatus />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/about" element={<AboutUsPage />} />
          <Route path="/professionals" element={<ProfessionalsPage />} />
          <Route path="/book-appointment/:professionalId" element={<BookAppointmentPage />} />
          <Route path="/appointment-confirmation" element={<AppointmentConfirmationPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/account-deactivated" element={<AccountDeactivated />} />
          <Route path="/doctor-profile/:doctorId" element={<DoctorProfilePage />} />
          <Route path="/chatbot" element={<ChatbotPage />} />
          <Route path="/terms" element={<TermsAndConditions />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App



