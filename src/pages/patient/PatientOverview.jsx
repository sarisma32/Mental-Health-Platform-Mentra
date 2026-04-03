import React from 'react';

const PatientOverview = ({ stats, appointments, loading, navigate, setActiveSection, getStatusColor, formatTime }) => {
  return (
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
                    <p className="text-xs text-gray-500">{new Date(apt.appointment_date).toLocaleDateString()} • {formatTime(apt.appointment_time)}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(apt.status)}`}>{apt.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientOverview;
