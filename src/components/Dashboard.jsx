import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { buildApiUrl, API_ENDPOINTS } from '../config/api.js';

const StarRating = ({ rating, onRate, readonly = false }) => (
  <div className="flex space-x-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        onClick={() => !readonly && onRate && onRate(star)}
        className={`text-2xl transition-colors ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
      >
        ★
      </button>
    ))}
  </div>
);

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    upcoming: 0,
    completed: 0
  });
  const [activeTab, setActiveTab] = useState('upcoming'); // upcoming, past, all
  const [reviewModal, setReviewModal] = useState(null); // appointment object
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewedAppointments, setReviewedAppointments] = useState(new Set());
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    const role = localStorage.getItem('userRole');

    if (!token || !userData) {
      navigate('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    
    if (parsedUser.status === 'inactive') {
      navigate('/account-deactivated');
      return;
    }

    if (role === 'doctor') {
      navigate('/doctor-dashboard');
      return;
    }

    setUser(parsedUser);
    setUserRole(role);
    fetchAppointments(parsedUser.id, token);
  }, [navigate]);

  const fetchAppointments = async (patientId, token) => {
    try {
      setLoading(true);
      const response = await fetch(
        buildApiUrl(`${API_ENDPOINTS.PATIENT_APPOINTMENTS}/${patientId}`),
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAppointments(data.appointments || []);
          
          const now = new Date();
          const upcoming = data.appointments.filter(apt => {
            const aptDate = new Date(apt.appointment_date);
            return aptDate >= now && apt.status !== 'cancelled' && apt.status !== 'completed';
          }).length;
          
          const completed = data.appointments.filter(apt => 
            apt.status === 'completed'
          ).length;
          
          setStats({
            total: data.appointments.length,
            upcoming,
            completed
          });

          // Check which completed appointments already have reviews
          const completedApts = data.appointments.filter(a => a.status === 'completed');
          const reviewChecks = await Promise.all(
            completedApts.map(a =>
              fetch(buildApiUrl(`${API_ENDPOINTS.CHECK_REVIEW}/${a.id}`))
                .then(r => r.json())
                .then(d => d.hasReview ? a.id : null)
                .catch(() => null)
            )
          );
          setReviewedAppointments(new Set(reviewChecks.filter(Boolean)));
        }
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!reviewRating || !reviewModal) return;
    setSubmittingReview(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(buildApiUrl(API_ENDPOINTS.SUBMIT_REVIEW), {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentId: reviewModal.id, rating: reviewRating, reviewText })
      });
      const data = await response.json();
      if (data.success) {
        setReviewedAppointments(prev => new Set([...prev, reviewModal.id]));
        setReviewModal(null);
        setReviewRating(0);
        setReviewText('');
        alert('Review submitted! It will appear after admin approval.');
      } else {
        alert(data.message || 'Failed to submit review');
      }
    } catch (err) {
      alert('Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        buildApiUrl(`${API_ENDPOINTS.CANCEL_APPOINTMENT}/${appointmentId}`),
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        alert('Appointment cancelled successfully');
        fetchAppointments(user.id, token);
      } else {
        alert('Failed to cancel appointment');
      }
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      alert('Failed to cancel appointment');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    navigate('/');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const filterAppointments = () => {
    const now = new Date();
    
    switch (activeTab) {
      case 'upcoming':
        return appointments.filter(apt => {
          const aptDate = new Date(apt.appointment_date);
          return aptDate >= now && apt.status !== 'cancelled' && apt.status !== 'completed';
        });
      case 'past':
        return appointments.filter(apt => {
          const aptDate = new Date(apt.appointment_date);
          return aptDate < now || apt.status === 'completed' || apt.status === 'cancelled';
        });
      case 'all':
      default:
        return appointments;
    }
  };

  const filteredAppointments = filterAppointments();

  if (!user) {
    return (
      <div className="min-h-screen bg-mentra-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mentra-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mentra-white">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-mentra-primary rounded-full flex items-center justify-center text-white font-bold text-2xl">
              {user.email.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {user.full_name.split(' ')[0]}!
              </h1>
              <p className="text-gray-600 mt-1">
                Patient Dashboard
              </p>
              <span className="inline-block px-3 py-1 text-sm rounded-full mt-2 bg-green-100 text-green-800">
                Patient
              </span>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                <button 
                  onClick={() => navigate('/professionals')}
                  className="p-4 bg-mentra-secondary/20 hover:bg-mentra-secondary/30 rounded-lg transition-colors text-left"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-mentra-primary rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Find Therapists</h3>
                      <p className="text-sm text-gray-600">Browse and book sessions</p>
                    </div>
                  </div>
                </button>
                
                <button 
                  onClick={() => setActiveTab('upcoming')}
                  className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-left"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">My Appointments</h3>
                      <p className="text-sm text-gray-600">View upcoming sessions</p>
                    </div>
                  </div>
                </button>
                
                <button className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors text-left">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">AI Chatbot</h3>
                      <p className="text-sm text-gray-600">Get instant support</p>
                    </div>
                  </div>
                </button>
                
                <button className="p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-left">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Progress Tracking</h3>
                      <p className="text-sm text-gray-600">Monitor your journey</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Appointments Section */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">My Appointments</h2>
                <button
                  onClick={() => fetchAppointments(user.id, localStorage.getItem('token'))}
                  className="text-sm text-mentra-primary hover:text-mentra-primary-hover font-medium"
                >
                  Refresh
                </button>
              </div>

              {/* Tabs */}
              <div className="flex space-x-2 mb-6 border-b border-gray-200">
                <button
                  onClick={() => setActiveTab('upcoming')}
                  className={`px-4 py-2 font-medium text-sm transition-colors ${
                    activeTab === 'upcoming'
                      ? 'text-mentra-primary border-b-2 border-mentra-primary'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Upcoming ({stats.upcoming})
                </button>
                <button
                  onClick={() => setActiveTab('past')}
                  className={`px-4 py-2 font-medium text-sm transition-colors ${
                    activeTab === 'past'
                      ? 'text-mentra-primary border-b-2 border-mentra-primary'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Past
                </button>
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-4 py-2 font-medium text-sm transition-colors ${
                    activeTab === 'all'
                      ? 'text-mentra-primary border-b-2 border-mentra-primary'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  All ({stats.total})
                </button>
              </div>

              {/* Appointments List */}
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mentra-primary mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading appointments...</p>
                </div>
              ) : filteredAppointments.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-gray-600 mb-4">No appointments found</p>
                  <button
                    onClick={() => navigate('/professionals')}
                    className="bg-mentra-primary hover:bg-mentra-primary-hover text-white px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    Book Your First Session
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <div className="w-12 h-12 bg-gradient-to-br from-mentra-primary to-mentra-primary-hover rounded-full flex items-center justify-center text-white font-semibold">
                              {appointment.doctor_name.charAt(0)}
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                Dr. {appointment.doctor_name}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {appointment.doctor_specialization}
                              </p>
                            </div>
                          </div>
                          
                          <div className="ml-15 space-y-1 text-sm">
                            <div className="flex items-center text-gray-700">
                              <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              {formatDate(appointment.appointment_date)}
                            </div>
                            <div className="flex items-center text-gray-700">
                              <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {formatTime(appointment.appointment_time)} • {appointment.duration_minutes} min
                            </div>
                            <div className="flex items-center text-gray-700">
                              <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              {appointment.doctor_location}
                            </div>
                            <div className="flex items-center text-gray-700">
                              <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                              </svg>
                              Rs {appointment.session_fee} • {appointment.appointment_type}
                            </div>
                            {appointment.confirmation_number && (
                              <div className="flex items-center text-gray-600 text-xs mt-2">
                                <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Confirmation: {appointment.confirmation_number}
                              </div>
                            )}
                            {appointment.session_notes && appointment.status === 'completed' && (
                              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <div className="flex items-start">
                                  <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                  <div className="flex-1">
                                    <h5 className="text-sm font-semibold text-blue-900 mb-1">Session Notes from Dr. {appointment.doctor_name.split(' ')[1] || appointment.doctor_name}</h5>
                                    <p className="text-sm text-blue-800 whitespace-pre-wrap">{appointment.session_notes}</p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-right space-y-2">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                            {appointment.status}
                          </span>
                          
                          {appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
                            <div>
                              <button
                                onClick={() => handleCancelAppointment(appointment.id)}
                                className="text-xs text-red-600 hover:text-red-800 font-medium"
                              >
                                Cancel
                              </button>
                            </div>
                          )}

                          {appointment.status === 'completed' && (
                            <div>
                              {reviewedAppointments.has(appointment.id) ? (
                                <span className="text-xs text-green-600 font-medium flex items-center">
                                  <span className="mr-1">★</span> Reviewed
                                </span>
                              ) : (
                                <button
                                  onClick={() => { setReviewModal(appointment); setReviewRating(0); setReviewText(''); }}
                                  className="text-xs text-[#A3B18A] hover:text-[#8FA076] font-medium border border-[#A3B18A] px-2 py-1 rounded"
                                >
                                  Leave a Review
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            
            {/* Profile Summary */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Profile Summary</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-600">Name:</span>
                  <span className="ml-2 font-medium text-gray-900">{user.full_name}</span>
                </div>
                <div>
                  <span className="text-gray-600">Email:</span>
                  <span className="ml-2 font-medium text-gray-900">{user.email}</span>
                </div>
                <div>
                  <span className="text-gray-600">Phone:</span>
                  <span className="ml-2 font-medium text-gray-900">{user.phone_number || 'Not provided'}</span>
                </div>
                <div>
                  <span className="text-gray-600">Member since:</span>
                  <span className="ml-2 font-medium text-gray-900">
                    {new Date(user.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
              
              <button className="w-full mt-4 bg-mentra-secondary/30 hover:bg-mentra-secondary/50 text-mentra-primary font-medium py-2 px-4 rounded-lg transition-colors">
                Edit Profile
              </button>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">My Progress</h3>
              
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-mentra-primary">{stats.completed}</div>
                  <div className="text-sm text-gray-600">Sessions Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.upcoming}</div>
                  <div className="text-sm text-gray-600">Upcoming Appointments</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                  <div className="text-sm text-gray-600">Total Appointments</div>
                </div>
              </div>
            </div>

            {/* Logout Button */}
            <button 
              onClick={handleLogout}
              className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      <Footer />

      {/* Review Modal */}
      {reviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">Leave a Review</h3>
              <button onClick={() => setReviewModal(null)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="bg-gray-50 rounded-lg p-3 mb-4 text-sm text-gray-700">
              <p className="font-medium">Dr. {reviewModal.doctor_name}</p>
              <p className="text-gray-500">{reviewModal.doctor_specialization} • {formatDate(reviewModal.appointment_date)}</p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Your Rating</label>
              <StarRating rating={reviewRating} onRate={setReviewRating} />
            </div>

            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">Your Review (optional)</label>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                rows={4}
                placeholder="Share your experience with this therapist..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#A3B18A] focus:border-transparent resize-none"
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setReviewModal(null)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 text-sm font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReview}
                disabled={!reviewRating || submittingReview}
                className="flex-1 px-4 py-2 bg-[#A3B18A] hover:bg-[#8FA076] text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
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
