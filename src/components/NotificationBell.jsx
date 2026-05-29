import React, { useState, useEffect, useRef } from 'react';
import { buildApiUrl, API_ENDPOINTS } from '../config/api.js';

const typeIcon = (type) => {
  switch (type) {
    case 'new_appointment':       return '📅';
    case 'appointment_booked':    return '✅';
    case 'appointment_confirmed': return '🎉';
    case 'appointment_cancelled': return '❌';
    case 'session_completed':     return '✔️';
    case 'task_assigned':         return '📋';
    case 'task_completed':        return '✅';
    case 'prescription_added':    return '💊';
    case 'new_user':              return '👤';
    case 'new_doctor':            return '👨‍⚕️';
    case 'new_review':            return '⭐';
    case 'account_deleted':       return '🗑️';
    case 'crisis_alert':          return '🚨';
    case 'no_show_warning':       return '⚠️';
    case 'no_show':               return '🚫';
    case 'new_dispute':           return '⚠️';
    case 'dispute_update':        return '📋';
    case 'admin_warning':         return '🚨';
    case 'system_review_submitted': return '⭐';
    case 'system_review_approved':  return '✅';
    case 'system_review_rejected':  return '❌';
    case 'system_review_deleted':   return '🗑️';
    default:                      return '🔔';
  }
};

// Maps notification type → dashboard section for doctor
const doctorSectionMap = {
  new_appointment: 'appointments',
  session_completed: 'appointments',
  new_review: 'reviews',
  task_completed: 'therapy',
  crisis_alert: 'emergency',
  admin_warning: 'warnings',
};

// Maps notification type → dashboard section for admin
const adminSectionMap = {
  new_appointment: 'appointments',
  session_completed: 'appointments',
  new_user: 'users',
  new_doctor: 'doctors',
  new_review: 'reviews',
  account_deleted: 'users',
  crisis_alert: 'crisis',
  no_show: 'appointments',
  new_dispute: 'disputes',
  system_review_submitted: 'system-reviews',
};

// Maps notification type → dashboard section for patient
const patientSectionMap = {
  appointment_booked: 'appointments',
  appointment_confirmed: 'appointments',
  appointment_cancelled: 'appointments',
  session_completed: 'appointments',
  task_assigned: 'therapy',
  prescription_added: 'prescriptions',
  crisis_response: 'emergency',
  no_show_warning: 'session-alerts',
  dispute_update: 'disputes',
  system_review_approved: 'settings',
  system_review_rejected: 'settings',
  system_review_deleted: 'settings',
};

const NotificationBell = ({ recipientType, recipientId, onNavigate }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Load user preferences from localStorage
  const getPrefs = () => {
    try { return JSON.parse(localStorage.getItem('mentra_prefs_' + recipientId)) || {}; } catch { return {}; }
  };

  // Map notification type → preference key
  const prefKeyForType = (type) => {
    if (['appointment_booked', 'appointment_confirmed', 'appointment_cancelled', 'new_appointment'].includes(type))
      return 'appointmentReminders';
    if (['session_completed'].includes(type))
      return 'sessionUpdates';
    return 'emailNotifications';
  };

  const isNotifAllowed = (type) => {
    const prefs = getPrefs();
    const key = prefKeyForType(type);
    // Default true if not set
    return prefs[key] !== false;
  };

  const fetchNotifications = async () => {
    try {
      const id = recipientId || 'all';
      const res = await fetch(buildApiUrl(`${API_ENDPOINTS.NOTIFICATIONS}/${recipientType}/${id}`));
      const data = await res.json();
      if (data.success) {
        // Filter out notifications the user has disabled in preferences
        // Also filter out dispute_update for doctors (they get warnings separately)
        const filtered = data.notifications.filter(n => {
          if (!isNotifAllowed(n.type)) return false;
          if (recipientType === 'doctor' && n.type === 'dispute_update') return false;
          return true;
        });
        setNotifications(filtered);
        setUnreadCount(filtered.filter(n => !n.is_read).length);
      }
    } catch (e) {
      console.error('Notification fetch error:', e);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [recipientType, recipientId]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await fetch(buildApiUrl(`${API_ENDPOINTS.NOTIFICATIONS}/read/${notificationId}`), { method: 'PUT' });
      setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const id = recipientId || 'all';
      await fetch(buildApiUrl(`${API_ENDPOINTS.NOTIFICATIONS}/${recipientType}/${id}/read-all`), { method: 'PUT' });
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (e) {
      console.error(e);
    }
  };

  const handleNotificationClick = async (n) => {
    // Mark as read
    if (!n.is_read) await handleMarkAsRead(n.id);

    // Navigate to relevant section
    const sectionMap = recipientType === 'doctor' ? doctorSectionMap : recipientType === 'patient' ? patientSectionMap : adminSectionMap;
    const section = sectionMap[n.type];
    if (section && onNavigate) {
      onNavigate(section);
    }

    setOpen(false);
  };

  const formatTime = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50">
            <h3 className="font-semibold text-gray-800 text-sm">Notifications</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs text-[#4A7C59] hover:text-[#3d6b4a] font-medium"
                >
                  Mark all read
                </button>
              )}
              <button onClick={fetchNotifications} className="text-gray-400 hover:text-gray-600" title="Refresh">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <svg className="w-10 h-10 mx-auto mb-2 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => {
                const sectionMap = recipientType === 'doctor' ? doctorSectionMap : recipientType === 'patient' ? patientSectionMap : adminSectionMap;
                const hasLink = !!sectionMap[n.type];
                return (
                  <div
                    key={n.id}
                    onClick={() => handleNotificationClick(n)}
                    className={`px-4 py-3 border-b border-gray-50 transition-colors
                      ${hasLink ? 'cursor-pointer hover:bg-[#d0e8dc]/40' : 'cursor-default hover:bg-gray-50'}
                      ${!n.is_read ? 'bg-[#F5F5F0]' : 'bg-white'}`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-lg flex-shrink-0 mt-0.5">{typeIcon(n.type)}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className={`text-sm text-gray-900 ${!n.is_read ? 'font-semibold' : 'font-medium'}`}>
                            {n.title}
                          </p>
                          {!n.is_read && (
                            <span className="w-2 h-2 bg-[#4A7C59] rounded-full flex-shrink-0"></span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{n.message}</p>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-xs text-gray-400">{formatTime(n.created_at)}</p>
                          {hasLink && (
                            <span className="text-xs text-[#4A7C59] font-medium">View →</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
