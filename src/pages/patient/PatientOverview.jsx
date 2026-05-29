import React from 'react';
import { useNavigate } from 'react-router-dom';

const PatientOverview = ({ stats, appointments, loading, navigate, setActiveSection, getStatusColor, formatTime }) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const firstName = user?.full_name?.split(' ')[0] || 'there';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const nextAppointment = appointments
    .filter(a => new Date(a.appointment_date) >= new Date() && a.status !== 'cancelled' && a.status !== 'completed')
    .sort((a, b) => new Date(a.appointment_date) - new Date(b.appointment_date))[0];

  return (
    <div className="space-y-6">

      {/* Welcome Banner */}
      <div className="relative bg-gradient-to-r from-[#4A7C59] to-[#3d6b4a] rounded-2xl p-6 text-white overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 right-24 w-32 h-32 bg-white/5 rounded-full translate-y-1/2" />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="text-white/80 text-sm font-medium">{greeting}</p>
            <h2 className="text-2xl font-bold mt-1">{firstName}</h2>
            <p className="text-white/70 text-sm mt-1">
              {stats.upcoming > 0
                ? `You have ${stats.upcoming} upcoming session${stats.upcoming > 1 ? 's' : ''}`
                : 'No upcoming sessions — book one today'}
            </p>
          </div>
          <button
            onClick={() => navigate('/professionals')}
            className="bg-white text-[#4A7C59] hover:bg-white/90 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm whitespace-nowrap"
          >
            + Book Session
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            label: 'Upcoming', value: stats.upcoming,
            bg: 'bg-blue-50', icon: 'bg-blue-100', iconColor: 'text-blue-600',
            path: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
          },
          {
            label: 'Completed', value: stats.completed,
            bg: 'bg-emerald-50', icon: 'bg-emerald-100', iconColor: 'text-emerald-600',
            path: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
          },
          {
            label: 'Total Sessions', value: stats.total,
            bg: 'bg-[#f0f7f4]', icon: 'bg-[#d0e8dc]', iconColor: 'text-[#4A7C59]',
            path: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
          },
        ].map(card => (
          <div key={card.label} className={`${card.bg} rounded-2xl p-5 flex items-center gap-4`}>
            <div className={`w-12 h-12 ${card.icon} rounded-xl flex items-center justify-center flex-shrink-0`}>
              <svg className={`w-6 h-6 ${card.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={card.path} />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{card.value}</p>
              <p className="text-sm text-gray-500">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Next Appointment + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* Next Appointment */}
        <div className="lg:col-span-3 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="text-base font-semibold text-gray-800 mb-4">Next Appointment</h3>
          {loading ? (
            <div className="flex items-center justify-center h-24">
              <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-[#4A7C59]" />
            </div>
          ) : nextAppointment ? (
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-[#4A7C59] to-[#3d6b4a] rounded-2xl flex items-center justify-center text-white font-bold text-xl flex-shrink-0 overflow-hidden">
                {nextAppointment.doctor_photo ? (
                  <img src={nextAppointment.doctor_photo} alt={nextAppointment.doctor_name} className="w-full h-full object-cover" />
                ) : (
                  nextAppointment.doctor_name?.charAt(0)
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900">Dr. {nextAppointment.doctor_name}</p>
                <p className="text-sm text-gray-500">{nextAppointment.doctor_specialization}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-lg">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {new Date(nextAppointment.appointment_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-lg">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {formatTime(nextAppointment.appointment_time)}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-lg font-medium ${getStatusColor(nextAppointment.status)}`}>
                    {nextAppointment.status}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setActiveSection('appointments')}
                className="text-xs text-[#4A7C59] hover:text-[#3d6b4a] font-medium border border-[#d0e8dc] hover:border-[#4A7C59] px-3 py-1.5 rounded-lg transition-all whitespace-nowrap"
              >
                View Details
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-sm text-gray-500 mb-3">No upcoming appointments</p>
              <button
                onClick={() => navigate('/professionals')}
                className="text-sm bg-[#4A7C59] hover:bg-[#3d6b4a] text-white px-4 py-2 rounded-xl transition-colors font-medium"
              >
                Book a Session
              </button>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="text-base font-semibold text-gray-800 mb-4">Quick Actions</h3>
          <div className="space-y-2">
            {[
              {
                label: 'Find Therapists',
                action: () => navigate('/professionals'),
                svg: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
              },
              {
                label: 'My Appointments',
                action: () => setActiveSection('appointments'),
                svg: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              },
              {
                label: 'AI Chatbot',
                action: () => navigate('/chatbot'),
                svg: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              },
              {
                label: 'My Profile',
                action: () => setActiveSection('profile'),
                svg: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              },
            ].map(item => (
              <button
                key={item.label}
                onClick={item.action}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-[#f0f7f4] text-left transition-colors group"
              >
                <div className="w-8 h-8 bg-[#f0f7f4] group-hover:bg-[#d0e8dc] rounded-lg flex items-center justify-center flex-shrink-0 transition-colors">
                  <svg className="w-4 h-4 text-[#4A7C59]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {item.svg}
                  </svg>
                </div>
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

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-[#4A7C59]" />
          </div>
        ) : appointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center px-6">
            <div className="w-16 h-16 bg-[#f0f7f4] rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-[#4A7C59]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-gray-600 font-medium mb-1">No appointments yet</p>
            <p className="text-sm text-gray-400 mb-4">Start your wellness journey by booking a session</p>
            <button
              onClick={() => navigate('/professionals')}
              className="bg-[#4A7C59] hover:bg-[#3d6b4a] text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
            >
              Browse Therapists
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {appointments.slice(0, 4).map(apt => (
              <div key={apt.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/50 transition-colors">
                <div className="w-10 h-10 bg-gradient-to-br from-[#4A7C59] to-[#3d6b4a] rounded-xl flex items-center justify-center text-white font-semibold text-sm flex-shrink-0 overflow-hidden">
                  {apt.doctor_photo ? (
                    <img src={apt.doctor_photo} alt={apt.doctor_name} className="w-full h-full object-cover" />
                  ) : (
                    apt.doctor_name?.charAt(0)
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">Dr. {apt.doctor_name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(apt.appointment_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · {formatTime(apt.appointment_time)}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
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

export default PatientOverview;
