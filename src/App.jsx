import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import MentraLanding from './components/MentraLanding'
import SignupPage from './components/SignupPage'
import UserRegister from './components/UserRegister'
import UserLogin from './components/UserLogin'
import Dashboard from './components/Dashboard'
import DoctorDashboard from './components/DoctorDashboard'
import DoctorDashboardNew from './components/DoctorDashboardNew'
import DoctorProfileEdit from './components/DoctorProfileEdit'
import ProfessionalRegister from './components/ProfessionalRegister'
import DoctorPendingStatus from './components/DoctorPendingStatus'
import ServicesPage from './components/ServicesPage'
import AboutUsPage from './components/AboutUsPage'
import ProfessionalsPage from './components/ProfessionalsPage'
import BookAppointmentPage from './components/BookAppointmentPage'
import AppointmentConfirmationPage from './components/AppointmentConfirmationPage'
import ForgotPassword from './components/ForgotPassword'
import VerifyOTP from './components/VerifyOTP'
import ResetPassword from './components/ResetPassword'
import AdminLogin from './components/AdminLogin'
import AdminDashboard from './components/AdminDashboard'
import AdminDashboardNew from './components/AdminDashboardNew'
import AccountDeactivated from './components/AccountDeactivated'
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
          <Route path="/doctor-dashboard-old" element={<DoctorDashboard />} />
          <Route path="/doctor/profile/edit" element={<DoctorProfileEdit />} />
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
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminDashboardNew />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/account-deactivated" element={<AccountDeactivated />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App



// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// import LandingPage from "./LandingPage/LandingPage.jsx";

// import ChooseAccountType from "./ChooseAccountType/ChooseAccountType";
// import DoctorRegister from "./DoctorRegister/DoctorRegister";
// import UserRegister from "./UserRegister/UserRegister";
// import AboutUs from "./AboutUs/AboutUs";   // NEW IMPORT

// function App() {
//   return (
//     <Router>
//       <Routes>
//         <Route path="/" element={<LandingPage />} />
//         <Route path="/choose-account" element={<ChooseAccountType />} />
//         <Route path="/register-doctor" element={<DoctorRegister />} />
//         <Route path="/register-user" element={<UserRegister />} />
//         <Route path="/about-us" element={<AboutUs />} />  {/* NEW ROUTE */}
//       </Routes>
//     </Router>
//   );
// }

// export default App;
