import React, { useState, useEffect } from 'react';
import { buildApiUrl } from '../../config/api.js';

const AdminCrisisAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all | pending | responded

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const res = await fetch(buildApiUrl('/api/crisis-messages/admin/all'));
      const data = await res.json();
      if (data.success) setAlerts(data.alerts);
    } catch (e) {
      console.error('Failed to fetch crisis alerts:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (ts) => new Date(ts).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true,
  });

  const filtered = alerts.filter(a => {
    if (filter === 'pending') return !a.doctor_responded;
    if (filter === 'responded') return a.doctor_responded;
    return true;
  });

  const pendingCount = alerts.filter(a => !a.doctor_responded).length;

  // Parse doctor info from message
  const parseDoctorFromMessage = (msg) => {
    const match = msg?.match(/Assigned Doctor:\s*([^|]+)/);
    return match ? match[1].trim() : 'Unknown';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Crisis Alert Monitor</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            System-level monitoring only — patient details are private
          </p>
        </div>
        <div className="flex items-center gap-3">
          {pendingCount > 0 && (
            <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
              {pendingCount} pending response
            </span>
          )}
          <button onClick={fetchAlerts}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Alerts', value: alerts.length, color: 'bg-gray-50', text: 'text-gray-900' },
          { label: 'Doctor Responded', value: alerts.filter(a => a.doctor_responded).length, color: 'bg-green-50', text: 'text-green-700' },
          { label: 'Pending Response', value: pendingCount, color: 'bg-red-50', text: 'text-red-700' },
        ].map(s => (
          <div key={s.label} className={`${s.color} rounded-xl p-5 border border-gray-100`}>
            <p className={`text-2xl font-bold ${s.text}`}>{s.value}</p>
            <p className="text-sm text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {['all', 'pending', 'responded'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${filter === f ? 'bg-[#4A7C59] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
            {f === 'all' ? 'All' : f === 'pending' ? 'Pending Response' : 'Doctor Responded'}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#4A7C59]" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-700 font-semibold">No crisis alerts</p>
          <p className="text-gray-400 text-sm mt-1">All clear — no crisis events recorded.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {['Patient ID', 'Risk Level', 'Assigned Doctor', 'Doctor Responded', 'Response Time', 'Alert Time'].map(h => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(alert => (
                <tr key={alert.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-gray-900">#{alert.patient_id}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      alert.risk_level === 'high' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {alert.risk_level || 'high'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-700">{parseDoctorFromMessage(alert.message)}</span>
                  </td>
                  <td className="px-6 py-4">
                    {alert.doctor_responded ? (
                      <span className="flex items-center gap-1.5 text-green-600 text-sm font-medium">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Yes
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-orange-500 text-sm font-medium">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs text-gray-400">
                      {alert.doctor_responded_at ? formatTime(alert.doctor_responded_at) : '—'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs text-gray-400">{formatTime(alert.created_at)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminCrisisAlerts;
