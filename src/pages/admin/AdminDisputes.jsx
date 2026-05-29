import React, { useState, useEffect } from 'react';
import { buildApiUrl, API_ENDPOINTS } from '../../config/api.js';

const statusConfig = {
  pending:      { label: 'Pending',      color: 'bg-yellow-100 text-yellow-800' },
  under_review: { label: 'Under Review', color: 'bg-blue-100 text-blue-800' },
  resolved:     { label: 'Resolved',     color: 'bg-green-100 text-green-800' },
  rejected:     { label: 'Rejected',     color: 'bg-red-100 text-red-800' },
};

const AdminDisputes = () => {
  const [disputes, setDisputes] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, under_review: 0, resolved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [responseText, setResponseText] = useState('');
  const [doctorWarning, setDoctorWarning] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => { fetchDisputes(); }, []);

  const fetchDisputes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin_token');
      const res = await fetch(buildApiUrl(API_ENDPOINTS.ADMIN_DISPUTES), {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setDisputes(data.disputes);
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Error fetching disputes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDispute = async () => {
    if (!newStatus) return;
    setUpdating(true);
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch(buildApiUrl(`${API_ENDPOINTS.ADMIN_UPDATE_DISPUTE}/${selectedDispute.id}/status`), {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, adminResponse: responseText, doctorWarning }),
      });
      const data = await res.json();
      if (data.success) {
        setSelectedDispute(null);
        setResponseText('');
        setDoctorWarning('');
        setNewStatus('');
        fetchDisputes();
      } else {
        alert(data.message || 'Failed to update dispute');
      }
    } catch {
      alert('Network error');
    } finally {
      setUpdating(false);
    }
  };

  const openDispute = (dispute) => {
    setSelectedDispute(dispute);
    setNewStatus(dispute.status);
    setResponseText(dispute.admin_response || '');
    setDoctorWarning(dispute.doctor_warning || '');
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  const filtered = disputes.filter(d => {
    const matchStatus = filterStatus === 'all' || d.status === filterStatus;
    const q = searchTerm.toLowerCase();
    const matchSearch = !q || d.patient_name?.toLowerCase().includes(q) || d.doctor_name?.toLowerCase().includes(q) || String(d.id).toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Disputes</h2>
        <p className="text-sm text-gray-500 mt-1">Manage patient and doctor disputes</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Total Disputes', value: stats.total, color: 'text-gray-700', icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
          { label: 'Pending', value: stats.pending, color: 'text-yellow-600', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
          { label: 'Under Review', value: stats.under_review, color: 'text-blue-600', icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
          { label: 'Resolved', value: stats.resolved, color: 'text-green-600', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
          { label: 'Rejected', value: stats.rejected, color: 'text-red-600', icon: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">{s.label}</p>
                <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
              </div>
              <svg className={`w-8 h-8 ${s.color} opacity-60`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={s.icon} />
              </svg>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Search by patient, doctor, or dispute ID..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#4A7C59] focus:border-transparent"
        />
        <div className="flex gap-2 flex-wrap">
          {['all', 'pending', 'under_review', 'resolved', 'rejected'].map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${filterStatus === s ? 'bg-[#4A7C59] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {s === 'all' ? 'All' : s === 'under_review' ? 'Under Review' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4A7C59] mx-auto"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No disputes found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Dispute ID', 'Patient', 'Doctor', 'Issue', 'Status', 'Date', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(d => {
                  const sc = statusConfig[d.status] || statusConfig.pending;
                  return (
                    <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">{String(d.id).slice(0, 18)}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{d.patient_name}</td>
                      <td className="px-4 py-3 text-gray-700">{d.doctor_name}</td>
                      <td className="px-4 py-3 text-gray-700 max-w-[160px] truncate">{d.issue_type}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${sc.color}`}>{sc.label}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{formatDate(d.created_at)}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => openDispute(d)} className="text-[#4A7C59] hover:text-[#3d6b4a] font-medium text-xs">View</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail modal */}
      {selectedDispute && (
        <div className="fixed inset-0 backdrop-blur-md bg-white/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center px-6 py-5 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Dispute Details</h3>
                <p className="text-xs text-gray-400 font-mono mt-0.5">{selectedDispute.id}</p>
              </div>
              <button onClick={() => setSelectedDispute(null)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Parties */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-1">Patient</p>
                  <p className="font-semibold text-gray-900 text-sm">{selectedDispute.patient_name}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-1">Doctor</p>
                  <p className="font-semibold text-gray-900 text-sm">{selectedDispute.doctor_name}</p>
                  <p className="text-xs text-gray-500">{selectedDispute.doctor_specialization}</p>
                </div>
              </div>

              {/* Appointment info */}
              <div className="bg-gray-50 rounded-xl p-3 text-sm">
                <p className="text-xs text-gray-400 mb-1">Appointment</p>
                <p className="text-gray-700">{formatDate(selectedDispute.appointment_date)}</p>
                {selectedDispute.confirmation_number && <p className="text-gray-500 text-xs">Token #{selectedDispute.confirmation_number}</p>}
              </div>

              {/* Issue */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Issue Type</p>
                <p className="text-sm font-medium text-gray-900">{selectedDispute.issue_type}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Description</p>
                <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{selectedDispute.description}</p>
              </div>

              {/* Update status */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Update Status</label>
                <select
                  value={newStatus}
                  onChange={e => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#4A7C59] focus:border-transparent"
                >
                  <option value="pending">Pending</option>
                  <option value="under_review">Under Review</option>
                  <option value="resolved">Resolved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              {/* Response to patient */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Response to Patient
                </label>
                <textarea
                  value={responseText}
                  onChange={e => setResponseText(e.target.value)}
                  rows={3}
                  placeholder="Write a resolution message to send to the patient..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#4A7C59] focus:border-transparent resize-none"
                />
              </div>

              {/* Warning to doctor */}
              <div>
                <label className="block text-xs font-semibold text-orange-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Warning to Doctor (optional)
                </label>
                <textarea
                  value={doctorWarning}
                  onChange={e => setDoctorWarning(e.target.value)}
                  rows={2}
                  placeholder="Send a warning message to the doctor regarding this dispute..."
                  className="w-full px-3 py-2 border border-orange-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-400 focus:border-transparent resize-none bg-orange-50"
                />
                <p className="text-xs text-gray-400 mt-1">This message will be sent as a notification to the doctor only.</p>
              </div>
            </div>

            <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
              <button onClick={() => setSelectedDispute(null)} className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button
                onClick={handleUpdateDispute}
                disabled={updating}
                className="flex-1 px-4 py-3 bg-[#4A7C59] hover:bg-[#3d6b4a] text-white rounded-xl text-sm font-semibold disabled:opacity-50 transition-colors"
              >
                {updating ? 'Saving...' : 'Save Decision'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDisputes;
