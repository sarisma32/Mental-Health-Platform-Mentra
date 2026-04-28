import React from 'react';
import DoctorVideoUpload from './DoctorVideoUpload';

const getMediaUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `http://localhost:5002/${path}`;
};

const DoctorProfile = ({
  doctor, editedDoctor, isEditing, saving,
  photoTimestamp, handleInputChange, handlePhotoUpload,
  handleProfileSave, handleCancelEdit, setIsEditing,
}) => {
  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-[#4A7C59] to-[#3d6b4a] rounded-xl p-8 shadow-lg text-white">
        <div className="flex items-center space-x-6">
          <div className="relative">
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border-4 border-white/30 overflow-hidden">
              {doctor.profile_photo ? (
                <img src={getMediaUrl(doctor.profile_photo)} alt={doctor.full_name} className="w-full h-full object-cover" key={photoTimestamp} />
              ) : (
                <span className="text-4xl font-bold text-white">{doctor.full_name?.charAt(0)}</span>
              )}
            </div>
            <label className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors shadow-lg">
              <svg className="w-4 h-4 text-[#4A7C59]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
            </label>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold">Dr. {doctor.full_name}</h2>
            <p className="text-white/90 mt-1">{doctor.specialization}</p>
            <div className="flex items-center space-x-4 mt-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-white/20 backdrop-blur-sm">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Verified Professional
              </span>
              <span className="text-sm text-white/80">License: {doctor.license_number}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Editable Form */}
      <form onSubmit={handleProfileSave} className="space-y-6">
        {/* Personal Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-[#4A7C59] to-[#3d6b4a] px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                <h3 className="text-lg font-semibold text-white">Personal Information</h3>
              </div>
              {!isEditing && (
                <button type="button" onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-white text-[#4A7C59] rounded-lg text-sm font-medium hover:bg-white/90 transition-colors">Edit</button>
              )}
            </div>
          </div>
          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              {[
                { label: 'Full Name', name: 'full_name', type: 'text', value: editedDoctor.full_name },
                { label: 'Email Address', name: 'email', type: 'email', value: editedDoctor.email },
                { label: 'Phone Number', name: 'phone_number', type: 'tel', value: editedDoctor.phone_number || '' },
              ].map(f => (
                <div key={f.name}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{f.label}</label>
                  <input type={f.type} name={f.name} value={f.value} onChange={handleInputChange} disabled={!isEditing}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A7C59] focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Professional Details */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-[#4A7C59] to-[#3d6b4a] px-6 py-4 flex items-center space-x-3">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            <h3 className="text-lg font-semibold text-white">Professional Details</h3>
          </div>
          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              {[
                { label: 'Specialization', name: 'specialization', value: editedDoctor.specialization },
                { label: 'Experience', name: 'experience', value: editedDoctor.experience },
              ].map(f => (
                <div key={f.name}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{f.label}</label>
                  <input type="text" name={f.name} value={f.value} onChange={handleInputChange} disabled={!isEditing}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A7C59] focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600" />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">License Number</label>
                <input type="text" value={doctor.license_number} disabled
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed" />
                <p className="text-xs text-gray-500 mt-1">License number cannot be changed</p>
              </div>
            </div>
          </div>
        </div>

        {/* Hospital & Location */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-[#4A7C59] to-[#3d6b4a] px-6 py-4 flex items-center space-x-3">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            <h3 className="text-lg font-semibold text-white">Hospital & Location</h3>
          </div>
          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              {[
                { label: 'Hospital Name', name: 'hospital_name', value: editedDoctor.hospital_name },
                { label: 'Location', name: 'location', value: editedDoctor.location || '' },
              ].map(f => (
                <div key={f.name}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{f.label}</label>
                  <input type="text" name={f.name} value={f.value} onChange={handleInputChange} disabled={!isEditing}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A7C59] focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Session Fees */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-[#4A7C59] to-[#3d6b4a] px-6 py-4 flex items-center space-x-3">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" /></svg>
            <h3 className="text-lg font-semibold text-white">Session Fees</h3>
          </div>
          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              {[
                { label: 'Initial Session Fee (Rs)', name: 'initial_session_fee', value: editedDoctor.initial_session_fee || '', placeholder: '2500', hint: 'First-time consultation fee' },
                { label: 'Follow-up Session Fee (Rs)', name: 'followup_session_fee', value: editedDoctor.followup_session_fee || '', placeholder: '2200', hint: 'Regular session fee' },
              ].map(f => (
                <div key={f.name}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{f.label}</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><span className="text-gray-500">Rs</span></div>
                    <input type="number" name={f.name} value={f.value} onChange={handleInputChange} disabled={!isEditing} placeholder={f.placeholder}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A7C59] focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600" />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{f.hint}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-[#4A7C59] to-[#3d6b4a] px-6 py-4 flex items-center space-x-3">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            <h3 className="text-lg font-semibold text-white">Professional Bio</h3>
          </div>
          <div className="p-6">
            <textarea name="bio" value={editedDoctor.bio || ''} onChange={handleInputChange} disabled={!isEditing} rows="6"
              placeholder="Tell patients about your expertise, approach, and what makes you unique..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A7C59] focus:border-transparent resize-none disabled:bg-gray-50 disabled:text-gray-600" />
            <p className="mt-2 text-sm text-gray-500 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              This will be displayed on your public profile
            </p>
          </div>
        </div>

        {/* Credentials */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-[#4A7C59] to-[#3d6b4a] px-6 py-4 flex items-center space-x-3">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
            <h3 className="text-lg font-semibold text-white">Credentials</h3>
          </div>
          <div className="p-6">
            <textarea name="credentials" value={editedDoctor.credentials || ''} onChange={handleInputChange} disabled={!isEditing} rows="4"
              placeholder="PhD in Clinical Psychology, Licensed Psychologist, Board Certified..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A7C59] focus:border-transparent resize-none disabled:bg-gray-50 disabled:text-gray-600" />
          </div>
        </div>

        {/* Save / Cancel */}
        {isEditing && (
          <div className="flex justify-end space-x-4">
            <button type="button" onClick={handleCancelEdit}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors">Cancel</button>
            <button type="submit" disabled={saving}
              className={`px-8 py-3 rounded-lg text-white font-medium transition-colors ${saving ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#4A7C59] hover:bg-[#3d6b4a]'}`}>
              {saving ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </span>
              ) : 'Save Changes'}
            </button>
          </div>
        )}
      </form>

      {/* Video Upload */}
      <DoctorVideoUpload doctorId={doctor?.id} />
    </div>
  );
};

export default DoctorProfile;
