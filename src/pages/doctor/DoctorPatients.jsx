import React, { useState } from 'react';
import { buildApiUrl } from '../../config/api.js';

const DoctorPatients = ({ patients, doctorId, onRefresh }) => {
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [cancelled, setCancelled] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);

  const fetchPatientHistory = async (patient) => {
    setSelectedPatient(patient);
    setLoadingSessions(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(
        buildApiUrl(`/api/appointments/doctor/${doctorId}/patient/${patient.patient_id}/history`),
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      const data = await res.json();
      if (data.success) {
        setSessions(data.sessions);
        setUpcoming(data.upcoming || []);
        setCancelled(data.cancelled || []);
      }
    } catch (e) { console.error(e); }
    finally { setLoadingSessions(false); }
  };

  const closeModal = () => { setSelectedPatient(null); setSessions([]); setUpcoming([]); setCancelled([]); };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
  const formatTime = (t) => {
    if (!t) return '';
    const [h, m] = t.split(':');
    const hour = parseInt(h);
    return `${hour % 12 || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-800">
          My Patients <span className="ml-2 text-sm font-normal text-gray-400">({patients.length})</span>
        </h3>
        <button onClick={onRefresh}
          className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {patients.length > 0 ? (
        <div className="grid gap-3">
          {patients.map(patient => (
            <div key={patient.patient_id} onClick={() => fetchPatientHistory(patient)}
              className="border border-gray-200 rounded-xl p-4 hover:shadow-md hover:border-[#A3B18A] transition-all cursor-pointer group">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#A3B18A] to-[#8FA076] rounded-full flex items-center justify-center text-white font-semibold shadow-sm">
                    {patient.patient_first_name.charAt(0)}{patient.patient_last_name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{patient.patient_first_name} {patient.patient_last_name}</h4>
                    <p className="text-sm text-gray-600">{patient.patient_email}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{patient.patient_phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    {patient.last_visit && <p className="text-sm text-gray-600">Last Visit: <span className="font-medium">{new Date(patient.last_visit).toLocaleDateString()}</span></p>}
                    <div className="flex items-center gap-2 justify-end mt-0.5">
                      <p className="text-sm font-medium text-[#A3B18A]">{patient.total_sessions} completed</p>
                      {parseInt(patient.upcoming_count) > 0 && (
                        <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-medium">{patient.upcoming_count} upcoming</span>
                      )}
                    </div>
                  </div>
                  <svg className="w-4 h-4 text-gray-300 group-hover:text-[#A3B18A] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p className="text-lg font-medium">No patients yet</p>
          <p className="text-sm mt-2">Patients will appear here after you complete sessions with them</p>
        </div>
      )}

      {/* Patient History Modal */}
      {selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 sticky top-0 bg-white">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-gradient-to-br from-[#A3B18A] to-[#8FA076] rounded-full flex items-center justify-center text-white font-bold">
                  {selectedPatient.patient_first_name.charAt(0)}{selectedPatient.patient_last_name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{selectedPatient.patient_first_name} {selectedPatient.patient_last_name}</h3>
                  <p className="text-xs text-gray-500">{selectedPatient.patient_email} • {selectedPatient.patient_phone}</p>
                </div>
              </div>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 p-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="px-6 py-5">
              {/* Summary */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-[#F5F5F0] rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-[#A3B18A]">{loadingSessions ? '...' : sessions.length}</p>
                  <p className="text-xs text-gray-500 mt-1">Completed</p>
                </div>
                <div className="bg-green-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-green-600">{loadingSessions ? '...' : upcoming.length}</p>
                  <p className="text-xs text-gray-500 mt-1">Upcoming</p>
                </div>
                <div className="bg-[#F5F5F0] rounded-xl p-4 text-center">
                  <p className="text-sm font-semibold text-gray-800">
                    {selectedPatient.last_visit ? new Date(selectedPatient.last_visit).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Last Visit</p>
                </div>
              </div>

              {/* Upcoming Sessions */}
              {!loadingSessions && upcoming.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Upcoming Sessions ({upcoming.length})
                  </h4>
                  <div className="space-y-2">
                    {upcoming.map(apt => (
                      <div key={apt.id} className="border border-green-200 bg-green-50 rounded-xl px-4 py-3 flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{formatDate(apt.appointment_date)}</p>
                          <p className="text-xs text-gray-500">{formatTime(apt.appointment_time)} • {apt.duration_minutes} min • <span className="capitalize">{apt.appointment_type}</span></p>
                          {apt.reason_for_visit && <p className="text-xs text-gray-500 mt-0.5">{apt.reason_for_visit}</p>}
                        </div>
                        <div className="text-right">
                          <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">{apt.status}</span>
                          <p className="text-sm font-semibold text-[#A3B18A] mt-1">Rs {apt.session_fee}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Session History */}
              <h4 className="font-semibold text-gray-800 mb-4">Session History</h4>
              {loadingSessions ? (
                <div className="text-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#A3B18A] mx-auto"></div></div>
              ) : sessions.length === 0 ? (
                <p className="text-center text-gray-400 py-8">No completed sessions found</p>
              ) : (
                <div className="space-y-4">
                  {sessions.map((session, idx) => (
                    <div key={session.id} className="border border-gray-200 rounded-xl overflow-hidden">
                      <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 bg-[#A3B18A] rounded-full flex items-center justify-center text-white text-xs font-bold">{idx + 1}</span>
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">{formatDate(session.appointment_date)}</p>
                            <p className="text-xs text-gray-500">{formatTime(session.appointment_time)} • {session.duration_minutes} min • <span className="capitalize">{session.appointment_type}</span></p>
                          </div>
                        </div>
                        <span className="text-sm font-semibold text-[#A3B18A]">Rs {session.session_fee}</span>
                      </div>
                      <div className="px-4 py-3 space-y-3">
                        {session.reason_for_visit && (
                          <div>
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Reason for Visit</p>
                            <p className="text-sm text-gray-700 mt-1">{session.reason_for_visit}</p>
                          </div>
                        )}
                        {session.session_notes && (
                          <div>
                            <p className="text-xs font-semibold text-[#A3B18A] uppercase tracking-wide">Doctor's Notes</p>
                            <p className="text-sm text-gray-700 mt-1 bg-[#F5F5F0] rounded-lg p-3 whitespace-pre-wrap">{session.session_notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Cancelled */}
              {!loadingSessions && cancelled.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                    Cancelled Appointments ({cancelled.length})
                  </h4>
                  <div className="space-y-2">
                    {cancelled.map(apt => (
                      <div key={apt.id} className="border border-red-100 bg-red-50 rounded-xl px-4 py-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-gray-700 text-sm">{formatDate(apt.appointment_date)}</p>
                            <p className="text-xs text-gray-500">{formatTime(apt.appointment_time)} • {apt.duration_minutes} min • <span className="capitalize">{apt.appointment_type}</span></p>
                            {apt.reason_for_visit && <p className="text-xs text-gray-400 mt-0.5">{apt.reason_for_visit}</p>}
                          </div>
                          <div className="text-right">
                            <span className="text-xs px-2 py-1 bg-red-100 text-red-600 rounded-full font-medium">Cancelled</span>
                            <p className="text-sm font-medium text-gray-500 mt-1">Rs {apt.session_fee}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-100">
              <button onClick={closeModal}
                className="w-full py-2.5 bg-[#A3B18A] hover:bg-[#8FA076] text-white rounded-xl font-medium text-sm transition-colors">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorPatients;
