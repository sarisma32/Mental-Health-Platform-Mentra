import React from 'react';

const DoctorOverview = ({ stats, appointments, setActiveSection, getStatusColor, formatTime }) => {
  const doctor = JSON.parse(localStorage.getItem('user') || '{}');
  const firstName = doctor?.full_name?.split(' ')[0] || 'Doctor';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const todayStr = new Date().toISOString().split('T')[0];
  const todayApts = appointments.filter(a =>
    new Date(a.appointment_date).toISOString().split('T')[0] === todayStr
  );
  const nextApt = todayApts.find(a => a.status !== 'completed' && a.status !== 'cancelled');
  const pendingCount = appointments.filter(a => a.status === 'pending').length;

  return (
    <div className="space-y-6">

      {/* Welcome Banner */}
      <div className="relative bg-gradient-to-r from-[#4A7C59] to-[#3d6b4a] rounded-2xl p-6 text-white overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full -translate-y-1/3 translate-x-1/4" />
        <div className="absolute bottom-0 right-32 w-40 h-40 bg-white/5 rounded-full translate-y-1/2" />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="text-white/75 text-sm">{greeting}, Dr. {firstName} 👋</p>
            <h2 className="text-2xl font-bold mt-1">
              {todayApts.length > 0
                ? `You have ${todayApts.length} session${todayApts.length > 1 ? 's' : ''} today`
                : 'No sessions scheduled today'}
            </h2>
            <p className="text-white/70 text-sm mt-1">
              {pendingCount > 0 ? `${pendingCount} appointment${pendingCount > 1 ? 's' : ''} awaiting confirmation` : 'All appointments up to date'}
            </p>
          </div>
          <button
            onClick={() => setActiveSection('schedule')}
            className="bg-white text-[#4A7C59] hover:bg-white/90 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm whitespace-nowrap"
          >
            Manage Schedule
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Today's Sessions", value: stats.todayAppointments,
            bg: 'bg-blue-50', iconBg: 'bg-blue-100', iconColor: 'text-blue-600',
            path: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
          },
          {
            label: 'Total Patients', value: stats.totalPatients,
            bg: 'bg-[#f0f7f4]', iconBg: 'bg-[#dce8e0]', iconColor: 'text-[#4A7C59]',
            path: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z'
          },
          {
            label: 'Weekly Revenue', value: `Rs. ${stats.weeklyRevenue || 0}`,
            bg: 'bg-purple-50', iconBg: 'bg-purple-100', iconColor: 'text-purple-600',
            path: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1'
          },
          {
            label: 'Completed', value: stats.completedSessions,
            bg: 'bg-amber-50', iconBg: 'bg-amber-100', iconColor: 'text-amber-600',
            path: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
          },
        ].map(card => (
          <div key={card.label} className={`${card.bg} rounded-2xl p-5 flex items-center gap-4`}>
            <div className={`w-12 h-12 ${card.iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
              <svg className={`w-6 h-6 ${card.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={card.path} />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{card.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Today's Schedule + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* Today's Schedule */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
            <div>
              <h3 className="text-base font-semibold text-gray-800">Today's Schedule</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <button
              onClick={() => setActiveSection('appointments')}
              className="text-sm text-[#4A7C59] hover:text-[#3d6b4a] font-medium"
            >
              View All →
            </button>
          </div>

          {todayApts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-6">
              <div className="w-14 h-14 bg-[#f0f7f4] rounded-full flex items-center justify-center mb-3">
                <svg className="w-7 h-7 text-[#4A7C59]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-600">No sessions today</p>
              <p className="text-xs text-gray-400 mt-1">Enjoy your free day or add availability</p>
              <button
                onClick={() => setActiveSection('schedule')}
                className="mt-4 text-sm bg-[#4A7C59] hover:bg-[#3d6b4a] text-white px-4 py-2 rounded-xl transition-colors font-medium"
              >
                Add Schedule
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {todayApts.slice(0, 5).map((apt, idx) => (
                <div key={apt.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/50 transition-colors">
                  <div className="w-8 text-center flex-shrink-0">
                    <span className="text-xs font-bold text-gray-400">#{idx + 1}</span>
                  </div>
                  <div className="w-10 h-10 bg-gradient-to-br from-[#4A7C59] to-[#3d6b4a] rounded-xl flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                    {apt.patient_first_name?.charAt(0)}{apt.patient_last_name?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{apt.patient_first_name} {apt.patient_last_name}</p>
                    <p className="text-xs text-gray-400">{formatTime(apt.appointment_time)} · {apt.appointment_type}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0 ${getStatusColor(apt.status)}`}>
                    {apt.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-base font-semibold text-gray-800 mb-4">Quick Actions</h3>
          <div className="space-y-2">
            {[
              { label: 'View Appointments', icon: '📅', action: () => setActiveSection('appointments') },
              { label: 'Manage Schedule', icon: '🗓️', action: () => setActiveSection('schedule') },
              { label: 'My Patients', icon: '👥', action: () => setActiveSection('patients') },
              { label: 'My Reviews', icon: '⭐', action: () => setActiveSection('reviews') },
              { label: 'Edit Profile', icon: '👤', action: () => setActiveSection('profile') },
            ].map(item => (
              <button
                key={item.label}
                onClick={item.action}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-[#f0f7f4] text-left transition-colors group"
              >
                <span className="text-lg">{item.icon}</span>
                <span className="text-sm font-medium text-gray-700 group-hover:text-[#4A7C59]">{item.label}</span>
                <svg className="w-4 h-4 text-gray-300 group-hover:text-[#4A7C59] ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Appointments */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
          <h3 className="text-base font-semibold text-gray-800">Recent Appointments</h3>
          <button
            onClick={() => setActiveSection('appointments')}
            className="text-sm text-[#4A7C59] hover:text-[#3d6b4a] font-medium"
          >
            View All →
          </button>
        </div>

        {appointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center px-6">
            <div className="w-16 h-16 bg-[#f0f7f4] rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-[#4A7C59]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-gray-600 font-medium">No appointments yet</p>
            <p className="text-sm text-gray-400 mt-1">Appointments will appear here once booked</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {appointments.slice(0, 5).map(apt => (
              <div key={apt.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/50 transition-colors">
                <div className="w-10 h-10 bg-gradient-to-br from-[#4A7C59] to-[#3d6b4a] rounded-xl flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                  {apt.patient_first_name?.charAt(0)}{apt.patient_last_name?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{apt.patient_first_name} {apt.patient_last_name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(apt.appointment_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · {formatTime(apt.appointment_time)}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs text-gray-400 capitalize">{apt.appointment_type}</span>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(apt.status)}`}>
                    {apt.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default DoctorOverview;
