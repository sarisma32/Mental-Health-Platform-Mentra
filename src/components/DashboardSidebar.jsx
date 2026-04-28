import React, { useState } from 'react';

const DashboardSidebar = ({
  title = 'Mentra',
  subtitle = 'Portal',
  userName = '',
  userSub = '',
  userPrefix = '',
  menuItems = [],
  activeSection,
  onNavigate,
  onLogout,
}) => {
  const initial = userName ? userName.charAt(0).toUpperCase() : '?';
  const displayName = userPrefix ? `${userPrefix} ${userName.split(' ')[0]}` : userName.split(' ')[0];
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div className="w-64 h-screen bg-white border-r border-gray-100 flex flex-col flex-shrink-0 shadow-sm">

      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#4A7C59] rounded-xl flex items-center justify-center shadow-sm">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-900">{title}</h1>
            <p className="text-xs text-gray-400">{subtitle}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">Menu</p>
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate && onNavigate(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-left group ${
              activeSection === item.id
                ? 'bg-[#4A7C59] text-white shadow-sm'
                : 'text-gray-600 hover:bg-[#f0f7f4] hover:text-[#4A7C59]'
            }`}
          >
            <span className={`transition-colors duration-200 ${
              activeSection === item.id
                ? 'text-white'
                : 'text-gray-400 group-hover:text-[#4A7C59]'
            }`}>
              {item.icon}
            </span>
            <span className="font-medium text-sm">{item.name}</span>
            {activeSection === item.id && (
              <span className="ml-auto w-1.5 h-1.5 bg-white rounded-full" />
            )}
          </button>
        ))}
      </nav>

      {/* Sign out */}
      <div className="px-3 py-4 border-t border-gray-100">
        <button
          onClick={() => setShowConfirm(true)}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all group"
        >
          <svg className="w-5 h-5 text-gray-400 group-hover:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="font-medium text-sm">Sign out</span>
        </button>
      </div>

      {/* Logout confirmation dialog */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="text-base font-semibold text-gray-800 mb-2">Sign Out</h3>
            <p className="text-sm text-gray-500 mb-6">Are you sure you want to sign out of your account?</p>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirm(false)}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                No
              </button>
              <button onClick={() => { setShowConfirm(false); onLogout && onLogout(); }}
                className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-900 text-white rounded-xl text-sm font-semibold transition-colors">
                Yes, Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardSidebar;
