import React, { useState, useEffect } from 'react';
import { buildApiUrl } from '../../config/api.js';

const PatientEmergencyMessages = ({ patientId }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(buildApiUrl(`/api/crisis-messages/patient/${patientId}`), {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setMessages(data.messages);
    } catch (e) {
      console.error('Failed to fetch emergency messages:', e);
    } finally {
      setLoading(false);
    }
  };

  const markAllRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch(buildApiUrl(`/api/crisis-messages/patient/${patientId}/read`), {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
      });
    } catch {}
  };

  useEffect(() => {
    if (patientId) { fetchMessages(); markAllRead(); }
  }, [patientId]);

  const formatTime = (ts) => new Date(ts).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true,
  });

  // Group messages by doctor
  const grouped = messages.reduce((acc, msg) => {
    const key = msg.doctor_id;
    if (!acc[key]) {
      acc[key] = {
        doctor_id: msg.doctor_id,
        doctor_name: msg.doctor_name,
        doctor_specialization: msg.doctor_specialization,
        messages: [],
      };
    }
    acc[key].messages.push(msg);
    return acc;
  }, {});
  const conversations = Object.values(grouped);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Emergency Messages</h2>
          <p className="text-sm text-gray-500 mt-0.5">Messages from your doctor during crisis situations</p>
        </div>
        <button onClick={fetchMessages}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#4A7C59]" />
        </div>
      ) : conversations.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
          <div className="w-16 h-16 bg-[#f0f7f4] rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-[#4A7C59]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <p className="text-gray-700 font-semibold">No emergency messages</p>
          <p className="text-gray-400 text-sm mt-1">If you ever trigger a crisis alert, your doctor's responses will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {conversations.map(conv => (
            <div key={conv.doctor_id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Doctor header */}
              <div className="px-5 py-3 flex items-center gap-3 border-b border-gray-100 bg-gray-50">
                <div className="w-9 h-9 rounded-xl bg-[#4A7C59] flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                  {conv.doctor_name?.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">Dr. {conv.doctor_name}</p>
                  <p className="text-xs text-gray-400">{conv.doctor_specialization}</p>
                </div>
                <span className="text-xs text-gray-400">{conv.messages.length} message{conv.messages.length !== 1 ? 's' : ''}</span>
              </div>

              {/* Messages */}
              <div className="divide-y divide-gray-50">
                {conv.messages.map(msg => (
                  <div key={msg.id} className="px-5 py-3 flex items-start gap-3">
                    <p className="flex-1 text-sm text-gray-700 leading-relaxed">{msg.message}</p>
                    <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0 mt-0.5">{formatTime(msg.created_at)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientEmergencyMessages;
