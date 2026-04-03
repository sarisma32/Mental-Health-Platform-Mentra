import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NotificationBanner from '../components/NotificationBanner';
import ScheduleManagement from '../components/ScheduleManagement';
import DashboardSidebar from '../components/DashboardSidebar';
import DashboardHeader from '../components/DashboardHeader';
import DoctorOverview from './doctor/DoctorOverview';
import DoctorAppointments from './doctor/DoctorAppointments';
import DoctorPatients from './doctor/DoctorPatients';
import DoctorProfile from './doctor/DoctorProfile';
import DoctorReviews from './doctor/DoctorReviews';
import DoctorCompleteSessionModal from './doctor/DoctorCompleteSessionModal';
import { buildApiUrl, API_ENDPOINTS } from '../config/api.js';

const DoctorDashboardNew = () => {
  const [doctor, setDoctor] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({ todayAppointments: 0, totalPatients: 0, weeklyRevenue: 0, completedSessions: 0 });
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
    if (!token || !userData || role !== 'doctor') { navigate('/login'); return; }
    const doctorData = JSON.parse(userData);
    setDoctor(doctorData);
    fetchDashboardData(doctorData.id, token);
  }, [navigate]);

  const fetchDashboardData = async (doctorId, token) => {
    try {
      setLoading(true);
      const profileRes = await fetch(buildApiUrl(API_ENDPOINTS.DOCTOR_PROFILE), {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        if (profileData.success) {
          setDoctor(profileData.doctor);
          setEditedDoctor(profileData.doctor);
          localStorage.setItem('user', JSON.stringify(profileData.doctor));
        }
      }

      const statsRes = await fetch(buildApiUrl(API_ENDPOINTS.DOCTOR_STATS), {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.stats);
      }

      const aptsRes = await fetch(`${buildApiUrl(API_ENDPOINTS.DOCTOR_APPOINTMENTS)}/${doctorId}`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      if (aptsRes.ok) {
        const aptsData = await aptsRes.json();
        setAppointments(aptsData.appointments || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setStats({ todayAppointments: 0, totalPatients: 0, weeklyRevenue: 0, completedSessions: 0 });
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctorPatients = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(buildApiUrl(`${API_ENDPOINTS.DOCTOR_PATIENTS}/${doctor.id}/patients`), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setPatients(data.patients);
    } catch (error) { console.error('Error fetching patients:', error); }
  };

  useEffect(() => {
    if (doctor && activeSection === 'patients') fetchDoctorPatients();
  }, [doctor, activeSection]);

  useEffect(() => {
    if (doctor) setEditedDoctor({ ...doctor });
  }, [doctor]);

  const handleCompleteSession = async () => {
    if (!selectedAppointment) return;
    setCompletingSession(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${buildApiUrl(API_ENDPOINTS.COMPLETE_SESSION)}/${selectedAppointment.id}/complete`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionNotes })
      });
      const data = await res.json();
      if (data.success) {
        setNotification({ message: 'Session completed successfully!', type: 'success' });
        setSelectedAppointment(null);
        setSessionNotes('');
        fetchDashboardData(doctor.id, token);
      } else {
        setNotification({ message: data.message || 'Failed to complete session', type: 'error' });
      }
    } catch {
      setNotification({ message: 'Error completing session', type: 'error' });
    } finally {
      setCompletingSession(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedDoctor(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setNotification({ message: 'Please upload an image file', type: 'error' }); return; }
    if (file.size > 5 * 1024 * 1024) { setNotification({ message: 'Image size should be less than 5MB', type: 'error' }); return; }
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('profilePhoto', file);
      const res = await fetch(buildApiUrl(API_ENDPOINTS.DOCTOR_PROFILE_PHOTO), {
        method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: formData
      });
      const data = await res.json();
      if (data.success) {
        setPhotoTimestamp(Date.now());
        setNotification({ message: 'Profile photo updated successfully!', type: 'success' });
        await fetchDashboardData(doctor.id, token);
      } else {
        setNotification({ message: data.message || 'Failed to upload photo', type: 'error' });
      }
    } catch { setNotification({ message: 'Failed to upload photo', type: 'error' }); }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const profileData = {
        full_name: editedDoctor.full_name, email: editedDoctor.email,
        phone_number: editedDoctor.phone_number || null, specialization: editedDoctor.specialization,
        experience: editedDoctor.experience, hospital_name: editedDoctor.hospital_name,
        location: editedDoctor.location || null, initial_session_fee: editedDoctor.initial_session_fee || null,
        followup_session_fee: editedDoctor.followup_session_fee || null, bio: editedDoctor.bio || null,
        credentials: editedDoctor.credentials || null, availability_hours: editedDoctor.availability_hours || null
      };
      const res = await fetch(buildApiUrl('/api/doctors/profile/complete'), {
        method: 'PUT', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData)
      });
      const data = await res.json();
      if (data.success) {
        setDoctor(data.doctor); setEditedDoctor(data.doctor);
        localStorage.setItem('user', JSON.stringify(data.doctor));
        setNotification({ message: 'Profile updated successfully!', type: 'success' });
        setIsEditing(false);
        await fetchDashboardData(doctor.id, token);
      } else {
        setNotification({ message: data.message || 'Failed to update profile', type: 'error' });
      }
    } catch { setNotification({ message: 'Failed to update profile', type: 'error' }); }
    finally { setSaving(false); }
  };

  const handleCancelEdit = () => { setIsEditing(false); setEditedDoctor({ ...doctor }); };

  const handleLogout = () => {
    localStorage.removeItem('token'); localStorage.removeItem('user'); localStorage.removeItem('userRole');
    navigate('/');
  };

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

  const formatTime = (t) => new Date(`2000-01-01T${t}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

  const menuItems = [
    { id: 'overview', name: 'Overview', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> },
    { id: 'appointments', name: 'Appointments', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> },
    { id: 'patients', name: 'Patients', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg> },
    { id: 'schedule', name: 'Schedule', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
    { id: 'profile', name: 'Profile', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> },
    { id: 'reviews', name: 'My Reviews', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg> },
  ];

  if (loading) return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A3B18A] mx-auto mb-4"></div>
        <p className="text-gray-600">Loading dashboard...</p>
      </div>
    </div>
  );

  if (!doctor) return null;

  const refreshDashboard = () => {
    setRefreshing(true);
    fetchDashboardData(doctor.id, localStorage.getItem('token')).finally(() => setRefreshing(false));
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {notification && (
        <NotificationBanner message={notification.message} type={notification.type} onClose={() => setNotification(null)} />
      )}

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

      <div className="flex-1 overflow-auto">
        <DashboardHeader
          sectionTitle={menuItems.find(item => item.id === activeSection)?.name || 'Overview'}
          userName={doctor.full_name}
          userEmail={doctor.email}
          userPrefix="Dr."
          notifType="doctor"
          notifId={doctor?.id}
          onNotifNavigate={setActiveSection}
        />

        <div className="p-8">
          {activeSection === 'overview' && (
            <DoctorOverview
              stats={stats}
              appointments={appointments}
              setActiveSection={setActiveSection}
              getStatusColor={getStatusColor}
              formatTime={formatTime}
            />
          )}

          {activeSection === 'appointments' && (
            <DoctorAppointments
              appointments={appointments}
              refreshing={refreshing}
              onRefresh={refreshDashboard}
              onCompleteSession={(apt) => setSelectedAppointment(apt)}
              getStatusColor={getStatusColor}
              formatTime={formatTime}
            />
          )}

          {activeSection === 'patients' && (
            <DoctorPatients
              patients={patients}
              doctorId={doctor?.id}
              onRefresh={fetchDoctorPatients}
            />
          )}

          {activeSection === 'schedule' && <ScheduleManagement />}

          {activeSection === 'reviews' && doctor && <DoctorReviews doctorId={doctor.id} />}

          {activeSection === 'profile' && (
            <DoctorProfile
              doctor={doctor}
              editedDoctor={editedDoctor}
              isEditing={isEditing}
              saving={saving}
              photoTimestamp={photoTimestamp}
              handleInputChange={handleInputChange}
              handlePhotoUpload={handlePhotoUpload}
              handleProfileSave={handleProfileSave}
              handleCancelEdit={handleCancelEdit}
              setIsEditing={setIsEditing}
            />
          )}
        </div>
      </div>

      <DoctorCompleteSessionModal
        selectedAppointment={selectedAppointment}
        sessionNotes={sessionNotes}
        setSessionNotes={setSessionNotes}
        completingSession={completingSession}
        handleCompleteSession={handleCompleteSession}
        onClose={() => { setSelectedAppointment(null); setSessionNotes(''); }}
        formatTime={formatTime}
      />
    </div>
  );
};

export default DoctorDashboardNew;
