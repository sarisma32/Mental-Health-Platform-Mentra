import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const SignupPage = () => {
  const navigate = useNavigate();

  return (
    <div className="h-screen overflow-hidden bg-mentra-white flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-3xl">

          <button onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-gray-500 hover:text-mentra-primary text-sm mb-8 transition-colors group">
            <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create your Mentra Account</h1>
            <p className="text-gray-500 text-sm">Choose the type of account to continue</p>
          </div>

          <div className="grid md:grid-cols-2 gap-5 mb-6">
            <div className="bg-white rounded-2xl p-7 border border-gray-100 shadow-sm hover:shadow-md hover:border-mentra-secondary transition-all duration-200 group text-center">
              <div className="w-12 h-12 bg-mentra-secondary rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-mentra-primary/20 transition-colors">
                <svg className="w-6 h-6 text-mentra-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Sign up as User</h3>
              <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                Access therapists, AI chatbot support, and self-help tools for your wellness journey.
              </p>
              <Link to="/register-user">
                <button className="w-full bg-mentra-primary hover:bg-mentra-primary-hover text-white py-2.5 rounded-xl text-sm font-semibold transition-colors">
                  Continue as User
                </button>
              </Link>
            </div>

            <div className="bg-white rounded-2xl p-7 border border-gray-100 shadow-sm hover:shadow-md hover:border-mentra-secondary transition-all duration-200 group text-center">
              <div className="w-12 h-12 bg-mentra-secondary rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-mentra-primary/20 transition-colors">
                <svg className="w-6 h-6 text-mentra-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Sign up as Professional</h3>
              <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                Provide mental health support to patients. Requires license document verification.
              </p>
              <Link to="/register-professional">
                <button className="w-full bg-mentra-primary hover:bg-mentra-primary-hover text-white py-2.5 rounded-xl text-sm font-semibold transition-colors">
                  Continue as Professional
                </button>
              </Link>
            </div>
          </div>

          <p className="text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="text-mentra-primary hover:text-mentra-primary-hover font-medium underline">
              Login here
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
};

export default SignupPage;
