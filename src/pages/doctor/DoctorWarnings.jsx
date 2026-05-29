import React, { useState, useEffect } from 'react';
import { buildApiUrl, API_ENDPOINTS } from '../../config/api.js';

const DoctorWarnings = ({ doctorId }) => {
  const [warnings, setWarnings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (doctorId) fetchWarnings();
  }, [doctorId]);

  const fetchWarnings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch(buildApiUrl(`${API_ENDPOINTS.DOCTOR_WARNINGS}/${doctorId}/warnings`), {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setWarnings(data.warnings);
    } catch (err) {
      console.error('Error fetching warnings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (warningId) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(buildApiUrl(`${API_ENDPOINTS.MARK_WARNING_READ}/${warningId}/read`), {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      setWarnings(prev => prev.map(w => w.id === warningId ? { ...w, is_read: true } : w));
    } catch (err) {
      console.error('Error marking warning as read:', err);
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  const unreadCount = warnings.filter(w => !w.is_read).length;

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            Admin Warnings
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{unreadCount}</span>
            )}
          </h3>
          <p className="text-sm text-gray-500 mt-0.5">Warning messages sent by the admin regarding disputes</p>
        </div>
        <button onClick={fetchWarnings} className="text-sm text-[#4A7C59] hover:text-[#3d6b4a] font-medium">Refresh</button>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4A7C59] mx-auto"></div>
        </div>
      ) : warnings.length === 0 ? (
        <div className="text-center py-12">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-gray-500">No warnings received.</p>
          <p className="text-sm text-gray-400 mt-1">You're in good standing with the admin team.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {warnings.map(warning => (
            <div
              key={warning.id}
              className={`border rounded-xl overflow-hidden transition-colors ${
                warning.is_read ? 'border-gray-200 bg-white' : 'border-orange-200 bg-orange-50'
              }`}
            >
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                      warning.is_read ? 'bg-gray-100' : 'bg-orange-100'
                    }`}>
                      <svg className={`w-5 h-5 ${warning.is_read ? 'text-gray-400' : 'text-orange-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className={`text-sm font-semibold ${warning.is_read ? 'text-gray-700' : 'text-orange-800'}`}>
                          Warning from Admin
                        </p>
                        {!warning.is_read && (
                          <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                        )}
                      </div>
                      <p className={`text-sm ${warning.is_read ? 'text-gray-600' : 'text-orange-700'}`}>
                        {warning.message}
                      </p>
                      {warning.dispute_issue && (
                        <p className="text-xs text-gray-400 mt-1.5">
                          Related dispute: {warning.dispute_issue}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">{formatDate(warning.created_at)}</p>
                    </div>
                  </div>
                  {!warning.is_read && (
                    <button
                      onClick={() => handleMarkRead(warning.id)}
                      className="text-xs text-orange-600 hover:text-orange-800 font-medium border border-orange-300 px-2 py-1 rounded-lg flex-shrink-0"
                    >
                      Mark read
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DoctorWarnings;
