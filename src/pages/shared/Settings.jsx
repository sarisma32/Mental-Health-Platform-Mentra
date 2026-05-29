import React, { useState } from 'react';
import { buildApiUrl } from '../../config/api.js';

// Reusable confirmation dialog
const ConfirmDialog = ({ title, message, onConfirm, onCancel, confirmLabel = 'Yes', confirmClass = 'bg-red-600 hover:bg-red-700' }) => (
  <div className="fixed inset-0 backdrop-blur-md bg-white/30 z-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
      <h3 className="text-base font-semibold text-gray-800 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 mb-6">{message}</p>
      <div className="flex gap-3">
        <button onClick={onCancel}
          className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
          No
        </button>
        <button onClick={onConfirm}
          className={`flex-1 py-2.5 text-white rounded-xl text-sm font-semibold transition-colors ${confirmClass}`}>
          {confirmLabel}
        </button>
      </div>
    </div>
  </div>
);

const Section = ({ title, description, children }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
    <div className="px-6 py-4 border-b border-gray-50">
      <h3 className="text-base font-semibold text-gray-800">{title}</h3>
      {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
    </div>
    <div className="px-6 py-5">{children}</div>
  </div>
);

const Toggle = ({ label, description, checked, onChange }) => (
  <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
    <div>
      <p className="text-sm font-medium text-gray-700">{label}</p>
      {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
    </div>
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${checked ? 'bg-[#4A7C59]' : 'bg-gray-200'}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  </div>
);

const EyeIcon = ({ visible }) => visible
  ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
  : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>;

const PASSWORD_RULES = [
  { label: 'At least 8 characters',           test: p => p.length >= 8 },
  { label: 'One uppercase letter (A-Z)',       test: p => /[A-Z]/.test(p) },
  { label: 'One lowercase letter (a-z)',       test: p => /[a-z]/.test(p) },
  { label: 'One number (0-9)',                 test: p => /[0-9]/.test(p) },
  { label: 'One special character (!@#$...)',  test: p => /[^A-Za-z0-9]/.test(p) },
];

const isStrong = p => PASSWORD_RULES.every(r => r.test(p));

const Settings = ({ user, role, onLogout }) => {
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });
  const [show, setShow] = useState({ current: false, newPass: false, confirm: false });
  const [dialog, setDialog] = useState(null); // { type: 'logout' | 'delete' | 'error', message?: string }

  const prefKey = 'mentra_prefs_' + user?.id;
  const [prefs, setPrefs] = useState(() => {
    try {
      return { emailNotifications: true, appointmentReminders: true, sessionUpdates: true, ...JSON.parse(localStorage.getItem(prefKey)) };
    } catch {
      return { emailNotifications: true, appointmentReminders: true, sessionUpdates: true };
    }
  });

  const savePrefs = updated => { setPrefs(updated); localStorage.setItem(prefKey, JSON.stringify(updated)); };
  const handleToggle = key => savePrefs({ ...prefs, [key]: !prefs[key] });
  const showMsg = (text, type) => { setMsg({ text, type: type || 'success' }); setTimeout(() => setMsg(null), 3500); };

  const passedCount = PASSWORD_RULES.filter(r => r.test(passwords.newPass)).length;

  const getStrengthColor = () => {
    if (passedCount <= 1) return 'bg-red-400';
    if (passedCount <= 3) return 'bg-yellow-400';
    if (passedCount === 4) return 'bg-blue-400';
    return 'bg-[#4A7C59]';
  };

  const getStrengthLabel = () => {
    if (passedCount <= 1) return 'Weak';
    if (passedCount <= 3) return 'Fair';
    if (passedCount === 4) return 'Good';
    return 'Strong';
  };

  const getStrengthTextColor = () => {
    if (passedCount <= 1) return 'text-red-500';
    if (passedCount <= 3) return 'text-yellow-500';
    if (passedCount === 4) return 'text-blue-500';
    return 'text-[#4A7C59]';
  };

  const handleChangePassword = async e => {
    e.preventDefault();
    if (!isStrong(passwords.newPass)) return showMsg('Password does not meet all requirements.', 'error');
    if (passwords.newPass !== passwords.confirm) return showMsg('New passwords do not match.', 'error');
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const endpoint = role === 'patient' ? '/api/patients/change-password'
        : role === 'doctor' ? '/api/doctors/change-password'
        : '/api/admin/change-password';
      const res = await fetch(buildApiUrl(endpoint), {
        method: 'PUT',
        headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: passwords.current, newPassword: passwords.newPass }),
      });
      const data = await res.json();
      if (data.success) {
        showMsg('Password changed successfully.');
        setPasswords({ current: '', newPass: '', confirm: '' });
      } else {
        showMsg(data.message || 'Failed to change password.', 'error');
      }
    } catch {
      showMsg('Something went wrong.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const inputBase = "w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all bg-gray-50 focus:bg-white pr-10";
  const inputNormal = inputBase + " border-gray-200 focus:border-[#4A7C59] focus:ring-1 focus:ring-[#4A7C59]/20";
  const inputError = inputBase + " border-red-300 focus:border-red-400 focus:ring-1 focus:ring-red-100";

  return (
    <div className="space-y-6 max-w-2xl">

      {msg && (
        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium border ${msg.type === 'error' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-[#f0f7f4] text-[#4A7C59] border-[#dce8e0]'}`}>
          <span>{msg.type === 'error' ? '' : ''}</span>
          {msg.text}
        </div>
      )}

      {/* Account Info */}
      <Section title="Account Information" description="Your current account details">
        <div>
          <div className="flex items-center justify-between py-2.5 border-b border-gray-50">
            <span className="text-sm text-gray-500">Name</span>
            <span className="text-sm font-medium text-gray-800">{role === 'doctor' ? 'Dr. ' + user?.full_name : user?.full_name}</span>
          </div>
          <div className="flex items-center justify-between py-2.5 border-b border-gray-50">
            <span className="text-sm text-gray-500">Email</span>
            <span className="text-sm font-medium text-gray-800">{user?.email}</span>
          </div>
          <div className="flex items-center justify-between py-2.5 border-b border-gray-50">
            <span className="text-sm text-gray-500">Role</span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#f0f7f4] text-[#4A7C59] capitalize">{role}</span>
          </div>
          {role === 'doctor' && (
            <div className="flex items-center justify-between py-2.5">
              <span className="text-sm text-gray-500">Specialization</span>
              <span className="text-sm font-medium text-gray-800">{user?.specialization}</span>
            </div>
          )}
        </div>
      </Section>

      {/* Change Password */}
      <Section title="Change Password" description="Must include uppercase, lowercase, number and special character">
        <form onSubmit={handleChangePassword} className="space-y-4">

          {/* Current Password */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Current Password</label>
            <div className="relative">
              <input
                type={show.current ? 'text' : 'password'}
                value={passwords.current}
                onChange={e => setPasswords(p => ({ ...p, current: e.target.value }))}
                placeholder="Enter current password"
                className={inputNormal}
                required
              />
              <button type="button" onClick={() => setShow(s => ({ ...s, current: !s.current }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <EyeIcon visible={show.current} />
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">New Password</label>
            <div className="relative">
              <input
                type={show.newPass ? 'text' : 'password'}
                value={passwords.newPass}
                onChange={e => setPasswords(p => ({ ...p, newPass: e.target.value }))}
                placeholder="Create a strong password"
                className={inputNormal}
                required
              />
              <button type="button" onClick={() => setShow(s => ({ ...s, newPass: !s.newPass }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <EyeIcon visible={show.newPass} />
              </button>
            </div>

            {passwords.newPass.length > 0 && (
              <div className="mt-2">
                {/* Strength bar */}
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex gap-1 flex-1">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${i <= passedCount ? getStrengthColor() : 'bg-gray-100'}`} />
                    ))}
                  </div>
                  <span className={`text-xs font-semibold ${getStrengthTextColor()}`}>{getStrengthLabel()}</span>
                </div>
                {/* Rules checklist */}
                <div className="space-y-1">
                  {PASSWORD_RULES.map(rule => {
                    const passed = rule.test(passwords.newPass);
                    return (
                      <div key={rule.label} className="flex items-center gap-2">
                        <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${passed ? 'bg-[#4A7C59]' : 'bg-gray-200'}`}>
                          {passed && (
                            <svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </span>
                        <span className={`text-xs transition-colors ${passed ? 'text-[#4A7C59]' : 'text-gray-400'}`}>{rule.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Confirm New Password</label>
            <div className="relative">
              <input
                type={show.confirm ? 'text' : 'password'}
                value={passwords.confirm}
                onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))}
                placeholder="Repeat new password"
                className={passwords.confirm && passwords.newPass !== passwords.confirm ? inputError : inputNormal}
                required
              />
              <button type="button" onClick={() => setShow(s => ({ ...s, confirm: !s.confirm }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <EyeIcon visible={show.confirm} />
              </button>
            </div>
            {passwords.confirm && passwords.newPass !== passwords.confirm && (
              <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
            )}
            {passwords.confirm && passwords.newPass === passwords.confirm && passwords.confirm.length > 0 && (
              <p className="text-xs text-[#4A7C59] mt-1">✓ Passwords match</p>
            )}
          </div>

          <button
            type="submit"
            disabled={saving || !isStrong(passwords.newPass) || passwords.newPass !== passwords.confirm || !passwords.current}
            className="w-full py-2.5 bg-[#4A7C59] hover:bg-[#3d6b4a] text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Update Password'}
          </button>
        </form>
      </Section>

      {/* Notification Preferences */}
      <Section title="Notification Preferences" description="Control what notifications you receive">
        <Toggle label="Email Notifications" description="Receive updates via email" checked={prefs.emailNotifications} onChange={() => handleToggle('emailNotifications')} />
        <Toggle label="Appointment Reminders" description="Get reminded before your sessions" checked={prefs.appointmentReminders} onChange={() => handleToggle('appointmentReminders')} />
        <Toggle label="Session Updates" description="Notifications when sessions are confirmed or completed" checked={prefs.sessionUpdates} onChange={() => handleToggle('sessionUpdates')} />
      </Section>

      {/* Session & Security */}
      <Section title="Session & Security">
        <div className="space-y-3">
          <button onClick={() => setDialog({ type: 'logout' })}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 text-left transition-colors group">
            <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <div>
              <p className="text-sm font-medium text-gray-700">Sign Out</p>
              <p className="text-xs text-gray-400">Sign out of your current session</p>
            </div>
          </button>

          {role !== 'admin' && (
            <button onClick={() => setDialog({ type: 'delete' })}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-red-100 hover:bg-red-50 text-left transition-colors group">
              <svg className="w-5 h-5 text-red-400 group-hover:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <div>
                <p className="text-sm font-medium text-red-600">Delete Account</p>
                <p className="text-xs text-gray-400">Permanently remove your account and data</p>
              </div>
            </button>
          )}
        </div>
      </Section>

      {/* Logout confirmation */}
      {dialog?.type === 'logout' && (
        <ConfirmDialog
          title="Sign Out"
          message="Are you sure you want to sign out of your account?"
          confirmLabel="Yes, Sign Out"
          confirmClass="bg-gray-800 hover:bg-gray-900"
          onCancel={() => setDialog(null)}
          onConfirm={() => { setDialog(null); onLogout(); }}
        />
      )}

      {/* Delete account confirmation */}
      {dialog?.type === 'delete' && (
        <ConfirmDialog
          title="Delete Account"
          message="Are you sure you want to permanently delete your account? This action cannot be undone."
          confirmLabel="Yes, Delete"
          confirmClass="bg-red-600 hover:bg-red-700"
          onCancel={() => setDialog(null)}
          onConfirm={async () => {
            setDialog(null);
            try {
              const token = localStorage.getItem('token');
              const endpoint = role === 'patient' ? '/api/patients/account' : '/api/doctors/account';
              
              console.log('Calling delete endpoint:', endpoint);
              
              const res = await fetch(buildApiUrl(endpoint), {
                method: 'DELETE',
                headers: { 'Authorization': 'Bearer ' + token },
              });
              
              console.log('Delete response status:', res.status);
              const data = await res.json();
              console.log('Delete response data:', data);
              
              if (data.success) { 
                localStorage.clear(); 
                window.location.href = '/'; 
              } else {
                // Show the specific error message from backend
                console.error('Delete failed:', data.message);
                setDialog({ 
                  type: 'error', 
                  message: data.message || 'Failed to delete account. Please try again later.' 
                });
              }
            } catch (error) { 
              console.error('Delete account error:', error);
              setDialog({ 
                type: 'error', 
                message: 'Something went wrong while trying to delete your account. Please check your connection and try again.' 
              });
            }
          }}
        />
      )}

      {/* Error dialog */}
      {dialog?.type === 'error' && (
        <div className="fixed inset-0 backdrop-blur-md bg-white/30 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-gray-800 mb-1">Cannot Delete Account</h3>
                <p className="text-sm text-gray-600">{dialog.message}</p>
              </div>
            </div>
            <button 
              onClick={() => setDialog(null)}
              className="w-full py-2.5 bg-[#4A7C59] hover:bg-[#3d6b4a] text-white rounded-xl text-sm font-semibold transition-colors">
              Understood
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default Settings;
