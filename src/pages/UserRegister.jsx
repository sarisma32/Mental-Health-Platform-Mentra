import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { buildApiUrl, API_ENDPOINTS } from '../config/api.js';

const UserRegister = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '', phoneNumber: '', age: '', agreeToTerms: false });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState('form');
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) { newErrors.fullName = 'Full name is required'; }
    else { const p = formData.fullName.trim().split(/\s+/); if (p.length < 2) newErrors.fullName = 'Enter first and last name'; }
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email address';
    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Phone number is required';
    if (!formData.age.trim()) newErrors.age = 'Age is required';
    else { const a = parseInt(formData.age); if (isNaN(a) || a < 13 || a > 120) newErrors.age = 'Age must be 13–120'; }
    if (!formData.password) newErrors.password = 'Password is required';
    else {
      const errs = [];
      if (formData.password.length < 8) errs.push('8+ chars');
      if (!/[A-Z]/.test(formData.password)) errs.push('uppercase');
      if (!/[a-z]/.test(formData.password)) errs.push('lowercase');
      if (!/\d/.test(formData.password)) errs.push('number');
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)) errs.push('special char');
      if (errs.length) newErrors.password = `Needs: ${errs.join(', ')}`;
    }
    if (!formData.agreeToTerms) newErrors.agreeToTerms = 'You must agree to the terms';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendOtp = async () => {
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setErrors(prev => ({ ...prev, email: 'Please enter a valid email first' })); return;
    }
    setSendingOtp(true);
    try {
      const res = await fetch(buildApiUrl('/api/patients/send-verification'), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: formData.email }) });
      const data = await res.json();
      if (data.success) { setStep('verify'); setOtpError(''); }
      else setErrors(prev => ({ ...prev, email: data.message }));
    } catch { setErrors(prev => ({ ...prev, email: 'Failed to send code.' })); }
    finally { setSendingOtp(false); }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim() || otp.length !== 6) { setOtpError('Enter the 6-digit code'); return; }
    setVerifyingOtp(true);
    try {
      const res = await fetch(buildApiUrl('/api/patients/verify-email'), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: formData.email, otp }) });
      const data = await res.json();
      if (data.success) { setEmailVerified(true); setStep('form'); setOtpError(''); }
      else setOtpError(data.message || 'Invalid code.');
    } catch { setOtpError('Verification failed.'); }
    finally { setVerifyingOtp(false); }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    if (name === 'email') { setEmailVerified(false); setStep('form'); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    if (!emailVerified) { setErrors(prev => ({ ...prev, email: 'Please verify your email first' })); setIsSubmitting(false); return; }
    if (validateForm()) {
      try {
        const response = await fetch(buildApiUrl(API_ENDPOINTS.PATIENT_REGISTER), {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fullName: formData.fullName, email: formData.email, password: formData.password, phoneNumber: formData.phoneNumber, age: formData.age })
        });
        const data = await response.json();
        if (data.success) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          localStorage.setItem('userRole', 'patient');
          window.dispatchEvent(new Event('storage'));
          navigate('/');
        } else { alert(data.message || 'Registration failed.'); }
      } catch { alert('Registration failed. Please try again.'); }
    }
    setIsSubmitting(false);
  };

  const inputClass = (field) => `w-full px-4 py-3.5 rounded-xl border text-sm outline-none transition-all focus:ring-2 focus:ring-[#4A7C59] focus:border-transparent bg-gray-50 focus:bg-white ${errors[field] ? 'border-red-300' : 'border-gray-200'}`;

  return (
    <div className="h-screen overflow-hidden bg-white flex flex-col">

      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-gray-100 flex-shrink-0">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#4A7C59] rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <span className="font-bold text-gray-900 text-lg">MENTRA</span>
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-gray-400">Already have an account?</span>
          <Link to="/login" className="bg-[#4A7C59] hover:bg-[#3d6b4a] text-white px-4 py-2 rounded-lg font-medium transition-colors">Sign in</Link>
        </div>
      </nav>

      {/* Main */}
      <div className="flex-1 flex overflow-hidden">

        {/* Left decorative */}
        <div className="hidden lg:flex lg:w-1/2 bg-[#F5F5F0] items-center justify-center relative overflow-hidden">
          <div className="absolute top-10 right-10 w-64 h-64 bg-[#d0e8dc] rounded-full opacity-60" />
          <div className="absolute bottom-10 left-10 w-48 h-48 bg-[#4A7C59]/20 rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#d0e8dc]/40 rounded-full" />
          <div className="relative z-10 text-center px-12">
            <div className="w-20 h-20 bg-[#4A7C59] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">Start your wellness journey</h3>
            <p className="text-gray-500 text-sm leading-relaxed max-w-xs mx-auto">Join thousands who have found peace and clarity through Mentra.</p>
            <div className="mt-8 grid grid-cols-3 gap-4">
              {[{ n: '10K+', l: 'Users' }, { n: '500+', l: 'Therapists' }, { n: '24/7', l: 'Support' }].map(({ n, l }) => (
                <div key={l} className="bg-white rounded-2xl p-4 shadow-sm">
                  <p className="text-lg font-bold text-[#4A7C59]">{n}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-12 py-6 overflow-y-auto">
          <div className="w-full max-w-md">

            <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-gray-400 hover:text-gray-700 text-sm mb-6 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>

            <h1 className="text-2xl font-bold text-gray-900 mb-1">Create account</h1>
            <p className="text-gray-400 text-sm mb-6">Join Mentra to access therapists and AI support</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name + Age */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                  <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} placeholder="First Last" className={inputClass('fullName')} />
                  {errors.fullName && <p className="mt-1 text-xs text-red-500">{errors.fullName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Age</label>
                  <input type="number" name="age" value={formData.age} onChange={handleInputChange} placeholder="Your age" min="13" max="120" className={inputClass('age')} />
                  {errors.age && <p className="mt-1 text-xs text-red-500">{errors.age}</p>}
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                <div className="flex gap-2">
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="you@example.com"
                    disabled={emailVerified}
                    className={`flex-1 px-4 py-3.5 rounded-xl border text-sm outline-none transition-all focus:ring-2 focus:ring-[#4A7C59] focus:border-transparent bg-gray-50 focus:bg-white ${errors.email ? 'border-red-300' : emailVerified ? 'border-green-400 bg-green-50' : 'border-gray-200'}`} />
                  {emailVerified ? (
                    <span className="flex items-center gap-1 px-3 py-2 bg-green-100 text-green-700 rounded-xl text-xs font-medium whitespace-nowrap">✓ Verified</span>
                  ) : (
                    <button type="button" onClick={handleSendOtp} disabled={sendingOtp || !formData.email}
                      className="px-4 py-2 bg-[#4A7C59] hover:bg-[#3d6b4a] text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50 whitespace-nowrap">
                      {sendingOtp ? '...' : 'Verify'}
                    </button>
                  )}
                </div>
                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                {step === 'verify' && !emailVerified && (
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                    <p className="text-xs text-blue-700 mb-2">Code sent to <strong>{formData.email}</strong></p>
                    <div className="flex gap-2">
                      <input type="text" value={otp} onChange={(e) => { setOtp(e.target.value.replace(/\D/g,'').slice(0,6)); setOtpError(''); }}
                        placeholder="6-digit code" maxLength={6}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-center tracking-widest font-mono focus:ring-2 focus:ring-[#4A7C59] outline-none bg-white" />
                      <button type="button" onClick={handleVerifyOtp} disabled={verifyingOtp || otp.length !== 6}
                        className="px-3 py-2 bg-[#4A7C59] text-white rounded-lg text-xs font-medium disabled:opacity-50">
                        {verifyingOtp ? '...' : 'Confirm'}
                      </button>
                    </div>
                    {otpError && <p className="mt-1 text-xs text-red-500">{otpError}</p>}
                  </div>
                )}
              </div>

              {/* Password + Phone */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                  <div className="relative">
                    <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleInputChange} placeholder="Create password" className={`${inputClass('password')} pr-9`} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {showPassword ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                        : <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></>}
                      </svg>
                    </button>
                  </div>
                  {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
                  <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} placeholder="Phone number" className={inputClass('phoneNumber')} />
                  {errors.phoneNumber && <p className="mt-1 text-xs text-red-500">{errors.phoneNumber}</p>}
                </div>
              </div>

              {/* Terms */}
              <div className="flex items-start gap-2 pt-1">
                <input type="checkbox" name="agreeToTerms" checked={formData.agreeToTerms} onChange={handleInputChange} className="mt-0.5 w-4 h-4 text-[#4A7C59] rounded" />
                <label className="text-xs text-gray-500">I agree to the <a href="#" className="text-[#4A7C59] underline">terms</a> & <a href="#" className="text-[#4A7C59] underline">privacy policy</a></label>
              </div>
              {errors.agreeToTerms && <p className="text-xs text-red-500">{errors.agreeToTerms}</p>}

              <button type="submit" disabled={isSubmitting || !emailVerified}
                className={`w-full py-3 rounded-xl font-semibold text-sm transition-all mt-1 ${isSubmitting || !emailVerified ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-[#4A7C59] hover:bg-[#3d6b4a] text-white'}`}>
                {isSubmitting ? 'Creating Account...' : !emailVerified ? 'Verify Email to Continue' : 'Create Account'}
              </button>
            </form>

          </div>
        </div>
      </div>
    </div>
  );
};

export default UserRegister;


