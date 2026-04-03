import React from 'react';

/**
 * Reusable sidebar for Admin, Doctor, and Patient dashboards.
 *
 * Props:
 *  - title        {string}   e.g. "Mentra Doctor"
 *  - subtitle     {string}   e.g. "Healthcare Portal"
 *  - userName     {string}   Display name shown in the user info block
 *  - userSub      {string}   Secondary line (specialization, email, role…)
 *  - userPrefix   {string}   Optional prefix before name e.g. "Dr."
 *  - menuItems    {Array}    [{ id, name, icon: <JSX> }]
 *  - activeSection {string}  Currently active section id
 *  - onNavigate   {fn}       Called with section id when a menu item is clicked
 *  - onLogout     {fn}       Called when Sign out is clicked
 */
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

  return (
    <div className="w-64 bg-gradient-to-b from-[#A3B18A] to-[#8FA076] text-white flex flex-col shadow-xl flex-shrink-0">

      {/* Logo */}
      <div className="p-6 border-b border-white/20">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-md">
            <svg className="w-6 h-6 text-[#A3B18A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold">{title}</h1>
            <p className="text-xs text-white/70">{subtitle}</p>
          </div>
        </div>
      </div>

      {/* User info */}
      <div className="p-4 border-b border-white/20">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <span className="text-white font-bold text-lg">{initial}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">
              {userPrefix ? `${userPrefix} ${userName.split(' ')[0]}` : userName.split(' ')[0]}
            </p>
            <p className="text-xs text-white/70 truncate">{userSub}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate && onNavigate(item.id)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
              activeSection === item.id
                ? 'bg-white/20 shadow-md backdrop-blur-sm'
                : 'hover:bg-white/10'
            }`}
          >
            <span className="text-white">{item.icon}</span>
            <span className="font-medium text-sm">{item.name}</span>
          </button>
        ))}
      </nav>

      {/* Sign out */}
      <div className="p-4 border-t border-white/20">
        <button
          onClick={onLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="font-medium text-sm">Sign out</span>
        </button>
      </div>
    </div>
  );
};

export default DashboardSidebar;
