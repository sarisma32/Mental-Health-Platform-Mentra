import React from 'react';

const PatientAppointments = ({
  appointments, stats, loading, activeTab, setActiveTab,
  filteredAppointments, handleCancelAppointment, setReviewModal,
  reviewedAppointments, getStatusColor, formatDate, formatTime,
  navigate, fetchAppointments, user,
  setReviewRating, setReviewText, setRatingProfessionalism,
  setRatingCommunication, setRatingWaitTime,
}) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-800">My Appointments</h3>
        <button onClick={() => fetchAppointments(user.id, localStorage.getItem('token'))} className="text-sm text-[#A3B18A] hover:text-[#8FA076] font-medium">Refresh</button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 mb-6 border-b border-gray-200">
        {[['upcoming', `Upcoming (${stats.upcoming})`], ['past', `Past (${stats.past})`], ['all', `All (${stats.total})`]].map(([tab, label]) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium text-sm transition-colors ${activeTab === tab ? 'text-[#A3B18A] border-b-2 border-[#A3B18A]' : 'text-gray-600 hover:text-gray-900'}`}>
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#A3B18A] mx-auto mb-4"></div></div>
      ) : filteredAppointments.length === 0 ? (
        <div className="text-center py-12">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          <p className="text-gray-600 mb-4">No appointments found</p>
          <button onClick={() => navigate('/professionals')} className="bg-[#A3B18A] hover:bg-[#8FA076] text-white px-6 py-2 rounded-lg font-medium transition-colors">Book Your First Session</button>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(
            filteredAppointments.slice().sort((a, b) => new Date(`${b.appointment_date}T${b.appointment_time}`) - new Date(`${a.appointment_date}T${a.appointment_time}`))
              .reduce((groups, apt) => {
                const key = apt.doctor_id;
                if (!groups[key]) groups[key] = { doctorName: apt.doctor_name, doctorSpecialization: apt.doctor_specialization, doctorLocation: apt.doctor_location, appointments: [] };
                groups[key].appointments.push(apt);
                return groups;
              }, {})
          ).map(([doctorId, group]) => (
            <div key={doctorId} className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="bg-[#F5F5F0] px-4 py-3 flex items-center gap-3 border-b border-gray-200">
                <div className="w-10 h-10 bg-gradient-to-br from-[#A3B18A] to-[#8FA076] rounded-full flex items-center justify-center text-white font-semibold text-sm">{group.doctorName.charAt(0)}</div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">Dr. {group.doctorName}</p>
                  <p className="text-xs text-gray-500">{group.doctorSpecialization} • {group.doctorLocation}</p>
                </div>
                <span className="text-xs text-gray-400 font-medium">{group.appointments.length} session{group.appointments.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="divide-y divide-gray-100">
                {group.appointments.map(apt => (
                  <div key={apt.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-1 text-sm">
                        <div className="flex items-center text-gray-700"><svg className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>{formatDate(apt.appointment_date)}</div>
                        <div className="flex items-center text-gray-700"><svg className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>{formatTime(apt.appointment_time)} • {apt.duration_minutes} min</div>
                        <div className="flex items-center text-gray-700"><svg className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" /></svg>Rs {apt.session_fee} • <span className="capitalize ml-1">{apt.appointment_type}</span></div>
                        {apt.confirmation_number && <div className="flex items-center text-gray-500 text-xs"><svg className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>Confirmation: {apt.confirmation_number}</div>}
                        {apt.session_notes && apt.status === 'completed' && (
                          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-start"><svg className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                              <div><p className="text-xs font-semibold text-blue-900 mb-1">Session Notes from Dr. {group.doctorName.split(' ').pop()}</p><p className="text-xs text-blue-800 whitespace-pre-wrap">{apt.session_notes}</p></div>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="text-right space-y-2 ml-4 flex-shrink-0">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(apt.status)}`}>{apt.status}</span>
                        {apt.status !== 'cancelled' && apt.status !== 'completed' && (() => {
                          const aptDateTime = new Date(`${apt.appointment_date}T${apt.appointment_time}`);
                          const hoursUntil = (aptDateTime - new Date()) / (1000 * 60 * 60);
                          return hoursUntil > 5 ? (
                            <div><button onClick={() => handleCancelAppointment(apt.id)} className="text-xs text-red-600 hover:text-red-800 font-medium">Cancel</button></div>
                          ) : <div><span className="text-xs text-gray-400">Cannot cancel</span></div>;
                        })()}
                        {apt.status === 'completed' && (
                          <div>{reviewedAppointments.has(apt.id) ? (
                            <span className="text-xs text-green-600 font-medium flex items-center justify-end"><span className="mr-1">★</span> Reviewed</span>
                          ) : (
                            <button onClick={() => {
                              setReviewModal(apt);
                              setReviewRating(0); setReviewText('');
                              setRatingProfessionalism(0); setRatingCommunication(0); setRatingWaitTime(0);
                            }} className="text-xs text-[#A3B18A] hover:text-[#8FA076] font-medium border border-[#A3B18A] px-2 py-1 rounded">Leave a Review</button>
                          )}</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientAppointments;


