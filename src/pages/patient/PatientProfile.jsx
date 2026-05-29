import React, { useState, useRef } from 'react';
import { buildApiUrl } from '../../config/api.js';

const PatientProfile = ({ user, stats, onUserUpdate }) => {
  const [uploading, setUploading] = useState(false);
  const [photoUrl, setPhotoUrl] = useState(user.profile_photo || null);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setError('');
    setUploading(true);
    const formData = new FormData();
    formData.append('profilePhoto', file);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(buildApiUrl('/api/patients/profile/photo'), {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setPhotoUrl(data.patient.profile_photo);
        const stored = JSON.parse(localStorage.getItem('user') || '{}');
        stored.profile_photo = data.patient.profile_photo;
        localStorage.setItem('user', JSON.stringify(stored));
        if (onUserUpdate) onUserUpdate(stored);
        // Notify Header (same tab) to re-read localStorage
        window.dispatchEvent(new Event('userUpdated'));
      } else {
        setError(data.message || 'Upload failed.');
      }
    } catch {
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-6">

      {/* Profile header card */}
      <div className="bg-gradient-to-r from-[#4A7C59] to-[#3d6b4a] rounded-xl p-8 shadow-lg text-white">
        <div className="flex items-center space-x-6">

          {/* Avatar with upload overlay */}
          <div className="relative group flex-shrink-0">
            <div className="w-20 h-20 rounded-full border-4 border-white/30 overflow-hidden bg-white/20 flex items-center justify-center">
              {photoUrl ? (
                <img src={photoUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-bold text-white">{user.full_name.charAt(0)}</span>
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute inset-0 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              {uploading ? (
                <svg className="w-5 h-5 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png"
              className="hidden"
              onChange={handlePhotoChange}
            />
          </div>

          <div>
            <h2 className="text-2xl font-bold">{user.full_name}</h2>
            <p className="text-white/80 mt-1">Patient Account</p>
            <span className="inline-block mt-2 px-3 py-1 bg-white/20 rounded-full text-sm">Active</span>
            <p className="text-white/60 text-xs mt-1">Hover over photo to change it</p>
            {error && <p className="text-red-300 text-xs mt-1">{error}</p>}
          </div>
        </div>
      </div>

      {/* Account info */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-[#4A7C59] to-[#3d6b4a] px-6 py-4">
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

      {/* Progress stats */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">My Progress</h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Sessions Completed', value: stats.completed, color: 'text-[#4A7C59]' },
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
  );
};

export default PatientProfile;
