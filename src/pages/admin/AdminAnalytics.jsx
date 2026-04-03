import React, { useState, useEffect } from 'react';
import { buildApiUrl } from '../../config/api.js';

const AdminAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [regTab, setRegTab] = useState('patients');

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [aptsRes, reviewsRes, doctorsRes, usersRes] = await Promise.all([
          fetch(buildApiUrl('/api/admin/appointments')),
          fetch(buildApiUrl('/api/reviews/admin/all')),
          fetch(buildApiUrl('/api/admin/doctors')),
          fetch(buildApiUrl('/api/admin/users')),
        ]);
        const [apts, reviews, doctors, users] = await Promise.all([
          aptsRes.json(), reviewsRes.json(), doctorsRes.json(), usersRes.json()
        ]);

        const appointments = apts.success ? apts.appointments : [];
        const allReviews = reviews.success ? reviews.reviews : [];
        const allDoctors = doctors.success ? doctors.doctors : [];
        const allUsers = users.success ? users.patients : [];

        const completed = appointments.filter(a => a.status === 'completed').length;
        const upcoming = appointments.filter(a => a.status === 'confirmed' || a.status === 'scheduled').length;
        const cancelled = appointments.filter(a => a.status === 'cancelled').length;
        const totalRevenue = appointments.filter(a => a.status === 'completed').reduce((sum, a) => sum + parseFloat(a.session_fee || 0), 0);

        const approvedDoctors = allDoctors.filter(d => d.approval_status === 'approved').length;
        const pendingDoctors = allDoctors.filter(d => d.approval_status === 'pending').length;
        const rejectedDoctors = allDoctors.filter(d => d.approval_status === 'rejected').length;

        const specMap = {};
        allDoctors.filter(d => d.approval_status === 'approved').forEach(d => {
          specMap[d.specialization] = (specMap[d.specialization] || 0) + 1;
        });
        const topSpecializations = Object.entries(specMap).sort((a, b) => b[1] - a[1]).slice(0, 5);

        const approvedReviews = allReviews.filter(r => r.is_visible).length;
        const pendingReviews = allReviews.filter(r => !r.is_visible).length;
        const avgRating = allReviews.length ? (allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length).toFixed(1) : 0;
        const activeUsers = allUsers.filter(u => u.status === 'active').length;

        const now = new Date();
        const months = [];
        for (let i = 5; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const label = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
          const patients = allUsers.filter(u => { const c = new Date(u.created_at); return c.getMonth() === d.getMonth() && c.getFullYear() === d.getFullYear(); }).length;
          const docs = allDoctors.filter(doc => { const c = new Date(doc.created_at); return c.getMonth() === d.getMonth() && c.getFullYear() === d.getFullYear(); }).length;
          const apts_count = appointments.filter(a => { const c = new Date(a.created_at); return c.getMonth() === d.getMonth() && c.getFullYear() === d.getFullYear(); }).length;
          months.push({ label, patients, doctors: docs, appointments: apts_count });
        }

        setData({
          appointments: { total: appointments.length, completed, upcoming, cancelled },
          revenue: totalRevenue,
          doctors: { total: allDoctors.length, approved: approvedDoctors, pending: pendingDoctors, rejected: rejectedDoctors },
          reviews: { total: allReviews.length, approved: approvedReviews, pending: pendingReviews, avgRating },
          users: { total: allUsers.length, active: activeUsers },
          topSpecializations,
          months,
        });
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchAll();
  }, []);

  if (loading) return (
    <div className="text-center py-20">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#A3B18A] mx-auto mb-3"></div>
      <p className="text-gray-500 text-sm">Loading analytics...</p>
    </div>
  );
  if (!data) return null;

  const maxSpec = Math.max(...data.topSpecializations.map(s => s[1]), 1);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: `Rs ${data.revenue.toLocaleString()}`, sub: 'From completed sessions', color: 'bg-[#A3B18A]', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" /> },
          { label: 'Total Appointments', value: data.appointments.total, sub: `${data.appointments.completed} completed`, color: 'bg-blue-500', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /> },
          { label: 'Active Patients', value: data.users.active, sub: `${data.users.total} total registered`, color: 'bg-purple-500', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /> },
          { label: 'Total Doctors', value: data.doctors.total, sub: `${data.doctors.approved} approved`, color: 'bg-[#8FA076]', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /> },
        ].map(card => (
          <div key={card.label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1">{card.label}</p>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                <p className="text-xs text-gray-400 mt-1">{card.sub}</p>
              </div>
              <div className={`${card.color} p-2.5 rounded-lg flex-shrink-0`}>
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">{card.icon}</svg>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Appointment Breakdown */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-5">Appointment Breakdown</h3>
          <div className="space-y-4">
            {[
              { label: 'Completed', value: data.appointments.completed, total: data.appointments.total, color: 'bg-green-500' },
              { label: 'Upcoming', value: data.appointments.upcoming, total: data.appointments.total, color: 'bg-blue-500' },
              { label: 'Cancelled', value: data.appointments.cancelled, total: data.appointments.total, color: 'bg-red-400' },
            ].map(item => (
              <div key={item.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">{item.label}</span>
                  <span className="font-semibold text-gray-900">{item.value} <span className="text-gray-400 font-normal">/ {item.total}</span></span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className={`${item.color} h-2 rounded-full transition-all`} style={{ width: item.total > 0 ? `${(item.value / item.total) * 100}%` : '0%' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Doctor Status */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-5">Doctor Status</h3>
          <div className="space-y-4">
            {[
              { label: 'Approved', value: data.doctors.approved, total: data.doctors.total, color: 'bg-[#A3B18A]' },
              { label: 'Pending', value: data.doctors.pending, total: data.doctors.total, color: 'bg-yellow-400' },
              { label: 'Rejected', value: data.doctors.rejected, total: data.doctors.total, color: 'bg-red-400' },
            ].map(item => (
              <div key={item.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">{item.label}</span>
                  <span className="font-semibold text-gray-900">{item.value} <span className="text-gray-400 font-normal">/ {item.total}</span></span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className={`${item.color} h-2 rounded-full transition-all`} style={{ width: item.total > 0 ? `${(item.value / item.total) * 100}%` : '0%' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Specializations */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-5">Top Specializations</h3>
          {data.topSpecializations.length === 0 ? <p className="text-gray-400 text-sm">No data yet</p> : (
            <div className="space-y-3">
              {data.topSpecializations.map(([name, count]) => (
                <div key={name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700 truncate mr-2">{name}</span>
                    <span className="font-semibold text-gray-900 flex-shrink-0">{count} doctor{count !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-[#A3B18A] h-2 rounded-full" style={{ width: `${(count / maxSpec) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Review Stats */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-5">Review Overview</h3>
          <div className="grid grid-cols-3 gap-4 mb-5">
            {[{ label: 'Total', value: data.reviews.total, color: 'text-gray-900' }, { label: 'Approved', value: data.reviews.approved, color: 'text-green-600' }, { label: 'Pending', value: data.reviews.pending, color: 'text-yellow-600' }].map(item => (
              <div key={item.label} className="text-center bg-gray-50 rounded-xl p-3">
                <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
                <p className="text-xs text-gray-500 mt-1">{item.label}</p>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-2 bg-yellow-50 rounded-xl p-4">
            <span className="text-yellow-400 text-2xl">★</span>
            <span className="text-2xl font-bold text-gray-900">{data.reviews.avgRating}</span>
            <span className="text-sm text-gray-500">average rating</span>
          </div>
        </div>
      </div>

      {/* Appointment Trends */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <div><h3 className="font-semibold text-gray-800">Appointment Trends</h3><p className="text-xs text-gray-400 mt-0.5">Last 6 months</p></div>
          <div className="text-right"><p className="text-2xl font-bold text-gray-900">{data.appointments.total}</p><p className="text-xs text-gray-400">total appointments</p></div>
        </div>
        {(() => {
          const pts = data.months.map(m => m.appointments);
          const maxVal = Math.max(...pts, 1);
          const W = 600; const H = 160; const PAD = 8;
          const xStep = (W - PAD * 2) / (pts.length - 1);
          const xs = pts.map((_, i) => PAD + i * xStep);
          const ys = pts.map(p => H - PAD - ((p / maxVal) * (H - PAD * 2)));
          const smooth = (points) => {
            if (points.length < 2) return '';
            let d = `M${points[0][0]},${points[0][1]}`;
            for (let i = 1; i < points.length; i++) {
              const [x0, y0] = points[i - 1]; const [x1, y1] = points[i]; const cpx = (x0 + x1) / 2;
              d += ` C${cpx},${y0} ${cpx},${y1} ${x1},${y1}`;
            }
            return d;
          };
          const coords = xs.map((x, i) => [x, ys[i]]);
          const linePath = smooth(coords);
          const areaPath = linePath ? `${linePath} L${xs[xs.length-1]},${H} L${xs[0]},${H} Z` : '';
          const yTicks = [maxVal, Math.round(maxVal * 0.5), 0];
          return (
            <div className="flex gap-4 mt-4">
              <div className="flex flex-col justify-between text-xs text-gray-300 text-right pb-6" style={{minWidth:'24px', height:`${H}px`}}>{yTicks.map(v => <span key={v}>{v}</span>)}</div>
              <div className="flex-1 min-w-0">
                <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{height:`${H}px`}} preserveAspectRatio="none">
                  <defs><linearGradient id="aptAreaGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#A3B18A" stopOpacity="0.25"/><stop offset="100%" stopColor="#A3B18A" stopOpacity="0"/></linearGradient></defs>
                  {yTicks.map((v, i) => { const y = H - PAD - ((v / maxVal) * (H - PAD * 2)); return <line key={i} x1={PAD} y1={y} x2={W - PAD} y2={y} stroke="#f3f4f6" strokeWidth="1" strokeDasharray="4,4"/>; })}
                  {areaPath && <path d={areaPath} fill="url(#aptAreaGrad)"/>}
                  {linePath && <path d={linePath} fill="none" stroke="#A3B18A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>}
                  {coords.map(([x, y], i) => (<g key={i}><circle cx={x} cy={y} r="5" fill="white" stroke="#A3B18A" strokeWidth="2.5"/>{pts[i] > 0 && <text x={x} y={y - 10} textAnchor="middle" fontSize="10" fill="#6b7280" fontWeight="600">{pts[i]}</text>}</g>))}
                </svg>
                <div className="flex justify-between text-xs text-gray-400 mt-1 px-1">{data.months.map(m => <span key={m.label}>{m.label}</span>)}</div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* New Registrations */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <div><h3 className="font-semibold text-gray-800">New Registrations</h3><p className="text-xs text-gray-400 mt-0.5">Last 6 months</p></div>
          <div className="flex border border-gray-200 rounded-lg overflow-hidden text-xs font-medium">
            {['patients','doctors'].map(tab => (
              <button key={tab} onClick={() => setRegTab(tab)}
                className={`px-4 py-1.5 capitalize transition-colors ${regTab === tab ? 'bg-[#A3B18A] text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
        {(() => {
          const regData = data.months.map(m => ({ label: m.label, count: regTab === 'patients' ? m.patients : m.doctors }));
          const maxVal = Math.max(...regData.map(m => m.count), 1);
          const W = 600; const H = 160; const PAD = 8;
          const barW = (W - PAD * 2) / regData.length;
          const barGap = barW * 0.25;
          const yTicks = [maxVal, Math.round(maxVal * 0.5), 0];
          return (
            <div className="flex gap-4 mt-4">
              <div className="flex flex-col justify-between text-xs text-gray-300 text-right pb-6" style={{minWidth:'24px', height:`${H}px`}}>{yTicks.map(v => <span key={v}>{v}</span>)}</div>
              <div className="flex-1 min-w-0">
                <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{height:`${H}px`}} preserveAspectRatio="none">
                  <defs><linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#A3B18A" stopOpacity="1"/><stop offset="100%" stopColor="#8FA076" stopOpacity="0.8"/></linearGradient></defs>
                  {yTicks.map((v, i) => { const y = H - PAD - ((v / maxVal) * (H - PAD * 2)); return <line key={i} x1={PAD} y1={y} x2={W - PAD} y2={y} stroke="#f3f4f6" strokeWidth="1" strokeDasharray="4,4"/>; })}
                  <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="#e5e7eb" strokeWidth="1"/>
                  {regData.map(({ count }, i) => {
                    const barH = (count / maxVal) * (H - PAD * 2);
                    const x = PAD + i * barW + barGap / 2; const w = barW - barGap; const y = H - PAD - barH;
                    return (<g key={i}>{count > 0 && <rect x={x} y={y} width={w} height={barH} fill="url(#barGrad)" rx="3" ry="3"/>}{count > 0 && <text x={x + w / 2} y={y - 5} textAnchor="middle" fontSize="10" fill="#6b7280" fontWeight="600">{count}</text>}</g>);
                  })}
                </svg>
                <div className="flex text-xs text-gray-400 mt-1">{regData.map(({ label }) => <div key={label} className="flex-1 text-center">{label}</div>)}</div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
};

export default AdminAnalytics;
