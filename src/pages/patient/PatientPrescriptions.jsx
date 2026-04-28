import React, { useState, useEffect } from 'react';
import { buildApiUrl } from '../../config/api.js';

const PatientPrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const res = await fetch(buildApiUrl('/api/prescriptions/patient'), {
          headers: { Authorization: 'Bearer ' + token },
        });
        const data = await res.json();
        if (data.success) setPrescriptions(data.prescriptions);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetch_();
  }, []);

  if (loading) return (
    <div className="flex justify-center py-16">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4A7C59]" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800">My Prescriptions</h2>
        <p className="text-sm text-gray-400 mt-0.5">Prescriptions from your completed sessions</p>
      </div>

      {prescriptions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 bg-[#f0f7f4] rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-[#4A7C59]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-gray-500 font-medium">No prescriptions yet</p>
          <p className="text-sm text-gray-400 mt-1">Prescriptions will appear here after your sessions</p>
        </div>
      ) : (
        <div className="space-y-4">
          {prescriptions.map(presc => (
            <div key={presc.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Header */}
              <div
                className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-gray-50/50 transition-colors"
                onClick={() => setExpanded(expanded === presc.id ? null : presc.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#4A7C59] to-[#3d6b4a] rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {presc.doctor_name?.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Dr. {presc.doctor_name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {presc.specialization} ·{' '}
                      {new Date(presc.appointment_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs bg-[#f0f7f4] text-[#4A7C59] px-2.5 py-1 rounded-full font-medium">
                    {presc.medications.length} medicine{presc.medications.length !== 1 ? 's' : ''}
                  </span>
                  <svg className={`w-4 h-4 text-gray-400 transition-transform ${expanded === presc.id ? 'rotate-180' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Expanded content */}
              {expanded === presc.id && (
                <div className="px-6 pb-5 border-t border-gray-50 pt-4 space-y-5">

                  {/* Diagnosis */}
                  {presc.diagnosis && (
                    <div>
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">🩺 Diagnosis</h4>
                      <div className="bg-blue-50 rounded-xl p-4">
                        <p className="text-sm text-blue-800 leading-relaxed">{presc.diagnosis}</p>
                      </div>
                    </div>
                  )}

                  {/* Medications */}
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">💊 Medications</h4>
                    <div className="space-y-3">
                      {presc.medications.map((med, idx) => (
                        <div key={idx} className="bg-gray-50 rounded-xl p-4">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-semibold text-gray-800">{med.medicine_name}</p>
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium flex-shrink-0">{med.dosage}</span>
                          </div>
                          <div className="flex flex-wrap gap-3 mt-2">
                            <span className="flex items-center gap-1 text-xs text-gray-500">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                              {med.frequency}
                            </span>
                            <span className="flex items-center gap-1 text-xs text-gray-500">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                              {med.duration}
                            </span>
                          </div>
                          {med.instructions && (
                            <p className="text-xs text-gray-500 mt-2 italic">📝 {med.instructions}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Therapy Advice */}
                  {presc.therapy_advice && (
                    <div>
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">🧘 Therapy Recommendation</h4>
                      <div className="bg-teal-50 rounded-xl p-4">
                        <p className="text-sm text-teal-800 leading-relaxed">{presc.therapy_advice}</p>
                      </div>
                    </div>
                  )}

                  {/* Lifestyle Advice */}
                  {presc.lifestyle_advice && (
                    <div>
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">🌿 Lifestyle Suggestions</h4>
                      <div className="bg-green-50 rounded-xl p-4">
                        <p className="text-sm text-green-800 leading-relaxed">{presc.lifestyle_advice}</p>
                      </div>
                    </div>
                  )}

                  <p className="text-xs text-gray-400 text-right">
                    Issued: {new Date(presc.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    {presc.follow_up_date && (
                      <span className="ml-3 text-[#4A7C59] font-medium">
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
    </div>
  );
};

export default PatientPrescriptions;
