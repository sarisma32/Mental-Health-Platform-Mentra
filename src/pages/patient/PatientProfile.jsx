import React from 'react';

const PatientProfile = ({ user, stats }) => {
  return (
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
  );
};

export default PatientProfile;
