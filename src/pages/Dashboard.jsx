import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardSidebar from '../components/DashboardSidebar';
import DashboardHeader from '../components/DashboardHeader';
import PatientOverview from './patient/PatientOverview';
import PatientAppointments from './patient/PatientAppointments';
import PatientProfile from './patient/PatientProfile';
import PatientReviewModal from './patient/PatientReviewModal';
import PatientTherapyTasks from './patient/PatientTherapyTasks.jsx';
import PatientPrescriptions from './patient/PatientPrescriptions.jsx';
import Settings from './shared/Settings.jsx';
import { buildApiUrl, API_ENDPOINTS } from '../config/api.js';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, upcoming: 0, completed: 0, past: 0 });
  const [activeSection, setActiveSection] = useState('overview');
  const [activeTab, setActiveTab] = useState('upcoming');
  const [reviewModal, setReviewModal] = useState(null);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [ratingProfessionalism, setRatingProfessionalism] = useState(0);
  const [ratingCommunication, setRatingCommunication] = useState(0);
  const [ratingWaitTime, setRatingWaitTime] = useState(0);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewedAppointments, setReviewedAppointments] = useState(new Set());
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    const role = localStorage.getItem('userRole');
    if (!token || !userData) { navigate('/login'); return; }
    const parsedUser = JSON.parse(userData);
    if (parsedUser.status === 'inactive') { navigate('/account-deactivated'); return; }
    if (role === 'doctor') { navigate('/doctor-dashboard'); return; }
    setUser(parsedUser);
    fetchAppointments(parsedUser.id, token);
  }, [navigate]);

  const fetchAppointments = async (patientId, token) => {
    try {
      setLoading(true);
      const response = await fetch(buildApiUrl(`${API_ENDPOINTS.PATIENT_APPOINTMENTS}/${patientId}`), {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAppointments(data.appointments || []);
          const now = new Date();
          const upcoming = data.appointments.filter(a => new Date(a.appointment_date) >= now && a.status !== 'cancelled' && a.status !== 'completed').length;
          const completed = data.appointments.filter(a => a.status === 'completed').length;
          setStats({
            total: data.appointments.length, upcoming, completed,
            past: data.appointments.filter(a => new Date(a.appointment_date) < now || a.status === 'completed' || a.status === 'cancelled').length
          });
          const completedApts = data.appointments.filter(a => a.status === 'completed');
          const checks = await Promise.all(completedApts.map(a =>
            fetch(buildApiUrl(`${API_ENDPOINTS.CHECK_REVIEW}/${a.id}`)).then(r => r.json()).then(d => d.hasReview ? a.id : null).catch(() => null)
          ));
          setReviewedAppointments(new Set(checks.filter(Boolean)));
        }
      }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleSubmitReview = async () => {
    if (!reviewRating || !reviewModal) return;
    setSubmittingReview(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(buildApiUrl(API_ENDPOINTS.SUBMIT_REVIEW), {
        method: 'POST', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentId: reviewModal.id, rating: reviewRating, reviewText, ratingProfessionalism: ratingProfessionalism || null, ratingCommunication: ratingCommunication || null, ratingWaitTime: ratingWaitTime || null })
      });
      const data = await res.json();
      if (data.success) {
        setReviewedAppointments(prev => new Set([...prev, reviewModal.id]));
        setReviewModal(null); setReviewRating(0); setReviewText('');
        setRatingProfessionalism(0); setRatingCommunication(0); setRatingWaitTime(0);
        alert('Review submitted! It will appear after admin approval.');
      } else alert(data.message || 'Failed to submit review');
    } catch { alert('Failed to submit review'); } finally { setSubmittingReview(false); }
  };

  const handleCancelAppointment = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(buildApiUrl(`${API_ENDPOINTS.CANCEL_APPOINTMENT}/${appointmentId}`), {
        method: 'PUT', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      if (res.ok) { alert('Appointment cancelled successfully'); fetchAppointments(user.id, token); }
      else alert('Failed to cancel appointment');
    } catch { alert('Failed to cancel appointment'); }
  };

  const handleLogout = () => {
    localStorage.removeItem('token'); localStorage.removeItem('user'); localStorage.removeItem('userRole');
    navigate('/');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-orange-100 text-orange-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const formatTime = (t) => new Date(`2000-01-01T${t}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

  const filterAppointments = () => {
    const now = new Date();
    if (activeTab === 'upcoming') return appointments.filter(a => new Date(a.appointment_date) >= now && a.status !== 'cancelled' && a.status !== 'completed');
    if (activeTab === 'past') return appointments.filter(a => new Date(a.appointment_date) < now || a.status === 'completed' || a.status === 'cancelled');
    return appointments;
  };

  const menuItems = [
    { id: 'overview', name: 'Overview', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    )},
    { id: 'appointments', name: 'Appointments', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    )},
    { id: 'profile', name: 'Profile', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    )},
    { id: 'therapy', name: 'My Tasks', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 8h6m-6 4h4" />
      </svg>
    )},
    { id: 'prescriptions', name: 'Prescriptions', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    )},
    { id: 'settings', name: 'Settings', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    )},
  ];

  if (!user) return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4A7C59]"></div>
    </div>
  );

  const filteredAppointments = filterAppointments();
  const sharedProps = { getStatusColor, formatDate, formatTime };

  return (
    <div className="flex h-screen bg-gray-100">
      <DashboardSidebar
        title="Mentra"
        subtitle="Patient Portal"
        userName={user.full_name}
        userSub={user.email}
        menuItems={menuItems}
        activeSection={activeSection}
        onNavigate={setActiveSection}
        onLogout={handleLogout}
      />

      <div className="flex-1 overflow-auto">
        <DashboardHeader
          sectionTitle={menuItems.find(m => m.id === activeSection)?.name || 'Overview'}
          userName={user.full_name}
          userEmail="Patient"
          notifType="patient"
          notifId={user?.id}
          onNotifNavigate={setActiveSection}
        />

        <div className="p-8">
          {activeSection === 'overview' && (
            <PatientOverview
              stats={stats}
              appointments={appointments}
              loading={loading}
              navigate={navigate}
              setActiveSection={setActiveSection}
              {...sharedProps}
            />
          )}

          {activeSection === 'appointments' && (
            <PatientAppointments
              appointments={appointments}
              stats={stats}
              loading={loading}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              filteredAppointments={filteredAppointments}
              handleCancelAppointment={handleCancelAppointment}
              setReviewModal={setReviewModal}
              reviewedAppointments={reviewedAppointments}
              navigate={navigate}
              fetchAppointments={fetchAppointments}
              user={user}
              setReviewRating={setReviewRating}
              setReviewText={setReviewText}
              setRatingProfessionalism={setRatingProfessionalism}
              setRatingCommunication={setRatingCommunication}
              setRatingWaitTime={setRatingWaitTime}
              {...sharedProps}
            />
          )}

          {activeSection === 'profile' && (
            <PatientProfile user={user} stats={stats} />
          )}

          {activeSection === 'therapy' && <PatientTherapyTasks />}

          {activeSection === 'prescriptions' && <PatientPrescriptions />}

          {activeSection === 'settings' && (
            <Settings user={user} role="patient" onLogout={handleLogout} />
          )}
        </div>
      </div>

      <PatientReviewModal
        reviewModal={reviewModal}
        setReviewModal={setReviewModal}
        reviewRating={reviewRating}
        setReviewRating={setReviewRating}
        reviewText={reviewText}
        setReviewText={setReviewText}
        ratingProfessionalism={ratingProfessionalism}
        setRatingProfessionalism={setRatingProfessionalism}
        ratingCommunication={ratingCommunication}
        setRatingCommunication={setRatingCommunication}
        ratingWaitTime={ratingWaitTime}
        setRatingWaitTime={setRatingWaitTime}
        submittingReview={submittingReview}
        handleSubmitReview={handleSubmitReview}
        formatDate={formatDate}
      />
    </div>
  );
};

export default Dashboard;

