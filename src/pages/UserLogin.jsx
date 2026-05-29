import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { buildApiUrl, API_ENDPOINTS } from '../config/api.js';
import Header from '../components/Header.jsx';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

const UserLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [accountStatusError, setAccountStatusError] = useState(null);
  const googleBtnRef = useRef(null);

  // Check for account status errors on component mount
  useEffect(() => {
    const statusError = localStorage.getItem('accountStatusError');
    if (statusError) {
      try {
        const errorData = JSON.parse(statusError);
        setAccountStatusError(errorData);
        setShowErrorModal(true);
        localStorage.removeItem('accountStatusError'); // Clear after showing
      } catch (e) {
        console.error('Error parsing account status error:', e);
      }
    }
  }, []);

  // Load Google Identity Services script
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      window.google?.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
      });
      window.google?.accounts.id.renderButton(googleBtnRef.current, {
        theme: 'outline',
        size: 'large',
        width: googleBtnRef.current?.offsetWidth || 360,
        text: 'continue_with',
      });
    };
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, []);

  const handleGoogleResponse = async (response) => {
    setGoogleLoading(true);
    try {
      const res = await fetch(buildApiUrl('/api/auth/google/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: response.credential }),
      });
      const data = await res.json();
      if (res.status === 403 && data.status === 'inactive') { navigate('/account-deactivated'); return; }
      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('userRole', data.role);
        window.dispatchEvent(new Event('storage'));
        navigate('/dashboard');
      } else if (data.notFound) {
        setErrors({ google: 'No account found with this Google account. Please sign up first.' });
      } else {
        setErrors({ google: data.message || 'Google login failed.' });
      }
    } catch {
      setErrors({ google: 'Google login failed. Please try again.' });
    } finally {
      setGoogleLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email';
    if (!formData.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    if (validateForm()) {
      try {
        const response = await fetch(buildApiUrl(API_ENDPOINTS.LOGIN), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email, password: formData.password })
        });
        const data = await response.json();
        if (response.status === 403 && data.status === 'inactive') { navigate('/account-deactivated'); return; }
        if (data.success) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          localStorage.setItem('userRole', data.role);
          window.dispatchEvent(new Event('storage'));
          if (data.role === 'doctor') {
            navigate(data.user.approval_status === 'pending' ? '/doctor-pending' : '/doctor-dashboard');
          } else {
            navigate('/dashboard');
          }
        } else {
          setErrorMessage(data.message || 'Login failed. Please check your credentials.');
          setShowErrorModal(true);
        }
      } catch {
        setErrorMessage('Login failed. Please check your connection and try again.');
        setShowErrorModal(true);
      }
    }
    setIsSubmitting(false);
  };

  return (
    <div className="h-screen overflow-hidden bg-white flex flex-col">

      {/* Nav */}
      <Header authMode={{ label: "Don't have an account?", buttonText: "Sign up", to: "/register-user" }} />

      {/* Main */}
      <div className="flex-1 flex overflow-hidden">

        {/* Decorative side � LEFT */}
        <div className="hidden lg:flex lg:w-1/2 bg-[#F5F5F0] items-center justify-center relative overflow-hidden">
          {/* Circles */}
          <div className="absolute top-10 right-10 w-64 h-64 bg-[#d0e8dc] rounded-full opacity-60" />
          <div className="absolute bottom-10 left-10 w-48 h-48 bg-[#4A7C59]/20 rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#d0e8dc]/40 rounded-full" />

          {/* Center content */}
          <div className="relative z-10 text-center px-12">
            <div className="w-20 h-20 bg-[#4A7C59] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">Your wellness, our priority</h3>
            <p className="text-gray-500 text-sm leading-relaxed max-w-xs mx-auto">
              Connect with licensed professionals and take control of your mental health journey.
            </p>

            <div className="mt-8 grid grid-cols-3 gap-4">
              {[
                { n: '10K+', l: 'Users' },
                { n: '500+', l: 'Therapists' },
                { n: '24/7', l: 'Support' },
              ].map(({ n, l }) => (
                <div key={l} className="bg-white rounded-2xl p-4 shadow-sm">
                  <p className="text-lg font-bold text-[#4A7C59]">{n}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Form side — RIGHT */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-8 py-16 overflow-y-auto">
          <div className="w-full max-w-sm pt-8">

            <button onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 text-gray-400 hover:text-gray-700 text-sm mb-10 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>

            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Welcome back</h1>
              <p className="text-gray-500 text-sm mt-2">Sign in to your Mentra account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
                <input
                  type="email" name="email" value={formData.email}
                  onChange={handleInputChange} placeholder="you@example.com"
                  className={`w-full px-4 py-3 rounded-xl border-2 text-sm outline-none transition-all focus:border-[#4A7C59] ${errors.email ? 'border-red-300' : 'border-gray-100 hover:border-gray-200'}`}
                />
                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-sm font-medium text-gray-700">Password</label>
                  <Link to="/forgot-password" className="text-xs text-[#4A7C59] hover:underline">Forgot password?</Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'} name="password" value={formData.password}
                    onChange={handleInputChange} placeholder="Enter your password"
                    className={`w-full px-4 py-3 pr-10 rounded-xl border-2 text-sm outline-none transition-all focus:border-[#4A7C59] ${errors.password ? 'border-red-300' : 'border-gray-100 hover:border-gray-200'}`}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {showPassword
                        ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                        : <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></>
                      }
                    </svg>
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
              </div>


              <button type="submit" disabled={isSubmitting}
                className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all mt-2 ${isSubmitting ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-[#4A7C59] hover:bg-[#3d6b4a] text-white'}`}>
                {isSubmitting ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            {/* Google Sign In */}
            {GOOGLE_CLIENT_ID && (
              <div className="mt-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-1 h-px bg-gray-100" />
                  <span className="text-xs text-gray-400">or</span>
                  <div className="flex-1 h-px bg-gray-100" />
                </div>
                {errors.google && <p className="mb-2 text-xs text-red-500 text-center">{errors.google}</p>}
                <div ref={googleBtnRef} className="w-full flex justify-center" />
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-400">
                Mental health professional?{' '}
                <Link to="/register-professional" className="text-[#4A7C59] hover:underline font-medium">Register here</Link>
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 backdrop-blur-md bg-white/30 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">
                {accountStatusError ? 'Account Access Denied' : 'Login Error'}
              </h3>
              <button 
                onClick={() => {
                  setShowErrorModal(false);
                  setAccountStatusError(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-6 py-5">
              <div className="text-center mb-6">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                  accountStatusError ? 'bg-orange-100' : 'bg-red-100'
                }`}>
                  <svg className={`w-8 h-8 ${accountStatusError ? 'text-orange-600' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {accountStatusError ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    )}
                  </svg>
                </div>
                <p className="text-gray-700 mb-2">
                  {accountStatusError ? accountStatusError.message : errorMessage}
                </p>
                {accountStatusError ? (
                  <p className="text-sm text-gray-500">
                    {accountStatusError.status === 'rejected' 
                      ? 'Your application has been reviewed and rejected. Please contact support if you believe this is an error.'
                      : accountStatusError.status === 'deactivated'
                      ? 'Your account has been deactivated. Please contact support for more information.'
                      : 'Your account is currently under review. Please wait for approval.'
                    }
                  </p>
                ) : (
                  <p className="text-sm text-gray-500">Please check your credentials and try again.</p>
                )}
              </div>

              <button
                onClick={() => {
                  setShowErrorModal(false);
                  setAccountStatusError(null);
                }}
                className="w-full bg-mentra-primary hover:bg-mentra-primary-hover text-white py-3 px-4 rounded-lg font-semibold transition-all duration-300"
              >
                {accountStatusError ? 'Understood' : 'Try Again'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserLogin;


