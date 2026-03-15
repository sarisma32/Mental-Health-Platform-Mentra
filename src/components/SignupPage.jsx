import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from './Header';

const SignupPage = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1); // Go back to previous page
  };

  return (
    <div className="min-h-screen bg-mentra-white">
      {/* Reuse Header Component */}
      <Header />

      {/* Main Content */}
      <div className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <div className="mb-8">
            <button 
              onClick={handleGoBack}
              className="flex items-center space-x-2 text-gray-600 hover:text-mentra-primary transition-colors group"
            >
              <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="font-medium">Back</span>
            </button>
          </div>

          {/* Progress Indicator */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-mentra-primary text-white rounded-full flex items-center justify-center text-sm font-semibold">
                  1
                </div>
                <span className="ml-2 text-sm font-medium text-mentra-primary">Choose Account Type</span>
              </div>
              <div className="w-12 h-0.5 bg-gray-300"></div>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gray-300 text-gray-500 rounded-full flex items-center justify-center text-sm font-semibold">
                  2
                </div>
                <span className="ml-2 text-sm font-medium text-gray-500">Create Account</span>
              </div>
              <div className="w-12 h-0.5 bg-gray-300"></div>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gray-300 text-gray-500 rounded-full flex items-center justify-center text-sm font-semibold">
                  3
                </div>
                <span className="ml-2 text-sm font-medium text-gray-500">Verification</span>
              </div>
            </div>
          </div>

          {/* Title Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Create your Mentra Account
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Choose the type of account you want to continue with
            </p>
          </div>

          {/* Account Type Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
            {/* User Account Card */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl hover:border-mentra-secondary transition-all duration-300 group">
              <div className="text-center">
                <div className="w-16 h-16 bg-mentra-secondary rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-mentra-primary/20 transition-colors">
                  <svg className="w-8 h-8 text-mentra-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Sign up as User</h3>
                
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Get Access to therapists, self help tools and AI chatbot support
                </p>

                {/* Features List */}
                <div className="text-left mb-8 space-y-2">
                  <div className="flex items-center space-x-3">
                    <span className="text-mentra-primary">✓</span>
                    <span className="text-sm text-gray-600">24/7 AI Chatbot Support</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-mentra-primary">✓</span>
                    <span className="text-sm text-gray-600">Connect with Licensed Therapists</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-mentra-primary">✓</span>
                    <span className="text-sm text-gray-600">Self-Help Tools & Resources</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-mentra-primary">✓</span>
                    <span className="text-sm text-gray-600">Progress Tracking</span>
                  </div>
                </div>
                
                <Link to="/register-user" className="w-full">
                  <button className="w-full bg-mentra-primary hover:bg-mentra-primary-hover text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2">
                    <span>→</span>
                    <span>Continue as User</span>
                  </button>
                </Link>
              </div>
            </div>

            {/* Professional Account Card */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl hover:border-mentra-secondary transition-all duration-300 group">
              <div className="text-center">
                <div className="w-16 h-16 bg-mentra-secondary rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-mentra-primary/20 transition-colors">
                  <span className="text-3xl">🩺</span>
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Sign up as Professional</h3>
                
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Provide Mental Health supports. Requires document verification
                </p>

                {/* Features List */}
                <div className="text-left mb-8 space-y-2">
                  <div className="flex items-center space-x-3">
                    <span className="text-mentra-primary">✓</span>
                    <span className="text-sm text-gray-600">Create Professional Profile</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-mentra-primary">✓</span>
                    <span className="text-sm text-gray-600">Manage Client Sessions</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-mentra-primary">✓</span>
                    <span className="text-sm text-gray-600">Secure Communication Tools</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-mentra-primary">✓</span>
                    <span className="text-sm text-gray-600">Professional Dashboard</span>
                  </div>
                </div>
                
                <Link to="/register-professional" className="w-full">
                  <button className="w-full bg-mentra-primary hover:bg-mentra-primary-hover text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2">
                    <span>→</span>
                    <span>Continue as Professional</span>
                  </button>
                </Link>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="text-center space-y-6">
            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-2xl mx-auto">
              <div className="flex items-center space-x-2 justify-center">
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-blue-700 text-sm font-medium">
                  You can change your account type later in settings if needed.
                </p>
              </div>
            </div>
            
            <p className="text-gray-900 font-semibold">
              Already have an account? 
              <Link to="/login" className="text-mentra-primary hover:text-mentra-primary-hover ml-1 underline">
                Login here
              </Link>
            </p>

            {/* Security Notice */}
            <div className="flex items-center justify-center space-x-2 text-gray-500 text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>Your data is protected with end-to-end encryption</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;