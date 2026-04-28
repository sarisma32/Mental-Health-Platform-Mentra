import React, { useState, useEffect } from 'react';
import { buildApiUrl } from '../../config/api.js';
import PrescriptionModal from './PrescriptionModal.jsx';

const DoctorPrescriptions = ({ appointments = [] }) => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [editApt, setEditApt] = useState(null);
  const [search, setSearch] = useState('');
  const [filterPatient, setFilterPatient] = useState('');

  // For new prescription flow
  const [showPatientPicker, setShowPatientPicker] = useState(false);
  const [pickedPatientId, setPickedPatientId] = useState('');
  const [pickedAptId, setPickedAptId] = useState('');

  const token = localStorage.getItem('token');

  // Unique patients from completed appointments
  const completedApts = appointments.filter(a => a.status === 'completed');
  const uniquePatients = Object.values(
    completedApts.reduce((acc, a) => {
      if (!acc[a.patient_id]) acc[a.patient_id] = { id: a.patient_id, name: `${a.patient_first_name} ${a.patient_last_name}` };
      return acc;
    }, {})
  );

  // Completed appointments for the picked patient
  const aptsForPatient = completedApts.filter(a => String(a.patient_id) === String(pickedPatientId));

  const fetchPrescriptions = async () => {
    setLoading(true);
    try {
      const res = await fetch(buildApiUrl('/api/prescriptions/doctor'), {
        headers: { Authorization: 'Bearer ' + token },
      });
      const data = await res.json();
      if (data.success) setPrescriptions(data.prescriptions);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPrescriptions(); }, []);

  const findApt = (presc) => {
    const apt = appointments.find(a => a.id === presc.appointment_id);
    if (apt) return apt;
    return {
      id: presc.appointment_id,
      patient_id: presc.patient_id,
      patient_first_name: presc.patient_name?.split(' ')[0] || '',
      patient_last_name: presc.patient_name?.split(' ').slice(1).join(' ') || '',
      appointment_date: presc.appointment_date,
      status: 'completed',
    };
  };

  const handleOpenNew = () => {
    setPickedPatientId('');
    setPickedAptId('');
    setShowPatientPicker(true);
  };

  const handleProceed = () => {
    if (!pickedPatientId || !pickedAptId) return;
    const apt = completedApts.find(a => String(a.id) === String(pickedAptId));
    if (apt) { setEditApt(apt); setShowPatientPicker(false); }
  };

  const filtered = prescriptions.filter(p => {
    const matchSearch = !search || p.patient_name?.toLowerCase().includes(search.toLowerCase()) || p.diagnosis?.toLowerCase().includes(search.toLowerCase());
    const matchPatient = !filterPatient || String(p.patient_id) === String(filterPatient);
    return matchSearch && matchPatient;
  });

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Prescriptions</h2>
          <p className="text-sm text-gray-400 mt-0.5">All prescriptions you have issued to patients</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search patient or diagnosis..."
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#4A7C59] bg-white w-56" />
          </div>
          <button onClick={handleOpenNew}
            className="flex items-center gap-2 bg-[#4A7C59] hover:bg-[#3d6b4a] text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Add Prescription
          </button>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3">
        <select value={filterPatient} onChange={e => setFilterPatient(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#4A7C59] bg-white">
          <option value="">All Patients</option>
          {uniquePatients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <span className="text-sm text-gray-400">{filtered.length} prescription{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Prescriptions', value: prescriptions.length, bg: 'bg-blue-50', color: 'text-blue-600' },
          { label: 'Unique Patients', value: new Set(prescriptions.map(p => p.patient_id)).size, bg: 'bg-[#f0f7f4]', color: 'text-[#4A7C59]' },
          { label: 'This Month', value: prescriptions.filter(p => new Date(p.created_at).getMonth() === new Date().getMonth()).length, bg: 'bg-purple-50', color: 'text-purple-600' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-4 text-center`}>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4A7C59]" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 bg-[#f0f7f4] rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-[#4A7C59]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-gray-500 font-medium">{search ? 'No results found' : 'No prescriptions yet'}</p>
          <p className="text-sm text-gray-400 mt-1">Prescriptions appear here after completing sessions</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(presc => (
            <div key={presc.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

              {/* Row */}
              <div className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-gray-50/50 transition-colors"
                onClick={() => setExpanded(expanded === presc.id ? null : presc.id)}>
                <div className="w-10 h-10 bg-gradient-to-br from-[#4A7C59] to-[#3d6b4a] rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {presc.patient_name?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800">{presc.patient_name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(presc.appointment_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    {presc.diagnosis && <span className="ml-2 text-gray-500">· {presc.diagnosis.slice(0, 40)}{presc.diagnosis.length > 40 ? '...' : ''}</span>}
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-xs bg-[#f0f7f4] text-[#4A7C59] px-2.5 py-1 rounded-full font-medium">
                    {presc.medications.length} med{presc.medications.length !== 1 ? 's' : ''}
                  </span>
                  {presc.follow_up_date && (
                    <span className="text-xs bg-amber-50 text-amber-600 px-2.5 py-1 rounded-full font-medium">
                      Follow-up: {new Date(presc.follow_up_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  )}
                  <button
                    onClick={e => { e.stopPropagation(); setEditApt(findApt(presc)); }}
                    className="text-xs text-[#4A7C59] hover:text-[#3d6b4a] border border-[#dce8e0] hover:border-[#4A7C59] px-3 py-1.5 rounded-lg transition-all font-medium"
                  >
                    Edit
                  </button>
                  <svg className={`w-4 h-4 text-gray-400 transition-transform ${expanded === presc.id ? 'rotate-180' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Expanded */}
              {expanded === presc.id && (
                <div className="px-5 pb-5 border-t border-gray-50 pt-4 space-y-4">

                  {presc.diagnosis && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">🩺 Diagnosis</p>
                      <div className="bg-blue-50 rounded-xl p-3">
                        <p className="text-sm text-blue-800">{presc.diagnosis}</p>
                      </div>
                    </div>
                  )}

                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">💊 Medications</p>
                    <div className="space-y-2">
                      {presc.medications.map((med, idx) => (
                        <div key={idx} className="bg-gray-50 rounded-xl p-3 flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-800">{med.medicine_name}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{med.frequency} · {med.duration}</p>
                            {med.instructions && <p className="text-xs text-gray-400 mt-0.5 italic">{med.instructions}</p>}
                          </div>
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium flex-shrink-0">{med.dosage}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {presc.lifestyle_advice && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">🌿 Lifestyle Suggestions</p>
                      <div className="bg-green-50 rounded-xl p-3">
                        <p className="text-sm text-green-800">{presc.lifestyle_advice}</p>
                      </div>
                    </div>
                  )}

                  <p className="text-xs text-gray-400">
                    Issued: {new Date(presc.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    {presc.follow_up_date && (
                      <span className="ml-3 text-amber-600 font-medium">
                        📅 Follow-up: {new Date(presc.follow_up_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    )}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Patient Picker Modal */}
      {showPatientPicker && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-base font-semibold text-gray-800">New Prescription</h3>
              <button onClick={() => setShowPatientPicker(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Select Patient *</label>
                <select value={pickedPatientId} onChange={e => { setPickedPatientId(e.target.value); setPickedAptId(''); }}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#4A7C59] bg-gray-50">
                  <option value="">Select patient...</option>
                  {uniquePatients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>

              {pickedPatientId && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Select Completed Session *</label>
                  <select value={pickedAptId} onChange={e => setPickedAptId(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#4A7C59] bg-gray-50">
                    <option value="">Select session...</option>
                    {aptsForPatient.map(a => (
                      <option key={a.id} value={a.id}>
                        {new Date(a.appointment_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} — {a.appointment_type}
                      </option>
                    ))}
                  </select>
                  {aptsForPatient.length === 0 && (
                    <p className="text-xs text-red-500 mt-1">No completed sessions found for this patient.</p>
                  )}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowPatientPicker(false)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button onClick={handleProceed} disabled={!pickedPatientId || !pickedAptId}
                  className="flex-1 py-2.5 bg-[#4A7C59] hover:bg-[#3d6b4a] text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                  Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit / New Prescription Modal */}
      {editApt && (
        <PrescriptionModal
          appointment={editApt}
          onClose={() => setEditApt(null)}
          onSaved={() => { fetchPrescriptions(); setEditApt(null); }}
        />
      )}
    </div>
  );
};

export default DoctorPrescriptions;
