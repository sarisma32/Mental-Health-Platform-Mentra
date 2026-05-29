import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { buildApiUrl } from '../config/api.js';
import DashboardSidebar from '../components/DashboardSidebar';
import DashboardHeader from '../components/DashboardHeader';
import AdminOverview from './admin/AdminOverview';
import AdminDoctors from './admin/AdminDoctors';
import AdminUsers from './admin/AdminUsers';
import AdminAppointments from './admin/AdminAppointments';
import AdminSpecializations from './admin/AdminSpecializations';
import AdminReviews from './admin/AdminReviews';
import AdminAnalytics from './admin/AdminAnalytics';
import AdminCrisisAlerts from './admin/AdminCrisisAlerts';
import AdminDisputes from './admin/AdminDisputes';
import AdminSystemReviews from './admin/AdminSystemReviews';
import Settings from './shared/Settings.jsx';

const AdminDashboardNew = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [stats, setStats] = useState({ totalUsers: 0, totalDoctors: 0, pendingDoctors: 0, totalAppointments: 0, pendingReviews: 0 });
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [patientSearchTerm, setPatientSearchTerm] = useState('');
  const [userFilter, setUserFilter] = useState('all');

  useEffect(() => {
    const role = localStorage.getItem('admin_userRole');
    if (role !== 'admin') { navigate('/admin-login'); return; }
    fetchDashboardStats();
    fetchDoctors();
    fetchPatients();

    // Auto-refresh every 30 seconds so admin sees updates without manual refresh
    const interval = setInterval(() => {
      fetchDashboardStats();
      fetchDoctors();
      fetchPatients();
    }, 30000);

    return () => clearInterval(interval);
  }, [navigate]);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const [statsRes, aptsRes, reviewsRes] = await Promise.all([
        fetch(buildApiUrl('/api/admin/stats'), { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } }),
        fetch(buildApiUrl('/api/admin/appointments'), { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } }),
        fetch(buildApiUrl('/api/reviews/admin/all')),
      ]);
      const [statsData, aptsData, reviewsData] = await Promise.all([statsRes.json(), aptsRes.json(), reviewsRes.json()]);
      setStats({
        totalUsers: statsData.stats?.patients?.total_patients || 0,
        totalDoctors: parseInt(statsData.stats?.doctors?.total_doctors) || 0,
        pendingDoctors: parseInt(statsData.stats?.doctors?.pending_doctors) || 0,
        totalAppointments: aptsData.success ? aptsData.appointments.length : 0,
        pendingReviews: reviewsData.success ? reviewsData.reviews.filter(r => !r.is_visible).length : 0,
      });
    } catch (error) { console.error('Error fetching stats:', error); }
    finally { setLoading(false); }
  };

  const fetchDoctors = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch(buildApiUrl('/api/admin/doctors'), { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } });
      if (res.ok) { const data = await res.json(); setDoctors(data.doctors || []); }
    } catch (error) { console.error('Error fetching doctors:', error); }
  };

  const fetchPatients = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch(buildApiUrl('/api/admin/users'), { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } });
      if (res.ok) { const data = await res.json(); setPatients(data.patients || []); }
    } catch (error) { console.error('Error fetching patients:', error); }
  };

  const updateDoctorStatus = async (doctorId, newStatus, adminMessage = '') => {
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch(buildApiUrl(`/api/admin/doctors/${doctorId}/status`), {
        method: 'PUT', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, adminMessage })
      });
      const data = await res.json();
      if (data.success) { 
        fetchDoctors(); 
        fetchDashboardStats(); 
      } else {
        return { error: data.message || 'Failed to update doctor status.' };
      }
    } catch (error) { 
      console.error('Error updating doctor status:', error);
      return { error: 'An error occurred while updating doctor status.' };
    }
  };

  const updatePatientStatus = async (patientId, newStatus, adminMessage = '') => {
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch(buildApiUrl(`/api/admin/users/${patientId}/status`), {
        method: 'PUT', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, adminMessage })
      });
      const data = await res.json();
      if (data.success) { fetchPatients(); }
      else { return { error: data.message || 'Failed to update user status.' }; }
    } catch (error) { 
      console.error('Error updating patient status:', error);
      return { error: 'An error occurred while updating user status.' };
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    localStorage.removeItem('admin_userRole');
    navigate('/admin-login');
  };

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> },
    { id: 'users', name: 'Users', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg> },
    { id: 'doctors', name: 'Doctors', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> },
    { id: 'appointments', name: 'Appointments', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> },
    { id: 'specializations', name: 'Specializations', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg> },
    { id: 'reviews', name: 'Reviews', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg> },
    { id: 'analytics', name: 'Analytics', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg> },
    { id: 'crisis', name: 'Crisis Alerts', alert: true, icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg> },
    { id: 'disputes', name: 'Disputes', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> },
    { id: 'system-reviews', name: 'System Reviews', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg> },
    { id: 'settings', name: 'Settings', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
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

      <div className="flex-1 overflow-auto">
        <DashboardHeader
          sectionTitle={menuItems.find(item => item.id === activeSection)?.name || 'Dashboard'}
          userName="Admin User"
          userEmail="admin@mentra.com"
          notifType="admin"
          notifId={1}
          onNotifNavigate={setActiveSection}
        />

        <div className="p-8">
          {activeSection === 'dashboard' && (
            <AdminOverview stats={stats} setActiveSection={setActiveSection} />
          )}

          {activeSection === 'doctors' && (
            <AdminDoctors
              doctors={doctors}
              filter={filter}
              setFilter={setFilter}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              updateDoctorStatus={updateDoctorStatus}
              formatDate={formatDate}
            />
          )}

          {activeSection === 'users' && (
            <AdminUsers
              patients={patients}
              patientSearchTerm={patientSearchTerm}
              setPatientSearchTerm={setPatientSearchTerm}
              userFilter={userFilter}
              setUserFilter={setUserFilter}
              updatePatientStatus={updatePatientStatus}
            />
          )}

          {activeSection === 'appointments' && <AdminAppointments />}

          {activeSection === 'specializations' && <AdminSpecializations />}

          {activeSection === 'reviews' && <AdminReviews />}

          {activeSection === 'analytics' && <AdminAnalytics />}

          {activeSection === 'crisis' && <AdminCrisisAlerts />}

          {activeSection === 'disputes' && <AdminDisputes />}

          {activeSection === 'system-reviews' && <AdminSystemReviews />}

          {activeSection === 'settings' && (
            <Settings
              user={{ ...JSON.parse(localStorage.getItem('admin_user') || '{}'), id: 1 }}
              role="admin"
              onLogout={() => { localStorage.removeItem('admin_token'); localStorage.removeItem('admin_user'); localStorage.removeItem('admin_userRole'); window.location.href = '/admin-login'; }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardNew;
