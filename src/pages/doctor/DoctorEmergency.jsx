import React, { useState, useEffect } from 'react';
import { buildApiUrl } from '../../config/api.js';

const DoctorEmergency = ({ doctorId }) => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePatientId, setActivePatientId] = useState(null);
  const [customMsg, setCustomMsg] = useState('');
  const [sending, setSending] = useState(false);
  const [sentMessages, setSentMessages] = useState({}); // patientId → array
  const [error, setError] = useState('');

  // Resolve patient ID from alert (metadata or name lookup)
  const resolvePatientId = async (alert, patientsList) => {
    if (alert.metadata?.patientId) return alert.metadata.patientId;
    const patientName = alert.title
      .replace(/^🚨\s*/, '').replace('High-Risk Alert: ', '').replace(' needs support', '').trim();
    const match = patientsList.find(p =>
      `${p.patient_first_name} ${p.patient_last_name}`.toLowerCase() === patientName.toLowerCase()
    );
    return match?.patient_id || null;
  };

  const parseAlert = (msg) => {
    const riskMatch = msg.match(/Risk Level:\s*(\w+)/i);
    const emotionMatch = msg.match(/Emotional Trend:\s*([^\n]+)/i);
    const summaryMatch = msg.match(/Summary:\s*([^\n]+(?:\n(?!The patient)[^\n]+)*)/i);
    return {
      riskLevel: riskMatch?.[1] || 'High',
      emotionTrend: emotionMatch?.[1]?.trim() || 'Distressed',
      summary: summaryMatch?.[1]?.trim() || '',
    };
  };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');

      // Fetch crisis alerts
      const res = await fetch(buildApiUrl(`/api/notifications/doctor/${doctorId}`), {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (!data.success) return;
      const crisisAlerts = data.notifications.filter(n => n.type === 'crisis_alert');
      setAlerts(crisisAlerts);

      // Fetch doctor's patients for name-based lookup
      let patientsList = [];
      try {
        const pRes = await fetch(buildApiUrl(`/api/appointments/doctor/${doctorId}/patients`), {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const pData = await pRes.json();
        if (pData.success) patientsList = pData.patients || [];
      } catch {}

      // Resolve patient IDs and fetch sent messages per patient
      const resolvedMap = {}; // alertId → patientId
      const patientIdSet = new Set();
      await Promise.all(crisisAlerts.map(async (alert) => {
        const pid = await resolvePatientId(alert, patientsList);
        if (pid) { resolvedMap[alert.id] = pid; patientIdSet.add(pid); }
      }));

      // Fetch sent messages and emergency contacts for each unique patient
      const msgMap = {};
      const ecMap = {};
      await Promise.all([...patientIdSet].map(async (pid) => {
        try {
          const mRes = await fetch(buildApiUrl(`/api/crisis-messages/doctor/${doctorId}/patient/${pid}`), {
            headers: { 'Authorization': `Bearer ${token}` },
          });
          const mData = await mRes.json();
          if (mData.success) msgMap[pid] = mData.messages;
        } catch {}
        try {
          const ecRes = await fetch(buildApiUrl(`/api/crisis-messages/emergency-contact/patient/${pid}`), {
            headers: { 'Authorization': `Bearer ${token}` },
          });
          const ecData = await ecRes.json();
          if (ecData.success && ecData.emergencyContact) ecMap[pid] = ecData.emergencyContact;
        } catch {}
      }));

      setSentMessages(msgMap);
      setEmergencyContacts(ecMap);
      setResolvedPatients(resolvedMap);
    } catch (e) {
      console.error('Failed to fetch emergency data:', e);
    } finally {
      setLoading(false);
    }
  };

  const [resolvedPatients, setResolvedPatients] = useState({});
  const [emergencyContacts, setEmergencyContacts] = useState({}); // patientId → {name, phone}

  useEffect(() => {
    if (doctorId) fetchAll();
  }, [doctorId]);

  const markRead = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(buildApiUrl(`/api/notifications/${id}/read`), {
        method: 'PUT', headers: { 'Authorization': `Bearer ${token}` },
      });
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, is_read: true } : a));
    } catch {}
  };

  const sendMessage = async (patientId, messageText) => {
    setError('');
    if (!messageText.trim() || !patientId) return;
    setSending(true);
    try {
      const res = await fetch(buildApiUrl('/api/crisis-messages/send'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doctorId, patientId, message: messageText.trim(), messageType: 'custom' }),
      });
      const data = await res.json();
      if (data.success) {
        const newMsg = { id: Date.now(), message: messageText.trim(), created_at: new Date().toISOString() };
        setSentMessages(prev => ({ ...prev, [patientId]: [...(prev[patientId] || []), newMsg] }));
        setCustomMsg('');
      } else {
        setError(data.message || 'Failed to send.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (ts) => new Date(ts).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true,
  });

  // Group alerts by patient name
  const grouped = alerts.reduce((acc, alert) => {
    const patientName = alert.title.replace(/^\s*/, '').replace('High-Risk Alert: ', '').replace(' needs support', '').trim();
    if (!acc[patientName]) acc[patientName] = { patientName, alerts: [] };
    acc[patientName].alerts.push(alert);
    return acc;
  }, {});
  const patientGroups = Object.values(grouped);
  const totalUnread = alerts.filter(a => !a.is_read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Emergency Alerts</h2>
          <p className="text-sm text-gray-500 mt-0.5">Crisis notifications from your patients</p>
        </div>
        <div className="flex items-center gap-3">
          {totalUnread > 0 && (
            <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">{totalUnread} unread</span>
          )}
          <button onClick={fetchAll}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-500" />
        </div>
      ) : patientGroups.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-700 font-semibold">No emergency alerts</p>
          <p className="text-gray-400 text-sm mt-1">You will be notified here if a patient triggers a crisis alert.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {patientGroups.map(group => {
            const patientId = resolvedPatients[group.alerts[0]?.id];
            const isOpen = activePatientId === group.patientName;
            const msgs = sentMessages[patientId] || [];
            const hasUnread = group.alerts.some(a => !a.is_read);
            const ec = emergencyContacts[patientId];

            return (
              <div key={group.patientName}
                className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${hasUnread ? 'border-red-200' : 'border-gray-100'}`}>

                {/* Patient header */}
                <div className={`px-6 py-4 flex items-center justify-between ${hasUnread ? 'bg-red-50' : 'bg-gray-50'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-semibold flex-shrink-0 ${hasUnread ? 'bg-red-500' : 'bg-gray-400'}`}>
                      {group.patientName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-base font-semibold text-gray-900">{group.patientName}</p>
                      <p className="text-xs text-gray-500">
                        {group.alerts.length} crisis alert{group.alerts.length !== 1 ? 's' : ''} triggered
                      </p>
                    </div>
                  </div>
                  {hasUnread && (
                    <span className="px-2.5 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">Unread</span>
                  )}
                </div>

                {/* Emergency Contact */}
                {ec && (
                  <div className="px-6 py-3 border-b border-gray-100 bg-orange-50 flex items-center gap-4">
                    <svg className="w-4 h-4 text-orange-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <div>
                      <p className="text-xs font-semibold text-orange-700">Emergency Contact</p>
                      <p className="text-sm text-orange-800 font-medium">{ec.name} — {ec.phone}</p>
                    </div>
                  </div>
                )}

                {/* Alert history */}
                <div className="px-6 py-4 border-b border-gray-100">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Alert History</p>
                  <div className="space-y-2">
                    {group.alerts.map((alert, idx) => {
                      const { riskLevel, emotionTrend } = parseAlert(alert.message);
                      const isHigh = riskLevel.toLowerCase() === 'high';
                      return (
                        <div key={alert.id} className="flex items-center gap-3 py-2 px-3 bg-gray-50 rounded-xl">
                          <span className="text-xs text-gray-400 w-5 text-center font-medium">#{idx + 1}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 ${isHigh ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {riskLevel}
                          </span>
                          <span className="text-xs text-gray-600 capitalize flex-shrink-0">
                            Emotion: <span className="font-medium">{emotionTrend}</span>
                          </span>
                          <span className="text-xs text-gray-400 ml-auto">{formatTime(alert.created_at)}</span>
                          {!alert.is_read && (
                            <button onClick={() => markRead(alert.id)}
                              className="text-xs text-[#4A7C59] hover:underline flex-shrink-0">Mark read</button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Clinical Summary */}
                {(() => {
                  const latestAlert = group.alerts[0]; // Most recent alert
                  const { summary } = parseAlert(latestAlert.message);
                  return summary ? (
                    <div className="px-6 py-4 border-b border-gray-100">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Clinical Summary</p>
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <p className="text-sm text-blue-800 leading-relaxed">{summary}</p>
                      </div>
                    </div>
                  ) : null;
                })()}

                {/* Sent messages */}
                {msgs.length > 0 && (
                  <div className="px-6 py-4 border-b border-gray-100">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Your Messages</p>
                    <div className="space-y-2">
                      {msgs.map(m => (
                        <div key={m.id} className="flex items-start justify-between gap-3 px-3 py-2.5 bg-blue-50 border border-blue-100 rounded-xl">
                          <p className="text-sm text-blue-700">{m.message}</p>
                          <span className="text-xs text-blue-400 whitespace-nowrap flex-shrink-0">
                            {new Date(m.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Send message */}
                <div className="px-6 py-4">
                  {error && isOpen && <p className="mb-2 text-xs text-red-500">{error}</p>}
                  {isOpen ? (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <textarea value={customMsg} onChange={e => setCustomMsg(e.target.value.slice(0, 300))}
                          placeholder="Type a short, clear message..."
                          rows={2}
                          className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm resize-none focus:ring-2 focus:ring-[#4A7C59] focus:border-transparent outline-none bg-white" />
                        <button disabled={!customMsg.trim() || sending}
                          onClick={() => sendMessage(patientId, customMsg)}
                          className="px-4 py-2 bg-[#4A7C59] hover:bg-[#3d6b4a] text-white rounded-xl text-sm font-medium disabled:opacity-50 transition-colors self-end">
                          {sending ? '...' : 'Send'}
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-400">{customMsg.length}/300</p>
                        <button onClick={() => { setActivePatientId(null); setCustomMsg(''); setError(''); }}
                          className="text-xs text-gray-400 hover:text-gray-600">Close</button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => { setActivePatientId(group.patientName); setError(''); }}
                      className="flex items-center gap-2 px-4 py-2 bg-[#4A7C59] hover:bg-[#3d6b4a] text-white rounded-xl text-sm font-medium transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      Send Message to Patient
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DoctorEmergency;
