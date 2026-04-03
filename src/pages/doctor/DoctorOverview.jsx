import React from 'react';

const DoctorOverview = ({ stats, appointments, setActiveSection, getStatusColor, formatTime }) => {
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Today's Sessions", value: stats.todayAppointments, sub: 'Scheduled today', color: 'bg-blue-50', iconColor: 'text-blue-600', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /> },
          { label: 'Active Patients', value: stats.totalPatients, sub: 'Total patients', color: 'bg-green-50', iconColor: 'text-green-600', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /> },
          { label: 'Weekly Revenue', value: `$${stats.weeklyRevenue}`, sub: 'Last 7 days', color: 'bg-purple-50', iconColor: 'text-purple-600', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" /> },
          { label: 'Completed Sessions', value: stats.completedSessions, sub: 'All time', color: 'bg-yellow-50', iconColor: 'text-yellow-600', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /> },
        ].map(card => (
          <div key={card.label} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium mb-1">{card.label}</p>
                <p className="text-3xl font-bold text-gray-800">{card.value}</p>
                <p className="text-xs text-gray-400 mt-1">{card.sub}</p>
              </div>
              <div className={`w-12 h-12 ${card.color} rounded-lg flex items-center justify-center`}>
                <svg className={`w-6 h-6 ${card.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">{card.icon}</svg>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Today's Schedule */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Today's Schedule</h3>
          <button onClick={() => setActiveSection('appointments')} className="text-sm text-[#A3B18A] hover:text-[#8FA076] font-medium">View All</button>
        </div>
        {(() => {
          const todayApts = appointments.filter(apt => {
            const today = new Date().toISOString().split('T')[0];
            return new Date(apt.appointment_date).toISOString().split('T')[0] === today;
          });
          return todayApts.length > 0 ? (
            <div className="space-y-3">
              {todayApts.slice(0, 5).map(apt => (
                <div key={apt.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#A3B18A] to-[#8FA076] rounded-full flex items-center justify-center text-white font-semibold shadow-sm">
                      {apt.patient_first_name.charAt(0)}{apt.patient_last_name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{apt.patient_first_name} {apt.patient_last_name}</p>
                      <p className="text-sm text-gray-600">{formatTime(apt.appointment_time)} • {apt.appointment_type}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(apt.status)}`}>{apt.status}</span>
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
          );
        })()}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Add Patient', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />, action: null },
            { label: 'Schedule', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />, action: () => setActiveSection('schedule') },
            { label: 'Notes', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />, action: null },
            { label: 'Reviews', isFill: true, icon: <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />, action: () => setActiveSection('reviews') },
          ].map(item => (
            <button key={item.label} onClick={item.action || undefined}
              className="p-4 border-2 border-[#DCE4D4] rounded-lg hover:bg-[#F5F5F0] hover:border-[#A3B18A] transition-all text-center group">
              <div className="w-10 h-10 bg-[#DCE4D4] rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-[#A3B18A] transition-colors">
                <svg className="w-6 h-6 text-[#A3B18A] group-hover:text-white" fill={item.isFill ? 'currentColor' : 'none'} stroke={item.isFill ? 'none' : 'currentColor'} viewBox="0 0 24 24">{item.icon}</svg>
              </div>
              <p className="text-sm font-medium text-gray-900">{item.label}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DoctorOverview;
