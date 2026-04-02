import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import NotificationBanner from '../components/NotificationBanner';
import { buildApiUrl, API_ENDPOINTS } from '../config/api.js';

const DoctorDashboard = () => {
  const [doctor, setDoctor] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({
    todayAppointments: 0,
    totalPatients: 0,
    weeklyRevenue: 0,
    completedSessions: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [notification, setNotification] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in and is a doctor
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    const role = localStorage.getItem('userRole');

    if (!token || !userData || role !== 'doctor') {
      navigate('/login');
      return;
    }

    const doctorData = JSON.parse(userData);
    setDoctor(doctorData);
    
    // Fetch dashboard data
    fetchDashboardData(doctorData.id, token);
  }, [navigate]);

  const fetchDashboardData = async (doctorId, token) => {
    try {
      setLoading(true);
      
      // Fetch dashboard stats
      const statsResponse = await fetch(
        buildApiUrl(API_ENDPOINTS.DOCTOR_STATS),
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.stats);
      }

      // Fetch today's appointments and upcoming appointments
      const today = new Date().toISOString().split('T')[0];
      const appointmentsResponse = await fetch(
        `${buildApiUrl(API_ENDPOINTS.DOCTOR_APPOINTMENTS)}/${doctorId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (appointmentsResponse.ok) {
        const appointmentsData = await appointmentsResponse.json();
        setAppointments(appointmentsData.appointments || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set fallback data if API fails
      setStats({
        todayAppointments: 0,
        totalPatients: 0,
        weeklyRevenue: 0,
        completedSessions: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (appointmentId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${buildApiUrl(API_ENDPOINTS.UPDATE_APPOINTMENT_STATUS)}/${appointmentId}/status`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ status: newStatus })
        }
      );

      if (response.ok) {
        // Refresh appointments data
        fetchDashboardData(doctor.id, token);
        setNotification({
          message: `Appointment status updated to ${newStatus}`,
          type: 'success'
        });
      } else {
        setNotification({
          message: 'Failed to update appointment status',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Error updating appointment status:', error);
      setNotification({
        message: 'Error updating appointment status',
        type: 'error'
      });
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
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-mentra-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mentra-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!doctor) {
    return null;
  }

  return (
    <div className="min-h-screen bg-mentra-white">
      {notification && (
        <NotificationBanner
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-mentra-primary rounded-full flex items-center justify-center text-white font-bold text-2xl">
                Dr
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Welcome back, Dr. {doctor.full_name.split(' ')[0]}!
                </h1>
                <p className="text-gray-600 mt-1">
                  {doctor.specialization} â€¢ {doctor.hospital_name}
                </p>
                <span className="inline-block px-3 py-1 text-sm rounded-full mt-2 bg-green-100 text-green-800">
                  âœ“ Verified Professional
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Today's Date</p>
              <p className="text-lg font-semibold text-gray-900">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Today's Sessions</p>
                <p className="text-2xl font-bold text-gray-900">{stats.todayAppointments}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-mentra-primary/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-mentra-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Patients</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalPatients}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Weekly Revenue</p>
                <p className="text-2xl font-bold text-gray-900">${stats.weeklyRevenue}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed Sessions</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedSessions}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 mb-8">
          <div className="border-b border-gray-200">
            <div className="flex justify-between items-center px-6">
              <nav className="flex space-x-8">
                {[
                  { id: 'overview', name: 'Overview', icon: 'ðŸ“Š' },
                  { id: 'appointments', name: 'Appointments', icon: 'ðŸ“…' },
                  { id: 'patients', name: 'Patients', icon: 'ðŸ‘¥' },
                  { id: 'schedule', name: 'Schedule', icon: 'ðŸ•’' },
                  { id: 'analytics', name: 'Analytics', icon: 'ðŸ“ˆ' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-mentra-primary text-mentra-primary'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <span className="mr-2">{tab.icon}</span>
                    {tab.name}
                  </button>
                ))}
              </nav>
              
              {/* Edit Profile Button */}
              <button
                onClick={() => navigate('/doctor/profile/edit')}
                className="flex items-center gap-2 px-4 py-2 bg-mentra-primary hover:bg-mentra-primary-hover text-white rounded-lg transition-colors font-medium"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Profile
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Today's Schedule */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Schedule</h3>
                  {appointments.filter(apt => {
                    const today = new Date().toISOString().split('T')[0];
                    const aptDate = new Date(apt.appointment_date).toISOString().split('T')[0];
                    return aptDate === today;
                  }).length > 0 ? (
                    <div className="space-y-3">
                      {appointments.filter(apt => {
                        const today = new Date().toISOString().split('T')[0];
                        const aptDate = new Date(apt.appointment_date).toISOString().split('T')[0];
                        return aptDate === today;
                      }).slice(0, 5).map((appointment) => (
                        <div key={appointment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-mentra-primary rounded-full flex items-center justify-center text-white font-semibold">
                              {appointment.patient_first_name.charAt(0)}{appointment.patient_last_name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {appointment.patient_first_name} {appointment.patient_last_name}
                              </p>
                              <p className="text-sm text-gray-600">
                                {formatTime(appointment.appointment_time)} â€¢ {appointment.appointment_type}
                              </p>
                            </div>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                            {appointment.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p>No appointments scheduled for today</p>
                    </div>
                  )}
                </div>

                {/* Quick Actions */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <button className="p-4 bg-mentra-secondary/20 hover:bg-mentra-secondary/30 rounded-lg transition-colors text-center">
                      <div className="w-8 h-8 bg-mentra-primary rounded-full flex items-center justify-center mx-auto mb-2">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                      <p className="text-sm font-medium text-gray-900">Add Patient</p>
                    </button>
                    
                    <button className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-center">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <p className="text-sm font-medium text-gray-900">Schedule</p>
                    </button>
                    
                    <button className="p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-center">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <p className="text-sm font-medium text-gray-900">Notes</p>
                    </button>
                    
                    <button className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors text-center">
                      <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-2">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      <p className="text-sm font-medium text-gray-900">Reports</p>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'appointments' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Appointments</h3>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => fetchDashboardData(doctor.id, localStorage.getItem('token'))}
                      disabled={refreshing}
                      className="border border-gray-300 hover:bg-gray-50 px-3 py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
                    >
                      {refreshing ? 'Refreshing...' : 'Refresh'}
                    </button>
                    <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                      <option value="all">All Status</option>
                      <option value="scheduled">Scheduled</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    <button className="bg-mentra-primary hover:bg-mentra-primary-hover text-white px-4 py-2 rounded-lg font-medium transition-colors">
                      New Appointment
                    </button>
                  </div>
                </div>
                
                {appointments.length > 0 ? (
                  <div className="space-y-4">
                    {appointments.map((appointment) => (
                      <div key={appointment.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-mentra-primary rounded-full flex items-center justify-center text-white font-semibold">
                              {appointment.patient_first_name.charAt(0)}{appointment.patient_last_name.charAt(0)}
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">
                                {appointment.patient_first_name} {appointment.patient_last_name}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {new Date(appointment.appointment_date).toLocaleDateString()} â€¢ {formatTime(appointment.appointment_time)} â€¢ {appointment.duration_minutes} min
                              </p>
                              <p className="text-sm text-gray-500">
                                {appointment.reason_for_visit}
                              </p>
                              <p className="text-xs text-gray-400">
                                {appointment.patient_email} â€¢ {appointment.patient_phone}
                              </p>
                            </div>
                          </div>
                          <div className="text-right space-y-2">
                            <div className="flex items-center space-x-2">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                                {appointment.status}
                              </span>
                              <span className="text-sm font-medium text-gray-900">${appointment.session_fee}</span>
                            </div>
                            <div className="flex space-x-1">
                              {appointment.status === 'scheduled' && (
                                <button
                                  onClick={() => handleStatusUpdate(appointment.id, 'confirmed')}
                                  className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded hover:bg-green-200 transition-colors"
                                >
                                  Confirm
                                </button>
                              )}
                              {appointment.status === 'confirmed' && (
                                <button
                                  onClick={() => handleStatusUpdate(appointment.id, 'completed')}
                                  className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded hover:bg-blue-200 transition-colors"
                                >
                                  Complete
                                </button>
                              )}
                              {(appointment.status === 'scheduled' || appointment.status === 'confirmed') && (
                                <button
                                  onClick={() => handleStatusUpdate(appointment.id, 'cancelled')}
                                  className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded hover:bg-red-200 transition-colors"
                                >
                                  Cancel
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-lg font-medium">No appointments found</p>
                    <p className="text-sm">Your appointments will appear here</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'patients' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Patient Management</h3>
                  <button className="bg-mentra-primary hover:bg-mentra-primary-hover text-white px-4 py-2 rounded-lg font-medium transition-colors">
                    Add Patient
                  </button>
                </div>
                <div className="text-center py-12 text-gray-500">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <p className="text-lg font-medium">Patient management coming soon</p>
                  <p className="text-sm">Manage your patient records and treatment plans</p>
                </div>
              </div>
            )}

            {activeTab === 'schedule' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Schedule Management</h3>
                <div className="text-center py-12 text-gray-500">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-lg font-medium">Schedule management coming soon</p>
                  <p className="text-sm">Set your availability and manage time slots</p>
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Practice Analytics</h3>
                <div className="text-center py-12 text-gray-500">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <p className="text-lg font-medium">Analytics dashboard coming soon</p>
                  <p className="text-sm">View insights about your practice performance</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Profile & Logout Section */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Recent Activity */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Session completed with Sarah Johnson</p>
                    <p className="text-xs text-gray-500">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">New appointment request from Michael Chen</p>
                    <p className="text-xs text-gray-500">4 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Profile updated successfully</p>
                    <p className="text-xs text-gray-500">1 day ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Profile Summary */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Summary</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-600">Name:</span>
                  <span className="ml-2 font-medium text-gray-900">{doctor.full_name}</span>
                </div>
                <div>
                  <span className="text-gray-600">Email:</span>
                  <span className="ml-2 font-medium text-gray-900">{doctor.email}</span>
                </div>
                <div>
                  <span className="text-gray-600">Specialization:</span>
                  <span className="ml-2 font-medium text-gray-900">{doctor.specialization}</span>
                </div>
                <div>
                  <span className="text-gray-600">Experience:</span>
                  <span className="ml-2 font-medium text-gray-900">{doctor.experience}</span>
                </div>
                <div>
                  <span className="text-gray-600">License:</span>
                  <span className="ml-2 font-medium text-gray-900">{doctor.license_number}</span>
                </div>
              </div>
              
              <button className="w-full mt-4 bg-mentra-secondary/30 hover:bg-mentra-secondary/50 text-mentra-primary font-medium py-2 px-4 rounded-lg transition-colors">
                Edit Profile
              </button>
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
    </div>
  );
};

export default DoctorDashboard;

