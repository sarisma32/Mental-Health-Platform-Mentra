import React from 'react';
import NotificationBell from './NotificationBell';

/**
 * Reusable top header bar for Admin, Doctor, and Patient dashboards.
 *
 * Props:
 *  - sectionTitle    {string}  Current section name e.g. "Overview"
 *  - userName        {string}  Full name of the logged-in user
 *  - userEmail       {string}  Email shown below the name
 *  - userPrefix      {string}  Optional prefix e.g. "Dr."
 *  - notifType       {string}  'doctor' | 'admin' | 'patient'
 *  - notifId         {any}     User ID for notification bell
 *  - onNotifNavigate {fn}      Called when a notification is clicked (optional)
 */
const DashboardHeader = ({
  sectionTitle = '',
  userName = '',
  userEmail = '',
  userPrefix = '',
  notifType,
  notifId,
  onNotifNavigate,
}) => {
  const displayName = userPrefix ? `${userPrefix} ${userName}` : userName;
  const initial = userName ? userName.charAt(0).toUpperCase() : '?';

  return (
    <div className="bg-white shadow-sm border-b border-gray-200 px-8 py-4 flex-shrink-0">
      <div className="flex justify-between items-center">
        {/* Left — section title + date */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{sectionTitle}</h2>
          <p className="text-sm text-gray-500 mt-1">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>

        {/* Right — notification bell + user info */}
        <div className="flex items-center space-x-4">
          {notifType && (
            <NotificationBell
              recipientType={notifType}
              recipientId={notifId}
              onNavigate={onNotifNavigate}
            />
          )}
          <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-800">{displayName}</p>
              <p className="text-xs text-gray-500">{userEmail}</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-[#A3B18A] to-[#8FA076] rounded-full flex items-center justify-center text-white font-semibold shadow-md">
              {initial}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
