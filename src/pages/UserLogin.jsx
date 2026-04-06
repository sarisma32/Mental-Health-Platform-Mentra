import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { buildApiUrl, API_ENDPOINTS } from '../config/api.js';

const UserLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
          alert(data.message || 'Login failed. Please check your credentials.');
        }
      } catch {
        alert('Login failed. Please check your connection and try again.');
      }
    }
    setIsSubmitting(false);
  };

  return (
    <div className="h-screen overflow-hidden bg-white flex flex-col">

      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-gray-100">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#A3B18A] rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <span className="font-bold text-gray-900 text-lg">MENTRA</span>
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-gray-400">Don't have an account?</span>
          <Link to="/register-user" className="bg-[#A3B18A] hover:bg-[#8FA076] text-white px-4 py-2 rounded-lg font-medium transition-colors">
            Sign up
          </Link>
        </div>
      </nav>

      {/* Main */}
      <div className="flex-1 flex overflow-hidden">

        {/* Decorative side — LEFT */}
        <div className="hidden lg:flex lg:w-1/2 bg-[#F5F5F0] items-center justify-center relative overflow-hidden">
          {/* Circles */}
          <div className="absolute top-10 right-10 w-64 h-64 bg-[#DCE4D4] rounded-full opacity-60" />
          <div className="absolute bottom-10 left-10 w-48 h-48 bg-[#A3B18A]/20 rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#DCE4D4]/40 rounded-full" />

          {/* Center content */}
          <div className="relative z-10 text-center px-12">
            <div className="w-20 h-20 bg-[#A3B18A] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
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
                  <p className="text-lg font-bold text-[#A3B18A]">{n}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Form side — RIGHT */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-8 py-16">
          <div className="w-full max-w-sm">

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
                  className={`w-full px-4 py-3 rounded-xl border-2 text-sm outline-none transition-all focus:border-[#A3B18A] ${errors.email ? 'border-red-300' : 'border-gray-100 hover:border-gray-200'}`}
                />
                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-sm font-medium text-gray-700">Password</label>
                  <Link to="/forgot-password" className="text-xs text-[#A3B18A] hover:underline">Forgot password?</Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'} name="password" value={formData.password}
                    onChange={handleInputChange} placeholder="Enter your password"
                    className={`w-full px-4 py-3 pr-10 rounded-xl border-2 text-sm outline-none transition-all focus:border-[#A3B18A] ${errors.password ? 'border-red-300' : 'border-gray-100 hover:border-gray-200'}`}
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
                className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all mt-2 ${isSubmitting ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-[#A3B18A] hover:bg-[#8FA076] text-white'}`}>
                {isSubmitting ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-400">
                Mental health professional?{' '}
                <Link to="/register-professional" className="text-[#A3B18A] hover:underline font-medium">Register here</Link>
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default UserLogin;


