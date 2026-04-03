import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NotificationBanner from '../components/NotificationBanner';
import ScheduleManagement from '../components/ScheduleManagement';
import NotificationBell from '../components/NotificationBell';
import DashboardSidebar from '../components/DashboardSidebar';
import { buildApiUrl, API_ENDPOINTS } from '../config/api.js';

const DoctorDashboardNew = () => {
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
  const [activeSection, setActiveSection] = useState('overview');
  const [notification, setNotification] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedDoctor, setEditedDoctor] = useState({});
  const [saving, setSaving] = useState(false);
  const [photoTimestamp, setPhotoTimestamp] = useState(Date.now());
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [sessionNotes, setSessionNotes] = useState('');
  const [completingSession, setCompletingSession] = useState(false);
  const [patients, setPatients] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    const role = localStorage.getItem('userRole');

    if (!token || !userData || role !== 'doctor') {
      navigate('/login');
      return;
    }

    const doctorData = JSON.parse(userData);
    setDoctor(doctorData);
    fetchDashboardData(doctorData.id, token);
  }, [navigate]);

  const fetchDashboardData = async (doctorId, token) => {
    try {
      setLoading(true);
      
      // Fetch doctor profile
      const profileResponse = await fetch(
        buildApiUrl(API_ENDPOINTS.DOCTOR_PROFILE),
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        if (profileData.success) {
          setDoctor(profileData.doctor);
          setEditedDoctor(profileData.doctor); // Also update editedDoctor
          // Update localStorage with latest data
          localStorage.setItem('user', JSON.stringify(profileData.doctor));
        }
      }
      
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
        fetchDashboardData(doctor.id, token);
        setNotification({
          message: `Appointment status updated to ${newStatus}`,
          type: 'success'
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

  const handleCompleteSession = async () => {
    if (!selectedAppointment) return;
    
    try {
      setCompletingSession(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(
        `${buildApiUrl(API_ENDPOINTS.COMPLETE_SESSION)}/${selectedAppointment.id}/complete`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ sessionNotes })
        }
      );

      const data = await response.json();

      if (data.success) {
        setNotification({
          message: 'Session completed successfully!',
          type: 'success'
        });
        setSelectedAppointment(null);
        setSessionNotes('');
        fetchDashboardData(doctor.id, token);
      } else {
        setNotification({
          message: data.message || 'Failed to complete session',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Error completing session:', error);
      setNotification({
        message: 'Error completing session',
        type: 'error'
      });
    } finally {
      setCompletingSession(false);
    }
  };

  const fetchDoctorPatients = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        buildApiUrl(`${API_ENDPOINTS.DOCTOR_PATIENTS}/${doctor.id}/patients`),
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const data = await response.json();
      if (data.success) {
        setPatients(data.patients);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  useEffect(() => {
    if (doctor && activeSection === 'patients') {
      fetchDoctorPatients();
    }
  }, [doctor, activeSection]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    navigate('/');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedDoctor(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setNotification({
        message: 'Please upload an image file',
        type: 'error'
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setNotification({
        message: 'Image size should be less than 5MB',
        type: 'error'
      });
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('profilePhoto', file);

      const response = await fetch(buildApiUrl(API_ENDPOINTS.DOCTOR_PROFILE_PHOTO), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();
      if (data.success) {
        // Update timestamp to force image reload (cache busting)
        setPhotoTimestamp(Date.now());
        
        setNotification({
          message: 'Profile photo updated successfully!',
          type: 'success'
        });
        
        // Refresh doctor data to get the new photo URL
        await fetchDashboardData(doctor.id, token);
      } else {
        setNotification({
          message: data.message || 'Failed to upload photo',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      setNotification({
        message: 'Failed to upload photo',
        type: 'error'
      });
    }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem('token');
      
      // Prepare data - convert empty strings to null for numeric fields
      const profileData = {
        full_name: editedDoctor.full_name,
        email: editedDoctor.email,
        phone_number: editedDoctor.phone_number || null,
        specialization: editedDoctor.specialization,
        experience: editedDoctor.experience,
        hospital_name: editedDoctor.hospital_name,
        location: editedDoctor.location || null,
        initial_session_fee: editedDoctor.initial_session_fee || null,
        followup_session_fee: editedDoctor.followup_session_fee || null,
        bio: editedDoctor.bio || null,
        credentials: editedDoctor.credentials || null,
        availability_hours: editedDoctor.availability_hours || null
      };

      const response = await fetch(buildApiUrl('/api/doctors/profile/complete'), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData)
      });

      const data = await response.json();
      
      if (data.success) {
        // Update both doctor and editedDoctor states with the returned data
        setDoctor(data.doctor);
        setEditedDoctor(data.doctor);
        // Update localStorage
        localStorage.setItem('user', JSON.stringify(data.doctor));
        
        setNotification({
          message: 'Profile updated successfully!',
          type: 'success'
        });
        setIsEditing(false);
        
        // Refresh full dashboard data
        await fetchDashboardData(doctor.id, token);
      } else {
        setNotification({
          message: data.message || 'Failed to update profile',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      setNotification({
        message: 'Failed to update profile',
        type: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedDoctor({ ...doctor });
  };

  // Initialize editedDoctor when doctor data loads
  useEffect(() => {
    if (doctor) {
      setEditedDoctor({ ...doctor });
    }
  }, [doctor]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-orange-100 text-orange-800';
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

  const menuItems = [
    { 
      id: 'overview', 
      name: 'Overview', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    { 
      id: 'appointments', 
      name: 'Appointments', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    { 
      id: 'patients', 
      name: 'Patients', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )
    },
    { 
      id: 'schedule', 
      name: 'Schedule', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    { 
      id: 'profile', 
      name: 'Profile', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    },
    {
      id: 'reviews',
      name: 'My Reviews',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      )
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A3B18A] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!doctor) return null;

  return (
    <div className="flex h-screen bg-gray-100">
      {notification && (
        <NotificationBanner
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Sidebar */}
      <DashboardSidebar
        title="Mentra Doctor"
        subtitle="Healthcare Portal"
        userName={doctor.full_name}
        userSub={doctor.specialization}
        userPrefix="Dr."
        menuItems={menuItems}
        activeSection={activeSection}
        onNavigate={setActiveSection}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200 px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {menuItems.find(item => item.id === activeSection)?.name || 'Overview'}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <NotificationBell recipientType="doctor" recipientId={doctor?.id} onNavigate={setActiveSection} />
              <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-800">Dr. {doctor.full_name}</p>
                  <p className="text-xs text-gray-500">{doctor.email}</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-[#A3B18A] to-[#8FA076] rounded-full flex items-center justify-center text-white font-semibold shadow-md">
                  {doctor.full_name.charAt(0)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-8">
          {activeSection === 'overview' && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 font-medium mb-1">Today's Sessions</p>
                      <p className="text-3xl font-bold text-gray-800">{stats.todayAppointments}</p>
                      <p className="text-xs text-gray-400 mt-1">Scheduled today</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 font-medium mb-1">Active Patients</p>
                      <p className="text-3xl font-bold text-gray-800">{stats.totalPatients}</p>
                      <p className="text-xs text-gray-400 mt-1">Total patients</p>
                    </div>
                    <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 font-medium mb-1">Weekly Revenue</p>
                      <p className="text-3xl font-bold text-gray-800">${stats.weeklyRevenue}</p>
                      <p className="text-xs text-gray-400 mt-1">Last 7 days</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 font-medium mb-1">Completed Sessions</p>
                      <p className="text-3xl font-bold text-gray-800">{stats.completedSessions}</p>
                      <p className="text-xs text-gray-400 mt-1">All time</p>
                    </div>
                    <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Today's Schedule */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Today's Schedule</h3>
                  <button 
                    onClick={() => setActiveSection('appointments')}
                    className="text-sm text-[#A3B18A] hover:text-[#8FA076] font-medium"
                  >
                    View All
                  </button>
                </div>
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
                      <div key={appointment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-gradient-to-br from-[#A3B18A] to-[#8FA076] rounded-full flex items-center justify-center text-white font-semibold shadow-sm">
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
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <button className="p-4 border-2 border-[#DCE4D4] rounded-lg hover:bg-[#F5F5F0] hover:border-[#A3B18A] transition-all text-center group">
                    <div className="w-10 h-10 bg-[#DCE4D4] rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-[#A3B18A] transition-colors">
                      <svg className="w-6 h-6 text-[#A3B18A] group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-gray-900">Add Patient</p>
                  </button>
                  
                  <button 
                    onClick={() => setActiveSection('schedule')}
                    className="p-4 border-2 border-[#DCE4D4] rounded-lg hover:bg-[#F5F5F0] hover:border-[#A3B18A] transition-all text-center group"
                  >
                    <div className="w-10 h-10 bg-[#DCE4D4] rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-[#A3B18A] transition-colors">
                      <svg className="w-6 h-6 text-[#A3B18A] group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-gray-900">Schedule</p>
                  </button>
                  
                  <button className="p-4 border-2 border-[#DCE4D4] rounded-lg hover:bg-[#F5F5F0] hover:border-[#A3B18A] transition-all text-center group">
                    <div className="w-10 h-10 bg-[#DCE4D4] rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-[#A3B18A] transition-colors">
                      <svg className="w-6 h-6 text-[#A3B18A] group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-gray-900">Notes</p>
                  </button>
                  
                  <button 
                    onClick={() => setActiveSection('reviews')}
                    className="p-4 border-2 border-[#DCE4D4] rounded-lg hover:bg-[#F5F5F0] hover:border-[#A3B18A] transition-all text-center group"
                  >
                    <div className="w-10 h-10 bg-[#DCE4D4] rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-[#A3B18A] transition-colors">
                      <svg className="w-6 h-6 text-[#A3B18A] group-hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-gray-900">Reviews</p>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'appointments' && (
            <AppointmentsSection
              appointments={appointments}
              doctor={doctor}
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchDashboardData(doctor.id, localStorage.getItem('token')).finally(() => setRefreshing(false));
              }}
              onCompleteSession={(apt) => setSelectedAppointment(apt)}
              getStatusColor={getStatusColor}
              formatTime={formatTime}
            />
          )}

          {activeSection === 'patients' && (
            <PatientsSection
              patients={patients}
              doctorId={doctor?.id}
              onRefresh={fetchDoctorPatients}
            />
          )}

          {activeSection === 'schedule' && (
            <ScheduleManagement />
          )}

          {activeSection === 'reviews' && doctor && (
            <DoctorReviewsSection doctorId={doctor.id} />
          )}

          {activeSection === 'profile' && (
            <div className="space-y-6">
              {/* Profile Header Card */}
              <div className="bg-gradient-to-r from-[#A3B18A] to-[#8FA076] rounded-xl p-8 shadow-lg text-white">
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border-4 border-white/30 overflow-hidden">
                      {doctor.profile_photo ? (
                        <img 
                          src={`http://localhost:5002/${doctor.profile_photo}?t=${photoTimestamp}`} 
                          alt={doctor.full_name}
                          className="w-full h-full object-cover"
                          key={photoTimestamp}
                        />
                      ) : (
                        <span className="text-4xl font-bold text-white">
                          {doctor.full_name.charAt(0)}
                        </span>
                      )}
                    </div>
                    <label className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors shadow-lg">
                      <svg className="w-4 h-4 text-[#A3B18A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handlePhotoUpload}
                      />
                    </label>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold">Dr. {doctor.full_name}</h2>
                    <p className="text-white/90 mt-1">{doctor.specialization}</p>
                    <div className="flex items-center space-x-4 mt-3">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-white/20 backdrop-blur-sm">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Verified Professional
                      </span>
                      <span className="text-sm text-white/80">License: {doctor.license_number}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Editable Profile Form */}
              <form onSubmit={handleProfileSave} className="space-y-6">
                {/* Personal Information */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-[#A3B18A] to-[#8FA076] px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <h3 className="text-lg font-semibold text-white">Personal Information</h3>
                      </div>
                      {!isEditing && (
                        <button
                          type="button"
                          onClick={() => setIsEditing(true)}
                          className="px-4 py-2 bg-white text-[#A3B18A] rounded-lg text-sm font-medium hover:bg-white/90 transition-colors"
                        >
                          Edit
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                        <input
                          type="text"
                          name="full_name"
                          value={editedDoctor.full_name}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A3B18A] focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                        <input
                          type="email"
                          name="email"
                          value={editedDoctor.email}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A3B18A] focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                        <input
                          type="tel"
                          name="phone_number"
                          value={editedDoctor.phone_number || ''}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A3B18A] focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Professional Details */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-[#A3B18A] to-[#8FA076] px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <h3 className="text-lg font-semibold text-white">Professional Details</h3>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Specialization</label>
                        <input
                          type="text"
                          name="specialization"
                          value={editedDoctor.specialization}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A3B18A] focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Experience</label>
                        <input
                          type="text"
                          name="experience"
                          value={editedDoctor.experience}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A3B18A] focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">License Number</label>
                        <input
                          type="text"
                          value={doctor.license_number}
                          disabled
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                        />
                        <p className="text-xs text-gray-500 mt-1">License number cannot be changed</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Hospital & Location */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-[#A3B18A] to-[#8FA076] px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <h3 className="text-lg font-semibold text-white">Hospital & Location</h3>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Hospital Name</label>
                        <input
                          type="text"
                          name="hospital_name"
                          value={editedDoctor.hospital_name}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A3B18A] focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                        <input
                          type="text"
                          name="location"
                          value={editedDoctor.location || ''}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A3B18A] focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Session Fees */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-[#A3B18A] to-[#8FA076] px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                      <h3 className="text-lg font-semibold text-white">Session Fees</h3>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Initial Session Fee (Rs)</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500">Rs</span>
                          </div>
                          <input
                            type="number"
                            name="initial_session_fee"
                            value={editedDoctor.initial_session_fee || ''}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            placeholder="2500"
                            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A3B18A] focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">First-time consultation fee</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Follow-up Session Fee (Rs)</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500">Rs</span>
                          </div>
                          <input
                            type="number"
                            name="followup_session_fee"
                            value={editedDoctor.followup_session_fee || ''}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            placeholder="2200"
                            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A3B18A] focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Regular session fee</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Professional Bio */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-[#A3B18A] to-[#8FA076] px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <h3 className="text-lg font-semibold text-white">Professional Bio</h3>
                    </div>
                  </div>
                  <div className="p-6">
                    <textarea
                      name="bio"
                      value={editedDoctor.bio || ''}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      rows="6"
                      placeholder="Tell patients about your expertise, approach, and what makes you unique..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A3B18A] focus:border-transparent resize-none disabled:bg-gray-50 disabled:text-gray-600"
                    />
                    <p className="mt-2 text-sm text-gray-500 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      This will be displayed on your public profile
                    </p>
                  </div>
                </div>

                {/* Credentials */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-[#A3B18A] to-[#8FA076] px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                      <h3 className="text-lg font-semibold text-white">Credentials</h3>
                    </div>
                  </div>
                  <div className="p-6">
                    <textarea
                      name="credentials"
                      value={editedDoctor.credentials || ''}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      rows="4"
                      placeholder="PhD in Clinical Psychology, Licensed Psychologist, Board Certified..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A3B18A] focus:border-transparent resize-none disabled:bg-gray-50 disabled:text-gray-600"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                {isEditing && (
                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className={`px-8 py-3 rounded-lg text-white font-medium transition-colors ${
                        saving
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-[#A3B18A] hover:bg-[#8FA076]'
                      }`}
                    >
                      {saving ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Saving...
                        </span>
                      ) : (
                        'Save Changes'
                      )}
                    </button>
                  </div>
                )}
              </form>

              {/* Video Upload Section */}
              <DoctorVideoUpload doctorId={doctor?.id} />
            </div>
          )}
        </div>
      </div>

      {/* Complete Session Modal */}
      {selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900">Complete Session</h3>
                <button
                  onClick={() => {
                    setSelectedAppointment(null);
                    setSessionNotes('');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Patient Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Patient Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Name:</span>
                    <span className="ml-2 font-medium">{selectedAppointment.patient_first_name} {selectedAppointment.patient_last_name}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Date:</span>
                    <span className="ml-2 font-medium">{new Date(selectedAppointment.appointment_date).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Time:</span>
                    <span className="ml-2 font-medium">{formatTime(selectedAppointment.appointment_time)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Type:</span>
                    <span className="ml-2 font-medium">{selectedAppointment.appointment_type}</span>
                  </div>
                </div>
                {selectedAppointment.reason_for_visit && (
                  <div className="mt-3">
                    <span className="text-gray-600 text-sm">Reason for Visit:</span>
                    <p className="text-sm text-gray-800 mt-1">{selectedAppointment.reason_for_visit}</p>
                  </div>
                )}
              </div>

              {/* Session Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Session Notes <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={sessionNotes}
                  onChange={(e) => setSessionNotes(e.target.value)}
                  rows={8}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A3B18A] focus:border-transparent resize-none"
                  placeholder="Enter session notes, observations, treatment plan, recommendations, etc..."
                  required
                />
                <p className="text-xs text-gray-500 mt-2">
                  These notes will be visible to the patient after the session is completed.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setSelectedAppointment(null);
                    setSessionNotes('');
                  }}
                  disabled={completingSession}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCompleteSession}
                  disabled={completingSession || !sessionNotes.trim()}
                  className="px-6 py-2 bg-[#A3B18A] hover:bg-[#8FA076] text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {completingSession ? 'Completing...' : 'Complete Session'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboardNew;

const DoctorVideoUpload = ({ doctorId }) => {
  const [videos, setVideos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchVideos = async () => {
    try {
      const res = await fetch(buildApiUrl(`/api/doctors/${doctorId}/videos`));
      const data = await res.json();
      if (data.success) setVideos(data.videos);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { if (doctorId) fetchVideos(); }, [doctorId]);

  const showMsg = (type, msg) => {
    if (type === 'error') setError(msg); else setSuccess(msg);
    setTimeout(() => { setError(''); setSuccess(''); }, 4000);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!videoFile || !title.trim()) return;
    setUploading(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('video', videoFile);
      formData.append('title', title.trim());
      formData.append('description', description);

      const res = await fetch(buildApiUrl('/api/doctors/videos'), {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setTitle(''); setDescription(''); setVideoFile(null);
        e.target.reset();
        fetchVideos();
        showMsg('success', 'Video uploaded successfully!');
      } else {
        showMsg('error', data.message || 'Upload failed');
      }
    } catch (err) {
      showMsg('error', 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (videoId) => {
    if (!window.confirm('Delete this video?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(buildApiUrl(`/api/doctors/videos/${videoId}`), {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) { fetchVideos(); showMsg('success', 'Video deleted.'); }
      else showMsg('error', data.message || 'Delete failed');
    } catch (e) { showMsg('error', 'Delete failed.'); }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-[#A3B18A] to-[#8FA076] px-6 py-4">
        <div className="flex items-center space-x-3">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <h3 className="text-lg font-semibold text-white">Educational Videos</h3>
        </div>
        <p className="text-white/70 text-sm mt-1">Upload videos explaining symptoms and solutions for patients</p>
      </div>

      <div className="p-6 space-y-6">
        {/* Feedback */}
        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}
        {success && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">{success}</div>}

        {/* Upload Form */}
        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Video Title <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Understanding Anxiety Symptoms"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#A3B18A] focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={2}
              placeholder="Brief description of what this video covers..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#A3B18A] focus:border-transparent resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Video File <span className="text-red-500">*</span></label>
            <input
              type="file"
              accept="video/mp4,video/mov,video/avi,video/webm,video/mkv"
              onChange={e => setVideoFile(e.target.files[0])}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:bg-[#DCE4D4] file:text-[#A3B18A] file:font-medium hover:file:bg-[#A3B18A] hover:file:text-white"
              required
            />
            <p className="text-xs text-gray-400 mt-1">MP4, MOV, AVI, WebM â€” max 100MB</p>
          </div>
          <button
            type="submit"
            disabled={uploading || !title.trim() || !videoFile}
            className="w-full py-2.5 bg-[#A3B18A] hover:bg-[#8FA076] text-white rounded-lg font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {uploading ? (
              <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Uploading...</>
            ) : (
              <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg> Upload Video</>
            )}
          </button>
        </form>

        {/* Uploaded Videos */}
        {videos.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Uploaded Videos ({videos.length})</h4>
            <div className="space-y-3">
              {videos.map(v => (
                <div key={v.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">{v.title}</p>
                      {v.description && <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{v.description}</p>}
                      <p className="text-xs text-gray-400 mt-1">{new Date(v.created_at).toLocaleDateString()}</p>
                    </div>
                    <button
                      onClick={() => handleDelete(v.id)}
                      className="text-red-500 hover:text-red-700 p-1 flex-shrink-0"
                      title="Delete video"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  <video
                    src={`http://localhost:5002/${v.video_path}`}
                    controls
                    className="w-full mt-3 rounded-lg max-h-48 bg-black"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const DoctorReviewsSection = ({ doctorId }) => {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ total_reviews: 0, avg_rating: null });
  const [loading, setLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch(buildApiUrl(`${API_ENDPOINTS.DOCTOR_REVIEWS}/${doctorId}`));
        const data = await res.json();
        if (data.success) {
          setReviews(data.reviews);
          setStats(data.stats);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [doctorId]);

  const renderStars = (rating, size = 'text-base') => (
    <span className={`text-yellow-400 ${size}`}>
      {'â˜…'.repeat(rating)}{'â˜†'.repeat(5 - rating)}
    </span>
  );

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-center">
          <p className="text-3xl font-bold text-gray-800">{stats.total_reviews || 0}</p>
          <p className="text-sm text-gray-500 mt-1">Total Reviews</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-center">
          <p className="text-3xl font-bold text-yellow-500">{stats.avg_rating || 'â€”'}</p>
          <p className="text-sm text-gray-500 mt-1">Average Rating</p>
          {stats.avg_rating && <p className="text-yellow-400 text-lg mt-1">{'â˜…'.repeat(Math.round(stats.avg_rating))}</p>}
        </div>
      </div>

      {/* Reviews List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">Patient Reviews (Approved)</h3>
          <p className="text-xs text-gray-400 mt-1">Click a review to see full details</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#A3B18A] mx-auto"></div>
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <svg className="w-12 h-12 mx-auto mb-3 text-gray-200" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            <p className="text-sm">No approved reviews yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {reviews.map((review) => (
              <div
                key={review.id}
                onClick={() => setSelectedReview(review)}
                className="px-6 py-4 cursor-pointer hover:bg-[#F5F5F0] transition-colors group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#A3B18A] to-[#8FA076] rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {review.patient_first_name?.charAt(0)}{review.patient_last_name?.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">
                        {review.patient_first_name} {review.patient_last_name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(review.appointment_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      {renderStars(review.rating)}
                      <p className="text-xs text-gray-400 mt-0.5">{review.rating}/5</p>
                    </div>
                    <svg className="w-4 h-4 text-gray-300 group-hover:text-[#A3B18A] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
                {review.review_text && (
                  <p className="mt-2 text-sm text-gray-600 line-clamp-1 ml-13">{review.review_text}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedReview && (
        <ReviewDetailModal review={selectedReview} onClose={() => setSelectedReview(null)} />
      )}
    </div>
  );
};

const PatientsSection = ({ patients, doctorId, onRefresh }) => {
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [cancelled, setCancelled] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);

  const fetchPatientHistory = async (patient) => {
    setSelectedPatient(patient);
    setLoadingSessions(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(
        buildApiUrl(`/api/appointments/doctor/${doctorId}/patient/${patient.patient_id}/history`),
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      const data = await res.json();
      if (data.success) {
        setSessions(data.sessions);
        setUpcoming(data.upcoming || []);
        setCancelled(data.cancelled || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingSessions(false);
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
  const formatTime = (t) => {
    if (!t) return '';
    const [h, m] = t.split(':');
    const hour = parseInt(h);
    return `${hour % 12 || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-800">
          My Patients
          <span className="ml-2 text-sm font-normal text-gray-400">({patients.length})</span>
        </h3>
        <button
          onClick={onRefresh}
          className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {patients.length > 0 ? (
        <div className="grid gap-3">
          {patients.map((patient) => (
            <div
              key={patient.patient_id}
              onClick={() => fetchPatientHistory(patient)}
              className="border border-gray-200 rounded-xl p-4 hover:shadow-md hover:border-[#A3B18A] transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#A3B18A] to-[#8FA076] rounded-full flex items-center justify-center text-white font-semibold shadow-sm">
                    {patient.patient_first_name.charAt(0)}{patient.patient_last_name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{patient.patient_first_name} {patient.patient_last_name}</h4>
                    <p className="text-sm text-gray-600">{patient.patient_email}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{patient.patient_phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    {patient.last_visit && (
                      <p className="text-sm text-gray-600">Last Visit: <span className="font-medium">{new Date(patient.last_visit).toLocaleDateString()}</span></p>
                    )}
                    <div className="flex items-center gap-2 justify-end mt-0.5">
                      <p className="text-sm font-medium text-[#A3B18A]">{patient.total_sessions} completed</p>
                      {parseInt(patient.upcoming_count) > 0 && (
                        <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-medium">
                          {patient.upcoming_count} upcoming
                        </span>
                      )}
                    </div>
                  </div>
                  <svg className="w-4 h-4 text-gray-300 group-hover:text-[#A3B18A] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p className="text-lg font-medium">No patients yet</p>
          <p className="text-sm mt-2">Patients will appear here after you complete sessions with them</p>
        </div>
      )}

      {/* Patient History Modal */}
      {selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 sticky top-0 bg-white">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-gradient-to-br from-[#A3B18A] to-[#8FA076] rounded-full flex items-center justify-center text-white font-bold">
                  {selectedPatient.patient_first_name.charAt(0)}{selectedPatient.patient_last_name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{selectedPatient.patient_first_name} {selectedPatient.patient_last_name}</h3>
                  <p className="text-xs text-gray-500">{selectedPatient.patient_email} â€¢ {selectedPatient.patient_phone}</p>
                </div>
              </div>
              <button onClick={() => { setSelectedPatient(null); setSessions([]); setUpcoming([]); setCancelled([]); }} className="text-gray-400 hover:text-gray-600 p-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-6 py-5">
              {/* Summary */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-[#F5F5F0] rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-[#A3B18A]">{loadingSessions ? '...' : sessions.length}</p>
                  <p className="text-xs text-gray-500 mt-1">Completed</p>
                </div>
                <div className="bg-green-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-green-600">{loadingSessions ? '...' : upcoming.length}</p>
                  <p className="text-xs text-gray-500 mt-1">Upcoming</p>
                </div>
                <div className="bg-[#F5F5F0] rounded-xl p-4 text-center">
                  <p className="text-sm font-semibold text-gray-800">
                    {selectedPatient.last_visit
                      ? new Date(selectedPatient.last_visit).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                      : 'â€”'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Last Visit</p>
                </div>
              </div>

              {/* Upcoming Sessions */}
              {!loadingSessions && upcoming.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Upcoming Sessions ({upcoming.length})
                  </h4>
                  <div className="space-y-2">
                    {upcoming.map((apt) => (
                      <div key={apt.id} className="border border-green-200 bg-green-50 rounded-xl px-4 py-3 flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{formatDate(apt.appointment_date)}</p>
                          <p className="text-xs text-gray-500">{formatTime(apt.appointment_time)} â€¢ {apt.duration_minutes} min â€¢ <span className="capitalize">{apt.appointment_type}</span></p>
                          {apt.reason_for_visit && <p className="text-xs text-gray-500 mt-0.5">{apt.reason_for_visit}</p>}
                        </div>
                        <div className="text-right">
                          <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">{apt.status}</span>
                          <p className="text-sm font-semibold text-[#A3B18A] mt-1">Rs {apt.session_fee}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Session History */}
              <h4 className="font-semibold text-gray-800 mb-4">Session History</h4>

              {loadingSessions ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#A3B18A] mx-auto"></div>
                </div>
              ) : sessions.length === 0 ? (
                <p className="text-center text-gray-400 py-8">No completed sessions found</p>
              ) : (
                <div className="space-y-4">
                  {sessions.map((session, idx) => (
                    <div key={session.id} className="border border-gray-200 rounded-xl overflow-hidden">
                      {/* Session header â€” numbered newest first */}
                      <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 bg-[#A3B18A] rounded-full flex items-center justify-center text-white text-xs font-bold">{idx + 1}</span>
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">{formatDate(session.appointment_date)}</p>
                            <p className="text-xs text-gray-500">{formatTime(session.appointment_time)} â€¢ {session.duration_minutes} min â€¢ <span className="capitalize">{session.appointment_type}</span></p>
                          </div>
                        </div>
                        <span className="text-sm font-semibold text-[#A3B18A]">Rs {session.session_fee}</span>
                      </div>
                      <div className="px-4 py-3 space-y-3">
                        {session.reason_for_visit && (
                          <div>
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Reason for Visit</p>
                            <p className="text-sm text-gray-700 mt-1">{session.reason_for_visit}</p>
                          </div>
                        )}
                        {session.session_notes && (
                          <div>
                            <p className="text-xs font-semibold text-[#A3B18A] uppercase tracking-wide">Doctor's Notes</p>
                            <p className="text-sm text-gray-700 mt-1 bg-[#F5F5F0] rounded-lg p-3 whitespace-pre-wrap">{session.session_notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Cancelled Appointments */}
              {!loadingSessions && cancelled.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                    Cancelled Appointments ({cancelled.length})
                  </h4>
                  <div className="space-y-2">
                    {cancelled.map((apt) => (
                      <div key={apt.id} className="border border-red-100 bg-red-50 rounded-xl px-4 py-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-gray-700 text-sm">{formatDate(apt.appointment_date)}</p>
                            <p className="text-xs text-gray-500">{formatTime(apt.appointment_time)} â€¢ {apt.duration_minutes} min â€¢ <span className="capitalize">{apt.appointment_type}</span></p>
                            {apt.reason_for_visit && <p className="text-xs text-gray-400 mt-0.5">{apt.reason_for_visit}</p>}
                          </div>
                          <div className="text-right">
                            <span className="text-xs px-2 py-1 bg-red-100 text-red-600 rounded-full font-medium">Cancelled</span>
                            <p className="text-sm font-medium text-gray-500 mt-1">Rs {apt.session_fee}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-100">
              <button
                onClick={() => { setSelectedPatient(null); setSessions([]); setUpcoming([]); setCancelled([]); }}
                className="w-full py-2.5 bg-[#A3B18A] hover:bg-[#8FA076] text-white rounded-xl font-medium text-sm transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const AppointmentsSection = ({ appointments, doctor, refreshing, onRefresh, onCompleteSession, getStatusColor, formatTime }) => {
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedDetail, setSelectedDetail] = useState(null);

  const handleConfirmAppointment = async (appointmentId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(buildApiUrl(`/api/appointments/${appointmentId}/confirm`), {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (data.success) { onRefresh(); }
      else alert(data.message || 'Failed to confirm');
    } catch (e) { alert('Failed to confirm appointment'); }
  };

  const handleCancelAppointment = async (appointmentId) => {
    if (!window.confirm('Cancel this appointment?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(buildApiUrl(`/api/appointments/${appointmentId}`), {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) { onRefresh(); }
      else alert(data.message || 'Failed to cancel');
    } catch (e) { alert('Failed to cancel appointment'); }
  };

  // Sort newest first, then filter
  const filtered = [...appointments]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .filter(apt => statusFilter === 'all' || apt.status === statusFilter);

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-800">
            All Appointments
            <span className="ml-2 text-sm font-normal text-gray-400">({filtered.length})</span>
          </h3>
          <div className="flex space-x-2">
            <button
              onClick={onRefresh}
              disabled={refreshing}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              <svg className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#A3B18A] focus:border-transparent bg-white"
            >
              <option value="all">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* List */}
        {filtered.length > 0 ? (
          <div className="space-y-3">
            {filtered.map((appointment) => (
              <div
                key={appointment.id}
                onClick={() => setSelectedDetail(appointment)}
                className="border border-gray-200 rounded-xl p-4 hover:shadow-md hover:border-[#A3B18A] transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#A3B18A] to-[#8FA076] rounded-full flex items-center justify-center text-white font-semibold shadow-sm flex-shrink-0">
                      {appointment.patient_first_name.charAt(0)}{appointment.patient_last_name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {appointment.patient_first_name} {appointment.patient_last_name}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {formatDate(appointment.appointment_date)} â€¢ {formatTime(appointment.appointment_time)} â€¢ {appointment.duration_minutes} min
                      </p>
                      {appointment.reason_for_visit && (
                        <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{appointment.reason_for_visit}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-0.5">
                        {appointment.patient_email} â€¢ {appointment.patient_phone}
                      </p>
                    </div>
                  </div>
                  <div className="text-right space-y-2 flex-shrink-0">
                    <div className="flex items-center space-x-2 justify-end">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                        {appointment.status}
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        Rs {appointment.session_fee || 0}
                      </span>
                    </div>
                    <div className="flex space-x-1 justify-end">
                      {appointment.status === 'pending' && (
                        <>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleConfirmAppointment(appointment.id); }}
                            className="px-3 py-1.5 bg-green-100 text-green-700 text-xs rounded-md hover:bg-green-200 transition-colors font-medium"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleCancelAppointment(appointment.id); }}
                            className="px-3 py-1.5 bg-red-100 text-red-700 text-xs rounded-md hover:bg-red-200 transition-colors font-medium"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                      {(appointment.status === 'confirmed' || appointment.status === 'scheduled') && (
                        <button
                          onClick={(e) => { e.stopPropagation(); onCompleteSession(appointment); }}
                          className="px-3 py-1.5 bg-blue-100 text-blue-700 text-xs rounded-md hover:bg-blue-200 transition-colors font-medium"
                        >
                          Complete Session
                        </button>
                      )}
                      <svg className="w-4 h-4 text-gray-300 group-hover:text-[#A3B18A] transition-colors self-center" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
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
            <p className="text-sm mt-1">
              {statusFilter !== 'all' ? `No ${statusFilter} appointments` : 'Your appointments will appear here'}
            </p>
          </div>
        )}
      </div>

      {/* Appointment Detail Modal */}
      {selectedDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 sticky top-0 bg-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#A3B18A] to-[#8FA076] rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {selectedDetail.patient_first_name.charAt(0)}{selectedDetail.patient_last_name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{selectedDetail.patient_first_name} {selectedDetail.patient_last_name}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(selectedDetail.status)}`}>
                    {selectedDetail.status}
                  </span>
                </div>
              </div>
              <button onClick={() => setSelectedDetail(null)} className="text-gray-400 hover:text-gray-600 p-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-6 py-5 space-y-5">
              {/* Appointment Info */}
              <div className="bg-[#F5F5F0] rounded-xl p-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Appointment Details</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-gray-500">Date:</span> <span className="font-medium ml-1">{formatDate(selectedDetail.appointment_date)}</span></div>
                  <div><span className="text-gray-500">Time:</span> <span className="font-medium ml-1">{formatTime(selectedDetail.appointment_time)}</span></div>
                  <div><span className="text-gray-500">Duration:</span> <span className="font-medium ml-1">{selectedDetail.duration_minutes} min</span></div>
                  <div><span className="text-gray-500">Type:</span> <span className="font-medium ml-1 capitalize">{selectedDetail.appointment_type}</span></div>
                  <div><span className="text-gray-500">Fee:</span> <span className="font-semibold text-[#A3B18A] ml-1">Rs {selectedDetail.session_fee}</span></div>
                  <div><span className="text-gray-500">Confirmation:</span> <span className="font-medium ml-1 text-xs">{selectedDetail.confirmation_number}</span></div>
                </div>
              </div>

              {/* Patient Contact */}
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Patient Contact</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-gray-500">Email:</span> <span className="font-medium ml-1">{selectedDetail.patient_email}</span></div>
                  <div><span className="text-gray-500">Phone:</span> <span className="font-medium ml-1">{selectedDetail.patient_phone}</span></div>
                  {selectedDetail.patient_date_of_birth && (
                    <div><span className="text-gray-500">Date of Birth:</span> <span className="font-medium ml-1">{new Date(selectedDetail.patient_date_of_birth).toLocaleDateString()}</span></div>
                  )}
                  {selectedDetail.emergency_contact_name && (
                    <div><span className="text-gray-500">Emergency Contact:</span> <span className="font-medium ml-1">{selectedDetail.emergency_contact_name}</span></div>
                  )}
                  {selectedDetail.emergency_contact_phone && (
                    <div><span className="text-gray-500">Emergency Phone:</span> <span className="font-medium ml-1">{selectedDetail.emergency_contact_phone}</span></div>
                  )}
                </div>
              </div>

              {/* Session Details */}
              <div className="space-y-3">
                {selectedDetail.reason_for_visit && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Reason for Visit</p>
                    <p className="text-sm text-gray-700 bg-white border border-gray-100 rounded-lg p-3">{selectedDetail.reason_for_visit}</p>
                  </div>
                )}
                {selectedDetail.previous_therapy && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Previous Therapy</p>
                    <p className="text-sm text-gray-700 bg-white border border-gray-100 rounded-lg p-3">{selectedDetail.previous_therapy}</p>
                  </div>
                )}
                {selectedDetail.current_medications && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Current Medications</p>
                    <p className="text-sm text-gray-700 bg-white border border-gray-100 rounded-lg p-3">{selectedDetail.current_medications}</p>
                  </div>
                )}
                {selectedDetail.special_requests && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Special Requests</p>
                    <p className="text-sm text-gray-700 bg-white border border-gray-100 rounded-lg p-3">{selectedDetail.special_requests}</p>
                  </div>
                )}
                {selectedDetail.session_notes && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Session Notes</p>
                    <p className="text-sm text-gray-700 bg-blue-50 border border-blue-100 rounded-lg p-3">{selectedDetail.session_notes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
              {selectedDetail.status === 'pending' && (
                <>
                  <button
                    onClick={() => { handleConfirmAppointment(selectedDetail.id); setSelectedDetail(null); }}
                    className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium text-sm transition-colors"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => { handleCancelAppointment(selectedDetail.id); setSelectedDetail(null); }}
                    className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium text-sm transition-colors"
                  >
                    Cancel
                  </button>
                </>
              )}
              {(selectedDetail.status === 'confirmed' || selectedDetail.status === 'scheduled') && (
                <button
                  onClick={() => { onCompleteSession(selectedDetail); setSelectedDetail(null); }}
                  className="flex-1 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium text-sm transition-colors"
                >
                  Complete Session
                </button>
              )}
              <button
                onClick={() => setSelectedDetail(null)}
                className="flex-1 py-2.5 bg-[#A3B18A] hover:bg-[#8FA076] text-white rounded-xl font-medium text-sm transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ReviewDetailModal = ({ review, onClose }) => {
  const renderStars = (rating, size = 'text-xl') => rating ? (
    <span className={`text-yellow-400 ${size}`}>
      {'â˜…'.repeat(rating)}{'â˜†'.repeat(5 - rating)}
    </span>
  ) : <span className="text-gray-300 text-xl">{'â˜†'.repeat(5)}</span>;

  const ratingLabel = { 1: 'Poor', 2: 'Fair', 3: 'Good', 4: 'Very Good', 5: 'Excellent' };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">Review Details</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Patient info */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#A3B18A] to-[#8FA076] rounded-full flex items-center justify-center text-white font-bold">
              {review.patient_first_name?.charAt(0)}{review.patient_last_name?.charAt(0)}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{review.patient_first_name} {review.patient_last_name}</p>
              <p className="text-xs text-gray-400">
                {new Date(review.appointment_date || review.created_at).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Overall Rating */}
          <div className="bg-[#F5F5F0] rounded-xl p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Overall Rating</p>
            <div className="flex items-center gap-3">
              {renderStars(review.rating, 'text-2xl')}
              <span className="text-lg font-bold text-gray-800">{review.rating}/5</span>
              <span className="text-sm text-[#A3B18A] font-medium">{ratingLabel[review.rating]}</span>
            </div>
          </div>

          {/* Detailed Ratings â€” always show */}
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Detailed Ratings</p>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Professionalism', value: review.rating_professionalism },
                { label: 'Communication', value: review.rating_communication },
                { label: 'Wait Time', value: review.rating_wait_time },
              ].map(({ label, value }) => (
                <div key={label} className="text-center">
                  <p className="text-xs text-gray-500 mb-1">{label}</p>
                  {value ? (
                    <>
                      <p className="text-yellow-400 text-lg leading-none">{'â˜…'.repeat(value)}{'â˜†'.repeat(5 - value)}</p>
                      <p className="text-xs text-gray-500 mt-1">{value}/5</p>
                    </>
                  ) : (
                    <p className="text-xs text-gray-400 mt-2">Not rated</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Written review */}
          {review.review_text && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Written Review</p>
              <p className="text-sm text-gray-700 leading-relaxed bg-white border border-gray-100 rounded-xl p-4">{review.review_text}</p>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-[#A3B18A] hover:bg-[#8FA076] text-white rounded-xl font-medium text-sm transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};


