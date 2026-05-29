import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header.jsx';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email address';
    if (!formData.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    if (validateForm()) {
      try {
        if (formData.email === 'admin@mentra.com' && formData.password === 'admin123') {
          localStorage.setItem('admin_token', 'admin-token-' + Date.now());
          localStorage.setItem('admin_userRole', 'admin');
          localStorage.setItem('admin_user', JSON.stringify({ id: 1, email: 'admin@mentra.com', role: 'admin', full_name: 'Admin User' }));
          navigate('/admin');
        } else {
          setErrors({ general: 'Invalid admin credentials. Please try again.' });
        }
      } catch {
        setErrors({ general: 'Login failed. Please try again.' });
      }
    }
    setIsSubmitting(false);
  };

  return (
    <div className="h-screen overflow-hidden bg-white flex flex-col">

      {/* Nav */}
      <Header authMode={{ label: "Patient or Doctor?", buttonText: "User Login", to: "/login" }} />

      {/* Main */}
      <div className="flex-1 flex overflow-hidden">

        {/* Left decorative panel */}
        <div className="hidden lg:flex lg:w-1/2 bg-[#F5F5F0] items-center justify-center relative overflow-hidden">
          <div className="absolute top-10 right-10 w-64 h-64 bg-[#d0e8dc] rounded-full opacity-60" />
          <div className="absolute bottom-10 left-10 w-48 h-48 bg-[#4A7C59]/20 rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#d0e8dc]/40 rounded-full" />

          <div className="relative z-10 text-center px-12">
            <div className="w-20 h-20 bg-[#4A7C59] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">Admin Portal</h3>
            <p className="text-gray-500 text-sm leading-relaxed max-w-xs mx-auto">
              Manage doctors, patients, and platform settings from one place.
            </p>

            <div className="mt-8 grid grid-cols-3 gap-4">
              {[
                { n: 'Doctors', l: 'Manage' },
                { n: 'Patients', l: 'Oversee' },
                { n: 'Platform', l: 'Control' },
              ].map(({ n, l }) => (
                <div key={n} className="bg-white rounded-2xl p-4 shadow-sm">
                  <p className="text-sm font-bold text-[#4A7C59]">{n}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right form panel */}
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
              <h1 className="text-3xl font-bold text-gray-900">Admin Login</h1>
              <p className="text-gray-500 text-sm mt-2">Access the admin dashboard</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
                <input
                  type="email" name="email" value={formData.email}
                  onChange={handleChange} placeholder="admin@mentra.com"
                  className={`w-full px-4 py-3 rounded-xl border-2 text-sm outline-none transition-all focus:border-[#4A7C59] ${errors.email ? 'border-red-300' : 'border-gray-100 hover:border-gray-200'}`}
                />
                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'} name="password" value={formData.password}
                    onChange={handleChange} placeholder="Enter your password"
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

              {errors.general && (
                <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-xs text-red-600">{errors.general}</p>
                </div>
              )}

              <button type="submit" disabled={isSubmitting}
                className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all mt-2 ${isSubmitting ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-[#4A7C59] hover:bg-[#3d6b4a] text-white'}`}>
                {isSubmitting ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            

          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminLogin;
