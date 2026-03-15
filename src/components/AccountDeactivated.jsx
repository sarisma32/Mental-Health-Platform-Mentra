import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

const AccountDeactivated = () => {
  const navigate = useNavigate();

  const handleBackToLogin = () => {
    // Clear any stored tokens/user data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            {/* Icon */}
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
              <svg 
                className="h-10 w-10 text-red-600" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                />
              </svg>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Account Deactivated
            </h2>

            {/* Message */}
            <p className="text-gray-600 mb-6">
              Your account has been deactivated by an administrator. 
              You cannot access your account at this time.
            </p>

            {/* Support Info */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-700 mb-2">
                If you believe this is a mistake or need assistance, please contact our support team:
              </p>
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-900">
                  📧 Email: support@mentra.com
                </p>
                <p className="text-sm font-medium text-gray-900">
                  📞 Phone: +1 (555) 123-4567
                </p>
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={handleBackToLogin}
              className="w-full bg-[#A3B18A] hover:bg-[#8FA076] text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AccountDeactivated;
