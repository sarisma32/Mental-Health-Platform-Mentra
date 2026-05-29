import React, { useState, useEffect } from 'react';
import { buildApiUrl, API_ENDPOINTS } from '../../config/api.js';

const statusConfig = {
  pending:      { label: 'Pending',      color: 'bg-yellow-100 text-yellow-800' },
  under_review: { label: 'Under Review', color: 'bg-blue-100 text-blue-800' },
  resolved:     { label: 'Resolved',     color: 'bg-green-100 text-green-800' },
  rejected:     { label: 'Rejected',     color: 'bg-red-100 text-red-800' },
};

const DoctorDisputes = ({ doctorId }) => {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (doctorId) fetchDisputes();
  }, [doctorId]);

  const fetchDisputes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch(buildApiUrl(`${API_ENDPOINTS.DOCTOR_DISPUTES}/${doctorId}`), {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setDisputes(data.disputes);
    } catch (err) {
      console.error('Error fetching disputes:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Disputes</h3>
          <p className="text-sm text-gray-500 mt-0.5">Patient complaints related to your appointments</p>
        </div>
        <button onClick={fetchDisputes} className="text-sm text-[#4A7C59] hover:text-[#3d6b4a] font-medium">Refresh</button>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4A7C59] mx-auto"></div>
        </div>
      ) : disputes.length === 0 ? (
        <div className="text-center py-12">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-gray-500">No disputes found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {disputes.map(dispute => {
            const sc = statusConfig[dispute.status] || statusConfig.pending;
            return (
              <div key={dispute.id} className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-xs text-gray-400 font-mono mb-1">{dispute.id}</p>
                      <p className="font-semibold text-gray-900">{dispute.issue_type}</p>
                      <p className="text-sm text-gray-500">Patient: {dispute.patient_name}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${sc.color}`}>{sc.label}</span>
                  </div>
                  <p className="text-sm text-gray-700 mt-2">{dispute.description}</p>
                  <div className="flex justify-between items-center mt-3 text-xs text-gray-400">
                    <span>Raised on {formatDate(dispute.created_at)}</span>
                    {dispute.confirmation_number && <span>Token #{dispute.confirmation_number} — {formatDate(dispute.appointment_date)}</span>}
                  </div>
                </div>

                {/* Admin response */}
                {dispute.admin_response && (
                  <div className={`px-4 py-3 border-t ${dispute.status === 'resolved' ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                    <div className="flex items-start gap-2">
                      <svg className={`w-4 h-4 mt-0.5 flex-shrink-0 ${dispute.status === 'resolved' ? 'text-green-600' : 'text-red-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {dispute.status === 'resolved'
                          ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        }
                      </svg>
                      <div>
                        <p className={`text-xs font-semibold ${dispute.status === 'resolved' ? 'text-green-800' : 'text-red-700'}`}>
                          Admin Response
                        </p>
                        <p className={`text-xs mt-0.5 ${dispute.status === 'resolved' ? 'text-green-700' : 'text-red-600'}`}>{dispute.admin_response}</p>
                        {dispute.responded_at && (
                          <p className="text-xs text-gray-400 mt-1">Decision on {formatDate(dispute.responded_at)}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {dispute.status === 'under_review' && !dispute.admin_response && (
                  <div className="px-4 py-3 border-t bg-blue-50 border-blue-100">
                    <p className="text-xs text-blue-700">This dispute is currently under review by the admin team.</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DoctorDisputes;
