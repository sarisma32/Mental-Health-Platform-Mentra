import React, { useState } from 'react';
import { buildApiUrl } from '../../config/api.js';

const DoctorPatients = ({ patients, doctorId, onRefresh }) => {
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [cancelled, setCancelled] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [activeTab, setActiveTab] = useState('sessions');

  const fetchPatientHistory = async (patient) => {
    setSelectedPatient(patient);
    setLoadingSessions(true);
    setActiveTab('sessions');
    try {
      const token = localStorage.getItem('token');
      const [histRes, prescRes, taskRes] = await Promise.all([
        fetch(buildApiUrl(`/api/appointments/doctor/${doctorId}/patient/${patient.patient_id}/history`), { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(buildApiUrl(`/api/prescriptions/doctor`), { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(buildApiUrl(`/api/therapy/doctor/tasks?patientId=${patient.patient_id}`), { headers: { 'Authorization': `Bearer ${token}` } }),
      ]);
      const [histData, prescData, taskData] = await Promise.all([histRes.json(), prescRes.json(), taskRes.json()]);
      if (histData.success) { setSessions(histData.sessions); setUpcoming(histData.upcoming || []); setCancelled(histData.cancelled || []); }
      if (prescData.success) setPrescriptions(prescData.prescriptions.filter(p => p.patient_id === patient.patient_id));
      if (taskData.success) setTasks(taskData.tasks);
    } catch (e) { console.error(e); }
    finally { setLoadingSessions(false); }
  };

  const closeModal = () => { setSelectedPatient(null); setSessions([]); setUpcoming([]); setCancelled([]); setPrescriptions([]); setTasks([]); };

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
              className="border border-gray-200 rounded-xl p-4 hover:shadow-md hover:border-[#4A7C59] transition-all cursor-pointer group">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#4A7C59] to-[#3d6b4a] rounded-full flex items-center justify-center text-white font-semibold shadow-sm overflow-hidden">
                    {patient.patient_photo ? (
                      <img src={patient.patient_photo} alt={patient.patient_first_name} className="w-full h-full object-cover" />
                    ) : (
                      <>{patient.patient_first_name.charAt(0)}{patient.patient_last_name.charAt(0)}</>
                    )}
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
                      <p className="text-sm font-medium text-[#4A7C59]">{patient.total_sessions} completed</p>
                      {parseInt(patient.upcoming_count) > 0 && (
                        <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-medium">{patient.upcoming_count} upcoming</span>
                      )}
                    </div>
                  </div>
                  <svg className="w-4 h-4 text-gray-300 group-hover:text-[#4A7C59] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        <div className="fixed inset-0 backdrop-blur-md bg-white/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 sticky top-0 bg-white">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-gradient-to-br from-[#4A7C59] to-[#3d6b4a] rounded-full flex items-center justify-center text-white font-bold overflow-hidden">
                  {selectedPatient.patient_photo ? (
                    <img src={selectedPatient.patient_photo} alt={selectedPatient.patient_first_name} className="w-full h-full object-cover" />
                  ) : (
                    <>{selectedPatient.patient_first_name.charAt(0)}{selectedPatient.patient_last_name.charAt(0)}</>
                  )}
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
                  <p className="text-2xl font-bold text-[#4A7C59]">{loadingSessions ? '...' : sessions.length}</p>
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

              {/* Tabs */}
              <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-5">
                {[
                  { key: 'sessions', label: 'Sessions', count: sessions.length },
                  { key: 'prescriptions', label: 'Prescriptions', count: prescriptions.length },
                  { key: 'tasks', label: 'Therapy Tasks', count: tasks.length },
                ].map(tab => (
                  <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${activeTab === tab.key ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                    {tab.label}
                    <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${activeTab === tab.key ? 'bg-[#f0f7f4] text-[#4A7C59]' : 'bg-gray-200 text-gray-500'}`}>{tab.count}</span>
                  </button>
                ))}
              </div>

              {/* Sessions Tab */}
              {activeTab === 'sessions' && (
                <>
                  {!loadingSessions && upcoming.length > 0 && (
                    <div className="mb-5">
                      <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>Upcoming ({upcoming.length})
                      </h4>
                      <div className="space-y-2">
                        {upcoming.map(apt => (
                          <div key={apt.id} className="border border-green-200 bg-green-50 rounded-xl px-4 py-3 flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-gray-900 text-sm">{formatDate(apt.appointment_date)}</p>
                              <p className="text-xs text-gray-500">{formatTime(apt.appointment_time)} • {apt.duration_minutes} min • <span className="capitalize">{apt.appointment_type}</span></p>
                            </div>
                            <div className="text-right">
                              <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">{apt.status}</span>
                              <p className="text-sm font-semibold text-[#4A7C59] mt-1">Rs {apt.session_fee}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <h4 className="font-semibold text-gray-800 mb-4">Session History</h4>
                  {loadingSessions ? (
                    <div className="text-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4A7C59] mx-auto"></div></div>
                  ) : sessions.length === 0 ? (
                    <p className="text-center text-gray-400 py-8">No completed sessions found</p>
                  ) : (
                    <div className="space-y-4">
                      {sessions.map((session, idx) => (
                        <div key={session.id} className="border border-gray-200 rounded-xl overflow-hidden">
                          <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="w-6 h-6 bg-[#4A7C59] rounded-full flex items-center justify-center text-white text-xs font-bold">{idx + 1}</span>
                              <div>
                                <p className="font-semibold text-gray-900 text-sm">{formatDate(session.appointment_date)}</p>
                                <p className="text-xs text-gray-500">{formatTime(session.appointment_time)} • {session.duration_minutes} min • <span className="capitalize">{session.appointment_type}</span></p>
                              </div>
                            </div>
                            <span className="text-sm font-semibold text-[#4A7C59]">Rs {session.session_fee}</span>
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
                                <p className="text-xs font-semibold text-[#4A7C59] uppercase tracking-wide">Doctor's Notes</p>
                                <p className="text-sm text-gray-700 mt-1 bg-[#F5F5F0] rounded-lg p-3 whitespace-pre-wrap">{session.session_notes}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* Prescriptions Tab */}
              {activeTab === 'prescriptions' && (
                <div>
                  {prescriptions.length === 0 ? (
                    <div className="text-center py-10 text-gray-400">
                      <p className="text-sm">No prescriptions issued yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {prescriptions.map(presc => (
                        <div key={presc.id} className="border border-gray-200 rounded-xl overflow-hidden">
                          <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
                            <div>
                              <p className="text-sm font-semibold text-gray-800">
                                {new Date(presc.appointment_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </p>
                              {presc.diagnosis && <p className="text-xs text-blue-600 mt-0.5">{presc.diagnosis}</p>}
                            </div>
                            {presc.follow_up_date && (
                              <span className="text-xs bg-amber-50 text-amber-600 px-2 py-1 rounded-full">
                                Follow-up: {new Date(presc.follow_up_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </span>
                            )}
                          </div>
                          <div className="px-4 py-3 space-y-2">
                            {presc.medications.map((med, i) => (
                              <div key={i} className="flex items-start justify-between bg-gray-50 rounded-lg p-2.5">
                                <div>
                                  <p className="text-sm font-semibold text-gray-800">{med.medicine_name}</p>
                                  <p className="text-xs text-gray-500">{med.frequency} · {med.duration}</p>
                                  {med.instructions && <p className="text-xs text-gray-400 italic">{med.instructions}</p>}
                                </div>
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">{med.dosage}</span>
                              </div>
                            ))}
                            {presc.lifestyle_advice && (
                              <div className="bg-green-50 rounded-lg p-2.5">
                                <p className="text-xs font-semibold text-gray-500 mb-1">🌿 Lifestyle</p>
                                <p className="text-xs text-green-800">{presc.lifestyle_advice}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Therapy Tasks Tab */}
              {activeTab === 'tasks' && (
                <div>
                  {tasks.length === 0 ? (
                    <div className="text-center py-10 text-gray-400">
                      <p className="text-sm">No therapy tasks assigned yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {tasks.map(task => (
                        <div key={task.id} className="border border-gray-200 rounded-xl p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <p className="text-sm font-semibold text-gray-800">{task.title}</p>
                                <span className="text-xs bg-[#f0f7f4] text-[#4A7C59] px-2 py-0.5 rounded-full">{task.type}</span>
                              </div>
                              {task.description && <p className="text-xs text-gray-500 mb-1">{task.description}</p>}
                              <p className="text-xs text-gray-400">
                                Due: {new Date(task.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · {task.frequency}
                              </p>
                              {task.difficulty && (
                                <p className={`text-xs font-medium mt-1 ${task.difficulty === 'Easy' ? 'text-green-600' : task.difficulty === 'Medium' ? 'text-yellow-600' : 'text-red-600'}`}>
                                  Feedback: {task.difficulty}
                                </p>
                              )}
                            </div>
                            <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 ${task.status === 'completed' ? 'bg-green-100 text-green-700' : task.status === 'missed' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                              {task.status}
                            </span>
                          </div>
                          {task.feedback_comment && (
                            <div className="mt-2 bg-gray-50 rounded-lg p-2.5">
                              <p className="text-xs text-gray-600 italic">"{task.feedback_comment}"</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-100">
              <button onClick={closeModal}
                className="w-full py-2.5 bg-[#4A7C59] hover:bg-[#3d6b4a] text-white rounded-xl font-medium text-sm transition-colors">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorPatients;
