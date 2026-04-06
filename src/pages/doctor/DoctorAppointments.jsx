import React, { useState } from 'react';
import { buildApiUrl } from '../../config/api.js';

const DoctorAppointments = ({ appointments, refreshing, onRefresh, onCompleteSession, getStatusColor, formatTime }) => {
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedDetail, setSelectedDetail] = useState(null);

  const handleConfirmAppointment = async (appointmentId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(buildApiUrl(`/api/appointments/${appointmentId}/confirm`), {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (data.success) onRefresh();
      else alert(data.message || 'Failed to confirm');
    } catch { alert('Failed to confirm appointment'); }
  };

  const handleCancelAppointment = async (appointmentId) => {
    if (!window.confirm('Cancel this appointment?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(buildApiUrl(`/api/appointments/${appointmentId}`), {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) onRefresh();
      else alert(data.message || 'Failed to cancel');
    } catch { alert('Failed to cancel appointment'); }
  };

  const filtered = [...appointments]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .filter(apt => statusFilter === 'all' || apt.status === statusFilter);

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-800">
            All Appointments
            <span className="ml-2 text-sm font-normal text-gray-400">({filtered.length})</span>
          </h3>
          <div className="flex space-x-2">
            <button onClick={onRefresh} disabled={refreshing}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors">
              <svg className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#A3B18A] focus:border-transparent bg-white">
              <option value="all">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {filtered.length > 0 ? (
          <div className="space-y-3">
            {filtered.map(apt => (
              <div key={apt.id} onClick={() => setSelectedDetail(apt)}
                className="border border-gray-200 rounded-xl p-4 hover:shadow-md hover:border-[#A3B18A] transition-all cursor-pointer group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#A3B18A] to-[#8FA076] rounded-full flex items-center justify-center text-white font-semibold shadow-sm flex-shrink-0">
                      {apt.patient_first_name.charAt(0)}{apt.patient_last_name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{apt.patient_first_name} {apt.patient_last_name}</h4>
                      <p className="text-sm text-gray-600">{formatDate(apt.appointment_date)} • {formatTime(apt.appointment_time)} • {apt.duration_minutes} min</p>
                      {apt.reason_for_visit && <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{apt.reason_for_visit}</p>}
                      <p className="text-xs text-gray-400 mt-0.5">{apt.patient_email} • {apt.patient_phone}</p>
                    </div>
                  </div>
                  <div className="text-right space-y-2 flex-shrink-0">
                    <div className="flex items-center space-x-2 justify-end">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(apt.status)}`}>{apt.status}</span>
                      <span className="text-sm font-medium text-gray-900">Rs {apt.session_fee || 0}</span>
                    </div>
                    <div className="flex space-x-1 justify-end">
                      {apt.status === 'pending' && (
                        <>
                          <button onClick={e => { e.stopPropagation(); handleConfirmAppointment(apt.id); }}
                            className="px-3 py-1.5 bg-green-100 text-green-700 text-xs rounded-md hover:bg-green-200 transition-colors font-medium">Confirm</button>
                          <button onClick={e => { e.stopPropagation(); handleCancelAppointment(apt.id); }}
                            className="px-3 py-1.5 bg-red-100 text-red-700 text-xs rounded-md hover:bg-red-200 transition-colors font-medium">Cancel</button>
                        </>
                      )}
                      {(apt.status === 'confirmed' || apt.status === 'scheduled') && (
                        <button onClick={e => { e.stopPropagation(); onCompleteSession(apt); }}
                          className="px-3 py-1.5 bg-blue-100 text-blue-700 text-xs rounded-md hover:bg-blue-200 transition-colors font-medium">Complete Session</button>
                      )}
                      <svg className="w-4 h-4 text-gray-300 group-hover:text-[#A3B18A] transition-colors self-center" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-lg font-medium">No appointments found</p>
            <p className="text-sm mt-1">{statusFilter !== 'all' ? `No ${statusFilter} appointments` : 'Your appointments will appear here'}</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 sticky top-0 bg-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#A3B18A] to-[#8FA076] rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {selectedDetail.patient_first_name.charAt(0)}{selectedDetail.patient_last_name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{selectedDetail.patient_first_name} {selectedDetail.patient_last_name}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(selectedDetail.status)}`}>{selectedDetail.status}</span>
                </div>
              </div>
              <button onClick={() => setSelectedDetail(null)} className="text-gray-400 hover:text-gray-600 p-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="px-6 py-5 space-y-5">
              <div className="bg-[#F5F5F0] rounded-xl p-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Appointment Details</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-gray-500">Date:</span> <span className="font-medium ml-1">{formatDate(selectedDetail.appointment_date)}</span></div>
                  <div><span className="text-gray-500">Time:</span> <span className="font-medium ml-1">{formatTime(selectedDetail.appointment_time)}</span></div>
                  <div><span className="text-gray-500">Duration:</span> <span className="font-medium ml-1">{selectedDetail.duration_minutes} min</span></div>
                  <div><span className="text-gray-500">Type:</span> <span className="font-medium ml-1 capitalize">{selectedDetail.appointment_type}</span></div>
                  <div><span className="text-gray-500">Fee:</span> <span className="font-semibold text-[#A3B18A] ml-1">Rs {selectedDetail.session_fee}</span></div>
                  <div><span className="text-gray-500">Confirmation:</span> <span className="font-medium ml-1 text-xs">{selectedDetail.confirmation_number}</span></div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Patient Contact</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-gray-500">Email:</span> <span className="font-medium ml-1">{selectedDetail.patient_email}</span></div>
                  <div><span className="text-gray-500">Phone:</span> <span className="font-medium ml-1">{selectedDetail.patient_phone}</span></div>
                  {selectedDetail.patient_date_of_birth && <div><span className="text-gray-500">Date of Birth:</span> <span className="font-medium ml-1">{new Date(selectedDetail.patient_date_of_birth).toLocaleDateString()}</span></div>}
                  {selectedDetail.emergency_contact_name && <div><span className="text-gray-500">Emergency Contact:</span> <span className="font-medium ml-1">{selectedDetail.emergency_contact_name}</span></div>}
                  {selectedDetail.emergency_contact_phone && <div><span className="text-gray-500">Emergency Phone:</span> <span className="font-medium ml-1">{selectedDetail.emergency_contact_phone}</span></div>}
                </div>
              </div>

              <div className="space-y-3">
                {selectedDetail.reason_for_visit && <div><p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Reason for Visit</p><p className="text-sm text-gray-700 bg-white border border-gray-100 rounded-lg p-3">{selectedDetail.reason_for_visit}</p></div>}
                {selectedDetail.previous_therapy && <div><p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Previous Therapy</p><p className="text-sm text-gray-700 bg-white border border-gray-100 rounded-lg p-3">{selectedDetail.previous_therapy}</p></div>}
                {selectedDetail.current_medications && <div><p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Current Medications</p><p className="text-sm text-gray-700 bg-white border border-gray-100 rounded-lg p-3">{selectedDetail.current_medications}</p></div>}
                {selectedDetail.special_requests && <div><p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Special Requests</p><p className="text-sm text-gray-700 bg-white border border-gray-100 rounded-lg p-3">{selectedDetail.special_requests}</p></div>}
                {selectedDetail.session_notes && <div><p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Session Notes</p><p className="text-sm text-gray-700 bg-blue-50 border border-blue-100 rounded-lg p-3">{selectedDetail.session_notes}</p></div>}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
              {selectedDetail.status === 'pending' && (
                <>
                  <button onClick={() => { handleConfirmAppointment(selectedDetail.id); setSelectedDetail(null); }}
                    className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium text-sm transition-colors">Confirm</button>
                  <button onClick={() => { handleCancelAppointment(selectedDetail.id); setSelectedDetail(null); }}
                    className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium text-sm transition-colors">Cancel</button>
                </>
              )}
              {(selectedDetail.status === 'confirmed' || selectedDetail.status === 'scheduled') && (
                <button onClick={() => { onCompleteSession(selectedDetail); setSelectedDetail(null); }}
                  className="flex-1 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium text-sm transition-colors">Complete Session</button>
              )}
              <button onClick={() => setSelectedDetail(null)}
                className="flex-1 py-2.5 bg-[#A3B18A] hover:bg-[#8FA076] text-white rounded-xl font-medium text-sm transition-colors">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorAppointments;

