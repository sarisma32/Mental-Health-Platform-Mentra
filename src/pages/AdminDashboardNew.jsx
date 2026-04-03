import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { buildApiUrl } from '../config/api.js';
import NotificationBell from '../components/NotificationBell';
import DashboardSidebar from '../components/DashboardSidebar';
import DashboardHeader from '../components/DashboardHeader';

const AdminDashboardNew = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDoctors: 0,
    pendingDoctors: 0,
    totalAppointments: 0,
    pendingReviews: 0
  });
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [patientSearchTerm, setPatientSearchTerm] = useState('');
  const [userFilter, setUserFilter] = useState('all');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);

  useEffect(() => {
    // Check if user is admin
    const role = localStorage.getItem('userRole');
    if (role !== 'admin') {
      navigate('/admin-login');
      return;
    }
    
    fetchDashboardStats();
    fetchDoctors();
    fetchPatients();
  }, [navigate]);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('token');

      // Fetch doctor/patient stats
      const statsRes = await fetch(buildApiUrl('/api/admin/stats'), {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });

      // Fetch appointments count
      const aptsRes = await fetch(buildApiUrl('/api/admin/appointments'), {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });

      // Fetch pending reviews count
      const reviewsRes = await fetch(buildApiUrl('/api/reviews/admin/all'));

      const [statsData, aptsData, reviewsData] = await Promise.all([
        statsRes.json(), aptsRes.json(), reviewsRes.json()
      ]);

      setStats({
        totalUsers: statsData.stats?.patients?.total_patients || 0,
        totalDoctors: parseInt(statsData.stats?.doctors?.total_doctors) || 0,
        pendingDoctors: parseInt(statsData.stats?.doctors?.pending_doctors) || 0,
        totalAppointments: aptsData.success ? aptsData.appointments.length : 0,
        pendingReviews: reviewsData.success
          ? reviewsData.reviews.filter(r => !r.is_visible).length
          : 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(buildApiUrl('/api/admin/doctors'), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setDoctors(data.doctors || []);
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };

  const fetchPatients = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(buildApiUrl('/api/admin/users'), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPatients(data.patients || []);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const updateDoctorStatus = async (doctorId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(buildApiUrl(`/api/admin/doctors/${doctorId}/status`), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        fetchDoctors();
        fetchDashboardStats();
      }
    } catch (error) {
      console.error('Error updating doctor status:', error);
    }
  };

  const updatePatientStatus = async (patientId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(buildApiUrl(`/api/admin/users/${patientId}/status`), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        fetchPatients();
      }
    } catch (error) {
      console.error('Error updating patient status:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    navigate('/admin-login');
  };

  const menuItems = [
    { 
      id: 'dashboard', 
      name: 'Dashboard', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    { 
      id: 'users', 
      name: 'Users', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )
    },
    { 
      id: 'doctors', 
      name: 'Doctors', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
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
      id: 'specializations',
      name: 'Specializations',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      )
    },
    {
      id: 'reviews',
      name: 'Reviews',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      )
    },
    {
      id: 'analytics',
      name: 'Analytics',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    { 
      id: 'settings', 
      name: 'Settings', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    }
  ];

  const filteredDoctors = doctors.filter(doctor => {
    const matchesFilter = filter === 'all' || doctor.approval_status === filter;
    const matchesSearch = doctor.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.full_name.toLowerCase().includes(patientSearchTerm.toLowerCase()) ||
                         patient.email.toLowerCase().includes(patientSearchTerm.toLowerCase()) ||
                         (patient.phone_number && patient.phone_number.includes(patientSearchTerm));
    const matchesFilter = userFilter === 'all' || patient.status === userFilter;
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status) => {
    const statusStyles = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      approved: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${statusStyles[status] || statusStyles.pending}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {/* Sidebar */}
      <DashboardSidebar
        title="Mentra Admin"
        subtitle="Healthcare Management"
        userName="Admin User"
        userSub="admin@mentra.com"
        menuItems={menuItems}
        activeSection={activeSection}
        onNavigate={setActiveSection}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <DashboardHeader
          sectionTitle={menuItems.find(item => item.id === activeSection)?.name || 'Dashboard'}
          userName="Admin User"
          userEmail="admin@mentra.com"
          notifType="admin"
          notifId="all"
          onNotifNavigate={setActiveSection}
        />

        {/* Content Area */}
        <div className="p-8">
          {activeSection === 'dashboard' && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 font-medium mb-1">Total Users</p>
                      <p className="text-3xl font-bold text-gray-800">{stats.totalUsers}</p>
                      <p className="text-xs text-gray-400 mt-1">Registered patients</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM9 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 font-medium mb-1">Total Doctors</p>
                      <p className="text-3xl font-bold text-gray-800">{stats.totalDoctors}</p>
                      <p className="text-xs text-gray-400 mt-1">Healthcare providers</p>
                    </div>
                    <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 font-medium mb-1">Pending Reviews</p>
                      <p className="text-3xl font-bold text-gray-800">{stats.pendingReviews}</p>
                      <p className="text-xs text-gray-400 mt-1">Awaiting approval</p>
                    </div>
                    <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 font-medium mb-1">Appointments</p>
                      <p className="text-3xl font-bold text-gray-800">{stats.totalAppointments}</p>
                      <p className="text-xs text-gray-400 mt-1">Total bookings</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => setActiveSection('doctors')}
                    className="p-4 border-2 border-[#DCE4D4] rounded-lg hover:bg-[#F5F5F0] hover:border-[#A3B18A] transition-all text-left group"
                  >
                    <div className="w-10 h-10 bg-[#DCE4D4] rounded-lg flex items-center justify-center mb-3 group-hover:bg-[#A3B18A] transition-colors">
                      <svg className="w-6 h-6 text-[#A3B18A] group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h4 className="font-semibold text-gray-800">Review Doctors</h4>
                    <p className="text-sm text-gray-500 mt-1">Approve pending applications</p>
                  </button>

                  <button
                    onClick={() => setActiveSection('users')}
                    className="p-4 border-2 border-[#DCE4D4] rounded-lg hover:bg-[#F5F5F0] hover:border-[#A3B18A] transition-all text-left group"
                  >
                    <div className="w-10 h-10 bg-[#DCE4D4] rounded-lg flex items-center justify-center mb-3 group-hover:bg-[#A3B18A] transition-colors">
                      <svg className="w-6 h-6 text-[#A3B18A] group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <h4 className="font-semibold text-gray-800">Manage Users</h4>
                    <p className="text-sm text-gray-500 mt-1">View patient accounts</p>
                  </button>

                  <button
                    onClick={() => setActiveSection('appointments')}
                    className="p-4 border-2 border-[#DCE4D4] rounded-lg hover:bg-[#F5F5F0] hover:border-[#A3B18A] transition-all text-left group"
                  >
                    <div className="w-10 h-10 bg-[#DCE4D4] rounded-lg flex items-center justify-center mb-3 group-hover:bg-[#A3B18A] transition-colors">
                      <svg className="w-6 h-6 text-[#A3B18A] group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h4 className="font-semibold text-gray-800">Appointments</h4>
                    <p className="text-sm text-gray-500 mt-1">Monitor bookings</p>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'doctors' && (
            <div className="space-y-6">
              {/* Stats Cards for Doctors Section */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 font-medium mb-1">Total Doctors</p>
                      <p className="text-3xl font-bold text-gray-800">{doctors.length}</p>
                      <p className="text-xs text-gray-400 mt-1">All registrations</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM9 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 font-medium mb-1">Pending Approval</p>
                      <p className="text-3xl font-bold text-gray-800">
                        {doctors.filter(d => d.approval_status === 'pending').length}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">Awaiting review</p>
                    </div>
                    <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 font-medium mb-1">Approved Doctors</p>
                      <p className="text-3xl font-bold text-gray-800">
                        {doctors.filter(d => d.approval_status === 'approved').length}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">Active providers</p>
                    </div>
                    <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 font-medium mb-1">Rejected Doctors</p>
                      <p className="text-3xl font-bold text-gray-800">
                        {doctors.filter(d => d.approval_status === 'rejected').length}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">Declined applications</p>
                    </div>
                    <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Filters and Search */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                      Search Doctors
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        id="search"
                        placeholder="Search by name, email, or specialization..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A3B18A] focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="filter" className="block text-sm font-medium text-gray-700 mb-2">
                      Filter by Status
                    </label>
                    <select
                      id="filter"
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A3B18A] focus:border-transparent"
                    >
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Doctors Table */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <h3 className="text-lg font-semibold text-gray-800">Doctor Applications</h3>
                  <p className="text-sm text-gray-500 mt-1">Click a doctor to view full registration details</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Doctor</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Specialization</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Hospital</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Registered</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredDoctors.map((doctor) => (
                        <tr key={doctor.id} onClick={() => setSelectedDoctor(doctor)}
                          className="hover:bg-[#F5F5F0] transition-colors cursor-pointer group">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#A3B18A] to-[#8FA076] flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
                                {doctor.full_name.charAt(0)}
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-gray-900">{doctor.full_name}</p>
                                <p className="text-xs text-gray-400">{doctor.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm text-gray-700">{doctor.specialization}</p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm text-gray-700">{doctor.hospital_name}</p>
                            <p className="text-xs text-gray-400">{doctor.location || 'â€”'}</p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm text-gray-500">{new Date(doctor.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                          </td>
                          <td className="px-6 py-4">
                            {getStatusBadge(doctor.approval_status)}
                          </td>
                          <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                            <div className="flex gap-2">
                              {doctor.approval_status === 'pending' && (
                                <>
                                  <button onClick={() => updateDoctorStatus(doctor.id, 'approved')}
                                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs transition-colors">Approve</button>
                                  <button onClick={() => updateDoctorStatus(doctor.id, 'rejected')}
                                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs transition-colors">Reject</button>
                                </>
                              )}
                              {doctor.approval_status === 'approved' && (
                                <button onClick={() => updateDoctorStatus(doctor.id, 'rejected')}
                                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs transition-colors">Revoke</button>
                              )}
                              {doctor.approval_status === 'rejected' && (
                                <button onClick={() => updateDoctorStatus(doctor.id, 'approved')}
                                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs transition-colors">Approve</button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {filteredDoctors.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-sm text-gray-500">{searchTerm || filter !== 'all' ? 'Try adjusting your search or filter criteria.' : 'No doctors have registered yet.'}</p>
                  </div>
                )}
              </div>

              {/* Doctor Detail Modal */}
              {selectedDoctor && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                    {/* Header */}
                    <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 sticky top-0 bg-white">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#A3B18A] to-[#8FA076] rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {selectedDoctor.full_name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900">{selectedDoctor.full_name}</h3>
                          <div className="flex items-center gap-2 mt-0.5">
                            {getStatusBadge(selectedDoctor.approval_status)}
                            <span className="text-xs text-gray-400">{selectedDoctor.specialization}</span>
                          </div>
                        </div>
                      </div>
                      <button onClick={() => setSelectedDoctor(null)} className="text-gray-400 hover:text-gray-600 p-1">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    <div className="px-6 py-5 space-y-5">
                      {/* Contact Info */}
                      <div className="bg-[#F5F5F0] rounded-xl p-4">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Contact Information</p>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div><span className="text-gray-500">Email:</span><span className="font-medium ml-1">{selectedDoctor.email}</span></div>
                          <div><span className="text-gray-500">Phone:</span><span className="font-medium ml-1">{selectedDoctor.phone_number}</span></div>
                        </div>
                      </div>

                      {/* Professional Details */}
                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Professional Details</p>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div><span className="text-gray-500">Specialization:</span><span className="font-medium ml-1">{selectedDoctor.specialization}</span></div>
                          <div><span className="text-gray-500">Experience:</span><span className="font-medium ml-1">{selectedDoctor.experience}</span></div>
                          <div><span className="text-gray-500">License No:</span><span className="font-medium ml-1">{selectedDoctor.license_number}</span></div>
                          <div><span className="text-gray-500">Hospital:</span><span className="font-medium ml-1">{selectedDoctor.hospital_name}</span></div>
                          <div><span className="text-gray-500">Location:</span><span className="font-medium ml-1">{selectedDoctor.location || 'â€”'}</span></div>
                          <div><span className="text-gray-500">Registered:</span><span className="font-medium ml-1">{formatDate(selectedDoctor.created_at)}</span></div>
                        </div>
                      </div>

                      {/* Bio */}
                      {selectedDoctor.bio && (
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Bio</p>
                          <p className="text-sm text-gray-700 bg-white border border-gray-100 rounded-lg p-3">{selectedDoctor.bio}</p>
                        </div>
                      )}

                      {/* Credentials */}
                      {selectedDoctor.credentials && (
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Credentials</p>
                          <p className="text-sm text-gray-700 bg-white border border-gray-100 rounded-lg p-3">{selectedDoctor.credentials}</p>
                        </div>
                      )}

                      {/* Document */}
                      {selectedDoctor.document_path && (
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">License Document</p>
                          <a href={`http://localhost:5002/uploads/documents/${selectedDoctor.document_path.split('\\').pop()}`}
                            target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-[#DCE4D4] text-[#A3B18A] hover:bg-[#A3B18A] hover:text-white rounded-lg text-sm font-medium transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            View Document
                          </a>
                        </div>
                      )}

                      {/* Session Fees */}
                      {(selectedDoctor.initial_session_fee || selectedDoctor.followup_session_fee) && (
                        <div className="bg-gray-50 rounded-xl p-4">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Session Fees</p>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            {selectedDoctor.initial_session_fee && <div><span className="text-gray-500">Initial:</span><span className="font-medium ml-1">Rs {selectedDoctor.initial_session_fee}</span></div>}
                            {selectedDoctor.followup_session_fee && <div><span className="text-gray-500">Follow-up:</span><span className="font-medium ml-1">Rs {selectedDoctor.followup_session_fee}</span></div>}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Footer Actions */}
                    <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
                      {selectedDoctor.approval_status === 'pending' && (
                        <>
                          <button onClick={() => { updateDoctorStatus(selectedDoctor.id, 'approved'); setSelectedDoctor(null); }}
                            className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium text-sm transition-colors">Approve</button>
                          <button onClick={() => { updateDoctorStatus(selectedDoctor.id, 'rejected'); setSelectedDoctor(null); }}
                            className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium text-sm transition-colors">Reject</button>
                        </>
                      )}
                      {selectedDoctor.approval_status === 'approved' && (
                        <button onClick={() => { updateDoctorStatus(selectedDoctor.id, 'rejected'); setSelectedDoctor(null); }}
                          className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium text-sm transition-colors">Revoke Approval</button>
                      )}
                      {selectedDoctor.approval_status === 'rejected' && (
                        <button onClick={() => { updateDoctorStatus(selectedDoctor.id, 'approved'); setSelectedDoctor(null); }}
                          className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium text-sm transition-colors">Approve</button>
                      )}
                      <button onClick={() => setSelectedDoctor(null)}
                        className="flex-1 py-2.5 bg-[#A3B18A] hover:bg-[#8FA076] text-white rounded-xl font-medium text-sm transition-colors">Close</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeSection === 'users' && (
            <div className="space-y-6">
              {/* Stats Cards for Users Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 font-medium mb-1">Total Users</p>
                      <p className="text-3xl font-bold text-gray-800">{patients.length}</p>
                      <p className="text-xs text-gray-400 mt-1">Registered patients</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 font-medium mb-1">New This Month</p>
                      <p className="text-3xl font-bold text-gray-800">
                        {patients.filter(p => {
                          const createdDate = new Date(p.created_at);
                          const now = new Date();
                          return createdDate.getMonth() === now.getMonth() && 
                                 createdDate.getFullYear() === now.getFullYear();
                        }).length}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">Recent registrations</p>
                    </div>
                    <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 font-medium mb-1">Active Users</p>
                      <p className="text-3xl font-bold text-gray-800">
                        {patients.filter(p => p.status === 'active').length}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">Currently active</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Search and Filter */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <label htmlFor="patient-search" className="block text-sm font-medium text-gray-700 mb-2">
                      Search Users
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        id="patient-search"
                        placeholder="Search by name, email, or phone..."
                        value={patientSearchTerm}
                        onChange={(e) => setPatientSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A3B18A] focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="user-filter" className="block text-sm font-medium text-gray-700 mb-2">
                      Filter by Status
                    </label>
                    <select
                      id="user-filter"
                      value={userFilter}
                      onChange={(e) => setUserFilter(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A3B18A] focus:border-transparent"
                    >
                      <option value="all">All Users</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Users Table */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <h3 className="text-lg font-semibold text-gray-800">User Management</h3>
                  <p className="text-sm text-gray-500 mt-1">Click a user to view full details</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">User</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Joined</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredPatients.map((patient) => (
                        <tr key={patient.id} onClick={() => setSelectedPatient(patient)}
                          className="hover:bg-[#F5F5F0] transition-colors cursor-pointer group">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 bg-gradient-to-br from-[#A3B18A] to-[#8FA076] rounded-full flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
                                {patient.full_name.charAt(0).toUpperCase()}
                              </div>
                              <p className="text-sm font-semibold text-gray-900">{patient.full_name}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm text-gray-600">{patient.email}</p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm text-gray-500">{new Date(patient.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${patient.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {patient.status === 'active' ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                            {patient.status === 'active' ? (
                              <button onClick={() => updatePatientStatus(patient.id, 'inactive')}
                                className="px-3 py-1.5 text-xs font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded-lg transition-colors">
                                Deactivate
                              </button>
                            ) : (
                              <button onClick={() => updatePatientStatus(patient.id, 'active')}
                                className="px-3 py-1.5 text-xs font-medium text-green-700 bg-green-100 hover:bg-green-200 rounded-lg transition-colors">
                                Activate
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {filteredPatients.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-sm text-gray-500">{patientSearchTerm || userFilter !== 'all' ? 'Try adjusting your search or filter criteria.' : 'No users have registered yet.'}</p>
                  </div>
                )}
              </div>

              {/* Patient Detail Modal */}
              {selectedPatient && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
                    {/* Header */}
                    <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#A3B18A] to-[#8FA076] rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {selectedPatient.full_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900">{selectedPatient.full_name}</h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${selectedPatient.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {selectedPatient.status === 'active' ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                      <button onClick={() => setSelectedPatient(null)} className="text-gray-400 hover:text-gray-600 p-1">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    <div className="px-6 py-5 space-y-4">
                      <div className="bg-[#F5F5F0] rounded-xl p-4">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Account Details</p>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Full Name</span>
                            <span className="font-medium text-gray-900">{selectedPatient.full_name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Email</span>
                            <span className="font-medium text-gray-900">{selectedPatient.email}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Phone</span>
                            <span className="font-medium text-gray-900">{selectedPatient.phone_number || 'â€”'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Age</span>
                            <span className="font-medium text-gray-900">{selectedPatient.age || 'â€”'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Member Since</span>
                            <span className="font-medium text-gray-900">
                              {new Date(selectedPatient.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">User ID</span>
                            <span className="font-medium text-gray-400 text-xs">#{selectedPatient.id}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
                      {selectedPatient.status === 'active' ? (
                        <button onClick={() => { updatePatientStatus(selectedPatient.id, 'inactive'); setSelectedPatient(null); }}
                          className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium text-sm transition-colors">
                          Deactivate Account
                        </button>
                      ) : (
                        <button onClick={() => { updatePatientStatus(selectedPatient.id, 'active'); setSelectedPatient(null); }}
                          className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium text-sm transition-colors">
                          Activate Account
                        </button>
                      )}
                      <button onClick={() => setSelectedPatient(null)}
                        className="flex-1 py-2.5 bg-[#A3B18A] hover:bg-[#8FA076] text-white rounded-xl font-medium text-sm transition-colors">
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeSection === 'appointments' && (
            <AppointmentsSection />
          )}

              {activeSection === 'specializations' && (
                <SpecializationsSection />
              )}

              {activeSection === 'reviews' && (
                <ReviewsSection />
              )}

          {activeSection === 'analytics' && (
            <AnalyticsSection />
          )}

          {activeSection === 'settings' && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Settings</h3>
              <p className="text-gray-600">System settings coming soon...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const AppointmentsSection = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [stats, setStats] = useState({ total: 0, upcoming: 0, completed: 0, cancelled: 0 });
  const [selectedApt, setSelectedApt] = useState(null);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      let url = buildApiUrl('/api/admin/appointments');
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (search) params.append('search', search);
      if (params.toString()) url += `?${params.toString()}`;

      const response = await fetch(url);
      const data = await response.json();
      if (data.success) {
        setAppointments(data.appointments);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [statusFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchAppointments();
  };

  const getStatusBadge = (status) => {
    const styles = {
      confirmed:  'bg-blue-100 text-blue-700',
      completed:  'bg-green-100 text-green-700',
      cancelled:  'bg-red-100 text-red-700',
      scheduled:  'bg-yellow-100 text-yellow-700',
      no_show:    'bg-gray-100 text-gray-600',
    };
    const labels = {
      confirmed: 'Upcoming',
      scheduled: 'Upcoming',
      completed: 'Completed',
      cancelled: 'Cancelled',
      no_show:   'No Show',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status] || 'bg-gray-100 text-gray-600'}`}>
        {labels[status] || status}
      </span>
    );
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const [h, m] = timeStr.split(':');
    const hour = parseInt(h);
    return `${hour % 12 || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total, color: 'bg-[#A3B18A]', icon: (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          )},
          { label: 'Upcoming', value: stats.upcoming, color: 'bg-blue-500', icon: (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          )},
          { label: 'Completed', value: stats.completed, color: 'bg-green-500', icon: (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          )},
          { label: 'Cancelled', value: stats.cancelled, color: 'bg-red-400', icon: (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          )},
        ].map((card) => (
          <div key={card.label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center space-x-4">
            <div className={`${card.color} p-3 rounded-lg`}>
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {card.icon}
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{card.value || 0}</p>
              <p className="text-sm text-gray-500">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex gap-2 flex-1 max-w-md">
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search patient or doctor..."
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#A3B18A] focus:border-transparent"
              />
            </div>
            <button type="submit" className="px-4 py-2 bg-[#A3B18A] text-white rounded-lg text-sm font-medium hover:bg-[#8FA076] transition-colors">
              Search
            </button>
          </form>

          {/* Status Filter */}
          <div className="flex gap-2 flex-wrap">
            {['all', 'confirmed', 'completed', 'cancelled'].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                  statusFilter === s
                    ? 'bg-[#A3B18A] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {s === 'confirmed' ? 'Upcoming' : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Appointments Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-semibold text-gray-900">All Appointments ({appointments.length})</h3>
          <button onClick={fetchAppointments} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#A3B18A] mx-auto mb-3"></div>
            <p className="text-gray-500 text-sm">Loading appointments...</p>
          </div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-16">
            <svg className="w-14 h-14 mx-auto mb-4 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-gray-500 font-medium">No appointments found</p>
            <p className="text-gray-400 text-sm mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Patient</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Doctor</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Specialty</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Date & Time</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Fee</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {appointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-[#F5F5F0] transition-colors">
                    {/* Patient */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#A3B18A] to-[#8FA076] flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
                          {apt.patient_first_name?.charAt(0)}{apt.patient_last_name?.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{apt.patient_first_name} {apt.patient_last_name}</p>
                          <p className="text-xs text-gray-400">{apt.patient_email}</p>
                        </div>
                      </div>
                    </td>
                    {/* Doctor */}
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-800">Dr. {apt.doctor_name}</p>
                    </td>
                    {/* Specialty */}
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600">{apt.doctor_specialization}</p>
                    </td>
                    {/* Date & Time */}
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-800">
                        {new Date(apt.appointment_date).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' })}
                      </p>
                      <p className="text-xs text-gray-400">{formatTime(apt.appointment_time)}</p>
                    </td>
                    {/* Type */}
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600 capitalize">{apt.appointment_type}</p>
                    </td>
                    {/* Fee */}
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-800">Rs {apt.session_fee || 0}</p>
                    </td>
                    {/* Status */}
                    <td className="px-6 py-4">
                      {getStatusBadge(apt.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardNew;

const AnalyticsSection = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [regTab, setRegTab] = useState('patients');

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [aptsRes, reviewsRes, doctorsRes, usersRes] = await Promise.all([
          fetch(buildApiUrl('/api/admin/appointments')),
          fetch(buildApiUrl('/api/reviews/admin/all')),
          fetch(buildApiUrl('/api/admin/doctors')),
          fetch(buildApiUrl('/api/admin/users')),
        ]);
        const [apts, reviews, doctors, users] = await Promise.all([
          aptsRes.json(), reviewsRes.json(), doctorsRes.json(), usersRes.json()
        ]);

        const appointments = apts.success ? apts.appointments : [];
        const allReviews = reviews.success ? reviews.reviews : [];
        const allDoctors = doctors.success ? doctors.doctors : [];
        const allUsers = users.success ? users.patients : [];

        // Appointment stats
        const completed = appointments.filter(a => a.status === 'completed').length;
        const upcoming = appointments.filter(a => a.status === 'confirmed' || a.status === 'scheduled').length;
        const cancelled = appointments.filter(a => a.status === 'cancelled').length;
        const totalRevenue = appointments
          .filter(a => a.status === 'completed')
          .reduce((sum, a) => sum + parseFloat(a.session_fee || 0), 0);

        // Doctor stats
        const approvedDoctors = allDoctors.filter(d => d.approval_status === 'approved').length;
        const pendingDoctors = allDoctors.filter(d => d.approval_status === 'pending').length;
        const rejectedDoctors = allDoctors.filter(d => d.approval_status === 'rejected').length;

        // Specialization breakdown
        const specMap = {};
        allDoctors.filter(d => d.approval_status === 'approved').forEach(d => {
          specMap[d.specialization] = (specMap[d.specialization] || 0) + 1;
        });
        const topSpecializations = Object.entries(specMap)
          .sort((a, b) => b[1] - a[1]).slice(0, 5);

        // Review stats
        const approvedReviews = allReviews.filter(r => r.is_visible).length;
        const pendingReviews = allReviews.filter(r => !r.is_visible).length;
        const avgRating = allReviews.length
          ? (allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length).toFixed(1)
          : 0;

        // User stats
        const activeUsers = allUsers.filter(u => u.status === 'active').length;

        // Monthly data (last 6 months)
        const now = new Date();
        const months = [];
        for (let i = 5; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const label = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
          const patients = allUsers.filter(u => { const c = new Date(u.created_at); return c.getMonth() === d.getMonth() && c.getFullYear() === d.getFullYear(); }).length;
          const docs = allDoctors.filter(doc => { const c = new Date(doc.created_at); return c.getMonth() === d.getMonth() && c.getFullYear() === d.getFullYear(); }).length;
          const apts_count = appointments.filter(a => { const c = new Date(a.created_at); return c.getMonth() === d.getMonth() && c.getFullYear() === d.getFullYear(); }).length;
          months.push({ label, patients, doctors: docs, appointments: apts_count });
        }

        setData({
          appointments: { total: appointments.length, completed, upcoming, cancelled },
          revenue: totalRevenue,
          doctors: { total: allDoctors.length, approved: approvedDoctors, pending: pendingDoctors, rejected: rejectedDoctors },
          reviews: { total: allReviews.length, approved: approvedReviews, pending: pendingReviews, avgRating },
          users: { total: allUsers.length, active: activeUsers },
          topSpecializations,
          months,
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) return (
    <div className="text-center py-20">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#A3B18A] mx-auto mb-3"></div>
      <p className="text-gray-500 text-sm">Loading analytics...</p>
    </div>
  );

  if (!data) return null;

  const maxSpec = Math.max(...data.topSpecializations.map(s => s[1]), 1);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: `Rs ${data.revenue.toLocaleString()}`, sub: 'From completed sessions', color: 'bg-[#A3B18A]', icon: (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          )},
          { label: 'Total Appointments', value: data.appointments.total, sub: `${data.appointments.completed} completed`, color: 'bg-blue-500', icon: (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          )},
          { label: 'Active Patients', value: data.users.active, sub: `${data.users.total} total registered`, color: 'bg-purple-500', icon: (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          )},
          { label: 'Total Doctors', value: data.doctors.total, sub: `${data.doctors.approved} approved`, color: 'bg-[#8FA076]', icon: (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          )},
        ].map(card => (
          <div key={card.label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1">{card.label}</p>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                <p className="text-xs text-gray-400 mt-1">{card.sub}</p>
              </div>
              <div className={`${card.color} p-2.5 rounded-lg flex-shrink-0`}>
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {card.icon}
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Appointment Breakdown */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-5">Appointment Breakdown</h3>
          <div className="space-y-4">
            {[
              { label: 'Completed', value: data.appointments.completed, total: data.appointments.total, color: 'bg-green-500' },
              { label: 'Upcoming', value: data.appointments.upcoming, total: data.appointments.total, color: 'bg-blue-500' },
              { label: 'Cancelled', value: data.appointments.cancelled, total: data.appointments.total, color: 'bg-red-400' },
            ].map(item => (
              <div key={item.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">{item.label}</span>
                  <span className="font-semibold text-gray-900">{item.value} <span className="text-gray-400 font-normal">/ {item.total}</span></span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className={`${item.color} h-2 rounded-full transition-all`}
                    style={{ width: item.total > 0 ? `${(item.value / item.total) * 100}%` : '0%' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Doctor Status */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-5">Doctor Status</h3>
          <div className="space-y-4">
            {[
              { label: 'Approved', value: data.doctors.approved, total: data.doctors.total, color: 'bg-[#A3B18A]' },
              { label: 'Pending', value: data.doctors.pending, total: data.doctors.total, color: 'bg-yellow-400' },
              { label: 'Rejected', value: data.doctors.rejected, total: data.doctors.total, color: 'bg-red-400' },
            ].map(item => (
              <div key={item.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">{item.label}</span>
                  <span className="font-semibold text-gray-900">{item.value} <span className="text-gray-400 font-normal">/ {item.total}</span></span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className={`${item.color} h-2 rounded-full transition-all`}
                    style={{ width: item.total > 0 ? `${(item.value / item.total) * 100}%` : '0%' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Specializations */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-5">Top Specializations</h3>
          {data.topSpecializations.length === 0 ? (
            <p className="text-gray-400 text-sm">No data yet</p>
          ) : (
            <div className="space-y-3">
              {data.topSpecializations.map(([name, count]) => (
                <div key={name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700 truncate mr-2">{name}</span>
                    <span className="font-semibold text-gray-900 flex-shrink-0">{count} doctor{count !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-[#A3B18A] h-2 rounded-full"
                      style={{ width: `${(count / maxSpec) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Review Stats */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-5">Review Overview</h3>
          <div className="grid grid-cols-3 gap-4 mb-5">
            {[
              { label: 'Total', value: data.reviews.total, color: 'text-gray-900' },
              { label: 'Approved', value: data.reviews.approved, color: 'text-green-600' },
              { label: 'Pending', value: data.reviews.pending, color: 'text-yellow-600' },
            ].map(item => (
              <div key={item.label} className="text-center bg-gray-50 rounded-xl p-3">
                <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
                <p className="text-xs text-gray-500 mt-1">{item.label}</p>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-2 bg-yellow-50 rounded-xl p-4">
            <span className="text-yellow-400 text-2xl">â˜…</span>
            <span className="text-2xl font-bold text-gray-900">{data.reviews.avgRating}</span>
            <span className="text-sm text-gray-500">average rating</span>
          </div>
        </div>
      </div>

      {/* Appointment Trends â€” smooth SVG area chart */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="font-semibold text-gray-800">Appointment Trends</h3>
            <p className="text-xs text-gray-400 mt-0.5">Last 6 months</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900">{data.appointments.total}</p>
            <p className="text-xs text-gray-400">total appointments</p>
          </div>
        </div>

        {(() => {
          const pts = data.months.map(m => m.appointments);
          const maxVal = Math.max(...pts, 1);
          const W = 600; const H = 160; const PAD = 8;
          const xStep = (W - PAD * 2) / (pts.length - 1);
          const xs = pts.map((_, i) => PAD + i * xStep);
          const ys = pts.map(p => H - PAD - ((p / maxVal) * (H - PAD * 2)));

          // Smooth cubic bezier path
          const smooth = (points) => {
            if (points.length < 2) return '';
            let d = `M${points[0][0]},${points[0][1]}`;
            for (let i = 1; i < points.length; i++) {
              const [x0, y0] = points[i - 1];
              const [x1, y1] = points[i];
              const cpx = (x0 + x1) / 2;
              d += ` C${cpx},${y0} ${cpx},${y1} ${x1},${y1}`;
            }
            return d;
          };

          const coords = xs.map((x, i) => [x, ys[i]]);
          const linePath = smooth(coords);
          const areaPath = linePath
            ? `${linePath} L${xs[xs.length-1]},${H} L${xs[0]},${H} Z`
            : '';

          const yTicks = [maxVal, Math.round(maxVal * 0.5), 0];

          return (
            <div className="flex gap-4 mt-4">
              {/* Y axis */}
              <div className="flex flex-col justify-between text-xs text-gray-300 text-right pb-6" style={{minWidth:'24px', height:`${H}px`}}>
                {yTicks.map(v => <span key={v}>{v}</span>)}
              </div>
              <div className="flex-1 min-w-0">
                <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{height:`${H}px`}} preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="aptAreaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#A3B18A" stopOpacity="0.25"/>
                      <stop offset="100%" stopColor="#A3B18A" stopOpacity="0"/>
                    </linearGradient>
                  </defs>
                  {/* Horizontal grid lines */}
                  {yTicks.map((v, i) => {
                    const y = H - PAD - ((v / maxVal) * (H - PAD * 2));
                    return <line key={i} x1={PAD} y1={y} x2={W - PAD} y2={y} stroke="#f3f4f6" strokeWidth="1" strokeDasharray="4,4"/>;
                  })}
                  {/* Area fill */}
                  {areaPath && <path d={areaPath} fill="url(#aptAreaGrad)"/>}
                  {/* Line */}
                  {linePath && <path d={linePath} fill="none" stroke="#A3B18A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>}
                  {/* Dots */}
                  {coords.map(([x, y], i) => (
                    <g key={i}>
                      <circle cx={x} cy={y} r="5" fill="white" stroke="#A3B18A" strokeWidth="2.5"/>
                      {pts[i] > 0 && (
                        <text x={x} y={y - 10} textAnchor="middle" fontSize="10" fill="#6b7280" fontWeight="600">{pts[i]}</text>
                      )}
                    </g>
                  ))}
                </svg>
                {/* X labels */}
                <div className="flex justify-between text-xs text-gray-400 mt-1 px-1">
                  {data.months.map(m => <span key={m.label}>{m.label}</span>)}
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* New Registrations â€” improved bar chart */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="font-semibold text-gray-800">New Registrations</h3>
            <p className="text-xs text-gray-400 mt-0.5">Last 6 months</p>
          </div>
          <div className="flex border border-gray-200 rounded-lg overflow-hidden text-xs font-medium">
            {['patients','doctors'].map(tab => (
              <button key={tab} onClick={() => setRegTab(tab)}
                className={`px-4 py-1.5 capitalize transition-colors ${regTab === tab ? 'bg-[#A3B18A] text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {(() => {
          const regData = data.months.map(m => ({ label: m.label, count: regTab === 'patients' ? m.patients : m.doctors }));
          const maxVal = Math.max(...regData.map(m => m.count), 1);
          const W = 600; const H = 160; const PAD = 8;
          const barW = (W - PAD * 2) / regData.length;
          const barGap = barW * 0.25;
          const yTicks = [maxVal, Math.round(maxVal * 0.5), 0];

          return (
            <div className="flex gap-4 mt-4">
              {/* Y axis */}
              <div className="flex flex-col justify-between text-xs text-gray-300 text-right pb-6" style={{minWidth:'24px', height:`${H}px`}}>
                {yTicks.map(v => <span key={v}>{v}</span>)}
              </div>
              <div className="flex-1 min-w-0">
                <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{height:`${H}px`}} preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#A3B18A" stopOpacity="1"/>
                      <stop offset="100%" stopColor="#8FA076" stopOpacity="0.8"/>
                    </linearGradient>
                  </defs>
                  {/* Grid lines */}
                  {yTicks.map((v, i) => {
                    const y = H - PAD - ((v / maxVal) * (H - PAD * 2));
                    return <line key={i} x1={PAD} y1={y} x2={W - PAD} y2={y} stroke="#f3f4f6" strokeWidth="1" strokeDasharray="4,4"/>;
                  })}
                  {/* Baseline */}
                  <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="#e5e7eb" strokeWidth="1"/>
                  {/* Bars */}
                  {regData.map(({ count }, i) => {
                    const barH = (count / maxVal) * (H - PAD * 2);
                    const x = PAD + i * barW + barGap / 2;
                    const w = barW - barGap;
                    const y = H - PAD - barH;
                    return (
                      <g key={i}>
                        {count > 0 && (
                          <rect x={x} y={y} width={w} height={barH} fill="url(#barGrad)" rx="3" ry="3"/>
                        )}
                        {count > 0 && (
                          <text x={x + w / 2} y={y - 5} textAnchor="middle" fontSize="10" fill="#6b7280" fontWeight="600">{count}</text>
                        )}
                      </g>
                    );
                  })}
                </svg>
                {/* X labels */}
                <div className="flex text-xs text-gray-400 mt-1">
                  {regData.map(({ label }) => (
                    <div key={label} className="flex-1 text-center">{label}</div>
                  ))}
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
};

const SpecializationsSection = () => {
  const [specializations, setSpecializations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchSpecializations = async () => {
    try {
      setLoading(true);
      const res = await fetch(buildApiUrl('/api/admin/specializations'));
      const data = await res.json();
      if (data.success) setSpecializations(data.specializations);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSpecializations(); }, []);

  const showMsg = (type, msg) => {
    if (type === 'error') setError(msg);
    else setSuccess(msg);
    setTimeout(() => { setError(''); setSuccess(''); }, 3000);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setAdding(true);
    try {
      const res = await fetch(buildApiUrl('/api/admin/specializations'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim() })
      });
      const data = await res.json();
      if (data.success) {
        setNewName('');
        fetchSpecializations();
        showMsg('success', 'Specialization added successfully');
      } else {
        showMsg('error', data.message || 'Failed to add');
      }
    } catch (e) {
      showMsg('error', 'Network error');
    } finally {
      setAdding(false);
    }
  };

  const handleEdit = async (id) => {
    if (!editName.trim()) return;
    try {
      const res = await fetch(buildApiUrl(`/api/admin/specializations/${id}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName.trim() })
      });
      const data = await res.json();
      if (data.success) {
        setEditingId(null);
        setEditName('');
        fetchSpecializations();
        showMsg('success', 'Specialization updated');
      } else {
        showMsg('error', data.message || 'Failed to update');
      }
    } catch (e) {
      showMsg('error', 'Network error');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(buildApiUrl(`/api/admin/specializations/${id}`), { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchSpecializations();
        showMsg('success', data.message);
      } else {
        showMsg('error', data.message || 'Failed to delete');
      }
    } catch (e) {
      showMsg('error', 'Network error');
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      {/* Feedback */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">{success}</div>
      )}

      {/* Add New */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-base font-semibold text-gray-800 mb-4">Add New Specialization</h3>
        <form onSubmit={handleAdd} className="flex gap-3">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="e.g. Trauma Therapy"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#A3B18A] focus:border-transparent"
          />
          <button
            type="submit"
            disabled={adding || !newName.trim()}
            className="px-5 py-2 bg-[#A3B18A] text-white rounded-lg text-sm font-medium hover:bg-[#8FA076] transition-colors disabled:opacity-50"
          >
            {adding ? 'Adding...' : 'Add'}
          </button>
        </form>
      </div>

      {/* List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-semibold text-gray-800">All Specializations ({specializations.length})</h3>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#A3B18A] mx-auto"></div>
          </div>
        ) : specializations.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">No specializations yet.</div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {specializations.map((spec) => (
              <li key={spec.id} className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-gray-50 transition-colors">
                {editingId === spec.id ? (
                  <div className="flex items-center gap-3 flex-1">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1 px-3 py-1.5 border border-[#A3B18A] rounded-lg text-sm focus:ring-2 focus:ring-[#A3B18A] focus:border-transparent"
                      autoFocus
                    />
                    <button
                      onClick={() => handleEdit(spec.id)}
                      className="px-3 py-1.5 bg-[#A3B18A] text-white rounded-lg text-xs font-medium hover:bg-[#8FA076] transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => { setEditingId(null); setEditName(''); }}
                      className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-8 h-8 bg-[#DCE4D4] rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-[#A3B18A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-gray-800">{spec.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => { setEditingId(spec.id); setEditName(spec.name); }}
                        className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(spec.id, spec.name)}
                        className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

const ReviewsSection = () => {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ total: 0, visible: 0, hidden: 0, avg_rating: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedReview, setSelectedReview] = useState(null);
  const ratingLabel = { 1: 'Poor', 2: 'Fair', 3: 'Good', 4: 'Very Good', 5: 'Excellent' };

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await fetch(buildApiUrl('/api/reviews/admin/all'));
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

  useEffect(() => { fetchReviews(); }, []);

  const toggleVisibility = async (e, reviewId, currentVisibility) => {
    e && e.stopPropagation();
    try {
      const res = await fetch(buildApiUrl(`/api/reviews/admin/${reviewId}/visibility`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isVisible: !currentVisibility })
      });
      const data = await res.json();
      if (data.success) fetchReviews();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (e, reviewId) => {
    e && e.stopPropagation();
    if (!window.confirm('Delete this review? This cannot be undone.')) return;
    try {
      const res = await fetch(buildApiUrl(`/api/reviews/admin/${reviewId}`), { method: 'DELETE' });
      const data = await res.json();
      if (data.success) { fetchReviews(); if (selectedReview?.id === reviewId) setSelectedReview(null); }
    } catch (e) {
      console.error(e);
    }
  };

  const renderStars = (rating) => (
    <span className="text-yellow-400 text-sm">
      {'â˜…'.repeat(rating)}{'â˜†'.repeat(5 - rating)}
    </span>
  );

  const filteredReviews = reviews.filter(r => {
    if (filter === 'visible') return r.is_visible;
    if (filter === 'hidden') return !r.is_visible;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Reviews', value: stats.total || 0, color: 'bg-[#A3B18A]' },
          { label: 'Approved', value: stats.visible || 0, color: 'bg-green-500' },
          { label: 'Pending/Hidden', value: stats.hidden || 0, color: 'bg-yellow-500' },
          { label: 'Avg Rating', value: stats.avg_rating ? `${stats.avg_rating} â˜…` : 'N/A', color: 'bg-purple-500' },
        ].map((card) => (
          <div key={card.label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center space-x-4">
            <div className={`${card.color} p-3 rounded-lg`}>
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">{card.value}</p>
              <p className="text-xs text-gray-500">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex gap-2">
        {['all', 'hidden', 'visible'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
              filter === f ? 'bg-[#A3B18A] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f === 'hidden' ? 'Pending Approval' : f === 'visible' ? 'Approved' : 'All'}
          </button>
        ))}
        <button onClick={fetchReviews} className="ml-auto text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Reviews List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Reviews ({filteredReviews.length})</h3>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#A3B18A] mx-auto mb-3"></div>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <svg className="w-12 h-12 mx-auto mb-3 text-gray-200" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            <p className="text-sm">No reviews found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Patient</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Doctor</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Rating</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Review</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredReviews.map((review) => (
                  <tr key={review.id} className="hover:bg-[#F5F5F0] transition-colors">
                    {/* Patient */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#A3B18A] to-[#8FA076] flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
                          {review.patient_first_name?.charAt(0)}{review.patient_last_name?.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{review.patient_first_name} {review.patient_last_name}</p>
                          <p className="text-xs text-gray-400">{review.patient_email}</p>
                        </div>
                      </div>
                    </td>
                    {/* Doctor */}
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-[#A3B18A]">Dr. {review.doctor_full_name}</p>
                      <p className="text-xs text-gray-400">{review.doctor_specialization}</p>
                    </td>
                    {/* Rating */}
                    <td className="px-6 py-4">
                      <p className="text-yellow-400 text-sm leading-none">{'â˜…'.repeat(review.rating)}{'â˜†'.repeat(5 - review.rating)}</p>
                      <p className="text-xs text-gray-400 mt-1">{review.rating}/5</p>
                    </td>
                    {/* Review text */}
                    <td className="px-6 py-4 max-w-xs">
                      {review.review_text
                        ? <p className="text-sm text-gray-600 line-clamp-2">{review.review_text}</p>
                        : <p className="text-xs text-gray-300 italic">No written review</p>
                      }
                    </td>
                    {/* Date */}
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600 whitespace-nowrap">
                        {new Date(review.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </td>
                    {/* Status */}
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${review.is_visible ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {review.is_visible ? 'Approved' : 'Pending'}
                      </span>
                    </td>
                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => toggleVisibility(e, review.id, review.is_visible)}
                          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${review.is_visible ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100' : 'bg-green-50 text-green-700 hover:bg-green-100'}`}>
                          {review.is_visible ? 'Hide' : 'Approve'}
                        </button>
                        <button
                          onClick={(e) => handleDelete(e, review.id)}
                          className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Review Details</h3>
              <button onClick={() => setSelectedReview(null)} className="text-gray-400 hover:text-gray-600 p-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="px-6 py-5 space-y-5">
              <div className="bg-[#F5F5F0] rounded-xl p-4 text-sm">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-gray-900">{selectedReview.patient_first_name} {selectedReview.patient_last_name}</span>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                  <span className="font-semibold text-[#A3B18A]">Dr. {selectedReview.doctor_full_name}</span>
                </div>
                <p className="text-gray-400 text-xs mt-1">{selectedReview.doctor_specialization} â€¢ {new Date(selectedReview.created_at).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Overall Rating</p>
                <div className="flex items-center gap-3">
                  <span className="text-yellow-400 text-2xl">{'â˜…'.repeat(selectedReview.rating)}{'â˜†'.repeat(5 - selectedReview.rating)}</span>
                  <span className="text-lg font-bold text-gray-800">{selectedReview.rating}/5</span>
                  <span className="text-sm text-[#A3B18A] font-medium">{ratingLabel[selectedReview.rating]}</span>
                </div>
              </div>
              {/* Detailed Ratings â€” always show */}
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Detailed Ratings</p>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: 'Professionalism', value: selectedReview.rating_professionalism },
                    { label: 'Communication', value: selectedReview.rating_communication },
                    { label: 'Wait Time', value: selectedReview.rating_wait_time },
                  ].map(({ label, value }) => (
                    <div key={label} className="text-center">
                      <p className="text-xs text-gray-500 mb-1">{label}</p>
                      {value ? (
                        <><p className="text-yellow-400 text-lg leading-none">{'â˜…'.repeat(value)}{'â˜†'.repeat(5 - value)}</p><p className="text-xs text-gray-500 mt-1">{value}/5</p></>
                      ) : <p className="text-xs text-gray-400 mt-2">Not rated</p>}
                    </div>
                  ))}
                </div>
              </div>
              {selectedReview.review_text && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Written Review</p>
                  <p className="text-sm text-gray-700 leading-relaxed bg-white border border-gray-100 rounded-xl p-4">{selectedReview.review_text}</p>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${selectedReview.is_visible ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {selectedReview.is_visible ? 'Approved & Visible' : 'Pending Approval'}
                </span>
                <div className="flex gap-2">
                  <button onClick={(e) => { toggleVisibility(e, selectedReview.id, selectedReview.is_visible); setSelectedReview(null); }}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${selectedReview.is_visible ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100' : 'bg-green-50 text-green-700 hover:bg-green-100'}`}>
                    {selectedReview.is_visible ? 'Hide' : 'Approve'}
                  </button>
                  <button onClick={(e) => handleDelete(e, selectedReview.id)}
                    className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
                    Delete
                  </button>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100">
              <button onClick={() => setSelectedReview(null)}
                className="w-full py-2.5 bg-[#A3B18A] hover:bg-[#8FA076] text-white rounded-xl font-medium text-sm transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


