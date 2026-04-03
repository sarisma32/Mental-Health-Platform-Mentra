import React from 'react';

const AdminOverview = ({ stats, setActiveSection }) => {
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Users', value: stats.totalUsers, sub: 'Registered patients', color: 'bg-blue-50', iconColor: 'text-blue-600', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM9 10a2 2 0 11-4 0 2 2 0 014 0z" /> },
          { label: 'Total Doctors', value: stats.totalDoctors, sub: 'Healthcare providers', color: 'bg-green-50', iconColor: 'text-green-600', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /> },
          { label: 'Pending Reviews', value: stats.pendingReviews, sub: 'Awaiting approval', color: 'bg-yellow-50', iconColor: 'text-yellow-600', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /> },
          { label: 'Appointments', value: stats.totalAppointments, sub: 'Total bookings', color: 'bg-purple-50', iconColor: 'text-purple-600', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /> },
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

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'Review Doctors', desc: 'Approve pending applications', section: 'doctors', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /> },
            { label: 'Manage Users', desc: 'View patient accounts', section: 'users', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /> },
            { label: 'Appointments', desc: 'Monitor bookings', section: 'appointments', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /> },
          ].map(item => (
            <button key={item.label} onClick={() => setActiveSection(item.section)}
              className="p-4 border-2 border-[#DCE4D4] rounded-lg hover:bg-[#F5F5F0] hover:border-[#A3B18A] transition-all text-left group">
              <div className="w-10 h-10 bg-[#DCE4D4] rounded-lg flex items-center justify-center mb-3 group-hover:bg-[#A3B18A] transition-colors">
                <svg className="w-6 h-6 text-[#A3B18A] group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">{item.icon}</svg>
              </div>
              <h4 className="font-semibold text-gray-800">{item.label}</h4>
              <p className="text-sm text-gray-500 mt-1">{item.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
