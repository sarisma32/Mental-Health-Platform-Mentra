import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { buildApiUrl } from '../config/api.js';

const DoctorPendingStatus = () => {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(false);
  const [message, setMessage] = useState('');

  // Check approval status on component mount
  useEffect(() => {
    checkApprovalStatus();
  }, []);

  const checkApprovalStatus = async () => {
    setChecking(true);
    setMessage('');
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/login');
        return;
      }

      // Call the check status API
      const response = await fetch(buildApiUrl('/api/auth/check-doctor-status'), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || 'Unable to check status. Please try again.');
        return;
      }

      // Update localStorage with new token and user data
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.doctor));

      // Check approval status and redirect accordingly
      if (data.approvalStatus === 'approved') {
        setMessage(' Your account has been approved! Redirecting to dashboard...');
        setTimeout(() => {
          navigate('/doctor-dashboard');
        }, 2000);
      } else if (data.approvalStatus === 'rejected') {
        setMessage(' Your account has been rejected. Please contact support for more information.');
      } else {
        setMessage(' Your account is still pending approval. Our team is reviewing your credentials.');
      }
    } catch (error) {
      console.error('Error checking status:', error);
      setMessage('Unable to check status. Please try again later.');
    } finally {
      setChecking(false);
    }
  };

  const handleLogout = () => {
    // Clear any stored tokens or user data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('doctor');
    localStorage.removeItem('userRole');
    
    // Navigate to home page
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-mentra-white">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <div className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Title Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Your Account is Under Review
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Thank you for registering with Mentra! Your Account is currently undergoing a thorough 
              verification process to ensure the highest standards of professional practice.
            </p>
          </div>

          {/* Status Card */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 max-w-3xl mx-auto">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
              {/* Illustration */}
              <div className="flex-shrink-0">
                <div className="w-32 h-32 bg-mentra-secondary rounded-full flex items-center justify-center relative overflow-hidden">
                  {/* Doctor with magnifying glass illustration */}
                  <div className="relative">
                    {/* Doctor figure */}
                    <div className="relative">
                      {/* Head */}
                      <div className="w-12 h-12 bg-orange-300 rounded-full relative">
                        {/* Hair */}
                        <div className="w-10 h-6 bg-orange-800 rounded-t-full absolute -top-1 left-1"></div>
                        {/* Eyes */}
                        <div className="flex space-x-2 absolute top-4 left-3">
                          <div className="w-1 h-1 bg-black rounded-full"></div>
                          <div className="w-1 h-1 bg-black rounded-full"></div>
                        </div>
                        {/* Smile */}
                        <div className="w-4 h-2 border-b-2 border-black rounded-full absolute top-6 left-4"></div>
                      </div>
                      
                      {/* Body/Shirt */}
                      <div className="w-14 h-12 bg-white rounded-lg absolute top-10 left-1 border-2 border-gray-300">
                        {/* Tie */}
                        <div className="w-2 h-8 bg-red-500 absolute top-0 left-6 clip-path-triangle"></div>
                        {/* Collar */}
                        <div className="w-full h-2 bg-gray-100 absolute top-0 rounded-t-lg"></div>
                      </div>
                      
                      {/* Arms */}
                      <div className="w-3 h-8 bg-orange-300 rounded-full absolute top-12 -left-2 transform -rotate-12"></div>
                      <div className="w-3 h-8 bg-orange-300 rounded-full absolute top-12 right-0 transform rotate-12"></div>
                    </div>
                    
                    {/* Magnifying glass */}
                    <div className="absolute -top-1 -right-1">
                      <div className="w-6 h-6 border-3 border-gray-700 rounded-full bg-blue-100 bg-opacity-30"></div>
                      <div className="w-1 h-3 bg-gray-700 absolute bottom-0 right-0 transform rotate-45 origin-top"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Content */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Verification Status</h2>
                  <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                    Pending
                  </span>
                </div>

                <p className="text-gray-600 mb-6 leading-relaxed">
                  Our team is carefully reviewing your professional credentials. This process typically takes 
                  24-48 hours. You will receive an email notification once your account has been approved 
                  and is ready to go live.
                </p>

                {/* Info Notice */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">i</span>
                  </div>
                  <p className="text-blue-800 text-sm">
                    You will not appear to patients until verification is complete.
                  </p>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Progress</span>
              </div>
              
              <div className="relative">
                {/* Progress track */}
                <div className="w-full h-2 bg-gray-200 rounded-full">
                  {/* Progress fill */}
                  <div className="h-2 bg-mentra-primary rounded-full" style={{ width: '66%' }}></div>
                </div>
                
                {/* Progress labels */}
                <div className="flex justify-between mt-3 text-sm">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 bg-mentra-primary rounded-full mb-1"></div>
                    <span className="text-mentra-primary font-medium">Submitted</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 bg-mentra-primary rounded-full mb-1"></div>
                    <span className="text-mentra-primary font-medium">Under Review</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 bg-gray-300 rounded-full mb-1"></div>
                    <span className="text-gray-500">Approved</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Message */}
            {message && (
              <div className={`mt-6 p-4 rounded-lg ${
                message.includes('approved') ? 'bg-green-50 border border-green-200 text-green-800' :
                message.includes('rejected') ? 'bg-red-50 border border-red-200 text-red-800' :
                'bg-blue-50 border border-blue-200 text-blue-800'
              }`}>
                <p className="text-sm font-medium">{message}</p>
              </div>
            )}

            {/* Support Contact */}
            <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-gray-600 text-sm">
                If you have any Questions, contact{' '}
                <a href="mailto:support@mentra.com" className="text-mentra-primary hover:text-mentra-primary-hover font-medium">
                  support@mentra.com
                </a>
              </p>
              
              <div className="flex gap-2">
                <button
                  onClick={checkApprovalStatus}
                  disabled={checking}
                  className="flex items-center gap-2 px-4 py-2 bg-mentra-primary text-white rounded-lg hover:bg-mentra-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {checking ? (
                    <>
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Checking...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <span>Check Status</span>
                    </>
                  )}
                </button>
                
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorPendingStatus;

