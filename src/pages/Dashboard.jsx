import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import NotificationBell from '../components/NotificationBell';
import DashboardSidebar from '../components/DashboardSidebar';
import DashboardHeader from '../components/DashboardHeader';
import { buildApiUrl, API_ENDPOINTS } from '../config/api.js';

const ratingLabels = { 1: 'Poor', 2: 'Fair', 3: 'Good', 4: 'Very Good', 5: 'Excellent' };

const StarRating = ({ rating, onRate, size = 'lg' }) => {
  const [hovered, setHovered] = React.useState(0);
  return (
    <div className="flex space-x-1">
      {[1,2,3,4,5].map(star => (
        <button key={star} type="button"
          onClick={() => onRate && onRate(star)}
          onMouseEnter={() => setHovered(star)} onMouseLeave={() => setHovered(0)}
          className={`${size === 'lg' ? 'text-4xl' : 'text-2xl'} cursor-pointer hover:scale-110 transition-transform ${star <= (hovered || rating) ? 'text-yellow-400' : 'text-gray-300'}`}>â˜…</button>
      ))}
    </div>
  );
};

const SubStarRating = ({ rating, onRate }) => {
  const [hovered, setHovered] = React.useState(0);
  return (
    <div className="flex space-x-0.5">
      {[1,2,3,4,5].map(star => (
        <button key={star} type="button" onClick={() => onRate(star)}
          onMouseEnter={() => setHovered(star)} onMouseLeave={() => setHovered(0)}
          className={`text-2xl cursor-pointer hover:scale-110 transition-transform ${star <= (hovered || rating) ? 'text-yellow-400' : 'text-gray-300'}`}>â˜…</button>
      ))}
    </div>
  );
};

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
  ];

  if (!user) return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A3B18A]"></div>
    </div>
  );

  const filteredAppointments = filterAppointments();

  return (
    <div className="flex h-screen bg-gray-100">

      {/* Sidebar */}
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

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        {/* Top header */}
        <DashboardHeader
          sectionTitle={menuItems.find(m => m.id === activeSection)?.name || 'Overview'}
          userName={user.full_name}
          userEmail="Patient"
          notifType="patient"
          notifId={user?.id}
        />

        {/* Content */}
        <div className="p-8">

          {/* OVERVIEW */}
          {activeSection === 'overview' && (
            <div className="space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: 'Upcoming', value: stats.upcoming, color: 'bg-blue-50', textColor: 'text-blue-600', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /> },
                  { label: 'Completed', value: stats.completed, color: 'bg-green-50', textColor: 'text-green-600', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /> },
                  { label: 'Total', value: stats.total, color: 'bg-[#DCE4D4]', textColor: 'text-[#A3B18A]', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /> },
                ].map(card => (
                  <div key={card.label} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500 font-medium mb-1">{card.label} Sessions</p>
                        <p className="text-3xl font-bold text-gray-800">{card.value}</p>
                      </div>
                      <div className={`w-12 h-12 ${card.color} rounded-lg flex items-center justify-center`}>
                        <svg className={`w-6 h-6 ${card.textColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">{card.icon}</svg>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Find Therapists', desc: 'Browse and book sessions', color: 'bg-[#DCE4D4]', iconColor: 'text-[#A3B18A]', action: () => navigate('/professionals'), icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /> },
                    { label: 'My Appointments', desc: 'View upcoming sessions', color: 'bg-blue-50', iconColor: 'text-blue-600', action: () => setActiveSection('appointments'), icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /> },
                    { label: 'AI Chatbot', desc: 'Get instant support', color: 'bg-purple-50', iconColor: 'text-purple-600', action: () => {}, icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /> },
                    { label: 'My Profile', desc: 'View your details', color: 'bg-green-50', iconColor: 'text-green-600', action: () => setActiveSection('profile'), icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /> },
                  ].map(item => (
                    <button key={item.label} onClick={item.action}
                      className="p-4 border-2 border-[#DCE4D4] rounded-lg hover:bg-[#F5F5F0] hover:border-[#A3B18A] transition-all text-left group">
                      <div className={`w-10 h-10 ${item.color} rounded-lg flex items-center justify-center mb-3 group-hover:bg-[#A3B18A] transition-colors`}>
                        <svg className={`w-5 h-5 ${item.iconColor} group-hover:text-white`} fill="none" stroke="currentColor" viewBox="0 0 24 24">{item.icon}</svg>
                      </div>
                      <p className="text-sm font-medium text-gray-900">{item.label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Recent appointments preview */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Recent Appointments</h3>
                  <button onClick={() => setActiveSection('appointments')} className="text-sm text-[#A3B18A] hover:text-[#8FA076] font-medium">View All</button>
                </div>
                {loading ? (
                  <div className="text-center py-6"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#A3B18A] mx-auto"></div></div>
                ) : appointments.slice(0, 3).length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p className="mb-3">No appointments yet</p>
                    <button onClick={() => navigate('/professionals')} className="bg-[#A3B18A] hover:bg-[#8FA076] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">Book Your First Session</button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {appointments.slice(0, 3).map(apt => (
                      <div key={apt.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-gradient-to-br from-[#A3B18A] to-[#8FA076] rounded-full flex items-center justify-center text-white font-semibold text-sm">{apt.doctor_name.charAt(0)}</div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">Dr. {apt.doctor_name}</p>
                            <p className="text-xs text-gray-500">{new Date(apt.appointment_date).toLocaleDateString()} â€¢ {formatTime(apt.appointment_time)}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(apt.status)}`}>{apt.status}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* APPOINTMENTS */}
          {activeSection === 'appointments' && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-800">My Appointments</h3>
                <button onClick={() => fetchAppointments(user.id, localStorage.getItem('token'))} className="text-sm text-[#A3B18A] hover:text-[#8FA076] font-medium">Refresh</button>
              </div>

              {/* Tabs */}
              <div className="flex space-x-2 mb-6 border-b border-gray-200">
                {[['upcoming', `Upcoming (${stats.upcoming})`], ['past', `Past (${stats.past})`], ['all', `All (${stats.total})`]].map(([tab, label]) => (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 font-medium text-sm transition-colors ${activeTab === tab ? 'text-[#A3B18A] border-b-2 border-[#A3B18A]' : 'text-gray-600 hover:text-gray-900'}`}>
                    {label}
                  </button>
                ))}
              </div>

              {loading ? (
                <div className="text-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#A3B18A] mx-auto mb-4"></div></div>
              ) : filteredAppointments.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  <p className="text-gray-600 mb-4">No appointments found</p>
                  <button onClick={() => navigate('/professionals')} className="bg-[#A3B18A] hover:bg-[#8FA076] text-white px-6 py-2 rounded-lg font-medium transition-colors">Book Your First Session</button>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(
                    filteredAppointments.slice().sort((a, b) => new Date(`${b.appointment_date}T${b.appointment_time}`) - new Date(`${a.appointment_date}T${a.appointment_time}`))
                      .reduce((groups, apt) => {
                        const key = apt.doctor_id;
                        if (!groups[key]) groups[key] = { doctorName: apt.doctor_name, doctorSpecialization: apt.doctor_specialization, doctorLocation: apt.doctor_location, appointments: [] };
                        groups[key].appointments.push(apt);
                        return groups;
                      }, {})
                  ).map(([doctorId, group]) => (
                    <div key={doctorId} className="border border-gray-200 rounded-xl overflow-hidden">
                      <div className="bg-[#F5F5F0] px-4 py-3 flex items-center gap-3 border-b border-gray-200">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#A3B18A] to-[#8FA076] rounded-full flex items-center justify-center text-white font-semibold text-sm">{group.doctorName.charAt(0)}</div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">Dr. {group.doctorName}</p>
                          <p className="text-xs text-gray-500">{group.doctorSpecialization} â€¢ {group.doctorLocation}</p>
                        </div>
                        <span className="text-xs text-gray-400 font-medium">{group.appointments.length} session{group.appointments.length !== 1 ? 's' : ''}</span>
                      </div>
                      <div className="divide-y divide-gray-100">
                        {group.appointments.map(apt => (
                          <div key={apt.id} className="p-4 hover:bg-gray-50 transition-colors">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 space-y-1 text-sm">
                                <div className="flex items-center text-gray-700"><svg className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>{formatDate(apt.appointment_date)}</div>
                                <div className="flex items-center text-gray-700"><svg className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>{formatTime(apt.appointment_time)} â€¢ {apt.duration_minutes} min</div>
                                <div className="flex items-center text-gray-700"><svg className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" /></svg>Rs {apt.session_fee} â€¢ <span className="capitalize ml-1">{apt.appointment_type}</span></div>
                                {apt.confirmation_number && <div className="flex items-center text-gray-500 text-xs"><svg className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>Confirmation: {apt.confirmation_number}</div>}
                                {apt.session_notes && apt.status === 'completed' && (
                                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                    <div className="flex items-start"><svg className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                      <div><p className="text-xs font-semibold text-blue-900 mb-1">Session Notes from Dr. {group.doctorName.split(' ').pop()}</p><p className="text-xs text-blue-800 whitespace-pre-wrap">{apt.session_notes}</p></div>
                                    </div>
                                  </div>
                                )}
                              </div>
                              <div className="text-right space-y-2 ml-4 flex-shrink-0">
                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(apt.status)}`}>{apt.status}</span>
                                {apt.status !== 'cancelled' && apt.status !== 'completed' && (() => {
                                  const aptDateTime = new Date(`${apt.appointment_date}T${apt.appointment_time}`);
                                  const hoursUntil = (aptDateTime - new Date()) / (1000 * 60 * 60);
                                  return hoursUntil > 5 ? (
                                    <div><button onClick={() => handleCancelAppointment(apt.id)} className="text-xs text-red-600 hover:text-red-800 font-medium">Cancel</button></div>
                                  ) : <div><span className="text-xs text-gray-400">Cannot cancel</span></div>;
                                })()}
                                {apt.status === 'completed' && (
                                  <div>{reviewedAppointments.has(apt.id) ? (
                                    <span className="text-xs text-green-600 font-medium flex items-center justify-end"><span className="mr-1">â˜…</span> Reviewed</span>
                                  ) : (
                                    <button onClick={() => { setReviewModal(apt); setReviewRating(0); setReviewText(''); setRatingProfessionalism(0); setRatingCommunication(0); setRatingWaitTime(0); }}
                                      className="text-xs text-[#A3B18A] hover:text-[#8FA076] font-medium border border-[#A3B18A] px-2 py-1 rounded">Leave a Review</button>
                                  )}</div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* PROFILE */}
          {activeSection === 'profile' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-[#A3B18A] to-[#8FA076] rounded-xl p-8 shadow-lg text-white">
                <div className="flex items-center space-x-6">
                  <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border-4 border-white/30">
                    <span className="text-3xl font-bold text-white">{user.full_name.charAt(0)}</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{user.full_name}</h2>
                    <p className="text-white/80 mt-1">Patient Account</p>
                    <span className="inline-block mt-2 px-3 py-1 bg-white/20 rounded-full text-sm">Active</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-[#A3B18A] to-[#8FA076] px-6 py-4">
                  <h3 className="text-lg font-semibold text-white">Account Information</h3>
                </div>
                <div className="p-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    {[
                      { label: 'Full Name', value: user.full_name },
                      { label: 'Email Address', value: user.email },
                      { label: 'Phone Number', value: user.phone_number || 'Not provided' },
                      { label: 'Age', value: user.age || 'Not provided' },
                      { label: 'Member Since', value: new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) },
                      { label: 'Account Status', value: 'Active' },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <label className="block text-sm font-medium text-gray-500 mb-1">{label}</label>
                        <p className="text-gray-900 font-medium">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">My Progress</h3>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: 'Sessions Completed', value: stats.completed, color: 'text-[#A3B18A]' },
                    { label: 'Upcoming', value: stats.upcoming, color: 'text-blue-600' },
                    { label: 'Total Appointments', value: stats.total, color: 'text-gray-900' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="text-center bg-[#F5F5F0] rounded-xl p-4">
                      <p className={`text-3xl font-bold ${color}`}>{value}</p>
                      <p className="text-sm text-gray-500 mt-1">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Review Modal */}
      {reviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center px-6 py-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#DCE4D4] rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-[#A3B18A]" fill="currentColor" viewBox="0 0 24 24"><path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                </div>
                <div><h3 className="text-lg font-bold text-gray-900">Rate Your Experience</h3><p className="text-xs text-gray-500">Your feedback helps other patients</p></div>
              </div>
              <button onClick={() => setReviewModal(null)} className="text-gray-400 hover:text-gray-600 p-1"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <div className="px-6 py-5 space-y-5 max-h-[75vh] overflow-y-auto">
              <div className="bg-[#F5F5F0] rounded-xl p-4 text-sm">
                <p className="font-semibold text-gray-900">Dr. {reviewModal.doctor_name}</p>
                <p className="text-gray-500 mt-0.5">{reviewModal.doctor_specialization} â€¢ {formatDate(reviewModal.appointment_date)}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800 mb-2">Overall Rating <span className="text-red-500">*</span></p>
                <StarRating rating={reviewRating} onRate={setReviewRating} size="lg" />
                {reviewRating > 0 && <p className="text-sm text-[#A3B18A] font-medium mt-2">{ratingLabels[reviewRating]}</p>}
              </div>
              <div className="bg-[#F5F5F0] rounded-xl p-4">
                <p className="text-sm font-semibold text-gray-800 mb-4">Detailed Ratings <span className="text-gray-400 font-normal">(Optional)</span></p>
                <div className="grid grid-cols-3 gap-4">
                  {[['Professionalism', ratingProfessionalism, setRatingProfessionalism], ['Communication', ratingCommunication, setRatingCommunication], ['Wait Time', ratingWaitTime, setRatingWaitTime]].map(([label, val, setter]) => (
                    <div key={label}><p className="text-xs font-medium text-gray-600 mb-2">{label}</p><SubStarRating rating={val} onRate={setter} /></div>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Your Review <span className="text-gray-400 font-normal">(optional)</span></label>
                <textarea value={reviewText} onChange={e => setReviewText(e.target.value)} rows={4} placeholder="Share your experience..." className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#A3B18A] focus:border-transparent resize-none bg-white" />
              </div>
            </div>
            <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
              <button onClick={() => setReviewModal(null)} className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={handleSubmitReview} disabled={!reviewRating || submittingReview} className="flex-1 px-4 py-3 bg-[#A3B18A] hover:bg-[#8FA076] text-white rounded-xl text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                {submittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;


