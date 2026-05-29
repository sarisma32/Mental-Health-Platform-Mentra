import React, { useState, useEffect } from 'react';
import { buildApiUrl } from '../../config/api.js';

const getStatusBadge = (status) => {
  const styles = { confirmed: 'bg-blue-100 text-blue-700', completed: 'bg-green-100 text-green-700', cancelled: 'bg-red-100 text-red-700', scheduled: 'bg-yellow-100 text-yellow-700', no_show: 'bg-gray-100 text-gray-600' };
  const labels = { confirmed: 'Upcoming', scheduled: 'Upcoming', completed: 'Completed', cancelled: 'Cancelled', no_show: 'No Show' };
  return <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status] || 'bg-gray-100 text-gray-600'}`}>{labels[status] || status}</span>;
};

const formatTime = (t) => { if (!t) return ''; const [h, m] = t.split(':'); const hour = parseInt(h); return `${hour % 12 || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`; };

const AdminAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [stats, setStats] = useState({ total: 0, upcoming: 0, completed: 0, cancelled: 0 });
  const [warningSent, setWarningSent] = useState({}); // appointmentId → true

  const [dialog, setDialog] = useState(null);

  const handleWarn = async (appointmentId) => {
    try {
      const res = await fetch(buildApiUrl(`/api/admin/appointments/${appointmentId}/warn`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.success) {
        setWarningSent(prev => ({ ...prev, [appointmentId]: true }));
      } else {
        setDialog(data.message || 'Failed to send warning');
      }
    } catch { setDialog('Failed to send warning'); }
  };

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      let url = buildApiUrl('/api/admin/appointments');
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (search) params.append('search', search);
      if (params.toString()) url += `?${params.toString()}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) { setAppointments(data.appointments); setStats(data.stats); }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchAppointments();
    const interval = setInterval(fetchAppointments, 30000);
    return () => clearInterval(interval);
  }, [statusFilter]);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total, color: 'bg-[#4A7C59]', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /> },
          { label: 'Upcoming', value: stats.upcoming, color: 'bg-blue-500', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /> },
          { label: 'Completed', value: stats.completed, color: 'bg-green-500', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /> },
          { label: 'Cancelled', value: stats.cancelled, color: 'bg-red-400', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /> },
        ].map(card => (
          <div key={card.label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center space-x-4">
            <div className={`${card.color} p-3 rounded-lg`}>
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">{card.icon}</svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{card.value || 0}</p>
              <p className="text-sm text-gray-500">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
          <form onSubmit={e => { e.preventDefault(); fetchAppointments(); }} className="flex gap-2 flex-1 max-w-md">
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search patient or doctor..."
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#4A7C59] focus:border-transparent" />
            </div>
            <button type="submit" className="px-4 py-2 bg-[#4A7C59] text-white rounded-lg text-sm font-medium hover:bg-[#3d6b4a] transition-colors">Search</button>
          </form>
          <div className="flex gap-2 flex-wrap">
            {['all', 'confirmed', 'completed', 'cancelled', 'no_show'].map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${statusFilter === s ? 'bg-[#4A7C59] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {s === 'confirmed' ? 'Upcoming' : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-semibold text-gray-900">All Appointments ({appointments.length})</h3>
          <button onClick={fetchAppointments} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            Refresh
          </button>
        </div>
        {loading ? (
          <div className="text-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#4A7C59] mx-auto mb-3"></div><p className="text-gray-500 text-sm">Loading appointments...</p></div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-16"><p className="text-gray-500 font-medium">No appointments found</p><p className="text-gray-400 text-sm mt-1">Try adjusting your filters</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  {['Patient', 'Doctor', 'Specialty', 'Date & Time', 'Type', 'Status', 'Action'].map(h => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {appointments.map(apt => (
                  <tr key={apt.id} className="hover:bg-[#F5F5F0] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#4A7C59] to-[#3d6b4a] flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
                          {apt.patient_first_name?.charAt(0)}{apt.patient_last_name?.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{apt.patient_first_name} {apt.patient_last_name}</p>
                          <p className="text-xs text-gray-400">{apt.patient_email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4"><p className="text-sm font-medium text-gray-800">Dr. {apt.doctor_name}</p></td>
                    <td className="px-6 py-4"><p className="text-sm text-gray-600">{apt.doctor_specialization}</p></td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-800">{new Date(apt.appointment_date).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' })}</p>
                      <p className="text-xs text-gray-400">{formatTime(apt.appointment_time)}</p>
                    </td>
                    <td className="px-6 py-4"><p className="text-sm text-gray-600 capitalize">{apt.appointment_type}</p></td>
                    <td className="px-6 py-4">{getStatusBadge(apt.status)}</td>
                    <td className="px-6 py-4">
                      {apt.status === 'no_show' && (
                        <button
                          onClick={() => handleWarn(apt.id)}
                          disabled={warningSent[apt.id]}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${warningSent[apt.id] ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-orange-100 hover:bg-orange-200 text-orange-700'}`}>
                          {warningSent[apt.id] ? 'Warned' : 'Warn Patient'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAppointments;

